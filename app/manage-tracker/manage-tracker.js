appCtrls.controller('ListTrackerCtrl',
    function ($scope, $rootScope, $filter, rootSvc, localDbSvc, webSvc, $window, Role) {
        rootSvc.SetPageTitle('List Trackers');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Role = Role;

        var BindTrackerList = function () {
            webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
                if (data.status.code == 0) {
                    console.log('TrackerList', data.response);
                    $scope.TrackerList = data.response;
                    $scope.TrackerList.totalCount = data.totalCount;

                    //parsing TrackerList
                    angular.forEach($scope.TrackerList, function(v, k) {
                        var temShipmentNumber = v.shipmentNumber;
                        if (temShipmentNumber){
                            var idx1 = temShipmentNumber.indexOf('(');
                            var idx2 = temShipmentNumber.indexOf(')');
                            var n = temShipmentNumber.substr(idx1+1, idx2-1);
                            var t = temShipmentNumber.substr(0, idx1);
                            $scope.TrackerList[k].tripCount = parseInt(n, 10);
                            //$scope.TrackerList[k].sn = parseInt(t);
                        }
                        $scope.TrackerList[k].sn = parseInt(v.sn, 10);
                    })
                }
            })
        }
        $scope.Print = function() {
            $window.print();
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
        var User = localDbSvc.getUserProfile();
        $scope.getRole = function () {
            if (!User || !User.roles) {
                return Role.Basic;
            }
            else if (User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return Role.SmartTraceAdmin;
            } else if (User.roles.indexOf('Admin') >= 0) {
                return Role.Admin;
            } else if (User.roles.indexOf('Normal') >= 0) {
                return Role.Normal;
            } else {
                return Role.Basic;
            }
        }
});
appCtrls.controller('AddTrackerCtrl', ['$scope', '$state', '$filter', 'rootSvc', 'localDbSvc', 'webSvc','$window', 'Role',
    function($scope, $state, $filter, rootSvc, localDbSvc, webSvc, $window, Role) {
        rootSvc.SetPageTitle('Add Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Add";

        $scope.Role = Role;

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
        $scope.Print = function() {
            $window.print();
        }
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
appCtrls.controller('EditTrackerCtrl', ['$scope', '$rootScope', '$state', '$filter', '$stateParams',
    'rootSvc', 'localDbSvc', 'webSvc', '$window', '$modal', 'Role',
    function($scope, $rootScope, $state, $filter, $stateParams, rootSvc, localDbSvc, webSvc, $window, $modal, Role) {
        rootSvc.SetPageTitle('Edit Tracker');
        rootSvc.SetActiveMenu('Trackers');
        rootSvc.SetPageHeader("Trackers");
        $scope.Action = "Edit";
        $scope.Role = Role;

        var User = localDbSvc.getUserProfile();
        $scope.getRole = function () {
            if (!User || !User.roles) {
                return Role.Basic;
            }
            else if (User.roles.indexOf('SmartTraceAdmin') >= 0) {
                return Role.SmartTraceAdmin;
            } else if (User.roles.indexOf('Admin') >= 0) {
                return Role.Admin;
            } else if (User.roles.indexOf('Normal') >= 0) {
                return Role.Normal;
            } else {
                return Role.Basic;
            }
        }
        $scope.Print = function() {
            $window.print();
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
            //console.log("TRACKER", data);
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
        }).then(function() {
            var temShipmentNumber = $scope.tracker.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                $scope.tracker.tripCount = parseInt(n, 10);
            }
            $scope.tracker.sn = parseInt($scope.tracker.sn, 10);
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
            if ($scope.tracker.shipmentStatus!='Ended' && $scope.tracker.shipmentStatus!='Arrived'){
                $("#confirmShutdown").modal("show");
            } else {
                toastr.error('You have already requested this tracker be shutdown')
            }
        };
        $scope.shutdownNow = function() {
            $("#confirmShutdown").modal("hide");
            var shipmentId = $scope.tracker.lastShipmentId;
            if (shipmentId == null) {
                toastr.error('No Shipment for this device');
            } else {
                webSvc.getShipment(shipmentId).success(function(resp) {
                    //console.log('DATA', resp);
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
                                toastr.success('Shutdown has been triggered for Tracker ' + $scope.tracker.sn + "(" + $scope.tracker.tripCount + ")");
                                $scope.tracker.shipmentStatus='Ended';
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

        $scope.confirmDeactive = function(shipmentId) {
            webSvc.getSingleShipment(shipmentId).success(function(resp) {
                if (resp.status.code == 0) {
                    $scope.arrivalTimeISO = resp.response.arrivalTimeISO;
                } else {
                    $scope.arrivalTimeISO = -1;
                    toastr.warning('There is no shipment with this device!');
                }
            }).then(function() {
                if ($scope.arrivalTimeISO != null){
                    if ($scope.tracker.active) {
                        var modalInstance = $modal.open({
                            templateUrl: '/app/manage-tracker/confirm-deactivate.html',
                            controller: 'ConfirmDeactivateCtrl',
                            resolve: {
                                tracker: function () {
                                    return $scope.tracker;
                                }
                            }
                        });
                        modalInstance.result.then(
                            function() {
                                //$scope.trackerInfo.shutdownTime = moment.tz($rootScope.RunningTimeZoneId).format("h:mmA DD MMM YYYY");
                                //$scope.trackerInfo.status = 'Ended';
                                //$scope.shutdownAlready = true;
                            }
                        );
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
        if (input <= 3355) {
            return '0%';
        } else if (input <= 3441.3) {
            return '10%';
        } else if (input <=3527.6) {
            return '20%';
        } else if (input <= 4131.7) {
            return '90%';
        } else if (input < 4218) {
            return '95%';
        } else {
            return '100%';
        }
       //return Number(input/1000).toFixed(1) + 'V';
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
