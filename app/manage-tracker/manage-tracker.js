appCtrls.controller('ListTrackerCtrl',
    function ($scope, $rootScope, $filter, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('List Trackers');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");

        var BindTrackerList = function () {
            webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
                if (data.status.code == 0) {
                    $scope.TrackerList = data.response;
                    $scope.TrackerList.totalCount = data.totalCount;
                }
            });
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
        $scope.roles = {};
        $scope.roles.SmartTraceAdmin = 1000;
        $scope.roles.Admin = 999;
        $scope.roles.Normal = 99;
        $scope.roles.Basic = 9;
        $scope.getRole = function () {
            if (!$rootScope.User || !$rootScope.User.roles) {
                return $scope.roles.Basic;
            }
            else if ($rootScope.User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return $scope.roles.SmartTraceAdmin;
            } else if ($rootScope.User.roles.indexOf('Admin') >= 0) {
                return $scope.roles.Admin;
            } else if ($rootScope.User.roles.indexOf('Normal') >= 0) {
                return $scope.roles.Normal;
            } else {
                return $scope.roles.Basic;
            }
        }
});
appCtrls.controller('AddTrackerCtrl', ['$scope', '$state', '$filter', 'rootSvc', 'localDbSvc', 'webSvc',
    function($scope, $state, $filter, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('Add Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Add";
        var filter = $filter('filter');
        var param = {
            pageSize: 1000,
            pageIndex: 1,
            so: 'id',
            sc: 'asc'
        };
        webSvc.getAutoStartShipments(param).success(function(data) {
            if (data.status.code == 0) {
                console.log('AutoShipment', data.response);
                $scope.AutoStartShipmentList = data.response;
                //$scope.tracker.autoStartShipment = filter($scope.AutoStartShipmentList, {id:$scope.tracker.autostartTemplateId}, true)[0];
            }
        });

        $scope.saveTracker = function() {
            if ($scope.tracker.autoStartShipment) {
                $scope.tracker.autostartTemplateId = $scope.tracker.autoStartShipment.id;
            }
            webSvc.saveDevice($scope.tracker).success(function(resp) {
                console.log('UPDATED', resp);
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
}]);
appCtrls.controller('EditTrackerCtrl', ['$scope', '$rootScope', '$state', '$filter', '$stateParams', 'rootSvc', 'localDbSvc', 'webSvc',
    function($scope, $rootScope, $state, $filter, $stateParams, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('Edit Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Edit";

        $scope.roles = {};
        $scope.roles.SmartTraceAdmin = 1000;
        $scope.roles.Admin = 999;
        $scope.roles.Normal = 99;
        $scope.roles.Basic = 9;
        $scope.getRole = function () {
            if (!$rootScope.User || !$rootScope.User.roles) {
                return $scope.roles.Basic;
            }
            else if ($rootScope.User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return $scope.roles.SmartTraceAdmin;
            } else if ($rootScope.User.roles.indexOf('Admin') >= 0) {
                return $scope.roles.Admin;
            } else if ($rootScope.User.roles.indexOf('Normal') >= 0) {
                return $scope.roles.Normal;
            } else {
                return $scope.roles.Basic;
            }
        }


        $scope.tracker = {};
        //$scope.tracker.imei = $stateParams.imei;
        var filter = $filter('filter');
        var param = {
            pageSize: 1000,
            pageIndex: 1,
            so: 'id',
            sc: 'asc'
        };
        //console.log('PARAM', $scope.tracker.imei);
        webSvc.getDevice($stateParams.imei).success(function(data){
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
            $("#confirmShutdown").modal("show");
        };
        $scope.shutdownNow = function() {
            $("#confirmShutdown").modal("hide");
            var shipmentId = $scope.tracker.lastShipmentId;
            if (shipmentId == null) {
                toastr.error('No Shipment for this device');
            } else {
                webSvc.getShipment(shipmentId).success(function(resp) {
                    console.log('DATA', resp);
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
                                toastr.success('You\'v shutdown a device!');
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

        /*$scope.confirm = function (deviceImei) {
            $scope.deviceImei = deviceImei;
            $("#confirmModel").modal("show");
        }*/

        $scope.deactivateNow = function () {
            $("#confirmDeactive").modal("hide");
            $scope.tracker.active = false; //-- deactivate
            webSvc.saveDevice($scope.tracker).success(function(data){
                console.log('DEACTIVATE-DEVICE', data);
                if (data.status.code == 0) {
                    toastr.success("Device has just deactivated successfully")
                    $state.go('tracker');
                } else {
                    toastr.error('Can\'t deactivate device!');
                }
            });
        }

        $scope.confirmDeactive = function() {
            //-- check if this device shutdown already or not
            var shipmentId = $scope.tracker.lastShipmentId;
            /*if (shipmentId == null) {
                toastr.warning('There is no shipmentId with this device!');
                webSvc.saveDevice($scope.tracker).success(function(data){
                    if (data.status.code == 0) {
                        toastr.success("Device has just deactivated successfully")
                        $state.go('tracker');
                    } else {
                        toastr.error('Can\'t deactivate device!');
                    }
                });
                return;
            }*/
            webSvc.getSingleShipment(shipmentId).success(function(resp) {
                console.log('SINGLE', resp);
                if (resp.status.code == 0) {
                    $scope.arrivalTimeISO = resp.response.arrivalTimeISO;
                } else {
                    $scope.arrivalTimeISO = -1;
                    toastr.warning('There is no shipment with this device!');
                }
            }).then(function() {
                if ($scope.arrivalTimeISO != null){
                    if ($scope.tracker.active) {
                        $("#confirmDeactive").modal("show");
                    } else {
                        toastr.warning('This device was deactivated!');
                    }
                } else {
                    toastr.warning('You must shut the device down first!')
                }
            })

        };
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
