appCtrls.controller('ListShipTempCtrl', function ($rootScope, $scope, $state, rootSvc, localDbSvc, webSvc, $window,
                                                  $timeout, $interval, $log, $controller, $location) {
    rootSvc.SetPageTitle('List Manual Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Manual Shipment Templates");
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }

    var BindShipmentList = function () {
        var param = {
            pageSize: $scope.PageSize, 
            pageIndex: $scope.PageIndex, 
            so: $scope.So, 
            sc: $scope.Sc
        };
        webSvc.getShipmentTemplates(param).success(function(data){
            if (data.status.code == 0) {
                $scope.ShipmentTemplateList = data.response;
                $scope.ShipmentTemplateList.totalCount = data.totalCount;
            }
        });
    }

    $scope.Print = function() {
        $window.print();
    }
    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "shipmentTemplateName";
        BindShipmentList();
    }
    $scope.PageSizeChanged = function () {
        BindShipmentList();
    }
    $scope.PageChanged = function () {
        BindShipmentList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindShipmentList();
    }

    $scope.confirm = function (shipmentTempId) {
        $scope.STemplateToDeleteShipTemp = shipmentTempId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteShipment = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteShipmentTemplate($scope.STemplateToDeleteShipTemp).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Shipment template deleted successfully")
                BindShipmentList();
            }
        });
    }

});

