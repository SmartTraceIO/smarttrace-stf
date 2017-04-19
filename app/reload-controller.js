appCtrls.controller('reloadCtrl', function ($scope, $state, $rootScope, $location, $interval, $window, $log, $q,
                                            localDbSvc, webSvc, $timeout, $document, $templateCache, $http, $uibModal) {
    $rootScope.closeText = "";
    $rootScope.loading = false;
    $scope.showRead = false;

    $scope.logout = function() {
        var promise = localDbSvc.expireNow();
        var v = (new Date()).getTime();
        var promise2 = $http.get('app/config/version.json?v='+v, {noCancelOnRouteChange:true}).then(
            function(response) {
                $log.debug('Logout...', $rootScope.loadedNotification);
                if ($rootScope.loadedNotification) {
                    $rootScope.loadedNotification = false;
                    $rootScope.readNotification = [];
                    $rootScope.unreadNotification = [];
                    $log.debug('Logout...', $rootScope.loadedNotification);
                }
                var nxt = response.data.version;
                if (nxt != version) {
                    $rootScope.isOut = true;
                }
            },
            function(response) {
                //$rootScope = $rootScope.$new(true);
                $rootScope.isOut = true;
            }
        ).then(function() {
            $rootScope.isSmartTraceAdmin = false;
        });

        $q.all([promise2]).then(function() {
            $log.debug('start logout!');
            $state.go('login');
        });
    };

    $scope.performanceReports = function($e) {
        $e.preventDefault();
        var modalInstance = $uibModal.open({
            templateUrl: 'app/preference/performance-report.html',
            controller: 'PerformanceReportCtrl as VM',
            /*resolve: {
                sn: function() {
                    return $scope.sn;
                },
                trip: function() {
                    return $scope.trip;
                }
                //note : function() {
                //    return note;
                //}
            }*/
        });
        modalInstance.result.then(
            //
        );
    }

    $scope.clearCache = function() {
        $templateCache.removeAll();
        toastr.info("Cleared cache");
    }

    // $scope.clearCache();

    $rootScope.height = $document.height();

    $scope.showRead = false;
    $rootScope.test = function(){
        $scope.showRead = !$scope.showRead; // toggle
        if($scope.showRead == true){
            $rootScope.closeText = "------------------  Closed  ------------------";
            $rootScope.closedNotification = $rootScope.readNotification;
        } else {
            $rootScope.closeText = "";
            $rootScope.closedNotification = [];
        }
        // console.log('Changing notification',$scope.showRead, $rootScope.closedNotification);
    }

    markAsRead = function(data){
        webSvc.markNotificationsAsRead(data).success(function(data){
            if(data.status.code != 0){
                toastr.warning(data.status.message);
            }
        });
    }

    $rootScope.closeAll = function(){
        var data = [];
        var cnt = $rootScope.unreadNotification.length;
        for(i = 0; i < cnt; i++){
            data.push($rootScope.unreadNotification[0].notificationId);
            $rootScope.readNotification.push($rootScope.unreadNotification[0]);
            $rootScope.unreadNotification.splice(0, 1);
        }
        if($scope.showRead)
            $rootScope.closedNotification = $rootScope.readNotification;
        markAsRead(data);
    }

    $rootScope.readNotify = function(id){
        
        var data = [id];
        
        markAsRead(data);

        for(i = 0; i < $rootScope.unreadNotification.length; i++){
            if($rootScope.unreadNotification[i].notificationId == id){
                $rootScope.unreadNotification[i].closed = true;
                $rootScope.readNotification.push($rootScope.unreadNotification[i]);
                $rootScope.unreadNotification.splice(i, 1);
                break;
            }
        }
    }

    $scope.reload = function() {
        //-- check authenticate
        //$log.debug('reload...');
        if (localDbSvc.getToken() == '_') {
            toastr.warning('Your session was expired!')
            return $scope.logout();
        }
        if ($state.current && $rootScope.previousState) {
            if ($state.current.name == $rootScope.previousState.name) {
                $state.go($state.current, {}, { reload: true });
            }
        }
    };
});

appCtrls.controller("PerformanceReportCtrl", PerformanceReportCtrl);
function PerformanceReportCtrl($uibModalInstance, $filter, webSvc, Api, localDbSvc) {
    var VM=this;
    VM.period = 'week';
    VM.location = null;
    VM.monthReport = new Date();

    VM.viewReport = function() {
        var month = moment(VM.monthReport).format('YYYY-MM-DD');
        var url = Api.url + 'getPerformanceReport/' + localDbSvc.getToken();// + "?month="+month;
        if (VM.monthReport) {
            url += ('?anchor=' + month);
        }
        if (VM.period) {
            url += ('&period=' + VM.period);
        }
        if (VM.location) {
            url += ('&location=' + VM.location);
        }
        var w = window.innerWidth * 0.7; //70% of fullwidth
        var h = window.innerHeight * 0.95;
        var options = "toolbar=0, titlebar=0, scrollbars=1, location=0, resizable=no, menubar=0, status=0, height="+ h +", width=" + w;
        window.open(url,"_blank", options);
        $uibModalInstance.close();
    }
    //-- cancel
    VM.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };

    var BindLocations = function (cb) {
        webSvc.getLocations(1000, 1, 'locationName', 'asc').success(function(data){
            if (data.status.code == 0) {
                var LocationList = data.response;
                VM.FromLocationList = [];
                VM.ToLocationList = [];
                VM.InterimLocationList = [];

                angular.forEach(LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        LocationList[key].DisplayText = val.locationName;
                    }

                    if (val.startFlag == "Y")
                        VM.FromLocationList.push(val);
                    if (val.endFlag == "Y")
                        VM.ToLocationList.push(val);
                    if (val.interimFlag == 'Y') {
                        VM.InterimLocationList.push(val);
                    }
                });

                if (cb)
                    cb;
            }
        });
    }
    BindLocations();
}