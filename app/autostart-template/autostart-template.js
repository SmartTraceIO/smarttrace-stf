appCtrls.controller('ListAutoTempCtrl', function ($scope, $state, $filter, $modal, rootSvc, localDbSvc, webSvc, $window) {
    rootSvc.SetPageTitle('List of Autostart Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Autostart templates");
    var filter = $filter('filter');
    var BindAutoShipmentList = function () {
        var param = {
            pageSize: $scope.PageSize,
            pageIndex: $scope.PageIndex,
            so: $scope.So,
            sc: $scope.Sc
        };

        webSvc.getAutoStartShipments(param).success(function(data){
            if (data.status.code == 0) {
                $scope.AutoStartShipmentList = data.response;
                $scope.AutoStartShipmentList.totalCount = data.totalCount;
                console.log('AutoStartShipmentList', $scope.AutoStartShipmentList);
            } else {
                toastr.error('Cannot get list of AutoStartShipment');
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
        BindAutoShipmentList();
    }
    $scope.PageSizeChanged = function () {
        BindAutoShipmentList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindAutoShipmentList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindAutoShipmentList();
    }

    $scope.confirmDelete = function(shipmentTempId) {
        var modalInstance = $modal.open({
            templateUrl: 'app/autostart-template/confirm-delete.html',
            controller: 'ConfirmDeleteAutoStartCtrl',
            resolve: {
                templateId: function () {
                    return shipmentTempId;
                }
            }
        })
        modalInstance.result.then(
            function() {
                BindAutoShipmentList();
            }
        );
    }
});

appCtrls.controller('AddAutoTempCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $state, $window,
                                                 $filter, arrayToStringFilter, $modal, $rootScope) {
    rootSvc.SetPageTitle('Add Auto Shipment');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Auto Shipment");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Add";

    $scope.Print = function() {
        $window.print();
    }

    var BindLocations = function (cb) {
        webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.LocationList = data.response;

                $scope.FromLocationList = [];
                $scope.ToLocationList = [];
                $scope.InterimLocationList = [];

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
                    if (val.interimFlag == 'Y') {
                        $scope.InterimLocationList.push(val);
                    }
                })

                if (cb)
                    cb;
            }
        });
    }
    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
            }

            if (cb)
                cb;
        });
    }
    var BindNotificationSchedules = function (cb) {
        webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }

            if (cb)
                cb;
        });
    }
    $scope.Init = function () {
        $scope.AutoStartShipment = {};
        $scope.AutoStartShipment.detectLocationForShippedFrom = false;
        $scope.AutoStartShipment.shutdownDeviceAfterMinutes = "120";
        $scope.AutoStartShipment.alertSuppressionMinutes = 120;
        $scope.AutoStartShipment.addDateShipped = true;
        $scope.AutoStartShipment.excludeNotificationsIfNoAlerts = false;

        $scope.NotificationScheduleOption = {
            multiple: true
        };

        BindLocations();
        BindAlertProfiles();
        BindNotificationSchedules();
    }

    $scope.VerifyStartLocations = function() {
        if ($scope.AutoStartShipment.start_locations) {
            var lastSelectLoc = $scope.AutoStartShipment.start_locations[$scope.AutoStartShipment.start_locations.length-1];
            if (($scope.AutoStartShipment.interim_stops && $scope.AutoStartShipment.interim_stops.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.end_locations && $scope.AutoStartShipment.end_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.VerifyInterimLocations = function() {
        if ($scope.AutoStartShipment.interim_stops) {
            var lastSelectLoc = $scope.AutoStartShipment.interim_stops[$scope.AutoStartShipment.interim_stops.length-1];
            if (($scope.AutoStartShipment.start_locations && $scope.AutoStartShipment.start_locations.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.end_locations && $scope.AutoStartShipment.end_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.VerifyEndLocations = function() {
        if ($scope.AutoStartShipment.end_locations) {
            var lastSelectLoc = $scope.AutoStartShipment.end_locations[$scope.AutoStartShipment.end_locations.length-1];
            if (($scope.AutoStartShipment.interim_stops && $scope.AutoStartShipment.interim_stops.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.start_locations && $scope.AutoStartShipment.start_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {
            $scope.AutoStartShipment.maxTimesAlertFires = null;
            $scope.AutoStartShipment.useCurrentTimeForDateShipped = true;
            if ($scope.AutoStartShipment.start_locations) {
                $scope.AutoStartShipment.startLocations = $scope.AutoStartShipment.start_locations.map(function(val) {
                    return val.locationId;
                });
            } else {
                $scope.AutoStartShipment.startLocations = [];
            }
            //--#
            if ($scope.AutoStartShipment.interim_stops) {
                $scope.AutoStartShipment.interimStops = $scope.AutoStartShipment.interim_stops.map(function(val) {
                    return val.locationId;
                })
            } else {
                $scope.AutoStartShipment.interimStops = [];
            }
            //--#
            if ($scope.AutoStartShipment.end_locations) {
                $scope.AutoStartShipment.endLocations = $scope.AutoStartShipment.end_locations.map(function(val) {
                    return val.locationId;
                })
            } else {
                $scope.AutoStartShipment.endLocations = [];
            }

            $scope.AutoStartShipment.shutdownDeviceAfterMinutes = parseInt($scope.AutoStartShipment.shutdownDeviceAfterMinutes);
            $scope.AutoStartShipment.shutDownAfterStartMinutes  = parseInt($scope.AutoStartShipment.shutDownAfterStartMinutes);
            $scope.AutoStartShipment.arrivalNotificationWithinKm = parseInt($scope.AutoStartShipment.arrivalNotificationWithinKm);
            $scope.AutoStartShipment.noAlertsAfterArrivalMinutes = parseInt($scope.AutoStartShipment.noAlertsAfterArrivalMinutes);
            $scope.AutoStartShipment.noAlertsAfterStartMinutes = parseInt($scope.AutoStartShipment.noAlertsAfterStartMinutes);

            if ($scope.AutoStartShipment.arrival_notification_schedules) {
                $scope.AutoStartShipment.arrivalNotificationSchedules = $scope.AutoStartShipment.arrival_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            } else {
                $scope.AutoStartShipment.arrivalNotificationSchedules = [];
            }
            if ($scope.AutoStartShipment.alerts_notification_schedules) {
                $scope.AutoStartShipment.alertsNotificationSchedules = $scope.AutoStartShipment.alerts_notification_schedules.map(function(val) {
                    return val.notificationScheduleId;
                })
            } else {
                $scope.AutoStartShipment.alertsNotificationSchedules = [];
            }
            webSvc.saveAutoStartShipment($scope.AutoStartShipment).success(
                function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    toastr.success("Shipment template added successfully")
                }
                $state.go('manage.autotemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        } else {
            toastr.error('Inputted data is invalid. Please correct all fields in RED before try again!')
        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.AutoStartShipment.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedFrom.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.AutoStartShipment.shippedFrom = shippedFrom;
                }
                if ($scope.AutoStartShipment.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedTo.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.AutoStartShipment.shippedTo = shippedTo;
                }
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.AutoStartShipment.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedFrom.locationId }, true)[0];
                        if (shippedFrom)
                            $scope.AutoStartShipment.shippedFrom = shippedFrom;
                    }
                    if ($scope.AutoStartShipment.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedTo.locationId }, true)[0];
                        if (shippedTo)
                            $scope.AutoStartShipment.shippedTo = shippedTo;
                    }
                });
            });
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.AutoStartShipment.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true)[0];
                    if (alertProfile)
                        $scope.AutoStartShipment.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.AutoStartShipment.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true)[0];
                        if (alertProfile)
                            $scope.AutoStartShipment.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.AutoStartShipment.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.AutoStartShipment.alertProfileId = alertProfile;
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
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.AutoStartShipment.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.AutoStartShipment.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };

    $scope.CreateAlertRule = function () {
        if ($scope.AutoStartShipment.alertProfileId == null) {
            $scope.alertRuleListForSelectedAlertProfile = '';
        } else
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true);
            if (selectedAlertProfile && selectedAlertProfile.length > 0) {
                selectedAlertProfile = selectedAlertProfile[0];
                $scope.alertRuleListForSelectedAlertProfile = arrayToStringFilter(selectedAlertProfile.alertRuleList);
            }
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        $scope.AlertNotiRule = null;
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.alerts_notification_schedules) {
            angular.forEach($scope.AutoStartShipment.alerts_notification_schedules, function (val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            });
        }
    }

    $scope.ChangeNotiScheduleForArrival = function () {
        $scope.ArrivalNotiRule = null;
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.arrival_notification_schedules) {
            angular.forEach($scope.AutoStartShipment.arrival_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            });

        }
    }
});

