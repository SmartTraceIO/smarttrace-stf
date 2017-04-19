appCtrls.controller('ListAlertCtrl', function ($rootScope, $scope, $state, rootSvc, localDbSvc, webSvc, $window,
                                               $timeout, $log, $uibModal, $interval, $controller, $location) {
    rootSvc.SetPageTitle('List Alert');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Alert Profiles");

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
    var BindAlertList = function () {
        webSvc.getAlertProfiles($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
                //$log.debug('AlertList', data.response);
                $scope.AlertList.totalCount = data.totalCount;
                angular.forEach($scope.AlertList, function (val, key) {
                    var rule;
                    angular.forEach(val.alertRuleList, function (subVal, subKey) {
                        if (subKey == 0) {
                            rule = subVal;
                        }
                        else {
                            rule = rule + ", " + subVal;
                        }
                    })
                    val["rule"] = rule;
                })
            }
        });
    }
    $scope.TempType = localDbSvc.getDegreeUnits() == "Celsius" ? "C" : "F";
    if ($scope.TempType == "C") {
        $scope.minRange = -20;
        $scope.maxRange = 50;
    }

    else if ($scope.TempType == "F") {
        $scope.minRange = -4;
        $scope.maxRange = 122;
    }

    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "alertProfileName";
        BindAlertList();
    }

    $scope.PageSizeChanged = function () {
        BindAlertList();
    }

    $scope.PageChanged = function () {
        BindAlertList();
    }

    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindAlertList();
    }

    $scope.confirm = function (alertId) {
        $scope.AlertIdToDeleteAlertProfile = alertId;
        $log.debug('ALertId', alertId);
        $("#confirmModel").modal("show");
    }

    $scope.DeleteAlertProfile = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteAlertProfile($scope.AlertIdToDeleteAlertProfile).success(function (data) {
            if (data.status.code == 0) {
                toastr.success("Alert profile deleted successfully");
                BindAlertList();
            } else {
                toastr.warning('Warning. Cannot delete this alert profile.');
            }
        });
    }
});

appCtrls.controller('AddAlertCtrl', function ($rootScope, $scope, rootSvc, localDbSvc, webSvc, $state, $timeout, $interval,
                                              $window,$log, $controller, $location) {
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

    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Add Alert');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Alert Profiles");
    }
    else {
        $scope.PageTitle = 'Add Alert';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Alert Profiles";
    }

    $scope.Action = "Add";
    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }
    $scope.Print = function() {
        $window.print();
    }
    $scope.TempType = localDbSvc.getDegreeUnits() == "Celsius" ? "C" : "F";
    if ($scope.TempType == "C") {
        $scope.minRange = -20;
        $scope.maxRange = 50;
    }
    else if ($scope.TempType == "F") {
        $scope.minRange = -4;
        $scope.maxRange = 122;
    }

    $scope.Init = function () {
        if ($rootScope.modalInstance) {
            $rootScope.modalInstance.opened.then(function () {
                $timeout(function () {
                    $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                }, 300);
            })
        }

        $scope.Alert = {};
        $scope.Alert.watchBatteryLow = true;
        $scope.Alert.watchEnterBrightEnvironment = true;
        $scope.Alert.watchEnterDarkEnvironment = true;
        $scope.Alert.watchMovementStart = false;
        $scope.Alert.watchMovementStop = true;

        $scope.coldAlerts = [
             {
                 type: "Cold",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             },
        ]

        $scope.hotAlerts = [
             {
                 type: "Hot",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             },
        ]
    }

    $scope.AddColdObject = function () {
        $scope.coldAlerts.push(
             {
                 type: "Cold",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             });
    }

    $scope.DeleteColdObject = function (coldAlert) {
        if ($scope.coldAlerts.length > 0) {
            var index = $scope.coldAlerts.indexOf(coldAlert);
            $scope.coldAlerts.splice(index, 1);
        }
    }

    $scope.AddHotObject = function () {
        $scope.hotAlerts.push(
             {
                 type: "Hot",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             });
    }

    $scope.DeleteHotObject = function (hotAlert) {
        if ($scope.hotAlerts.length > 0) {
            var index = $scope.hotAlerts.indexOf(hotAlert);
            $scope.hotAlerts.splice(index, 1);
        }
    }

    $scope.WarnUserAndRedirectToListPage = function () {
        $("#confirmModel").modal("hide");
        setTimeout(function () {
            $state.go('manage.alert')
        }, 200)
    }

    $scope.close = function () {
        if (confirm("Any unsaved changes will be lost including delete, are you sure you want to cancel?")) {
            $rootScope.modalInstance.dismiss('cancel');
        }
    }

    $scope.SaveData = function (isValid, closeModalPopup) {
        $log.debug('IsValid', isValid);
        if (isValid) {
            $scope.Alert.temperatureIssues = [];
            for (var i = 0; i < $scope.coldAlerts.length; i++) {
                var val = clone($scope.coldAlerts[i]);
                /*if ($scope.TempType == 'F') {
                    val.temperature = F2C(val.temperature);
                }*/
                $scope.Alert.temperatureIssues.push(val);
            }

            for (var i = 0; i < $scope.hotAlerts.length; i++) {
                var val = clone($scope.hotAlerts[i]);
                /*if ($scope.TempType == 'F') {
                    val.temperature = F2C(val.temperature);
                }*/
                $scope.Alert.temperatureIssues.push(val);
            }

            //$log.debug('Alert', $scope.Alert);

            webSvc.saveAlertProfile($scope.Alert).success(function (data, textStatus, XmlHttpRequest) {
                if (data.status.code==0) {
                    toastr.success("Alert profile saved successfully")
                } else {
                    toastr.warning('Warning. An error has occured while creating new alert!');
                }
                if (closeModalPopup) {
                    $rootScope.modalInstance.close('cancel');
                    $scope.fromModalPopup = false;
                }
                else {
                    $state.go('manage.alert')
                }
            }).error(function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                
            });
        }
    }
});