appCtrls.controller('AddShipTempCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $state, $filter, arrayToStringFilter,
                                                 $uibModal, $rootScope, $window, $timeout, $log, $interval, $controller, $location) {
    rootSvc.SetPageTitle('Add Manual Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Manual Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Add";
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }

    $scope.Print = function() {
        $window.print();
    }
    //--
    var BindLocations = function (cb) {
        webSvc.getLocations(1000000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.LocationList = data.response;

                $scope.FromLocationList = [];
                $scope.ToLocationList = [];

                angular.forEach($scope.LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        $scope.LocationList[key].DisplayText = val.locationName;
                    }

                    if (val.startFlag == "Y")
                        $scope.FromLocationList.push(val);
                    if (val.endFlag == "Y")
                        $scope.ToLocationList.push(val);

                })
            }
        });
    }

    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
            }
        });
    }
    var BindNotificationSchedules = function (cb) {
        webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }
        });
    }
    $scope.Init = function () {
        $scope.ShipmentTemplate = {};
        $scope.ShipmentTemplate.detectLocationForShippedFrom = false;
        $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = '120';
        $scope.ShipmentTemplate.alertSuppressionMinutes = 120;
        $scope.ShipmentTemplate.addDateShipped = false;
        $scope.ShipmentTemplate.excludeNotificationsIfNoAlerts = false;
        $scope.NotificationScheduleOption = {
            multiple: true
        };
        BindLocations();
        BindAlertProfiles();
        BindNotificationSchedules();
    }
    $scope.mapOptions = {
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
    $scope.map.setCenter(new google.maps.LatLng(20.632784, 78.969727));
    $scope.ChangeShipmentFrom = function () {
        if (!$scope.ShipmentTemplate.shippedFrom) {
            return;
        }
        //-reset map
        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        var fromLocation = $scope.ShipmentTemplate.shippedFrom.location;
        var toLocation = null;
        if ($scope.ShipmentTemplate.shippedTo) {
            toLocation = $scope.ShipmentTemplate.shippedTo.location;
        };

        if (fromLocation) {
            $scope.HomeMarker = new google.maps.Marker({
                position: new google.maps.LatLng(fromLocation.lat, fromLocation.lon),
                map: $scope.map,
                icon: 'theme/img/mapStart.png'
            });
            $scope.map.setCenter(new google.maps.LatLng(fromLocation.lat, fromLocation.lon));
            $scope.HomeMarker.setMap($scope.map);
        }

        if (fromLocation && toLocation) {
            $scope.DrawLine([fromLocation, toLocation])
        }

    }

    $scope.ChangeShipmentTo = function () {
        $log.debug('ShippedTo', $scope.ShipmentTemplate.shippedTo)
        if (!$scope.ShipmentTemplate.shippedTo) {
            return;
        }
        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        var toLocation = $scope.ShipmentTemplate.shippedTo.location;
        var fromLocation = null;
        if($scope.ShipmentTemplate.shippedFrom) {
            fromLocation = $scope.ShipmentTemplate.shippedFrom.location;
        };

        if (toLocation) {
            $scope.EndMarker = new google.maps.Marker({
                position: new google.maps.LatLng(toLocation.lat, toLocation.lon),
                map: $scope.map,
                icon: 'theme/img/mapStop.png'
            });
            $scope.map.setCenter(new google.maps.LatLng(toLocation.lat, toLocation.lon));
            $scope.EndMarker.setMap($scope.map);
        }

        if (fromLocation && toLocation) {
            $scope.DrawLine([fromLocation, toLocation])
        }
    }
    $scope.DrawLine = function (arrayOfLatLang) {
        if ($scope.Path)
            $scope.Path.setMap(null);

        var bounds = new google.maps.LatLngBounds();
        $scope.Route = [];
        angular.forEach(arrayOfLatLang, function (val, key) {
            $scope.Route.push(new google.maps.LatLng(val.lat, val.lon))
            bounds.extend(new google.maps.LatLng(val.lat, val.lon));
        })

        $scope.Path = new google.maps.Polyline(
        {
            path: $scope.Route,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5
        });

        $scope.Path.setMap($scope.map);
        $scope.map.fitBounds(bounds);
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {
            if (!$scope.ShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if ($scope.ShipmentTemplate.arrivalNotificationWithinKm || ($scope.ShipmentTemplate.arrivalNotificationWithinKm == '0'))
                $scope.ShipmentTemplate.arrivalNotificationWithinKm = parseInt($scope.ShipmentTemplate.arrivalNotificationWithinKm, 10);

            $scope.ShipmentTemplate.maxTimesAlertFires = null;
            $scope.ShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.ShipmentTemplate.shippedFrom)
                $scope.ShipmentTemplate.shippedFrom = $scope.ShipmentTemplate.shippedFrom.locationId;
            if ($scope.ShipmentTemplate.shippedTo)
                $scope.ShipmentTemplate.shippedTo = $scope.ShipmentTemplate.shippedTo.locationId;

            if($scope.ShipmentTemplate.alerts_notification_schedules) {
                $scope.ShipmentTemplate.alertsNotificationSchedules = $scope.ShipmentTemplate.alerts_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            }
            if ($scope.ShipmentTemplate.arrival_notification_schedules) {
                $scope.ShipmentTemplate.arrivalNotificationSchedules = $scope.ShipmentTemplate.arrival_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            }

            webSvc.saveShipmentTemplate($scope.ShipmentTemplate).success(
                function (data, textStatus, XmlHttpRequest) {
                $log.debug('SAVED', data);
                    if (data.status.code == 0) {
                        toastr.success("Shipment template added successfully")
                    } else {
                        toastr.warning("Warning. An error has occurred while create new shipment template");
                    }
                $state.go('manage.shiptemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.ShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.ShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedTo = shippedTo;
                }
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.ShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId }, true)[0];
                        if (shippedFrom)
                            $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.ShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId }, true)[0];
                        if (shippedTo)
                            $scope.ShipmentTemplate.shippedTo = shippedTo;
                    }
                });
            });
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.ShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true)[0];
                    if (alertProfile)
                        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.ShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true)[0];
                        if (alertProfile)
                            $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.ShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                //}
            })
        });
    };
    $scope.openEditNoti = function (notiId) {

        if (notiId) {
            if (notiId.length > 0) {
                notiId = notiId[0];
            }
            $rootScope.notiIdForModalPopup = notiId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.ShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };

    $scope.CreateAlertRule = function () {
        if ($scope.ShipmentTemplate.alertProfileId == null) {
            $scope.alertRuleListForSelectedAlertProfile = '';
        } else
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true);
            if (selectedAlertProfile) {
                if (selectedAlertProfile.length > 0) {
                    selectedAlertProfile = selectedAlertProfile[0];
                    $scope.alertRuleListForSelectedAlertProfile = arrayToStringFilter(selectedAlertProfile.alertRuleList);
                }
            }
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.alerts_notification_schedules) {
            $scope.AlertNotiRule = '';
            angular.forEach($scope.ShipmentTemplate.alerts_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            });
        }
    }
    $scope.ChangeNotiScheduleForArrival = function () {
        if($scope.ShipmentTemplate && $scope.ShipmentTemplate.arrival_notification_schedules) {
            $scope.ArrivalNotiRule = '';
            angular.forEach($scope.ShipmentTemplate.arrival_notification_schedules, function(val, key){
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            })
        }
    }
});