appCtrls.controller('EditAutoTempCtrl', function ($scope, rootSvc, localDbSvc, $stateParams, arrayToStringFilter,
                                                  $state, $filter, $rootScope, $modal, webSvc, $window, $q){
    rootSvc.SetPageTitle('Edit AutoStart Shipment');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("AutoStart Shipment");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    var filter = $filter('filter');

    $scope.Print = function() {
        $window.print();
    }
    var BindLocations = function (cb) {
        return webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.LocationList = data.response;

                $scope.FromLocationList = [];
                $scope.ToLocationList = [];
                $scope.InterimLocationList = [];

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
                    if (val.interimFlag == 'Y') {
                        $scope.InterimLocationList.push(val);
                    }
                })

                if (cb)
                    cb;
            }
        });
    }
    var BindAlertProfiles = function (cb) {
        return webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
            }

            if (cb)
                cb;
        });
    }
    var BindNotificationSchedules = function (cb) {
        return webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }

            if (cb)
                cb;
        });
    }

    //BindLocations();
    //BindAlertProfiles();
    //BindNotificationSchedules();

    $q.all([BindLocations(), BindAlertProfiles(), BindNotificationSchedules()]).then(function() {
        var params = null;
        $scope.STId = $stateParams.stId
        if ($scope.STId) {
            params = {
                autoStartShipmentId: $scope.STId
            };
        }
        webSvc.getAutoStartShipment(params).success(function(data){
            if (data.status.code == 0) {
                var response = data.response;
                 $scope.AutoStartShipment = data.response;
                 //-- correcting
                 if (response.shutdownDeviceAfterMinutes)
                 $scope.AutoStartShipment.shutdownDeviceAfterMinutes = response.shutdownDeviceAfterMinutes.toString();

                 if (response.shutDownAfterStartMinutes) {
                 $scope.AutoStartShipment.shutDownAfterStartMinutes = response.shutDownAfterStartMinutes.toString();
                 }

                 if ($scope.AutoStartShipment.arrivalNotificationWithinKm)
                 $scope.AutoStartShipment.arrivalNotificationWithinKm = response.arrivalNotificationWithinKm.toString();

                 //-- noAlertsAfterArrivalMinutes
                 if (response.noAlertsAfterArrivalMinutes) {
                 $scope.AutoStartShipment.noAlertsAfterArrivalMinutes = response.noAlertsAfterArrivalMinutes.toString();
                 }
                 //-- noAlertsAfterStartMinutes -- seems not done on server side
                 if (response.noAlertsAfterStartMinutes) {
                 $scope.AutoStartShipment.noAlertsAfterStartMinutes = response.noAlertsAfterStartMinutes.toString();
                 }

                if ($scope.AutoStartShipment.startLocations) {
                    $scope.AutoStartShipment.start_locations = $scope.AutoStartShipment.startLocations.map(function (val) {
                        var loc = filter($scope.FromLocationList, {locationId: val}, true);
                        if (loc && loc.length > 0) return loc[0];
                        else return null;
                    })
                }

                if ($scope.AutoStartShipment.interimStops) {
                    $scope.AutoStartShipment.interim_stops = $scope.AutoStartShipment.interimStops.map(function (val) {
                        var loc = filter($scope.InterimLocationList, {locationId: val}, true);
                        if (loc && loc.length > 0) return loc[0];
                        else return null;
                    });
                }
                if ($scope.AutoStartShipment.endLocations) {
                    $scope.AutoStartShipment.end_locations = $scope.AutoStartShipment.endLocations.map(function (val) {
                        var loc = filter($scope.ToLocationList, {locationId: val}, true);
                        if (loc && loc.length > 0) return loc[0];
                    });
                }
                if ($scope.AutoStartShipment.arrivalNotificationSchedules) {
                    $scope.AutoStartShipment.arrival_notification_schedules = $scope.AutoStartShipment.arrivalNotificationSchedules.map(function (val) {
                        var noti = filter($scope.NotificationList, {notificationScheduleId: val}, true)
                        if (noti && noti.length > 0) return noti[0];
                    });
                }
                if ($scope.AutoStartShipment.alertsNotificationSchedules) {
                    $scope.AutoStartShipment.alerts_notification_schedules = $scope.AutoStartShipment.alertsNotificationSchedules.map(function (val) {
                        var noti = filter($scope.NotificationList, {notificationScheduleId: val}, true)
                        if (noti && noti.length > 0) return noti[0];
                    });
                }
                 $scope.ChangeNotiScheduleForAlert();
                 $scope.ChangeNotiScheduleForArrival();
            } else {
            }
        })
   });

    $scope.VerifyStartLocations = function() {
        if ($scope.AutoStartShipment.start_locations) {
            var lastSelectLoc = $scope.AutoStartShipment.start_locations[$scope.AutoStartShipment.start_locations.length-1];
            if (($scope.AutoStartShipment.interim_stops && $scope.AutoStartShipment.interim_stops.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.end_locations && $scope.AutoStartShipment.end_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.VerifyInterimLocations = function() {
        if ($scope.AutoStartShipment.interim_stops) {
            var lastSelectLoc = $scope.AutoStartShipment.interim_stops[$scope.AutoStartShipment.interim_stops.length-1];
            if (($scope.AutoStartShipment.start_locations && $scope.AutoStartShipment.start_locations.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.end_locations && $scope.AutoStartShipment.end_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.VerifyEndLocations = function() {
        if ($scope.AutoStartShipment.end_locations) {
            var lastSelectLoc = $scope.AutoStartShipment.end_locations[$scope.AutoStartShipment.end_locations.length-1];
            if (($scope.AutoStartShipment.interim_stops && $scope.AutoStartShipment.interim_stops.indexOf(lastSelectLoc) >= 0) ||
                ($scope.AutoStartShipment.start_locations && $scope.AutoStartShipment.start_locations.indexOf(lastSelectLoc) >= 0))
            {
                toastr.warning('Warning. A location can only appear in one section - either Shipped From, Interim or Shipped To.' +
                    ' You could consider adding a nearby location as an alternative. ');
            }
        }
    }
    $scope.SaveData = function (isValid) {
        if (isValid) {

            if (!$scope.AutoStartShipment.shutdownDeviceAfterMinutes)
                $scope.AutoStartShipment.shutdownDeviceAfterMinutes = null;

            if (!$scope.AutoStartShipment.arrivalNotificationWithinKm)
                $scope.AutoStartShipment.arrivalNotificationWithinKm = null;

            $scope.AutoStartShipment.maxTimesAlertFires = null;
            $scope.AutoStartShipment.useCurrentTimeForDateShipped = true;

            if ($scope.AutoStartShipment.start_locations) {
                $scope.AutoStartShipment.startLocations = $scope.AutoStartShipment.start_locations.map(function (val) {
                    return val.locationId;
                });
            }

            if ($scope.AutoStartShipment.interim_stops) {
                $scope.AutoStartShipment.interimStops = $scope.AutoStartShipment.interim_stops.map(function (val) {
                    return val.locationId;
                })
            }

            if ($scope.AutoStartShipment.end_locations) {
                $scope.AutoStartShipment.endLocations = $scope.AutoStartShipment.end_locations.map(function (val) {
                    return val.locationId;
                });
            }

            if ($scope.AutoStartShipment.arrival_notification_schedules) {
                $scope.AutoStartShipment.arrivalNotificationSchedules = $scope.AutoStartShipment.arrival_notification_schedules.map(function (val) {
                    return val.notificationScheduleId;
                });
            }

            if ($scope.AutoStartShipment.alerts_notification_schedules) {
                $scope.AutoStartShipment.alertsNotificationSchedules = $scope.AutoStartShipment.alerts_notification_schedules.map(function (val) {
                    return val.notificationScheduleId;
                });
            }

            webSvc.saveAutoStartShipment($scope.AutoStartShipment)
                .success(function (data, textStatus, XmlHttpRequest) {
                toastr.success("Auto Start Shipment updated successfully")
                $state.go('manage.autotemp')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });

        }
    }
    $scope.openAddLocation = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-location/add-edit.html',
            controller: 'AddLocCtrl',
        })

        $rootScope.modalInstance.result.then(function () {
            BindLocations(function () {
                if ($scope.AutoStartShipment.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedFrom.locationId })[0];
                    if (shippedFrom)
                        $scope.AutoStartShipment.shippedFrom = shippedFrom;
                }
                if ($scope.AutoStartShipment.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedTo.locationId })[0];
                    if (shippedFrom)
                        $scope.AutoStartShipment.shippedTo = shippedTo;
                }

                $scope.ChangeShipmentFrom();
                $scope.ChangeShipmentTo();
            });
        });
    };
    $scope.openEditLocation = function (locationId) {
        if (locationId) {
            $rootScope.locationIdForModalPopup = locationId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-location/add-edit.html',
                controller: 'EditLocCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindLocations(function () {
                    if ($scope.AutoStartShipment.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedFrom.locationId })[0];
                        if (shippedFrom)
                            $scope.AutoStartShipment.shippedFrom = shippedFrom;
                    }
                    if ($scope.AutoStartShipment.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoStartShipment.shippedTo.locationId })[0];
                        if (shippedTo)
                            $scope.AutoStartShipment.shippedTo = shippedTo;
                    }

                    $scope.ChangeShipmentFrom();
                    $scope.ChangeShipmentTo();
                });
            });
        }
    };
    $scope.openAddAlert = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-alert/add-edit.html',
            controller: 'AddAlertCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindAlertProfiles(function () {
                if ($scope.AutoStartShipment.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                    if (alertProfile)
                        $scope.AutoStartShipment.alertProfileId = alertProfile;
                }
            })
        });
    };
    $scope.openEditAlert = function (alertId) {
        if (alertId) {
            $rootScope.alertIdForModalPopup = alertId;
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-alert/add-edit.html',
                controller: 'EditAlertCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindAlertProfiles(function () {
                    if ($scope.AutoStartShipment.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                        if (alertProfile)
                            $scope.AutoStartShipment.alertProfileId = alertProfile;
                    }
                })
            });
        }
    };
    $scope.openAddNoti = function () {
        $rootScope.modalInstance = $modal.open({
            templateUrl: '/app/manage-notification/add-edit.html',
            controller: 'AddNotiCtrl',
        });

        $rootScope.modalInstance.result.then(function () {
            BindNotificationSchedules(function () {
                //if ($scope.AutoStartShipment.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.AutoStartShipment.alertProfileId = alertProfile;
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
            $rootScope.modalInstance = $modal.open({
                templateUrl: '/app/manage-notification/add-edit.html',
                controller: 'EditNotiCtrl',
            });

            $rootScope.modalInstance.result.then(function () {
                BindNotificationSchedules(function () {
                    //if ($scope.AutoStartShipment.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.AutoStartShipment.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };
    $scope.CreateAlertRule = function () {
        if ($scope.AutoStartShipment.alertProfileId == null) {
            $scope.alertRuleListForSelectedAlertProfile = '';
        } else
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true);
            if (selectedAlertProfile && selectedAlertProfile.length > 0) {
                selectedAlertProfile = selectedAlertProfile[0];
                $scope.alertRuleListForSelectedAlertProfile = arrayToStringFilter(selectedAlertProfile.alertRuleList);
            }
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        $scope.AlertNotiRule = null;
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.alerts_notification_schedules) {
            angular.forEach($scope.AutoStartShipment.alerts_notification_schedules, function (val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            });
        }
    }

    $scope.ChangeNotiScheduleForArrival = function () {
        $scope.ArrivalNotiRule = null;
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.arrival_notification_schedules) {
            angular.forEach($scope.AutoStartShipment.arrival_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            });

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