appCtrls.controller('EditAlertCtrl', function ($rootScope, $scope, rootSvc, localDbSvc, $stateParams, webSvc, $state,
                                               $timeout, $interval, $window, $log, $controller, $location) {
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

    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Edit Alert');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Alert Profiles");
    }
    else {
        $scope.PageTitle = 'Edit Alert';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Alert Profiles";
    }

    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";

    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }

    $scope.WarnUserAndRedirectToListPage = function () {
        $("#confirmModel").modal("hide");
        setTimeout(function () { 
            $state.go('manage.alert')
        }, 200)
    }

    $scope.close = function () {
        if (confirm("Any unsaved changes will be lost including delete, are you sure you want to cancel?")) {
            $rootScope.modalInstance.dismiss('cancel');
        }
    }
    $scope.Print = function() {
        $window.print();
    }
    $scope.TempType = localDbSvc.getDegreeUnits() == "Celsius" ? "C" : "F";
    if ($scope.TempType == "C") {
        $scope.minRange = -20;
        $scope.maxRange = 50;
    }
    else if ($scope.TempType == "F") {
        $scope.minRange = -4;
        $scope.maxRange = 122;
    }

    $scope.Init = function () {
        if ($rootScope.modalInstance) {
            $rootScope.modalInstance.opened.then(function () {
                $timeout(function () {
                    $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                }, 300);
            })
        }

        $scope.AlertId = $stateParams.aId
        if ($scope.AlertId || $rootScope.alertIdForModalPopup) {
            var alertId;
            if ($scope.AlertId)
                alertId = $scope.AlertId;
            else
                alertId = $rootScope.alertIdForModalPopup;

            webSvc.getAlertProfile(alertId).success(function (data) {
                if (data.status.code == 0) {
                    //$log.debug('Alert', data.response);
                    $scope.Alert = data.response;
                    $scope.coldAlerts = [];
                    $scope.hotAlerts = [];
                    angular.forEach($scope.Alert.temperatureIssues, function (val, key) {
                        /*if ($scope.TempType == 'F') {
                            val.temperature = C2F(val.temperature);
                        }*/
                        val.temperature = Math.round(val.temperature*10)/10;
                        if (val.type == "Hot" || val.type == "CriticalHot")
                            $scope.hotAlerts.push(val);
                        else if (val.type == "Cold" || val.type == "CriticalCold")
                            $scope.coldAlerts.push(val);
                    })
                }
            })
        }
    }

    $scope.AddColdObject = function () {
        $scope.coldAlerts.push(
             {
                 type: "Cold",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             });
    }

    $scope.DeleteColdObject = function (coldAlert) {
        if ($scope.coldAlerts.length > 0) {
            var index = $scope.coldAlerts.indexOf(coldAlert);
            $scope.coldAlerts.splice(index, 1);
        }
    }

    $scope.AddHotObject = function () {
        $scope.hotAlerts.push(
             {
                 type: "Hot",
                 temperature: 0,
                 timeOutMinutes: "",
                 cumulativeFlag: false
             });
    }

    $scope.DeleteHotObject = function (hotAlert) {
        if ($scope.hotAlerts.length > 0) {
            var index = $scope.hotAlerts.indexOf(hotAlert);
            $scope.hotAlerts.splice(index, 1);
        }
    }

    $scope.SaveData = function (isValid, closeModalPopup) {
        $log.debug('IsValid', isValid);
        if (isValid) {
            $scope.Alert.temperatureIssues = [];
            for (var i = 0; i < $scope.coldAlerts.length; i++) {
                var val = clone($scope.coldAlerts[i]);
                /*if ($scope.TempType == 'F') {
                    val.temperature = F2C(val.temperature);
                }*/
                $scope.Alert.temperatureIssues.push(val);
            }

            for (var i = 0; i < $scope.hotAlerts.length; i++) {
                var val = clone($scope.hotAlerts[i]);
                /*if ($scope.TempType == 'F') {
                    val.temperature = F2C(val.temperature);
                }*/
                $scope.Alert.temperatureIssues.push(val);
            }

            webSvc.saveAlertProfile($scope.Alert).success(function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    toastr.success("Alert profile updated successfully")
                } else {
                    toastr.warning('Warning. An error has occured while updating current alert');
                }
                if (closeModalPopup) {
                    $rootScope.modalInstance.close('cancel');
                    $scope.fromModalPopup = false;
                }
                else {
                    $state.go('manage.alert')
                }
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});

/*function F2C(fah) {
    return (fah - 32) * 5 / 9;
}*/
/*function C2F(cel) {
    return Math.round((cel * 9 / 5 + 32) * 10) / 10;
}*/
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}