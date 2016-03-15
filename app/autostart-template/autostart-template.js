appCtrls.controller('ListAutoTempCtrl', function ($scope, $filter, rootSvc, localDbSvc, webSvc) {
    rootSvc.SetPageTitle('List of Autostart Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Autostart templates");
    $scope.AuthToken = localDbSvc.getToken();
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

                /*webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
                    if (data.status.code == 0) {
                        $scope.AlertList = data.response;
                    }
                }).then(function() {
                    webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
                        if (data.status.code == 0) {
                            $scope.LocationList = data.response;
                        }
                    }).then(function() {
                        console.log('LocationList', $scope.LocationList);
                        angular.forEach($scope.AutoStartShipmentList, function(autoStartShipment, key) {
                            if (autoStartShipment.alertProfileId) {
                                webSvc.getAlertProfile(autoStartShipment.alertProfileId).success(function(resp) {
                                    $scope.AutoStartShipmentList[key].alertProfileName = resp.response.alertProfileName;
                                })
                            }

                            if (autoStartShipment.startLocations && autoStartShipment.startLocations.length > 0){
                                var locFrom = filter($scope.LocationList, {locationId:autoStartShipment.startLocations[0]}, true);
                                $scope.AutoStartShipmentList[key].shippedFromLocationName = locFrom[0].locationName;
                            }
                            if (autoStartShipment.endLocations && autoStartShipment.endLocations.length>0){
                                var locTo = filter($scope.LocationList, {locationId: autoStartShipment.endLocations[0]}, true);
                                $scope.AutoStartShipmentList[key].shippedToLocationName = locTo[0].locationName;
                            }
                        });
                    })
                })*/
            } else {
                toastr.error('Cannot get list of AutoStartShipment');
            }
        });
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

    $scope.confirm = function (shipmentTempId) {
        $scope.autoStartShipmentId = shipmentTempId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteShipment = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteAutoStartShipment($scope.autoStartShipmentId).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Shipment template deleted successfully");
                BindAutoShipmentList();
            }
        });
    }
});

appCtrls.controller('AddAutoTempCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $state, $filter, $modal, $rootScope) {
    rootSvc.SetPageTitle('Add Auto Shipment');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Auto Shipment");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Add";
    var BindLocations = function (cb) {
        webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
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
        $scope.AutoStartShipment.shutdownDeviceAfterMinutes = '120';
        $scope.AutoStartShipment.alertSuppressionMinutes = 120;
        $scope.AutoStartShipment.addDateShipped = false;
        $scope.AutoStartShipment.excludeNotificationsIfNoAlerts = false;

        $scope.NotificationScheduleOption = {
            multiple: true
        };

        BindLocations();
        BindAlertProfiles();
        BindNotificationSchedules();
    }

    $scope.ChangeShipmentFrom = function () {
        $scope.ShipmentFrom = [];
        if ($scope.AutoStartShipment.startLocations) {
            angular.forEach($scope.AutoStartShipment.startLocations, function(value, key) {
                webSvc.getLocation(value).success(function(resp) {
                    if (resp.status.code == 0) {
                        if ($scope.ShipmentFrom.indexOf(resp.response.locationName) < 0) {
                            $scope.ShipmentFrom.push(resp.response.locationName);
                        }
                    } else {

                    }
                });
            })
        }
    };
    $scope.ChangeShipmentTo = function () {
        $scope.ShipmentTo = [];
        if ($scope.AutoStartShipment.endLocations) {
            angular.forEach($scope.AutoStartShipment.endLocations, function(value, key) {
                webSvc.getLocation(value).success(function(resp) {
                    if (resp.status.code == 0) {
                        if ($scope.ShipmentTo.indexOf(resp.response.locationName) < 0) {
                            $scope.ShipmentTo.push(resp.response.locationName);
                        }
                    } else {

                    }
                });
            })
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

            $scope.AutoStartShipment.maxTimesAlertFires = null;
            $scope.AutoStartShipment.useCurrentTimeForDateShipped = true;
            $scope.AutoStartShipment.startLocations = [];
            $scope.AutoStartShipment.endLocations = [];

            if ($scope.AutoStartShipment.shippedFrom)
                $scope.AutoStartShipment.startLocations.push($scope.AutoStartShipment.shippedFrom.locationId);

            if ($scope.AutoStartShipment.shippedTo)
                $scope.AutoStartShipment.endLocations.push($scope.AutoStartShipment.shippedTo.locationId);

            webSvc.saveAutoStartShipment($scope.AutoStartShipment).success(
                function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    toastr.success("Shipment template added successfully")
                }
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
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true);
            if (selectedAlertProfile && selectedAlertProfile.length > 0) {
                selectedAlertProfile = selectedAlertProfile[0];
                if (selectedAlertProfile.alertRuleList) {
                    angular.forEach(selectedAlertProfile.alertRuleList, function (val, key) {
                        if (key != 0)
                            $scope.alertRuleListForSelectedAlertProfile = $scope.alertRuleListForSelectedAlertProfile + ", " + val;
                        else
                            $scope.alertRuleListForSelectedAlertProfile = val;
                    })
                }
            }
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        console.log($scope.AutoStartShipment.alertsNotificationSchedules);
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.AutoStartShipment.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoStartShipment.alertsNotificationSchedules[i]) }, true)
                if (shipment && shipment.length > 0) {
                    shipment = shipment[0];
                    var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                    if ($scope.AlertNotiRule)
                        $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                    else
                        $scope.AlertNotiRule = peopleToNotify;
                }
            }
        }
    }

    $scope.ChangeNotiScheduleForArrival = function () {
        
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.AutoStartShipment.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoStartShipment.arrivalNotificationSchedules[i]) }, true)

                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.ArrivalNotiRule)
                            $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.ArrivalNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
});

