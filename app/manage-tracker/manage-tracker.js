appCtrls.controller('ListTrackerCtrl',
    function ($scope, $filter, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('List Trackers');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");

        $scope.AuthToken = localDbSvc.getToken();

        var BindTrackerList = function () {
            webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
                console.log("TRACKER", data);
                if (data.status.code == 0) {
                    $scope.TrackerList = data.response;
                    $scope.TrackerList.totalCount = data.totalCount;
                    console.log(data);
                }
            });
        }

        $scope.Init = function () {
            $scope.PageSize = '20';
            $scope.PageIndex = 1;
            $scope.So = "asc";
            $scope.Sc = "name";
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
            console.log($scope.So);
            console.log($scope.Sc);
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

        /*var orderBy = $filter('orderBy');
        $scope.Sorting = function(predicate) {
            $scope.predicate = predicate;
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.TrackerList = orderBy($scope.TrackerList, predicate, $scope.reverse);
        };*/
});
appCtrls.controller('AddTrackerCtrl', ['$scope', '$filter', 'rootSvc', 'localDbSvc', 'webSvc',
    function($scope, $filter, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('Add Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");

        $scope.Action = "Add";
}]);
appCtrls.controller('EditTrackerCtrl', ['$scope', '$state', '$filter', '$stateParams', 'rootSvc', 'localDbSvc', 'webSvc',
    function($scope, $state, $filter, $stateParams, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('Edit Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Edit";

        $scope.tracker = {};
        $scope.tracker.imei = $stateParams.imei;
        var filter = $filter('filter');
        var param = {
            pageSize: 1000,
            pageIndex: 1,
            so: 'id',
            sc: 'asc'
        };
        console.log('PARAM', $scope.tracker.imei);
        webSvc.getDevice($scope.tracker.imei).success(function(data){
            console.log("TRACKER", data);
            if (data.status.code == 0) {
                $scope.tracker = data.response;
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
        });

        $scope.saveTracker = function() {
            if ($scope.tracker.autoStartShipment) {
                $scope.tracker.autostartTemplateId = $scope.tracker.autoStartShipment.id;
            }
            webSvc.saveDevice($scope.tracker).success(function(resp) {
                console.log('UPDATED', resp);
                if (resp.status.code == 0) {
                    //success
                    toastr.success('You\'v updated device: ' + $scope.tracker.imei);
                    $state.go('tracker');
                } else {
                    //error
                    toastr.error('Can\'t update the device: ' + $scope.tracker.imei + resp.status.message);
                }
            });
        }
    }]);
/**
 * Created by beou on 09/03/2016.
 */
appFilters.filter('volt', function() {
    return function (input) {
        return Number(input/1000).toFixed(1) + 'V';
    }
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
