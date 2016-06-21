appCtrls.controller('NewShipmentCtrl', function ($scope, rootSvc, arrayToStringFilter, localDbSvc, webSvc, $state, $location,
                                                 $filter, $timeout, $interval, $rootScope, $window, $log, $controller) {
    rootSvc.SetPageTitle('New Manual Shipment');
    rootSvc.SetActiveMenu('New Shipment');
    rootSvc.SetPageHeader("New Manual Shipment");
    
    $scope.AuthToken = localDbSvc.getToken();
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
    webSvc.getAlertProfiles(1000000, 1, 'alertProfileName', 'asc').success( function (data) {
        
        if (data.status.code == 0) {
            $scope.AlertList = data.response;
        }
    });

    webSvc.getLocations(1000000, 1, 'locationName', 'asc').success( function (data) {
        if (data.status.code == 0) {
            $scope.FromLocationList = [];
            $scope.ToLocationList = [];
            $scope.InterimLocationList = [];
            $scope.LocationList = data.response;
            $log.debug('LocationList', $scope.LocationList);
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
                if (val.interimFlag == "Y")
                    $scope.InterimLocationList.push(val);
                if (val.endFlag == "Y")
                    $scope.ToLocationList.push(val);
            })
        }
    });
    $scope.Print = function() {
        $window.print();
    }
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

    webSvc.getDevices(1000000, 1, 'locationName', 'asc').success( function (data) {
        if(data.status.code != 0) return;
        $scope.TrackerList = data.response;
    });

    webSvc.getNotificationSchedules(1000000, 1, 'notificationScheduleName', 'asc').success( function (data) {
        if(data.status.code != 0) return;
        $scope.NotificationList = data.response;
    });

    var param = {
        pageSize: 1000000,
        pageIndex: 1
    };
    webSvc.getShipmentTemplates(param).success(function(data){
        if(data.status.code != 0) return;
        $scope.ShipmentTemplates = data.response;
    })

    webSvc.getUserTime().success( function (data) {
        if(data.status.code != 0) return;
        $scope.Time = data.response;
        var t1withZone = moment.tz($scope.Time.dateTimeIso, $rootScope.RunningTimeZoneId).format('MMM DD, YYYY HH:mm:ss');
        var d1withZone = moment.tz($scope.Time.dateTimeIso, $rootScope.RunningTimeZoneId).format('MMM DD, YYYY HH:mm:ss');
        $scope.time1 = new Date(t1withZone);
        $scope.date1 = new Date(d1withZone);
        $scope.timeZone = data.response.timeZoneId;
    })

    $scope.showMeridian = true;
    $scope.disabled = false;


    $scope.NewShipment = {};
    $scope.NewShipment.shipment = {};
    $scope.NewShipment.shipment.alertSuppressionMinutes = 120;
    $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = '120';
    $scope.NewShipment.shipment.excludeNotificationsIfNoAlerts = false;
    $scope.NewShipment.saveAsNewTemplate = false;
    $scope.NewShipment.shipment.shipmentDate = new Date();
    var momentShipment = moment.tz();

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
        if ($scope.NewShipment == null || $scope.NewShipment.shipment == null || $scope.NewShipment.shipment.alertProfileId == null) {
            $scope.alertRuleListForSelectedAlertProfile = '';
        } else
        if ($scope.AlertList && $scope.AlertList.length > 0) {
            var selectedAlertProfile = $filter('filter')($scope.AlertList, { alertProfileId: $scope.NewShipment.shipment.alertProfileId })[0];
            $scope.alertRuleListForSelectedAlertProfile = arrayToStringFilter(selectedAlertProfile.alertRuleList);
        }
    }

    $scope.ChangeNotiScheduleForAlert = function () {
        if ($scope.NewShipment && $scope.NewShipment.shipment && $scope.NewShipment.shipment.alerts_notification_schedules) {
            $scope.AlertNotiRule = '';
            $scope.NewShipment.shipment.alertsNotificationSchedules.length=0;

            angular.forEach($scope.NewShipment.shipment.alerts_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                $scope.NewShipment.shipment.alertsNotificationSchedules.push(val.notificationScheduleId);
                //var peopleToNotify = $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify ? $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            });

            /*for (var i = 0; i < $scope.NewShipment.shipment.alertsNotificationSchedules.length; i++) {
                var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: $scope.NewShipment.shipment.alertsNotificationSchedules[i] })[0]
                var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
                //var peopleToNotify = $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify ? $scope.NewShipment.shipment.alertsNotificationSchedules[i].peopleToNotify : "";
                if ($scope.AlertNotiRule)
                    $scope.AlertNotiRule = $scope.AlertNotiRule + ', ' + peopleToNotify;
                else
                    $scope.AlertNotiRule = peopleToNotify;
            }*/
        }
    }
    $scope.ChangeNotiScheduleForArrival = function () {
        if ($scope.NewShipment && $scope.NewShipment.shipment && $scope.NewShipment.shipment.arrival_notification_schedules) {
            $scope.ArrivalNotiRule = '';
            $scope.NewShipment.shipment.arrivalNotificationSchedules.length = 0;

            angular.forEach($scope.NewShipment.shipment.arrival_notification_schedules, function(val, key) {
                var peopleToNotify = val.peopleToNotify ? val.peopleToNotify : "";
                $scope.NewShipment.shipment.arrivalNotificationSchedules.push(val.notificationScheduleId);
                if ($scope.ArrivalNotiRule)
                    $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
                else
                    $scope.ArrivalNotiRule = peopleToNotify;
            });

            //for (var i = 0; i < $scope.NewShipment.shipment.arrivalNotificationSchedules.length; i++) {
            //    var shipment = $filter('filter')($scope.NotificationList, { notificationScheduleId: parseInt($scope.NewShipment.shipment.arrivalNotificationSchedules[i]) })[0]
            //    var peopleToNotify = shipment.peopleToNotify ? shipment.peopleToNotify : "";
            //    if ($scope.ArrivalNotiRule)
            //        $scope.ArrivalNotiRule = $scope.ArrivalNotiRule + ', ' + peopleToNotify;
            //    else
            //        $scope.ArrivalNotiRule = peopleToNotify;
            //}
        }
    }
    $scope.NotificationScheduleOption = {
        multiple: true
    };

    $scope.$watch('date1', function (nVal, oVal) {
        if (nVal) {
            momentShipment.date(nVal.getDate());
            momentShipment.year(nVal.getFullYear());
            momentShipment.month(nVal.getMonth());
            if (angular.isDate(nVal)) {
                var date = $filter('date')(nVal, 'dd-MMM-yyyy');
                var time = $filter('date')($scope.time1, 'shortTime');
                $scope.NewShipment.shipment.DiscriptionDateTime = date + " " + time + " " + $scope.timeZone;
            }
        }
    })

    $scope.$watch('time1', function (nVal, oVal) {
        if (nVal) {
            momentShipment.hour(nVal.getHours());
            momentShipment.minute(nVal.getMinutes());
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

        if ($scope.ShipmentTemplate.selectedShipmentTemplateId) {

            var param = {
                shipmentTemplateId: $scope.ShipmentTemplate.selectedShipmentTemplateId
            };
            webSvc.getShipmentTemplate(param).success(function(data){
                if (data.status.code == 0) {
                    $scope.NewShipment.shipment = data.response;
                    $log.debug('Shipment', data.response);
                    if (data.response) {
                        $scope.SelectedTemplateId = data.response.shipmentTemplateId;
                        $scope.ShipmentTemplate.selectedShipmentTemplateId = data.response.shipmentTemplateId;
                        $scope.AddDateShipped = data.response.addDateShipped;

                        //-- add more field follow indication from Vyacheslav
                        $scope.NewShipment.shipment.alertsNotificationSchedules = data.response.alertsNotificationSchedules.map(function(val) {
                            return val.toString();
                        });
                        $scope.NewShipment.shipment.arrivalNotificationSchedules = data.response.arrivalNotificationSchedules;
                        $scope.NewShipment.shipment.excludeNotificationsIfNoAlerts = data.response.excludeNotificationsIfNoAlerts;

                        $scope.NewShipment.shipment.alerts_notification_schedules = data.response.alertsNotificationSchedules.map(function(val) {
                            var item = $filter('filter')($scope.NotificationList, { notificationScheduleId: val })[0]
                            return item;
                        });
                        $scope.NewShipment.shipment.arrival_notification_schedules = data.response.arrivalNotificationSchedules.map(function(val) {
                            var item = $filter('filter')($scope.NotificationList, { notificationScheduleId: val })[0]
                            return item;
                        })

                        $scope.NewShipment.shipment.shipmentDate = momentShipment.format('YYYY-MM-DDTHH:mm');

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
        } else {
            $scope.NewShipment.shipment = {};
            $scope.SelectedTemplateId = $scope.ShipmentTemplate.selectedShipmentTemplateId;
            $scope.AddDateShipped = false;
            $scope.NewShipment.shipment.shipmentDate = momentShipment.format('YYYY-MM-DDTHH:mm');
            $scope.NewShipment.shipment.arrivalNotificationWithinKm = '0';
            $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = '120';
            $scope.ChangeNotiScheduleForAlert();
            $scope.ChangeNotiScheduleForArrival();
            $scope.CreateAlertRule();
            $scope.GetShippedFromAddress();
            $scope.GetShippedToAddress();
        }
    }

    $scope.formatDate = function(d){
        var m_names = new Array("Jan", "Feb", "Mar", 
        "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
        "Oct", "Nov", "Dec");

        
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();

        return curr_date + "-" + m_names[curr_month] + "-" + curr_year;
    }

    $scope.SaveData = function (isValid) {
        console.log('NewShipment', $scope.NewShipment);
        console.log('$scope.AddDateShipped', $scope.AddDateShipped);
        $scope.NewShipment.shipment.shipmentDate = momentShipment.format('YYYY-MM-DDTHH:mm');
        if (isValid) {
            if (!$scope.NewShipment.shipment.shutdownDeviceAfterMinutes)
                $scope.NewShipment.shipment.shutdownDeviceAfterMinutes = null
            $scope.NewShipment.shipment.maxTimesAlertFires = null;
            $scope.NewShipment.shipment.useCurrentTimeForDateShipped = true;
            $scope.NewShipment.shipment.poNum = null
            $scope.NewShipment.shipment.assetType = null;
            $scope.NewShipment.shipment.customFields = null;
            $scope.NewShipment.shipment.tripCount = null;
            $scope.NewShipment.shipment.status = "Default";
            $scope.NewShipment.shipment.detectLocationForShippedFrom = false;

            /*if ($scope.AddDateShipped && !$scope.NewShipment.saveAsNewTemplate) {
                $scope.NewShipment.shipment.shipmentDescription = $scope.NewShipment.shipment.shipmentDescription + " - " + $scope.NewShipment.shipment.DiscriptionDateTime;
            }*/
            webSvc.saveShipment($scope.NewShipment).success( function (data, textStatus, XmlHttpRequest) {
                if ($scope.NewShipment.saveAsNewTemplate)
                    toastr.success("Shipment detailed saved. Enter another shipment by changing any required details and resubmitting the page. The template '" + $scope.NewShipment.templateName + "' was also created.")
                else
                    toastr.success("Shipment detailed saved. Enter another shipment by changing any required details and resubmitting the page.")

            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        } else {
            toastr.error('Inputting data is not valid. Please correct all fields in RED before try again!');
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