appCtrls.controller('EditAutoTempCtrl', function ($scope, rootSvc, localDbSvc, $stateParams, $state, $filter, $rootScope, $modal, webSvc) {
    rootSvc.SetPageTitle('Edit AutoStart Shipment');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("AutoStart Shipment");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    var BindLocations = function (cb) {
        webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
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

                if (cb)
                    cb;
            }
        });
    }
    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
                $scope.CreateAlertRule();
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

    BindLocations();
    BindAlertProfiles();
    BindNotificationSchedules();

    //$scope.ChangeShipmentFrom = function () {
    //    $scope.ShipmentFrom = [];
    //    if ($scope.AutoStartShipment.startLocations) {
    //        angular.forEach($scope.AutoStartShipment.startLocations, function(value, key) {
    //
    //
    //            webSvc.getLocation(value).success(function(resp) {
    //                if (resp.status.code == 0) {
    //                    if ($scope.ShipmentFrom.indexOf(resp.response.locationName) < 0) {
    //                        $scope.ShipmentFrom.push(resp.response.locationName);
    //                    }
    //                } else {
    //
    //                }
    //            });
    //        })
    //    }
    //};
    //$scope.ChangeShipmentTo = function () {
    //    $scope.ShipmentTo = [];
    //    if ($scope.AutoStartShipment.endLocations) {
    //        angular.forEach($scope.AutoStartShipment.endLocations, function(value, key) {
    //            webSvc.getLocation(value).success(function(resp) {
    //                if (resp.status.code == 0) {
    //                    if ($scope.ShipmentTo.indexOf(resp.response.locationName) < 0) {
    //                        $scope.ShipmentTo.push(resp.response.locationName);
    //                    }
    //                } else {
    //
    //                }
    //            });
    //        })
    //    }
    //}
    $scope.Init = function () {
        $scope.STId = $stateParams.stId
        $scope.AutoStartShipment = {};
        if ($scope.STId) {
            var param = {
                autoStartShipmentId: $scope.STId
            };
            webSvc.getAutoStartShipment(param).success(function(data){
                if (data.status.code == 0) {
                    var response = data.response;
                    console.log(response);
                    $scope.AutoStartShipment = response;
                    if (response) {
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
                        $scope.ChangeNotiScheduleForAlert();
                        $scope.ChangeNotiScheduleForArrival();
                        //$scope.ChangeShipmentFrom();
                        //$scope.ChangeShipmentTo();
                    }
                } else {
                    toastr.error(data.status.message);
                }
            })

            $scope.OptionsShipmentTo = {
                multiple:true
            };
            $scope.OptionsShipmentFrom = {
                multiple:true
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

            console.log('BEFORE SAVE!', $scope.AutoStartShipment)
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
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoStartShipment.alertProfileId }, true);
            if (selectedAlertProfile) {
                if (selectedAlertProfile.length > 0) {
                    selectedAlertProfile = selectedAlertProfile[0];
                    if (selectedAlertProfile.alertRuleList) {
                        angular.forEach(selectedAlertProfile.alertRuleList, function (val, key) {
                            if (key != 0)
                                $scope.alertRuleListForSelectedAlertProfile = $scope.alertRuleListForSelectedAlertProfile + ", " + val;
                            else
                                $scope.alertRuleListForSelectedAlertProfile = val;
                        })
                    }
                }
            }
        }
    }
    $scope.ChangeNotiScheduleForAlert = function () {
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.AutoStartShipment.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoStartShipment.alertsNotificationSchedules[i]) }, true)
                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.AlertNotiRule)
                            $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.AlertNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
    $scope.ChangeNotiScheduleForArrival = function () {
        if ($scope.AutoStartShipment && $scope.AutoStartShipment.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.AutoStartShipment.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoStartShipment.arrivalNotificationSchedules[i]) }, true)
                if (shipment) {
                    if (shipment.length > 0) {
                        shipment = shipment[0];
                        var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                        if ($scope.ArrivalNotiRule)
                            $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                        else
                            $scope.ArrivalNotiRule = peopleToNotify;
                    }
                }
            }
        }
    }
});

appFilters.filter('arrayToString', function() {
    return function (input) {
        if (angular.isArray(input)) {
            return input.join();
        } else {
            return input;
        }
    }
});