appCtrls.controller('ListTrackerCtrl',
    function ($scope, $rootScope, $filter, $state, rootSvc, localDbSvc, webSvc, $window, Role, localStorageService,
              $log, $q, $timeout, $interval, $controller, Color) {
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
            }).then(function(){
                var promises = [];
                $log.debug('update trackers Maps', $scope.TrackerList);
                angular.forEach($scope.TrackerList, function(tracker, key) {
                    if (tracker.lastShipmentId) {
                        var p = webSvc.getShipment(tracker.lastShipmentId).success(function(data) {
                            if (data.status.code == 0) {
                                $scope.TrackerList[key].lastShipment = data.response;
                            }
                        });
                        promises.push(p);
                    }
                });
                //-- get list of location
                $scope.LocationListFrom = [];
                $scope.LocationListTo = [];
                $scope.LocationListInterim = [];
                var promiseLocation = webSvc.getLocations(1000000, 1, 'locationName', 'asc').success( function (data) {
                    $log.debug("LocationList", data);
                    if (data.status.code == 0) {
                        $scope.LocationList = data.response;
                        angular.forEach($scope.LocationList, function (val, key) {
                            if (val.companyName) {
                                var dots = val.companyName.length > 20 ? '...' : '';
                                var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                                $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                            }
                            else {
                                $scope.LocationList[key].DisplayText = val.locationName;
                            }

                            if (val.startFlag=='Y') {
                                $scope.LocationListFrom.push(val);
                            }
                            if (val.endFlag == 'Y') {
                                $scope.LocationListTo.push(val)
                            }
                            if (val.interimFlag == 'Y') {
                                $scope.LocationListInterim.push(val);
                            }
                        })
                    }
                });
                promises.push(promiseLocation);
                $q.all(promises).then(function() {
                    angular.forEach($scope.TrackerList, function(t, k) {
                        var cl = filter(Color, {name: t.color}, true);
                            if (cl && angular.isArray(cl) && cl.length>0) {
                                $scope.TrackerList[k].trackerColor = cl[0];
                            } else {
                                $scope.TrackerList[k].trackerColor = Color[0];
                            }

                        if (t.lastShipment) {
                            var shippedFromId = t.lastShipment.shippedFrom;
                            var shippedToId = t.lastShipment.shippedTo;
                            var fl = filter($scope.LocationList, {locationId: shippedFromId}, true);
                            var tl = filter($scope.LocationList, {locationId: shippedToId}, true);
                            if (fl && (fl.length > 0)) {
                                $scope.TrackerList[k].lastShipment.shippedFromLocation = fl[0];
                            }
                            if (tl && (tl.length > 0)) {
                                $scope.TrackerList[k].lastShipment.shippedToLocation = tl[0];

                            }
                        }
                    });
                    if ($scope.map) {
                        $scope.updateMap();
                    }
                })
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
        }
        $scope.initMap = function() {
            $scope.map = new google.maps.Map(document.getElementById('trackerMap'), {
                center: {lat: -34.397, lng: 150.644},
                zoom: 8,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                zoomControl: false,
                streetViewControl: false,
                scaleControl: true,
                styles: [
                    {
                        featureType:"poi",
                        elementType: "all",
                        stylers: [
                            { visibility: "off" }
                        ]
                    }
                ]
            });

            //-- setup bottom-left control
            var bottomLeftInfo = document.createElement('div');
            var bliHtml = '';
            bliHtml += '<div style="margin-bottom: 15px; margin-left: 15px; border: 1px solid #aaaaaa;">';
            bliHtml += '<div style="background-color: #aaaaaa; color: #ffffff; padding: 5px; font-weight: 600;">';
            bliHtml += '<span>Index</span>';
            bliHtml += '</div>';
            bliHtml += '<div style="background-color: #ffffff; padding: 5px;">';
            bliHtml += '<table style="text-align: left;">';
            //--
            bliHtml += '<tr>';
            bliHtml += '<td  style="padding-bottom: 5px;">';
            bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px;">';
            bliHtml += '</div>';
            bliHtml += '</td>';
            bliHtml += '<td>';
            bliHtml += '<span>Shipment is active</span>';
            bliHtml += '</td>';
            bliHtml += '</tr>';
            //--
            bliHtml += '<tr>';
            bliHtml += '<td  style="padding-bottom: 5px;">';
            bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position:relative;">';
            bliHtml += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
            bliHtml += '</div>';
            bliHtml += '</td>';
            bliHtml += '<td>';
            bliHtml += '<span>Shipment has arrived</span>';
            bliHtml += '</td>';
            bliHtml += '<td>';
            bliHtml += '</td>';
            bliHtml += '</tr>';
            //--
            bliHtml += '<tr>';
            bliHtml += '<td  style="padding-bottom: 5px;">';
            bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position: relative">';
            bliHtml += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&times;</span>';
            bliHtml += '</div>';
            bliHtml += '</td>';
            bliHtml += '<td>';
            bliHtml += '<span>Shipment has ended</span>';
            bliHtml += '</td>';
            bliHtml += '<td>';
            bliHtml += '</td>';
            bliHtml += '</tr>';
            //--
            bliHtml += '</table>';
            bliHtml += '</div>';
            bliHtml += '</div>';

            bottomLeftInfo.innerHTML = bliHtml;
            $scope.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].pop();
            $scope.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(bottomLeftInfo);

            if ($scope.TrackerList) {
                $scope.updateMap();
            }
        }
        $scope.updateMap = function() {
            if ($scope.markerClusterer) {
                var ms = $scope.markerClusterer.getMarkers();
                // Unset all markers
                var l = ms ? ms.length : 0;
                console.log('Markers-tracker', ms);
                for (var i = 0; i<l; i++) {
                    ms[i].setMap(null)
                }
                // Clears all clusters and markers from the clusterer.
                $scope.markerClusterer.clearMarkers();
            }
            if ($scope.dynMarkers) {
                var lx = $scope.dynMarkers ? $scope.dynMarkers.length : 0;
                for (var i = 0; i < lx; i++) {
                    $scope.dynMarkers[i].setMap(null);
                }
            }
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

                    if (tracker.shipmentStatus == 'Ended') {
                        htmlIcon += "<div style='border:2px solid #5e5e5e; width: 16px; height: 16px; background-color:"+tracker.color+"; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); cursor: pointer; position:relative;'>";
                        htmlIcon += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -4px; left: 2px;;">&times;</span>'
                        htmlIcon += '</div>';
                    } else if (tracker.shipmentStatus == 'Arrived') {
                        htmlIcon += "<div style='border:2px solid #5e5e5e; width: 16px; height: 16px; background-color:"+tracker.color+"; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); cursor: pointer; position:relative;'>";
                        htmlIcon += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -4px; left: 0px;;">&check;</span>'
                        htmlIcon += '</div>';
                    } else {
                        htmlIcon += "<div style=' border:2px solid #5e5e5e; width: 16px; height: 16px; background-color:"+tracker.color+"; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); cursor: pointer;'></div>";
                    }
                    htmlIcon += "</td>";
                    htmlIcon += "<td  style='background-color: white'>";
                    htmlIcon += "<div>";
                    htmlIcon += tracker.sn + "(" + tracker.tripCount + ")";
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

                    //-- infor window
                    var htmlContent = '';
                    htmlContent += '<div class="portlet box" style="border: 2px solid; border-color:'+tracker.color+'">';

                    htmlContent += '<div style="padding-left: 10px; padding-right: 10px; padding-top: 10px; padding-bottom: 10px; background-color: #bababa; color: #ffffff;">';
                    htmlContent += '<table width="100%" style="font-size: 13px;">';
                    htmlContent += '<tr>';
                    htmlContent += '<td style="width: 20px;">';

                    if (shipment.status == 'Ended') {
                        htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ tracker.color +'; margin-right: 5px; position:relative;">';
                        htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&times;</span>'
                        htmlContent += '</div>';
                    } else if (shipment.status == 'Arrived') {
                        htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ tracker.color +';margin-right: 5px; position:relative;">';
                        htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
                        htmlContent += '</div>';
                    } else {
                        htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ tracker.color +';margin-right: 5px;">';
                        htmlContent += '</div>';
                    }

                    htmlContent += '</td>';
                    htmlContent += '<td>'
                    htmlContent += '<span class="pull-left bold">';
                    htmlContent += '<a href="#/view-shipment-detail?sn='+tracker.sn+'&trip='+tracker.tripCount+'">';
                    htmlContent +=  '<u style="color: #ffffff">Shipment ' + tracker.sn + ' (' + tracker.tripCount + ')</u></a>';
                    htmlContent += '</span>';
                    htmlContent += '</td>'
                    htmlContent += '<td width="50px">&nbsp;</td>'
                    htmlContent += '</tr>';
                    htmlContent += '</table>';                                  //+3 -3
                    htmlContent += '</div>';                                                                                        //-2

                    //-- infor window body
                    htmlContent += '<div class="portlet-body">';                                //+5

                    htmlContent += '<table style="text-align: left;">';
                    htmlContent += '<tr>';
                    htmlContent += '<td>';
                    htmlContent += '<img src="theme/img/locationStart.png">';
                    htmlContent += '</td>';
                    htmlContent += '<td>';
                    if (shipment.shippedFromLocation && shipment.shippedFromLocation.locationName) {
                        htmlContent += '<span class="bold">' + shipment.shippedFromLocation.locationName + '</span>';
                    } else {
                        htmlContent += '<span class="bold no-margin no-padding">Default</span>';
                    }
                    if (shipment.shipmentDate) {
                        htmlContent += '<p class="text-muted no-margin no-padding" style="height: 17px;">'+ shipment.shipmentDate+'</p>';
                    } else {
                        htmlContent += '<p class="text-muted no-margin no-padding" style="height: 17px;">'+ shipment.firstReadingTime+'</p>';
                    }
                    htmlContent += '</td>';
                    htmlContent += '<td>';

                    if (shipment.siblingCount > 0) {
                        htmlContent += '<span class="pull-left">';
                        htmlContent += '<img src="theme/img/similarTrips.png"/>'
                        htmlContent += shipment.siblingCount + ' others';
                        htmlContent += '</span>';
                    }

                    htmlContent += '</td>';
                    htmlContent += '</tr>';
                    //-- interim stop here

                    if (shipment.interimStops) {
                        angular.forEach(shipment.interimStops, function(v, k) {
                            htmlContent += '<tr>';
                            htmlContent += '<td>';
                            htmlContent += '<img src="theme/img/tinyInterimLocation.png">';
                            htmlContent += '</td>';
                            htmlContent += '<td>';
                            htmlContent += '<div class="bold">' + v.name + '</div>';
                            htmlContent += '<div>' + v.time + '</div>';
                            htmlContent += '</td>';
                            htmlContent += '</tr>';
                        });
                    }

                    //--end
                    htmlContent += '<tr>';
                    htmlContent += '<td>';
                    if (shipment.status == "Ended" || shipment.status == "Default") {
                        htmlContent += '<img class="rev-horizon" src="theme/img/locationStopToBeDetermined.png">';
                    } else {
                        htmlContent += '<img class="rev-horizon" src="theme/img/locationStop.png">';
                    }
                    htmlContent += '</td>';
                    htmlContent += '<td>';
                    if (shipment.shippedToLocation && shipment.shippedToLocation.locationName) {
                        htmlContent += '<p class="bold no-margin no-padding">' + shipment.shippedToLocation.locationName + '</p>';
                    } else {
                        htmlContent += '<p class="bold no-margin no-padding">Default</p>';
                    }
                    if (shipment.status == 'Arrived') {
                        htmlContent += '<p class="text-muted no-margin no-padding">';
                        htmlContent += '<span>ARRIVED AT</span>: '+shipment.actualArrivalDate+'</p>';
                    } else if (shipment.status == 'Ended'){
                        htmlContent += '<p class="text-muted no-margin no-padding">';
                        htmlContent += '<span>ENDED AT</span>: '+tracker.lastReadingTime+'</p>';
                    }
                    htmlContent += '</td>';
                    htmlContent += '</tr>';
                    htmlContent += '</table>';
                    htmlContent += '</div>';
                    //-------------
                    htmlContent += '<div style="background-color: #ffffff; padding: 5px; border-top: 1px solid; border-color: '+tracker.color+'">'; //+5
                    htmlContent += '<table style="text-align: left;">';
                    htmlContent += '<tr>';
                    htmlContent += '<td>';
                    htmlContent += '<span style="font-weight: 600; padding-right: 5px">Desc:</span>';
                    htmlContent += '</td>';
                    htmlContent += '<td>';
                    htmlContent += '<span>'+shipment.shipmentDescription+'</span>'
                    htmlContent += '</td>';
                    htmlContent += '</tr>';

                    htmlContent += '<tr>';
                    htmlContent += '<td>';
                    htmlContent += '<span style="font-weight: 600; padding-right: 5px">Status:</span>';
                    htmlContent += '</td>';
                    htmlContent += '<td>';
                    htmlContent += '<span>'+shipment.status+'</span>'
                    htmlContent += '</td>';
                    htmlContent += '</tr>'

                    var temperature = tracker.lastReadingTemperature;
                    if (!isNaN(temperature)) {
                        temperature = temperature.toFixed(1) + '℃';
                    }
                    var lastMoment = tracker.lastReadingTimeISO ? tracker.lastReadingTimeISO : '';
                    if (lastMoment) {
                        $log.debug('RunningTimezone', $rootScope.RunningTimeZoneId);
                        lastReading = moment(lastMoment).tz($rootScope.RunningTimeZoneId).format('h:ma DD-MMM-YYYY');
                    }

                    lastReading = tracker.lastReadingTime ? tracker.lastReadingTime : lastReading;

                    if (temperature || lastReading) {
                        htmlContent += '<tr>';
                        htmlContent += '<td>';
                        htmlContent += '<span style="font-weight: 600; padding-right: 5px">Last Reading:</span>';
                        htmlContent += '</td>';
                        htmlContent += '<td>';
                        htmlContent += temperature + ' at ' + lastReading;
                        htmlContent += '</td>';
                        htmlContent += '</tr>'
                    }
                    htmlContent += '</table>'
                    htmlContent += '</div>';                                                                  //-5
                    htmlContent += '</div>';

                    //var infowindow = new InfoBubble({
                    //    content: htmlContent,
                    //    shadowStyle: 3,
                    //    padding: 0,
                    //    borderRadius: 4,
                    //    arrowSize: 10,
                    //    borderWidth: 0,
                    //    borderColor: '#7ed56d',
                    //    disableAutoPan: true,
                    //    arrowPosition: 10,
                    //    arrowStyle: 2,
                    //    minWidth: 300,
                    //    backgroundClassName: 'phoney'
                    //});
                    var infoWindow = document.createElement('div');
                    infoWindow.innerHTML = htmlContent;
                    var closeBtn = document.createElement('div');
                    closeBtn.style.position='absolute';
                    closeBtn.style.top='5px';
                    closeBtn.style.right='10px';
                    closeBtn.style.color='#ffffff';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.innerHTML = '<span style="font-size: 20px;">&times;</span>';
                    closeBtn.addEventListener('click', function() {
                        if ($scope.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
                            var pContent = $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
                        }
                    });
                    infoWindow.appendChild(closeBtn);

                    marker.addListener('click', function () {
                        if ($scope.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
                            var pContent = $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
                            if (!pContent.childNodes[0].isEqualNode(infoWindow.childNodes[0])) {
                                $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoWindow);
                                //VM.updatePolylines(shipment);
                            }
                        } else {
                            $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoWindow);
                        }
                    });
                    $scope.dynMarkers.push(marker);
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
            google.maps.event.trigger($scope.map, 'resize');
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
                            templateUrl: 'app/manage-tracker/confirm-deactivate.html',
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
