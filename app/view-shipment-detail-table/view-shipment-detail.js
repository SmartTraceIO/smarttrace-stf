appCtrls.controller('ViewShipmentDetailTableCtrl',
    function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $uibModal, $state, $log, $interval,
              $filter, NgMap, $sce, $rootScope, $templateCache, $timeout, $window, $controller) {
    rootSvc.SetPageTitle('View Shipment Detail in Table');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipment Detail  in Table");
        {
            this.rootScope  = $rootScope;
            this.state      = $state;
            this.log        = $log;
            this.webSvc     = webSvc;
            this.localDbSvc = localDbSvc;
            this.timeout    = $timeout;
            this.interval   = $interval;
            $controller('BaseCtrl', {VM:this});
        }
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Print = function() {
        $window.print();
    }
    //$scope.ShipmentId = $stateParams.vsId;
    if ($stateParams.vsId) {
        $scope.ShipmentId = $stateParams.vsId;
    } else {
        $scope.sn = $stateParams.sn;
        $scope.trip = $stateParams.trip;
    }
    //--update $rootScope roles
    function reloadIfNeed() {
            if ($rootScope.User) {
                return $rootScope.User;
            } else {
                webSvc.getUser().success(function (data) {
                    if(data.status.code == 0){
                        $rootScope.User = data.response;
                        console.log('USER', $rootScope.User);
                    }
                });
            }

            if ($rootScope.RunningTime == null) {
                //reload user-time
                webSvc.getUserTime().success( function (timeData) {
                    //console.log('USER-TIME', timeData);
                    if (timeData.status.code == 0) {
                        $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                        $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
                        $scope.tickInterval = 1000 //ms
                        var tick = function () {
                            $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                            $timeout(tick, $scope.tickInterval); // reset the timer
                        }
                        // Start the timer
                        $timeout(tick, $scope.tickInterval);
                    }
                });
            }
        }
        reloadIfNeed()
    //includes all tracker info here
    $scope.trackers = new Array();
    //------MAIN TRACKER INDEX ------
    $scope.MI = 0;

    loadTrackerData();    

    function loadTrackerData(){

        var params = null;
        if ($scope.ShipmentId) {
            params = {
                params: {
                    shipmentId: $scope.ShipmentId
                }
            };
        } else {
            params = {
                params: {
                    sn : $scope.sn,
                    trip : $scope.trip
                }
            };
        }

        //console.log('PARAMS', params);
        webSvc.getSingleShipmentShare(params).success( function (graphData) {
            if(graphData.status.code !=0){
                toastr.error(graphData.status.message, "Error");
                return;
            }

            var info = graphData.response;

            //--------Remove Light On, Off---------
            for(alert = 0; alert < info.alertSummary.length; alert ++){
                if(info.alertSummary[alert].toLowerCase() == "lighton" 
                    || info.alertSummary[alert].toLowerCase() == "lightoff") {
                    info.alertSummary.splice(alert --, 1);
                }
            }
            //--------Remove Light On, Off---------
            //console.log(info);

            

            // console.log("******", info.locations.length);

            //------------PREPARE TRACKERS INFO  BEGIN-------------
            var tempObj = {};
            for(var k in info){
                if(info.hasOwnProperty(k)){
                    tempObj[k] = info[k];
                }
            }
            if(tempObj.alertYetToFire != null)
                tempObj.alertYetToFire = tempObj.alertYetToFire.split(",");
            tempObj.loaded = true;
            tempObj.loadedForIcon = true;
            //console.log("MainTracker", tempObj.locations.length);
            //$scope.trackers[0] is the main tracker here.
            //at the first time, it addes new tracker info to the $scope.trackers
            //next time, it only updates the main tracker info, not insert it to $scope.trackers
            if($scope.trackers.length == 0){
                $scope.trackers.push(tempObj);
            } else $scope.trackers[0] = tempObj;


            for(i = 0; i < $scope.trackers.length; i++){
                $scope.trackers[i].siblingColor = rootSvc.getTrackerColor(i);
                $scope.trackers[i].index = i;
            }
            //------------PREPARE TRACKERS INFO    END-------------

            //set tracker information
            angular.forEach(tempObj.alertsNotificationSchedules, function(child, index){
                child.index = index;
            });

            //start and end location info

            var locations = info.locations;
            //google map data
            //$scope.firstPoint = locations[0];
            //$scope.currentPoint.loc = locations[0];
            //$scope.currentPoint.iconUrl = "theme/img/edot.png";
            $scope.changeActiveTracker($scope.MI);
        });
    }
        $scope.changeActiveTracker = function(index){

            $scope.MI = index;
            if($scope.trackers[index].locations.length == 0){
                toastr.warning("No data recorded yet!", "Empty Track");
                return;
            }
            //-------PREPARE HIGHCHART DATA-------
            // prepareHighchartSeries();
            //Map start and end location info
            //$scope.mapInfo.startLocationForMap = $scope.trackers[index].startLocationForMap;
            //$scope.mapInfo.startTimeISO = $scope.trackers[index].startTimeISO;
            //$scope.mapInfo.startLocation = $scope.trackers[index].startLocation;
            //$scope.mapInfo.endLocationForMap = $scope.trackers[index].endLocationForMap;
            //$scope.mapInfo.endLocation = $scope.trackers[index].endLocation;
            //$scope.mapInfo.etaISO = $scope.trackers[index].etaISO;
            //$scope.mapInfo.arrivalTimeISO = $scope.trackers[index].arrivalTimeISO;
            //$scope.mapInfo.lastReadingTimeISO = $scope.trackers[index].lastReadingTimeISO;

            $scope.trackerInfo = $scope.trackers[index];

            console.log('TrackerInfo', $scope.trackerInfo);

            //-- update trackerInfo here
            $scope.trackerInfo.shutdownDeviceAfterMinutesText = parseInt($scope.trackerInfo.shutdownDeviceAfterMinutes/60) + " hr(s) after arrival";
            $scope.trackerInfo.shutDownAfterStartMinutesText = parseInt($scope.trackerInfo.shutDownAfterStartMinutes/60) + " hr(s) after start";

            //check if latest shipment here
            $scope.shutdownAlready=false;
            var currentShipmentId = $scope.trackerInfo.shipmentId;
            webSvc.getShipment (currentShipmentId).success(function(data) {
                currentShipment = data.response;
                if (currentShipment.shutdownTime || currentShipment.status == 'Ended') {
                    $scope.shutdownAlready = true;
                }
                webSvc.getDevice(currentShipment.deviceImei).success(function(dd) {
                    console.log('CURRENT-DEVICE', dd);
                    currentDevice = dd.response;
                    if (currentShipmentId != currentDevice.lastShipmentId) {
                        $scope.isLatest = false;
                    } else {
                        $scope.isLatest = true;
                    }
                })
            })
        }
    function parseDate(date){
        var newDate = date.replace('-', '/').replace('-', '/') + ":00";
        return Date.parse(newDate);
    }

    $scope.shutdownNow = function() {
        if ($scope.isLatest) {
            if (!$scope.shutdownAlready) {
                webSvc.shutdownDevice(currentShipmentId).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. The shutdown process has been triggered for this device");
                        $scope.trackerInfo.shutdownTime = moment.tz($rootScope.RunningTimeZoneId).format("h:mmA DD MMM YYYY");
                        $scope.trackerInfo.status = 'Ended';
                        $scope.shutdownAlready = true;
                    } else {
                        toastr.error("You have no permission to shutdown this device!");
                    }
                })
            } else {
                toastr.warning ('Device has already been shutdown during this shipment.');
            }

        } else {
            //todo: link
            var temShipmentNumber = currentDevice.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                currentDevice.tripCount = parseInt(n);
            }
            currentDevice.sn = parseInt(currentDevice.sn);
            var link = '<a href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            toastr.warning("Warning. This device can only be shutdown from the latest shipment " + link);
        }
    }
    $scope.EditDescription = function(Id) {
        var modalInstance = $uibModal.open({
            templateUrl: '/app/view-shipment-detail-share/edit-description.html',
            controller: 'EditShipmentDetailDescription',
            resolve: {
                editId : function() {
                    return Id;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                $scope.trackerInfo.shipmentDescription = result;
            }
        );
    }
    $scope.EditComment = function(Id) {
        var modalInstance = $uibModal.open({
            templateUrl: '/app/view-shipment-detail-share/edit-comment.html',
            controller: 'EditShipmentDetailComment',
            resolve: {
                editId : function() {
                    return Id;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                $scope.trackerInfo.commentsForReceiver = result;
            }
        );
    }
});

appCtrls.controller('EditShipmentDetailDescription', ['$scope', '$uibModalInstance', 'webSvc', 'editId',
function($scope, $uibModalInstance, webSvc, editId) {
    $scope.editId = editId;
    webSvc.getShipment(editId).success(function(data) {
        if (data.status.code == 0) {
            $scope.shipment = data.response;
        }
    })
    $scope.saveShipment  = function() {
        var savingObject = {};
        savingObject.saveAsNewTemplate = false;
        savingObject.includePreviousData = false;

        savingObject.shipment = $scope.shipment;
        console.log('Shipment', $scope.shipment);
        webSvc.saveShipment(savingObject).success(function(data) {
            if (data.status.code == 0) {
                toastr.success('Description updated for shipment ' + $scope.shipment.deviceSN + '(' + $scope.shipment.tripCount + ')');
            } else {
                toastr.error('You have no permission to update shipment');
            }
        })
        $uibModalInstance.close($scope.shipment.shipmentDescription);
    }
    $scope.cancelEdit = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
appCtrls.controller('EditShipmentDetailComment', ['$scope', '$uibModalInstance', 'webSvc', 'editId',
    function($scope, $uibModalInstance, webSvc, editId) {
        $scope.editId = editId;
        webSvc.getShipment(editId).success(function(data) {
            if (data.status.code == 0) {
                $scope.shipment = data.response;
            }
        });
        $scope.saveShipment  = function() {
            var savingObject = {};
            savingObject.saveAsNewTemplate = false;
            //savingObject.includePreviousData = false;

            savingObject.shipment = $scope.shipment;
            webSvc.saveShipment(savingObject).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success('Comment updated for shipment ' + $scope.shipment.deviceSN + '(' + $scope.shipment.tripCount + ')');
                } else {
                    toastr.error('You have no permission to update shipment');
                }
            })
            $uibModalInstance.close($scope.shipment.commentsForReceiver);
        }
        $scope.cancelEdit = function () {
            $uibModalInstance.dismiss('cancel');
        };
}]);

