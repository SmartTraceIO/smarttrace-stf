appCtrls.controller('ListAlertCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', 'Api', function ($scope, rootSvc, $resource, localDbSvc, Api) {
    rootSvc.SetPageTitle('List Alert');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Alert Profiles");

    $scope.AuthToken = localDbSvc.get("AuthToken");
    var alertApi = $resource(Api.url + ':action/:token');
    var BindAlertList = function () {
        alertApi.get({ action: "getAlertProfiles", token: $scope.AuthToken, pageSize: $scope.PageSize, pageIndex: $scope.PageIndex, so: $scope.So, sc: $scope.Sc }, function (data) {
            if (data.status.code == 0) {
                $scope.AlertList = data.response;
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

    $scope.TempType = localDbSvc.get("CurrentUserTempUnits") == "Celsius" ? "C" : "F";
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

    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindAlertList();
    }

    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindAlertList();
    }

    $scope.confirm = function (alertId) {
        $scope.AlertIdToDeleteAlertProfile = alertId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteAlertProfile = function () {
        $("#confirmModel").modal("hide");
        alertApi.get({ action: "deleteAlertProfile", token: $scope.AuthToken, alertProfileId: $scope.AlertIdToDeleteAlertProfile }, function (data) {
            if (data.status.code == 0) {
                toastr.success("Alert profile deleted successfully");
                BindAlertList();
            }
        });
    }
}]);

appCtrls.controller('AddAlertCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', 'Api', '$state', '$rootScope', '$timeout', function ($scope, rootSvc, $resource, localDbSvc, Api, $state, $rootScope, $timeout) {
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

    var alertApi = $resource(Api.url + ':action/:token');
    $scope.Action = "Add";
    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }

    $scope.TempType = localDbSvc.get("CurrentUserTempUnits") == "Celsius" ? "C" : "F";
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
        if (isValid) {
            $scope.Alert.temperatureIssues = [];
            angular.forEach($scope.coldAlerts, function (val, key) {
                $scope.Alert.temperatureIssues.push(val);
            });
            angular.forEach($scope.hotAlerts, function (val, key) {
                $scope.Alert.temperatureIssues.push(val);
            });

            $scope.AuthToken = localDbSvc.get("AuthToken");
            var url = Api.url + 'saveAlertProfile/' + $scope.AuthToken
            $.ajax({
                type: "POST",
                datatype: "json",
                processData: false,
                contentType: "text/plain",
                data: JSON.stringify($scope.Alert),
                url: url,
                success: function (data, textStatus, XmlHttpRequest) {
                    toastr.success("Alert profile saved successfully")
                    if (closeModalPopup) {
                        $rootScope.modalInstance.close('cancel');
                        $scope.fromModalPopup = false;
                    }
                    else {
                        $state.go('manage.alert')
                    }
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                }
            });
        }
    }
}]);

appCtrls.controller('EditAlertCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', '$stateParams', 'Api', '$state', '$rootScope', '$timeout', function ($scope, rootSvc, $resource, localDbSvc, $stateParams, Api, $state, $rootScope, $timeout) {
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

    var alertApi = $resource(Api.url + ':action/:token');
    $scope.AuthToken = localDbSvc.get("AuthToken");
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

    $scope.TempType = localDbSvc.get("CurrentUserTempUnits") == "Celsius" ? "C" : "F";
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

            alertApi.get({ action: "getAlertProfile", token: $scope.AuthToken, alertProfileId: alertId }, function (data) {
                if (data.status.code == 0) {
                    $scope.Alert = data.response;
                    $scope.coldAlerts = [];
                    $scope.hotAlerts = [];
                    angular.forEach($scope.Alert.temperatureIssues, function (val, key) {
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
        if (isValid) {
            $scope.Alert.temperatureIssues = [];
            angular.forEach($scope.coldAlerts, function (val, key) {
                $scope.Alert.temperatureIssues.push(val);
            });
            angular.forEach($scope.hotAlerts, function (val, key) {
                $scope.Alert.temperatureIssues.push(val);
            });
            $scope.AuthToken = localDbSvc.get("AuthToken");
            var url = Api.url + 'saveAlertProfile/' + $scope.AuthToken
            $.ajax({
                type: "POST",
                datatype: "json",
                processData: false,
                contentType: "text/plain",
                data: JSON.stringify($scope.Alert),
                url: url,
                success: function (data, textStatus, XmlHttpRequest) {
                    toastr.success("Alert profile updated successfully")
                    if (closeModalPopup) {
                        $rootScope.modalInstance.close('cancel');
                        $scope.fromModalPopup = false;
                    }
                    else {
                        $state.go('manage.alert')
                    }
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                }
            });
        }
    }
}]);