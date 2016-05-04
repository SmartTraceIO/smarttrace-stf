appCtrls.controller('ListTrackerCtrl',
    function ($scope, $rootScope, $filter, $state, rootSvc, localDbSvc, webSvc, $window, Role, localStorageService,
              $log, $q, $timeout, $interval, $controller, Color, NgMap) {
        rootSvc.SetPageTitle('List Trackers');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        var filter = $filter('filter');
        $scope.Role = Role;
        {
            this.rootScope  = $rootScope;
            this.state      = $state;
            this.log        = $log;
            this.webSvc     = webSvc;
            this.localDbSvc = localDbSvc;
            this.timeout    = $timeout;
            this.interval   = $interval;
            $controller('BaseCtrl', {VM:this});
        }

        var BindTrackerList = function () {
            webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
                if (data.status.code == 0) {
                    $log.debug('TrackerList', data.response);
                    $scope.TrackerList = data.response;
                    $scope.TrackerList.totalCount = data.totalCount;

                    //parsing TrackerList
                    angular.forEach($scope.TrackerList, function(v, k) {
                        var temShipmentNumber = v.shipmentNumber;
                        if (temShipmentNumber){
                            var idx1 = temShipmentNumber.indexOf('(');
                            var idx2 = temShipmentNumber.indexOf(')');
                            var n = temShipmentNumber.substr(idx1+1, idx2-1);
                            var t = temShipmentNumber.substr(0, idx1);
                            $scope.TrackerList[k].tripCount = parseInt(n, 10);
                        }
                        if (!isNaN(v.sn)) {
                            $scope.TrackerList[k].sn = parseInt(v.sn, 10);
                        }
                        if (!v.color) {
                            $scope.TrackerList[k].trackerColor=Color[0];
                        } else {
                            var cl = filter(Color, {name: v.color}, true);
                            if (cl) {
                                $scope.TrackerList[k].trackerColor=cl[0];;
                            } else {
                                $scope.TrackerList[k].trackerColor=Color[0];;
                            }
                        }
                    })
                }
            }).then(function() {
                NgMap.getMap('trackerMap').then(function(map) {
                    $scope.updateMap(map);
                });
            })
        }
        $scope.Print = function() {
            $window.print();
        }
        $scope.Init = function () {
            $scope.PageSize = '20';
            $scope.PageIndex = 1;
            $scope.So = "desc";
            $scope.Sc = "lastReadingTimeISO";
            BindTrackerList();
        }

        $scope.PageSizeChanged = function () {
            BindTrackerList();
        }

        $scope.PageChanged = function (page) {
            $scope.PageIndex = page;
            BindTrackerList();
        }

        $scope.Sorting = function (expression) {
            $scope.So = $scope.So == "asc" ? "desc" : "asc";
            $scope.Sc = expression;
            BindTrackerList();
        }

        $scope.confirm = function (deviceImei) {
            $scope.deviceImei = deviceImei;
            $("#confirmModel").modal("show");
        }

        $scope.DeleteDevice = function () {
            $("#confirmModel").modal("hide");
            webSvc.deleteDevice($scope.deviceImei).success(function(data){
                console.log('DELETE-DEVICE', data);
                if (data.status.code == 0) {
                    toastr.success("Device deleted successfully")
                } else {
                    toastr.error('Can\'t delete device!');
                }
            });
        }
        var User = localDbSvc.getUserProfile();
        $scope.getRole = function () {
            if (!User || !User.roles) {
                return Role.Basic;
            }
            else if (User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return Role.SmartTraceAdmin;
            } else if (User.roles.indexOf('Admin') >= 0) {
                return Role.Admin;
            } else if (User.roles.indexOf('Normal') >= 0) {
                return Role.Normal;
            } else {
                return Role.Basic;
            }
        }
        //-- coding for map-view
        $scope.lastView = localStorageService.get('LastViewTracker');
        if (!$scope.lastView) {
            $scope.lastView = 1;
        }
        $scope.showTable = function() {
            $scope.lastView = 1;
            localStorageService.set('LastViewTracker', 1);
        }
        $scope.showMap = function() {
            $scope.lastView = 3;
            localStorageService.set('LastViewTracker', 3);
            NgMap.getMap('trackerMap').then(function(map) {
                $scope.updateMap(map);
            });
        }
        $scope.updateMap = function(map) {
            if ($scope.markerClusterer) {
                var ms = $scope.markerClusterer.getMarkers();
                // Unset all markers
                var l = ms ? ms.length : 0;
                console.log('Markers-tracker', ms);
                for (var i = 0; i<l; i++) {
                    ms[i].setMap(null)
                }
                var lx = VM.dynMarkers ? VM.dynMarkers.length : 0;
                for (var i = 0; i < lx; i++) {
                    VM.dynMarkers[i].setMap(null);
                }
                // Clears all clusters and markers from the clusterer.
                $scope.markerClusterer.clearMarkers();
            }
            if (map) {
                $scope.map = map;
            }
            if ($scope.map) {
                var promises = [];
                $log.debug('update trackers Maps', $scope.TrackerList);
                angular.forEach($scope.TrackerList, function(tracker, key) {
                    var cl = filter(Color, {name: tracker.color}, true);
                    if (cl && angular.isArray(cl) && cl.length>0) {
                        $scope.TrackerList[key].trackerColor = cl[0];
                    } else {
                        $scope.TrackerList[key].trackerColor = Color[0];
                    }
                    if (tracker.lastShipmentId) {
                        var p = webSvc.getShipment(tracker.lastShipmentId).success(function(data) {
                            if (data.status.code == 0) {
                                $scope.TrackerList[key].lastShipment = data.response;
                            }
                        });
                        promises.push(p);
                    }
                });
                $q.all(promises).then(function() {
                    generateContentAndUpdateMap();
                });
            }
        }
        var generateContentAndUpdateMap = function() {

            $scope.dynMarkers = [];
            var bounds = new google.maps.LatLngBounds;

            angular.forEach($scope.TrackerList, function(tracker, key) {
                if (tracker.lastReadingTime) {
                    //$log.debug('Tracker#' + key, tracker);
                    var shipment = tracker.lastShipment;
                    if (!shipment) {
                        shipment = {
                            percentageComplete: 0,
                            alertSummary: {
                                LightOn: null,
                                LightOff: null,
                                Cold: null,
                                Hot: null,
                                CriticalCold: null,
                                CriticalHot: null,
                                Battery: null,
                                MovementStart: null
                            },
                            assetType: null,
                            assetNum: null,
                            shippedFrom: null,
                            shipmentDate: null,
                            shippedTo: null,
                            status: null,
                            actualArrivalDate: null,
                            lastReadingTimeISO: null,

                        }
                    }
                    var llng = new google.maps.LatLng(tracker.lastReadingLat, tracker.lastReadingLong);

                    var htmlIcon = '';
                    htmlIcon += "<table style=''>";
                    htmlIcon += "<tr>";
                    htmlIcon += "<td>";
                    htmlIcon += "<div style=' border:2px solid #5e5e5e; width: 16px; height: 16px; background-color:" + tracker.trackerColor.code/*Color[key].code*/ + "; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); cursor: pointer;'></div>";
                    htmlIcon += "</td>";
                    htmlIcon += "<td  style='background-color: white'>";
                    htmlIcon += "<div>";
                    htmlIcon += tracker.sn + "(" + tracker.tripCount + ")";
                    htmlIcon += "</div>"
                    htmlIcon += "</td>";
                    htmlIcon += "</tr>";
                    htmlIcon += "<tr>";
                    htmlIcon += "<td colspan=2>"
                    htmlIcon += "<div style='margin-top: 5px;'>"

                    htmlIcon += "<div class='progress' style='height: 5px; border: #5BCA45 solid 1px;'>";
                    htmlIcon += "<div class='progress-bar' role='progressbar' aria-valuenow='" + shipment.percentageComplete + "' aria-valuemin='0' aria-valuemax='100' style='background-color:#5BCA45;width:" + shipment.percentageComplete + "%'>";
                    htmlIcon += "</div>";
                    htmlIcon += "</div>";


                    htmlIcon += "</div>"
                    htmlIcon += "</td>";
                    htmlIcon += "</tr>";
                    htmlIcon += "</table>";

                    var marker = new RichMarker({
                        position: llng,
                        map: $scope.map,
                        flat: true,
                        anchor: RichMarkerPosition.TOP,
                        content: htmlIcon,
                    });

                    var htmlContent = '';
                    htmlContent += '<div class="portlet box green" style="margin-bottom: 0px!important; border: 0px!important;">';  //+1
                    htmlContent += '<div class="portlet-title">';                                                                   //+2
                    htmlContent += '<div class="caption">' + tracker.description + '</div>';                                   //+3 -3
                    //htmlContent += '<div class="pull-right" style="margin-top:6px">';                                               //+4
                    //htmlContent += '<a href="#/view-shipment-detail?sn=' + tracker.sn + '&trip=' + tracker.tripCount + '"';
                    //htmlContent += 'class="btn btn-sm green-meadow" style="background-color:green;border-color:green">View</a>'
                    //htmlContent += '</div>';                                                                                        //-4
                    htmlContent += '</div>';                                                                                        //-2

                    htmlContent += '<div class="portlet-body" style="padding-top: 0px!important;">';                                //+5
                    htmlContent += '<div class="row">';                                                                                               //+6

                    htmlContent += '<table class="table" style="margin-bottom: 0px!important;">';
                    htmlContent += '<tr>';
                    htmlContent += '<td>';
                    htmlContent += '<span class="pull-left">Tracker ';
                    htmlContent += '<a href="#/view-shipment-detail?sn='+shipment.deviceSN+'&trip='+shipment.tripCount+'">';
                    htmlContent +=  '<u>' + shipment.deviceSN + ' (' + shipment.tripCount + ')</u></a>';
                    htmlContent += '</span>';
                    htmlContent += '</td>';;
                    //htmlContent += '<td>';

                    //if (shipment.siblingCount > 0) {
                    //    htmlContent += '<h5 class="text-center">';
                    //    htmlContent += '<img src="theme/img/similarTrips.png"/>'
                    //    htmlContent += shipment.siblingCount + ' similar trips';
                    //    //htmlContent += '<i uib-tooltip="Waiting your tooltip text" tooltip-append-to-body="true" tooltip-trigger="mouseenter" tooltip-placement="top" class="fa fa-info-circle"></i>';
                    //    htmlContent += '</h5>';
                    //}

                    //htmlContent += '</td>';
                    //htmlContent += '<td>';
                    //htmlContent += '<h5 class="pull-right">';
                    //if (shipment.alertSummary.LightOn)          htmlContent += '<img src="theme/img/alertLightOn.png"/>';
                    //if (shipment.alertSummary.LightOff)         htmlContent += '<img src="theme/img/alertLightOff.png"/>';
                    //if (shipment.alertSummary.Cold)             htmlContent += '<img src="theme/img/alertCold.png"/>';
                    //if (shipment.alertSummary.Hot)              htmlContent += '<img src="theme/img/alertHot.png"/>';
                    //if (shipment.alertSummary.CriticalCold)     htmlContent += '<img src="theme/img/alertCriticalCold.png"/>';
                    //if (shipment.alertSummary.CriticalHot)      htmlContent += '<img src="theme/img/alertCriticalHot.png"/>';
                    //if (shipment.alertSummary.Battery)          htmlContent += '<img src="theme/img/alertBattery.png"/>';
                    //if (shipment.alertSummary.MovementStart)    htmlContent += '<img src="theme/img/alertShock.png"/>';
                    //htmlContent += '</h5>';
                    //htmlContent += '</td>';
                    htmlContent += '</tr>';
                    htmlContent += '</table>';

                    htmlContent += '</div>'; //-- class row                                                                                 //-6

                    htmlContent += '<div class="row">'; //row2                                                                              //+7
                    htmlContent += '<div class="col-sm-12">'                                                                                //+8
                    htmlContent += '<p class="col-xs-1 text-left no-margin no-padding"><i class="fa fa-home fa-2x"></i></p>';
                    var assetTypeAndNum = '';
                    assetTypeAndNum += (shipment.assetType ? shipment.assetType : '');
                    assetTypeAndNum += (shipment.assetNum ? shipment.assetNum : '');
                    assetTypeAndNum = (assetTypeAndNum ? assetTypeAndNum + '-' : '');
                    if (tracker.shipmentStatus) {
                        htmlContent += '<p class="col-xs-10 no-margin no-padding text-center">' + assetTypeAndNum + tracker.shipmentStatus + '</p>';
                    }
                    htmlContent += '<p class="col-xs-1 text-right no-margin no-padding"><i class="fa fa-flag fa-flip-horizontal fa-2x"></i></p>';
                    htmlContent += '</div>'; //-- col-sm-12                                                                                 //-8
                    htmlContent += '</div>'; //-- row2                                                                                      //-7

                    htmlContent += '<div class="row">'; //--row3                                                                            //+9
                    htmlContent += '<div class="col-sm-12">'                                                                                //+10
                    htmlContent += '<div class="progress" style="max-height:5px">';                                                         //+11
                    htmlContent += '<div style="width:' + (shipment.percentageComplete + 1) * 100 / 101 + '%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="' + shipment.percentageComplete + '" role="progressbar" class="progress-bar progress-bar-info">'; //+12
                    htmlContent += '<span class="sr-only">' + shipment.percentageComplete + '% Complete </span>';
                    htmlContent += '</div>';                                                                                                //-12
                    htmlContent += '</div>';                                                                                                //-11
                    htmlContent += '</div>';                                                                                                //-10
                    htmlContent += '</div>';                                                                                                //-9

                    htmlContent += '<!--row 3+-->'

                    htmlContent += '<div class="row">'; // row4                                                                             //+13
                    htmlContent += '<div class="col-xs-6 text-left">';                                                                      //+14
                    if (shipment.shippedFrom) {
                        htmlContent += '<p class="bold no-margin no-padding">' + shipment.shippedFrom + '</p>';
                    }
                    if (shipment.shipmentDate) {
                        htmlContent += '<p class="text-muted no-margin no-padding">' + shipment.shipmentDate + '</p>';
                    }
                    htmlContent += '</div>';                                                                                                //-14

                    htmlContent += '<div class="col-xs-6 text-right">';                                                                     //+15
                    if (shipment.shippedTo) {
                        htmlContent += '<p class="bold no-margin no-padding">' + shipment.shippedTo + '</p>';
                    }
                    if (shipment.status == 'Arrived') {
                        htmlContent += '<p class="text-muted no-margin no-padding">';
                        htmlContent += '<span>ARRIVED AT</span>: ' + shipment.actualArrivalDate + '</p>';
                    }
                    htmlContent += '</div>'; //col-xs-6 text-right                                                                          //-15
                    htmlContent += '</div>'; // row4 end                                                                                    //-13
                    htmlContent += '<!--row3-->'
                    htmlContent += '</div>'; //-- portlet-body                                                                       //-5

                    var temperature = tracker.lastReadingTemperature;
                    if (temperature && !isNaN(temperature)) {
                        temperature = temperature.toFixed(1) + '℃';
                    } else {
                        temperature = '';
                    }
                    var lastMoment = tracker.lastReadingTimeISO ? tracker.lastReadingTimeISO : '';
                    if (lastMoment) {
                        lastReading = moment(lastMoment).tz($rootScope.RunningTimeZoneId).format('h:ma DD-MMM-YYYY');
                    }

                    if (temperature || lastReading) {
                        htmlContent += '<div class="shipment-last-reading">'
                        htmlContent += '<div class="text-center">';
                        htmlContent += 'Last Reading ' + temperature + ' at ' + lastReading;
                        htmlContent += '</div>';
                        htmlContent += '</div>';
                    }
                    htmlContent += '</div>';

                    var infowindow = new InfoBubble({
                        content: htmlContent,
                        shadowStyle: 3,
                        padding: 0,
                        borderRadius: 4,
                        arrowSize: 10,
                        borderWidth: 1,
                        borderColor: '#7ed56d',
                        disableAutoPan: true,
                        arrowPosition: 10,
                        arrowStyle: 2,
                        minWidth: 420
                    });
                    marker.addListener('click', function () {
                        if (infowindow.isOpen()) {
                            infowindow.close();
                        } else {
                            infowindow.open($scope.map, marker);
                        }
                    });
                    $scope.dynMarkers.push(marker);
                    $scope.map.addListener('click', function () {
                        if (infowindow.isOpen) {
                            infowindow.close();
                        }
                    });
                    bounds.extend(llng);
                }
            });//end angular.forEach();

            $scope.markerClusterer = new MarkerClusterer($scope.map, $scope.dynMarkers, {minimumClusterSize:4});
            $scope.map.setCenter(bounds.getCenter());
            if(bounds != null){
                $scope.map.fitBounds(bounds);
            }
        }
});
appCtrls.controller('AddTrackerCtrl',
    function($rootScope, $scope, $filter, $state, rootSvc, localDbSvc, webSvc, $window, Role, $timeout, $interval,
             $log, $controller, Color) {
        rootSvc.SetPageTitle('Add Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Add";
        $scope.colors = Color;
        $scope.Role = Role;
        {
            this.rootScope  = $rootScope;
            this.state      = $state;
            this.log        = $log;
            this.webSvc     = webSvc;
            this.localDbSvc = localDbSvc;
            this.timeout    = $timeout;
            this.interval   = $interval;
            $controller('BaseCtrl', {VM:this});
        }
        var filter = $filter('filter');
        var param = {
            pageSize: 1000,
            pageIndex: 1,
            so: 'id',
            sc: 'asc'
        };
        webSvc.getAutoStartShipments(param).success(function(data) {
            if (data.status.code == 0) {
                $log.debug('AutoShipment', data.response);
                $scope.AutoStartShipmentList = data.response;
                //$scope.tracker.autoStartShipment = filter($scope.AutoStartShipmentList, {id:$scope.tracker.autostartTemplateId}, true)[0];
            }
        });
        $scope.Print = function() {
            $window.print();
        }
        $scope.saveTracker = function() {
            if ($scope.tracker.autoStartShipment) {
                $scope.tracker.autostartTemplateId = $scope.tracker.autoStartShipment.id;
            }
            if ($scope.tracker.trackerColor) {
                $scope.tracker.color = $scope.tracker.trackerColor.name;
            } else {
                $scope.tracker.color = Color[0].name;
            }
            webSvc.saveDevice($scope.tracker).success(function(resp) {
                $log.debug('UPDATED', resp);
                if (resp.status.code == 0) {
                    //success
                    toastr.success('You\'v created a device: ' + $scope.tracker.imei);
                    $state.go('tracker');
                } else {
                    //error
                    toastr.error('Can\'t create the device: ' + $scope.tracker.imei + resp.status.message);
                }
            });
        };
});
appCtrls.controller('EditTrackerCtrl', function($scope, $rootScope, $state, $filter, $stateParams, rootSvc, localDbSvc, Color,
                                                webSvc, $window, $uibModal, Role, $log, $timeout, $interval, $controller) {
        rootSvc.SetPageTitle('Edit Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
    $scope.colors = Color;
    var filter = $filter('filter');
        $scope.Action = "Edit";
        $scope.Role = Role;
        {
            this.rootScope  = $rootScope;
            this.state      = $state;
            this.log        = $log;
            this.webSvc     = webSvc;
            this.localDbSvc = localDbSvc;
            this.timeout    = $timeout;
            this.interval   = $interval;
            $controller('BaseCtrl', {VM:this});
        }

        var User = localDbSvc.getUserProfile();
        $scope.getRole = function () {
            if (!User || !User.roles) {
                return Role.Basic;
            }
            else if (User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return Role.SmartTraceAdmin;
            } else if (User.roles.indexOf('Admin') >= 0) {
                return Role.Admin;
            } else if (User.roles.indexOf('Normal') >= 0) {
                return Role.Normal;
            } else {
                return Role.Basic;
            }
        }
        $scope.Print = function() {
            $window.print();
        }

        $scope.tracker = {};
        //$scope.tracker.imei = $stateParams.imei;
        var param = {
            pageSize: 1000,
            pageIndex: 1,
            so: 'id',
            sc: 'asc'
        };
        webSvc.getDevice($stateParams.imei).success(function(data){
            $log.debug("TRACKER", data);
            if (data.status.code == 0) {
                $scope.tracker = data.response;
                if (!$scope.tracker.color) {
                    $scope.tracker.trackerColor  = Color[0];
                } else {
                    var fcolor = filter(Color, {name: $scope.tracker.color}, true);
                    if (fcolor) {
                        $scope.tracker.trackerColor = fcolor[0];
                    } else {
                        $scope.tracker.trackerColor  = Color[0];
                    }
                }
            } else {
                //error
            }
        }).then(function() {
            webSvc.getAutoStartShipments(param).success(function(data) {
                if (data.status.code == 0) {
                    console.log('AutoShipment', data.response);
                    $scope.AutoStartShipmentList = data.response;
                    $scope.tracker.autoStartShipment = filter($scope.AutoStartShipmentList, {id:$scope.tracker.autostartTemplateId}, true)[0];
                }
            });
        }).then(function() {
            var temShipmentNumber = $scope.tracker.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                $scope.tracker.tripCount = parseInt(n, 10);
            }
            if (!isNaN($scope.tracker.sn)) {
                $scope.tracker.sn = parseInt($scope.tracker.sn, 10);
            }
        });

        $scope.saveTracker = function() {
            if ($scope.tracker.autoStartShipment) {
                $scope.tracker.autostartTemplateId = $scope.tracker.autoStartShipment.id;
            }
            if ($scope.tracker.trackerColor) {
                $scope.tracker.color = $scope.tracker.trackerColor.name;
            } else {
                $scope.tracker.color = Color[0].name;
            }
            webSvc.saveDevice($scope.tracker).success(function(resp) {
                $log.debug('UPDATED', resp);
                if (resp.status.code == 0) {
                    //success
                    toastr.success('"Changes saved for Device ' + $scope.tracker.sn);
                    $state.go('tracker');
                } else {
                    //error
                    toastr.error('Can\'t update the device: ' + $scope.tracker.sn + resp.status.message);
                }
            });
        };
        $scope.confirmCancel = function() {
            //-- confirm to cancel
            $state.go('tracker');
        };

        $scope.confirmShutdown = function() {
            if ($scope.tracker.shipmentStatus!='Ended' && $scope.tracker.shipmentStatus!='Arrived'){
                $("#confirmShutdown").modal("show");
            } else {
                toastr.error('You have already requested this tracker be shutdown')
            }
        };
        $scope.shutdownNow = function() {
            $("#confirmShutdown").modal("hide");
            var shipmentId = $scope.tracker.lastShipmentId;
            if (shipmentId == null) {
                toastr.error('No Shipment for this device');
            } else {
                webSvc.getShipment(shipmentId).success(function(resp) {
                    //console.log('DATA', resp);
                    if (resp.status.code == 0) {
                        $scope.arrivalTimeISO = resp.response.arrivalTimeISO;
                    } else {
                        toastr.error('Could not get a single shipment!');
                        return;
                    }
                }).then(function() {
                    if ($scope.arrivalTimeISO == null) {
                        webSvc.shutdownDevice(shipmentId).success(function(resp) {
                            if (resp.status.code == 0) {
                                //success shutdown
                                toastr.success('Shutdown has been triggered for Tracker ' + $scope.tracker.sn + "(" + $scope.tracker.tripCount + ")");
                                $scope.tracker.shipmentStatus='Ended';
                            } else {
                                //error shutdown
                                toastr.error('You have no permission to shut this device down.');
                            }
                        });
                    } else {
                        toastr.warning('You have already shut this device down!');
                    }
                })

            }
        };

        $scope.confirmDeactive = function(shipmentId) {
            webSvc.getSingleShipment(shipmentId).success(function(resp) {
                if (resp.status.code == 0) {
                    $scope.arrivalTimeISO = resp.response.arrivalTimeISO;
                } else {
                    $scope.arrivalTimeISO = -1;
                    toastr.warning('There is no shipment with this device!');
                }
            }).then(function() {
                if ($scope.arrivalTimeISO != null){
                    if ($scope.tracker.active) {
                        var modalInstance = $uibModal.open({
                            templateUrl: '/app/manage-tracker/confirm-deactivate.html',
                            controller: 'ConfirmDeactivateCtrl',
                            resolve: {
                                tracker: function () {
                                    return $scope.tracker;
                                }
                            }
                        });
                        modalInstance.result.then(
                            function() {
                                //$scope.trackerInfo.shutdownTime = moment.tz($rootScope.RunningTimeZoneId).format("h:mmA DD MMM YYYY");
                                //$scope.trackerInfo.status = 'Ended';
                                //$scope.shutdownAlready = true;
                            }
                        );
                    } else {
                        toastr.warning('This device was deactivated!');
                    }
                } else {
                    toastr.warning('You must shut the device down first!')
                }
            })
        };
    });

appFilters.filter('friendlyDate', function() {
    return function (input) {
        if (input == null) {
            input = "0";
        }
        cdate = new Date(input);
        return cdate.getTime();
    }
});
