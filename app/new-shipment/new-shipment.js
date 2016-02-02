appCtrls.controller('NewShipmentCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', 'Api', '$state', '$filter', '$timeout', '$rootScope', '$state', function ($scope, rootSvc, $resource, localDbSvc, Api, $state, $filter, $timeout, $rootScope, $state) {
    rootSvc.SetPageTitle('New Shipment');
    rootSvc.SetActiveMenu('New Shipment');
    rootSvc.SetPageHeader("New Shipment");
    var resourceApi = $resource(Api.url + ':action/:token');
    $scope.AuthToken = localDbSvc.get("AuthToken");
    // resourceApi.get({ action: 'login', email: 'developer@visfresh.com', password: 'password' }, function (data) {
    //     if (data.status.code == 0) {
    //         localDbSvc.set("AuthToken", data.response.token);
    //         localDbSvc.set("TokenExpiredOn", data.response.expired);
    //         $scope.AuthToken = data.response.token;

            resourceApi.get({ action: 'getUser', token: localDbSvc.get("AuthToken") }, function (userData) {
                if (userData.status.code == 0) {
                    localDbSvc.set("CurrentUSerTimeZone", userData.response.timeZone);
                    localDbSvc.set("CurrentUserTempUnits", userData.response.temperatureUnits);
                    localDbSvc.set("InternalCompany", userData.response.internalCompany);
                }
            })

            

            resourceApi.get({ action: "getAlertProfiles", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'alertProfileName', sc: 'asc' }, function (data) {
                if (data.status.code == 0) {
                    $scope.AlertList = data.response;
                }
            });

            resourceApi.get({ action: "getLocations", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'locationName', sc: 'asc' }, function (data) {
                if (data.status.code == 0) {
                    $scope.FromLocationList = [];
                    $scope.ToLocationList = [];
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


                        if (val.startFlag == "Y")
                            $scope.FromLocationList.push(val);
                        if (val.endFlag == "Y")
                            $scope.ToLocationList.push(val);
                    })
                }
            });

            $scope.ResetForm = function () {
                $state.go($state.current, {}, { reload: true });
                $scope.frmAddNewShipment.$setPristine()
            }

            $scope.GetShippedFromAddress = function () {
                var shippedFrom = $filter('filter')($scope.LocationList, { locationId: $scope.NewShipment.shipment.shippedFrom })[0];
                if (shippedFrom) {
                    $scope.shippedFromAddress = shippedFrom.address;
                }
            }

            $scope.GetShippedToAddress = function () {
                var shippedTo = $filter('filter')($scope.LocationList, { locationId: $scope.NewShipment.shipment.shippedTo })[0];
                if (shippedTo) {
                    $scope.shippedToAddress = shippedTo.address;
                }
            }

            resourceApi.get({ action: "getDevices", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'locationName', sc: 'asc' }, function (data) {
                if(data.status.code != 0) return;
                $scope.TrackerList = data.response;
            });

            resourceApi.get({ action: "getNotificationSchedules", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'notificationScheduleName', sc: 'asc' }, function (data) {
                if(data.status.code != 0) return;
                $scope.NotificationList = data.response;
            });

            resourceApi.get({ action: 'getShipmentTemplates', token: $scope.AuthToken, pageIndex: 1, pageSize: 1000000 }, function (data) {
                if(data.status.code != 0) return;
                $scope.ShipmentTemplates = data.response;
            })

            resourceApi.get({ action: 'getUserTime', token: $scope.AuthToken }, function (data) {
                if(data.status.code != 0) return;
                $scope.Time = data.response;
                $scope.time1 = new Date($scope.Time.dateTimeIso);
                $scope.timeZone = data.response.timeZoneId;
            })
    //     }
    // });



    //$scope.time2 = new Date();
    //$scope.time2.setHours(7, 30);
    $scope.showMeridian = true;
    $scope.disabled = false;


    $scope.NewShipment = {};
    $scope.NewShipment.shipment = {};
    $scope.NewShipment.shipment.alertSuppressionMinutes = 120;
    $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = '120';
    $scope.NewShipment.shipment.excludeNotificationsIfNoAlerts = false;
    $scope.NewShipment.saveAsNewTemplate = false;
    $scope.NewShipment.shipment.shipmentDate = new Date();

    $scope.WarnUserAndRedirectToAddShipment = function () {
        if (confirm("Your unsaved shipment data will be lost. Do you want to add a template now?")) {
            $state.go("manage.addshiptemp");
        }
    }

    $scope.WarnUserAndRedirectToEditShipment = function (shipmentTemplateId) {
        if (shipmentTemplateId) {
            if (confirm("your unsaved data will be lost, do you want to continue edit this selected shipment template?")) {
                $state.go("manage.editshiptemp", { stId: shipmentTemplateId });
            }
        }
        else {

        }
    }

    $scope.CreateAlertRule = function () {
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.NewShipment.shipment.alertProfileId })[0];
            if (selectedAlertProfile) {
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
        if ($scope.NewShipment && $scope.NewShipment.shipment && $scope.NewShipment.shipment.alertsNotificationSchedules) {
            $scope.AlertNotiRule = '';
            for (var i = 0; i < $scope.NewShipment.shipment.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: $scope.NewShipment.shipment.alertsNotificationSchedules[i] })[0]
                var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                //var peopleToNotify = $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify ? $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            }
        }
    }

    $scope.ChangeNotiScheduleForArrival = function () {
        if ($scope.NewShipment && $scope.NewShipment.shipment && $scope.NewShipment.shipment.arrivalNotificationSchedules) {
            $scope.ArrivalNotiRule = '';
            for (var i = 0; i < $scope.NewShipment.shipment.arrivalNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.NewShipment.shipment.arrivalNotificationSchedules[i]) })[0]
                var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            }
        }
    }

    $scope.NotificationScheduleOption = {
        multiple: true
    };

    $scope.$watch('NewShipment.shipment.shipmentDate', function (nVal, oVal) {
        if (nVal) {
            if (angular.isDate(nVal)) {
                var date = $filter('date')(nVal, 'dd-MMM-yyyy');
                var time = $filter('date')($scope.time1, 'shortTime');
                $scope.NewShipment.shipment.DiscriptionDateTime = date + " " + time + " " + $scope.timeZone;
            }
        }
    })

    $scope.$watch('time1', function (nVal, oVal) {
        if (nVal) {
            var date = $filter('date')($scope.NewShipment.shipment.shipmentDate, 'dd-MMM-yyyy');
            var time = $filter('date')(nVal, 'shortTime');
            $scope.NewShipment.shipment.DiscriptionDateTime = date + " " + time + " " + $scope.timeZone;
        }
    })

    $scope.ChangeSelectedShipmentTemplate = function () {

        $scope.shippedFromAddress = "";
        $scope.shippedToAddress = "";
        $scope.alertRuleListForSelectedAlertProfile = "";
        $scope.AlertNotiRule = "";
        $scope.ArrivalNotiRule = "";

        if (!$scope.ShipmentTemplate.selectedShipmentTemplateId)
            $scope.ShipmentTemplate.selectedShipmentTemplateId = $scope.SelectedTemplateId;
        resourceApi.get({ action: 'getShipmentTemplate', token: $scope.AuthToken, shipmentTemplateId: $scope.ShipmentTemplate.selectedShipmentTemplateId }, function (data) {
            if (data.status.code == 0) {
                $scope.NewShipment.shipment = data.response;

                if (data.response) {
                    $scope.SelectedTemplateId = data.response.shipmentTemplateId;
                    $scope.ShipmentTemplate.selectedShipmentTemplateId = data.response.shipmentTemplateId;
                    $scope.AddDateShipped = data.response.addDateShipped;
                    $scope.NewShipment.shipment.shipmentDate = new Date();
                    if (data.response.arrivalNotificationWithinKm == 0 || data.response.arrivalNotificationWithinKm)
                        $scope.NewShipment.shipment.arrivalNotificationWithinKm = data.response.arrivalNotificationWithinKm.toString();
                    if (data.response.shutdownDeviceAfterMinutes == 0 || data.response.shutdownDeviceAfterMinutes)
                        $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = data.response.shutdownDeviceAfterMinutes.toString();

                    $scope.ChangeNotiScheduleForAlert();
                    $scope.ChangeNotiScheduleForArrival();
                    $scope.CreateAlertRule();
                    $scope.GetShippedFromAddress();
                    $scope.GetShippedToAddress();
                }
            }
        })
    }

    $scope.SaveData = function (isValid) {
        if (isValid) {
            if (!$scope.NewShipment.shipment.shutdownDeviceAfterMinutes)
                $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = null
            $scope.NewShipment.shipment.maxTimesAlertFires = null;
            $scope.NewShipment.shipment.useCurrentTimeForDateShipped = true;
            $scope.NewShipment.shipment.poNum = null
            $scope.NewShipment.shipment.assetType = null;
            $scope.NewShipment.shipment.customFields = null;
            $scope.NewShipment.shipment.tripCount = null;
            $scope.NewShipment.shipment.status = "InProgress";
            $scope.NewShipment.shipment.detectLocationForShippedFrom = false;

            if ($scope.AddDateShipped && !$scope.NewShipment.saveAsNewTemplate) {
                $scope.NewShipment.shipment.shipmentDescription = $scope.NewShipment.shipment.shipmentDescription + " - " + $scope.NewShipment.shipment.DiscriptionDateTime;
            }

            var url = Api.url + 'saveShipment/' + $scope.AuthToken
            $.ajax({
                type: "POST",
                datatype: "json",
                processData: false,
                contentType: "text/plain",
                data: JSON.stringify($scope.NewShipment),
                url: url,
                success: function (data, textStatus, XmlHttpRequest) {
                    if ($scope.NewShipment.saveAsNewTemplate)
                        toastr.success("Shipment detailed saved. Enter another shipment by changing any required details and resubmitting the page. The template '" + $scope.NewShipment.templateName + "' was also created.")
                    else
                        toastr.success("Shipment detailed saved. Enter another shipment by changing any required details and resubmitting the page.")

                    resourceApi.get({ action: 'getShipmentTemplates', token: $scope.AuthToken, pageIndex: 1, pageSize: 1000000 }, function (tempData) {
                        $scope.ShipmentTemplates = tempData.response;
                        $scope.ChangeSelectedShipmentTemplate();
                    })

                    //$scope.ShipmentTemplate.selectedShipmentTemplateId = $scope.SelectedTemplateId;
                    //if (data.response) {
                    //    resourceApi.get({ action: 'getShipmentTemplate', token: $scope.AuthToken, shipmentTemplateId: data.response.templateId }, function (subData) {
                    //        if (subData.status.code == 0) {
                    //            $scope.NewShipment.shipment = subData.response;
                    //            $scope.ShipmentTemplate.selectedShipmentTemplateId = subData.response.templateId;
                    //        }
                    //    })
                    //}
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                }
            });
        }
    }

}]);