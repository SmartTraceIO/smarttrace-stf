appCtrls.controller('ListAutoTempCtrl', function ($scope, rootSvc, localDbSvc, webSvc) {
    rootSvc.SetPageTitle('List Auto Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Auto Templates");
    $scope.AuthToken = localDbSvc.getToken();
    var BindAutoShipmentList = function () {
        var param = {
            pageSize: $scope.PageSize,
            pageIndex: $scope.PageIndex,
            so: $scope.So,
            sc: $scope.Sc
        };
        webSvc.getAutoStartShipments(param).success(function(data){
            if (data.status.code == 0) {
                toastr.success('Get list of AutoStartShipment');
                console.log(data);
                $scope.AutoShipmentList = data.response;
                $scope.AutoShipmentList.totalCount = data.totalCount;
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
        $scope.STemplateToDeleteShipTemp = shipmentTempId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteShipment = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteShipmentTemplate($scope.STemplateToDeleteShipTemp).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Shipment template deleted successfully")
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
        $scope.AutoShipmentTemplate = {};
        $scope.AutoShipmentTemplate.detectLocationForShippedFrom = false;
        $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = '120';
        $scope.AutoShipmentTemplate.alertSuppressionMinutes = 120;
        $scope.AutoShipmentTemplate.addDateShipped = false;
        $scope.AutoShipmentTemplate.excludeNotificationsIfNoAlerts = false;
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
    $scope.$watch("AutoShipmentTemplate.detectLocationForShippedFrom", function (nVal, oVal) {
        if (nVal) {
            $scope.AutoShipmentTemplate.shippedFrom = "";

            if ($scope.HomeMarker)
                $scope.HomeMarker.setMap(null);
            if ($scope.Path)
                $scope.Path.setMap(null);
        }
    })
    $scope.ChangeShipmentFrom = function () {

        if ($scope.AutoShipmentTemplate.shippedFrom) {
            $scope.AutoShipmentTemplate.detectLocationForShippedFrom = false;
        }

        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        $scope.HomeMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.AutoShipmentTemplate.shippedFrom.location.lat, $scope.AutoShipmentTemplate.shippedFrom.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStart.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.AutoShipmentTemplate.shippedFrom.location.lat, $scope.AutoShipmentTemplate.shippedFrom.location.lon));

        $scope.HomeMarker.setMap($scope.map);

        if ($scope.AutoShipmentTemplate.shippedFrom && $scope.AutoShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.AutoShipmentTemplate.shippedFrom.location, $scope.AutoShipmentTemplate.shippedTo.location])
        }
    }
    $scope.ChangeShipmentTo = function () {

        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        $scope.EndMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.AutoShipmentTemplate.shippedTo.location.lat, $scope.AutoShipmentTemplate.shippedTo.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStop.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.AutoShipmentTemplate.shippedTo.location.lat, $scope.AutoShipmentTemplate.shippedTo.location.lon));
        $scope.EndMarker.setMap($scope.map);

        if ($scope.AutoShipmentTemplate.shippedFrom && $scope.AutoShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.AutoShipmentTemplate.shippedFrom.location, $scope.AutoShipmentTemplate.shippedTo.location])
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
            if (!$scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if (!$scope.AutoShipmentTemplate.arrivalNotificationWithinKm)
                $scope.AutoShipmentTemplate.arrivalNotificationWithinKm = null;

            $scope.AutoShipmentTemplate.maxTimesAlertFires = null;
            $scope.AutoShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.AutoShipmentTemplate.shippedFrom)
                $scope.AutoShipmentTemplate.shippedFrom = $scope.AutoShipmentTemplate.shippedFrom.locationId;
            if ($scope.AutoShipmentTemplate.shippedTo)
                $scope.AutoShipmentTemplate.shippedTo = $scope.AutoShipmentTemplate.shippedTo.locationId;

            webSvc.saveAutoStartShipment($scope.AutoShipmentTemplate).success( function (data, textStatus, XmlHttpRequest) {
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
                if ($scope.AutoShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedFrom.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.AutoShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.AutoShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedTo.locationId }, true)[0];
                    if (shippedFrom)
                        $scope.AutoShipmentTemplate.shippedTo = shippedTo;
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
                    if ($scope.AutoShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedFrom.locationId }, true)[0];
                        if (shippedFrom)
                            $scope.AutoShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.AutoShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedTo.locationId }, true)[0];
                        if (shippedTo)
                            $scope.AutoShipmentTemplate.shippedTo = shippedTo;
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
                if ($scope.AutoShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId }, true)[0];
                    if (alertProfile)
                        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                    if ($scope.AutoShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId }, true)[0];
                        if (alertProfile)
                            $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                //if ($scope.AutoShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                    //if ($scope.AutoShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };

    $scope.CreateAlertRule = function () {
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId }, true);
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
        console.log($scope.AutoShipmentTemplate.alertsNotificationSchedules);
        if ($scope.AutoShipmentTemplate && $scope.AutoShipmentTemplate.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.AutoShipmentTemplate.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoShipmentTemplate.alertsNotificationSchedules[i]) }, true)
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
        
        if ($scope.AutoShipmentTemplate && $scope.AutoShipmentTemplate.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.AutoShipmentTemplate.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoShipmentTemplate.arrivalNotificationSchedules[i]) }, true)

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
    rootSvc.SetPageTitle('Edit Shipment Template');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Shipment Templates");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    var BindLocations = function (cb) {

    }
    var BindAlertProfiles = function (cb) {
        webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success(function(data){
        // .get({ action: "getAlertProfiles", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'alertProfileName', sc: 'asc' }, function (data) {
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
        // .get({ action: "getNotificationSchedules", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'notificationScheduleName', sc: 'asc' }, function (data) {
            if (data.status.code == 0) {
                $scope.NotificationList = data.response;
            }

            if (cb)
                cb;
        });
    }

    //BindLocations();
    BindAlertProfiles();
    BindNotificationSchedules();

    $scope.Init = function () {
        $scope.STId = $stateParams.stId
        $scope.AutoShipmentTemplate = {};
        if ($scope.STId) {
            var param = {
                shipmentTemplateId: $scope.STId
            };
            webSvc.getShipmentTemplates(param).success(function(data){
            // .get({ action: "getShipmentTemplate", token: $scope.AuthToken, shipmentTemplateId: $scope.STId }, function (data) {
                if (data.status.code == 0) {
                    $scope.AutoShipmentTemplate = data.response;
                    if (data.response) {

                        if ($scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes == 0)
                            $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = "0";
                        else if (data.response.shutdownDeviceAfterMinutes)
                            $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = data.response.shutdownDeviceAfterMinutes.toString();
                        else
                            $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = "";

                        if ($scope.AutoShipmentTemplate.arrivalNotificationWithinKm == 0)
                            $scope.AutoShipmentTemplate.arrivalNotificationWithinKm = "0";
                        else if (data.response.arrivalNotificationWithinKm)
                            $scope.AutoShipmentTemplate.arrivalNotificationWithinKm = data.response.arrivalNotificationWithinKm.toString();
                        else
                            $scope.AutoShipmentTemplate.arrivalNotificationWithinKm = "";

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

                                var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedFrom }, true);
                                if (shippedFrom && shippedFrom.length > 0) {
                                    $scope.AutoShipmentTemplate.shippedFrom = shippedFrom[0];
                                }

                                var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedTo }, true);
                                if (shippedTo && shippedTo.length > 0) {
                                    $scope.AutoShipmentTemplate.shippedTo = shippedTo[0];
                                }

                                if ($scope.AutoShipmentTemplate.shippedFrom)
                                    $scope.ChangeShipmentFrom();
                                if ($scope.AutoShipmentTemplate.shippedTo)
                                    $scope.ChangeShipmentTo();
                            }
                        });

                        $scope.ChangeNotiScheduleForAlert();
                        $scope.ChangeNotiScheduleForArrival();
                    }
                }
            })

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
    }

    $scope.$watch("AutoShipmentTemplate.detectLocationForShippedFrom", function (nVal, oVal) {
        if (nVal) {
            $scope.AutoShipmentTemplate.shippedFrom = "";

            if ($scope.HomeMarker)
                $scope.HomeMarker.setMap(null);
            if ($scope.Path)
                $scope.Path.setMap(null);
        }
    })

    $scope.ChangeShipmentFrom = function () {
        console.log($scope.AutoShipmentTemplate.shippedFrom)
        if ($scope.AutoShipmentTemplate.shippedFrom) {
            $scope.AutoShipmentTemplate.detectLocationForShippedFrom = false;
        }
        else { return; }

        if ($scope.HomeMarker)
            $scope.HomeMarker.setMap(null);

        $scope.HomeMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.AutoShipmentTemplate.shippedFrom.location.lat, $scope.AutoShipmentTemplate.shippedFrom.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStart.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.AutoShipmentTemplate.shippedFrom.location.lat, $scope.AutoShipmentTemplate.shippedFrom.location.lon));

        $scope.HomeMarker.setMap($scope.map);

        if ($scope.AutoShipmentTemplate.shippedFrom && $scope.AutoShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.AutoShipmentTemplate.shippedFrom.location, $scope.AutoShipmentTemplate.shippedTo.location])
        }
    }
    $scope.ChangeShipmentTo = function () {
        console.log($scope.AutoShipmentTemplate.shippedTo)
        if ($scope.EndMarker)
            $scope.EndMarker.setMap(null);

        $scope.EndMarker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.AutoShipmentTemplate.shippedTo.location.lat, $scope.AutoShipmentTemplate.shippedTo.location.lon),
            map: $scope.map,
            icon: '/theme/img/mapStop.png'
        });

        $scope.map.setCenter(new google.maps.LatLng($scope.AutoShipmentTemplate.shippedTo.location.lat, $scope.AutoShipmentTemplate.shippedTo.location.lon));
        $scope.EndMarker.setMap($scope.map);

        if ($scope.AutoShipmentTemplate.shippedFrom && $scope.AutoShipmentTemplate.shippedTo) {
            $scope.DrawLine([$scope.AutoShipmentTemplate.shippedFrom.location, $scope.AutoShipmentTemplate.shippedTo.location])
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

            if (!$scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes)
                $scope.AutoShipmentTemplate.shutdownDeviceAfterMinutes = null;

            if (!$scope.AutoShipmentTemplate.arrivalNotificationWithinKm)
                $scope.AutoShipmentTemplate.arrivalNotificationWithinKm = null;

            $scope.AutoShipmentTemplate.maxTimesAlertFires = null;
            $scope.AutoShipmentTemplate.useCurrentTimeForDateShipped = true;

            if ($scope.AutoShipmentTemplate.shippedFrom)
                $scope.AutoShipmentTemplate.shippedFrom = $scope.AutoShipmentTemplate.shippedFrom.locationId;
            if ($scope.AutoShipmentTemplate.shippedTo)
                $scope.AutoShipmentTemplate.shippedTo = $scope.AutoShipmentTemplate.shippedTo.locationId;

            // $scope.AuthToken = localDbSvc.getToken();
            // var url = .url + 'saveShipmentTemplate/' + $scope.AuthToken
            // $.ajax({
            //     type: "POST",
            //     datatype: "json",
            //     processData: false,
            //     contentType: "text/plain",
            //     data: JSON.stringify($scope.AutoShipmentTemplate),
            //     url: url,
            //     success: function (data, textStatus, XmlHttpRequest) {
            //         toastr.success("Shipment template updated successfully")
            //         $state.go('manage.shiptemp')
            //     },
            //     error: function (xmlHttpRequest, textStatus, errorThrown) {
            //         alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            //     }
            // });
            
            webSvc.saveShipmentTemplate($scope.AutoShipmentTemplate).success( function (data, textStatus, XmlHttpRequest) {
                toastr.success("Shipment template added successfully")
                $state.go('manage.shiptemp')
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
                if ($scope.AutoShipmentTemplate.shippedFrom) {
                    var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedFrom.locationId })[0];
                    if (shippedFrom)
                        $scope.AutoShipmentTemplate.shippedFrom = shippedFrom;
                }
                if ($scope.AutoShipmentTemplate.shippedTo) {
                    var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedTo.locationId })[0];
                    if (shippedFrom)
                        $scope.AutoShipmentTemplate.shippedTo = shippedTo;
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
                    if ($scope.AutoShipmentTemplate.shippedFrom) {
                        var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedFrom.locationId })[0];
                        if (shippedFrom)
                            $scope.AutoShipmentTemplate.shippedFrom = shippedFrom;
                    }
                    if ($scope.AutoShipmentTemplate.shippedTo) {
                        var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.AutoShipmentTemplate.shippedTo.locationId })[0];
                        if (shippedTo)
                            $scope.AutoShipmentTemplate.shippedTo = shippedTo;
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
                if ($scope.AutoShipmentTemplate.alertProfileId) {
                    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                    if (alertProfile)
                        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                    if ($scope.AutoShipmentTemplate.alertProfileId) {
                        var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                        if (alertProfile)
                            $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                //if ($scope.AutoShipmentTemplate.alertProfileId) {
                //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                //    if (alertProfile)
                //        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
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
                    //if ($scope.AutoShipmentTemplate.alertProfileId) {
                    //    var alertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId })[0];
                    //    if (alertProfile)
                    //        $scope.AutoShipmentTemplate.alertProfileId = alertProfile;
                    //}
                })
            });
        }
    };
    $scope.CreateAlertRule = function () {
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.AutoShipmentTemplate.alertProfileId }, true);
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
        if ($scope.AutoShipmentTemplate && $scope.AutoShipmentTemplate.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.AutoShipmentTemplate.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoShipmentTemplate.alertsNotificationSchedules[i]) }, true)
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
        if ($scope.AutoShipmentTemplate && $scope.AutoShipmentTemplate.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.AutoShipmentTemplate.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.AutoShipmentTemplate.arrivalNotificationSchedules[i]) }, true)
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