appCtrls.controller('EditShipTempCtrl', function ($scope, rootSvc, localDbSvc, arrayToStringFilter, $stateParams, $state, $filter,
                                                  $rootScope, $timeout, $uibModal, webSvc, $window, $log, $q, $location, $interval, $controller) {
    rootSvc.SetPageTitle('Edit Manual Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Manual Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";

    var filter = $filter('filter');
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }
    $scope.Print = function() {
        $window.print();
    }
    //--
    var BindLocations = function (cb) {
        return webSvc.getLocations(1000000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.LocationList = data.response;
                $scope.FromLocationList = [];
                $scope.ToLocationList = [];
                angular.forEach($scope.LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        $scope.LocationList[key].DisplayText = val.locationName;
                    }

                    if (val.startFlag == "Y")
                        $scope.FromLocationList.push(val);
                    if (val.endFlag == "Y")
                        $scope.ToLocationList.push(val);
                })
            }
        });
    }
    var BindAlertProfiles = function (cb) {
        return webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
            }
        })
    }
    var BindNotificationSchedules = function (cb) {
        return webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }
        });
    }

    $q.all([BindLocations(), BindAlertProfiles(), BindNotificationSchedules()]).then(function() {
        $scope.STId = $stateParams.stId
        $scope.ShipmentTemplate = {};
        if ($scope.STId) {
            var param = {
                shipmentTemplateId: $scope.STId
            };
            webSvc.getShipmentTemplate(param).success(function(data){
                if (data.status.code == 0) {
                    $scope.ShipmentTemplate = data.response;
                    $log.debug('ShipmentTemplate', data.response);
                    if (data.response) {
                        if ($scope.ShipmentTemplate.shutdownDeviceAfterMinutes == 0)
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = "0";
                        else if (data.response.shutdownDeviceAfterMinutes)
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = data.response.shutdownDeviceAfterMinutes.toString();
                        else
                            $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = "";

                        if ($scope.ShipmentTemplate.arrivalNotificationWithinKm == 0)
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = "0";
                        else if (data.response.arrivalNotificationWithinKm)
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = data.response.arrivalNotificationWithinKm.toString();
                        else
                            $scope.ShipmentTemplate.arrivalNotificationWithinKm = "";

                        if($scope.ShipmentTemplate.alertsNotificationSchedules) {
                             $scope.ShipmentTemplate.alerts_notification_schedules = $scope.ShipmentTemplate.alertsNotificationSchedules.map(function(val) {
                                 var notification = filter($scope.NotificationList, { notificationScheduleId: val }, true);
                                 if (notification) return notification[0];
                             });
                         }

                        if ($scope.ShipmentTemplate.arrivalNotificationSchedules) {
                            $scope.ShipmentTemplate.arrival_notification_schedules = $scope.ShipmentTemplate.arrivalNotificationSchedules.map(function(val) {
                                var notification = filter($scope.NotificationList, {notificationScheduleId: val}, true);
                                if (notification) return notification[0];
                            })
                        }

                        var shippedFrom = filter($scope.FromLocationList, { locationId: $scope.ShipmentTemplate.shippedFrom }, true);
                         if (shippedFrom && shippedFrom.length > 0) {
                            $scope.ShipmentTemplate.shippedFrom = shippedFrom[0];
                         }

                         var shippedTo = filter($scope.ToLocationList, { locationId: $scope.ShipmentTemplate.shippedTo }, true);
                         if (shippedTo && shippedTo.length > 0) {
                            $scope.ShipmentTemplate.shippedTo = shippedTo[0];
                         }

                         if ($scope.ShipmentTemplate.shippedFrom)
                         $scope.ChangeShipmentFrom();
                         if ($scope.ShipmentTemplate.shippedTo)
                         $scope.ChangeShipmentTo();

                        $scope.CreateAlertRule();
                        $scope.ChangeNotiScheduleForAlert();
                        $scope.ChangeNotiScheduleForArrival();
                    }
                }
            });

            $scope.mapOptions = {
                zoom: 4,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            }

            $scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
            $scope.map.setCenter(new google.maps.LatLng(20.632784, 78.969727));

            $scope.NotificationScheduleOption = {
                multiple: true
            };
        }
    });

    $scope.ChangeShipmentFrom = function () {
        if (!$scope.ShipmentTemplate.shippedFrom) {
            return;
        }
        //-reset map
        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        var fromLocation = $scope.ShipmentTemplate.shippedFrom.location;
        var toLocation = null;
        if ($scope.ShipmentTemplate.shippedTo) {
            toLocation = $scope.ShipmentTemplate.shippedTo.location;
        };

        if (fromLocation) {
            $scope.HomeMarker = new google.maps.Marker({
                position: new google.maps.LatLng(fromLocation.lat, fromLocation.lon),
                map: $scope.map,
                icon: 'theme/img/mapStart.png'
            });
            $scope.map.setCenter(new google.maps.LatLng(fromLocation.lat, fromLocation.lon));
            $scope.HomeMarker.setMap($scope.map);
        }

        if (fromLocation && toLocation) {
            $scope.DrawLine([fromLocation, toLocation])
        }

    }

    $scope.ChangeShipmentTo = function () {
        $log.debug('ShippedTo', $scope.ShipmentTemplate.shippedTo)
        if (!$scope.ShipmentTemplate.shippedTo) {
            return;
        }
        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        var toLocation = $scope.ShipmentTemplate.shippedTo.location;
        var fromLocation = null;
        if($scope.ShipmentTemplate.shippedFrom) {
            fromLocation = $scope.ShipmentTemplate.shippedFrom.location;
        };

        if (toLocation) {
            $scope.EndMarker = new google.maps.Marker({
                position: new google.maps.LatLng(toLocation.lat, toLocation.lon),
                map: $scope.map,
                icon: 'theme/img/mapStop.png'
            });
            $scope.map.setCenter(new google.maps.LatLng(toLocation.lat, toLocation.lon));
            $scope.EndMarker.setMap($scope.map);
        }

        if (fromLocation && toLocation) {
            $scope.DrawLine([fromLocation, toLocation])
        }
    }
    $scope.DrawLine = function (arrayOfLatLang) {

        if ($scope.Path)
            $scope.Path.setMap(null);


        var bounds = new google.maps.LatLngBounds();
        $scope.Route = [];
        angular.forEach(arrayOfLatLang, function (val, key) {
            $scope.Route.push(new google.maps.LatLng(val.lat, val.lon))
            bounds.extend(new google.maps.LatLng(val.lat, val.lon));
        })

        $scope.Path = new google.maps.Polyline(
        {
            path: $scope.Route,
            geodesic: true,
            strokeColor: '#F37E2E',
            strokeOpacity: 1.0,
            strokeWeight: 5
        });

        $scope.Path.setMap($scope.map);
        $scope.map.fitBounds(bounds);
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {

            if (!$scope.ShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.ShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if (!$scope.ShipmentTemplate.arrivalNotificationWithinKm)
                $scope.ShipmentTemplate.arrivalNotificationWithinKm = null;

            $scope.ShipmentTemplate.maxTimesAlertFires = null;
            $scope.ShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.ShipmentTemplate.shippedFrom)
                $scope.ShipmentTemplate.shippedFrom = $scope.ShipmentTemplate.shippedFrom.locationId;
            if ($scope.ShipmentTemplate.shippedTo)
                $scope.ShipmentTemplate.shippedTo = $scope.ShipmentTemplate.shippedTo.locationId;

            if($scope.ShipmentTemplate.alerts_notification_schedules) {
                $scope.ShipmentTemplate.alertsNotificationSchedules = $scope.ShipmentTemplate.alerts_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            }
            if ($scope.ShipmentTemplate.arrival_notification_schedules) {
                $scope.ShipmentTemplate.arrivalNotificationSchedules = $scope.ShipmentTemplate.arrival_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            }

            webSvc.saveShipmentTemplate($scope.ShipmentTemplate).success( function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    toastr.success("Shipment template added successfully")
                } else {
                    toastr.warning('Warning. An error has occurred while update shipment template.')
                }
                $state.go('manage.shiptemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });

        } else {
            toastr.error ('Data you have inputted is invalid. Please correct all fields in RED before try again.');
        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.ShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId })[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.ShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId })[0];
                    if (shippedFrom)
                        $scope.ShipmentTemplate.shippedTo = shippedTo;
                }

                $scope.ChangeShipmentFrom();
                $scope.ChangeShipmentTo();
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.ShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedFrom.locationId })[0];
                        if (shippedFrom)
                            $scope.ShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.ShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.ShipmentTemplate.shippedTo.locationId })[0];
                        if (shippedTo)
                            $scope.ShipmentTemplate.shippedTo = shippedTo;
                    }

                    $scope.ChangeShipmentFrom();
                    $scope.ChangeShipmentTo();
                });
            });
        } else {
            toastr.warning('There is no location for edit!');
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.ShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    if (alertProfile)
                        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.ShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                        if (alertProfile)
                            $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.ShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                //}
            })
        });
    };
    $scope.openEditNoti = function (notiId) {

        if (notiId) {
            if (notiId.length > 0) {
                notiId = notiId[0];
            }
            $rootScope.notiIdForModalPopup = notiId;
            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.ShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.ShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };

    $scope.CreateAlertRule = function () {
        if ($scope.ShipmentTemplate.alertProfileId == null) {
            $scope.alertRuleListForSelectedAlertProfile = '';
        } else
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = filter($scope.AlertList, { alertProfileId: $scope.ShipmentTemplate.alertProfileId }, true);
            if (selectedAlertProfile) {
                if (selectedAlertProfile.length > 0) {
                    selectedAlertProfile = selectedAlertProfile[0];
                    $scope.alertRuleListForSelectedAlertProfile = arrayToStringFilter(selectedAlertProfile.alertRuleList);
                }
            }
        }
    }
    $scope.ChangeNotiScheduleForAlert = function () {
        if ($scope.ShipmentTemplate && $scope.ShipmentTemplate.alerts_notification_schedules) {
            $scope.AlertNotiRule = '';
            angular.forEach($scope.ShipmentTemplate.alerts_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            });
        }
    }
    $scope.ChangeNotiScheduleForArrival = function () {
        if($scope.ShipmentTemplate && $scope.ShipmentTemplate.arrival_notification_schedules) {
            $scope.ArrivalNotiRule = '';
            angular.forEach($scope.ShipmentTemplate.arrival_notification_schedules, function(val, key){
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            })
        }
    }
});
appFilters.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;
                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }
        return out;
    };
});