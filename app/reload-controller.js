appCtrls.controller('reloadCtrl', function ($scope, $state, $rootScope, $location, $interval, $window, $log, $q,
                                            localDbSvc, webSvc, $timeout, $document, $templateCache, $http) {
    $rootScope.closeText = "";
    $rootScope.loading = false;
    $scope.showRead = false;
    // $rootScope.showRead= false;
    $scope.init = function() {
        $rootScope.readNotification = [];
        $rootScope.unreadNotification = [];
        $rootScope.closedNotification = [];
        //$scope.reloadUserIfNeed();
    }
    $scope.logout = function() {
        console.log('Logout...');
        var promise = localDbSvc.expireNow();
        var v = (new Date()).getTime();
        var promise2 = $http.get('/app/config/version.json?v='+v, {noCancelOnRouteChange:true}).then(
            function(response) {
                $rootScope = $rootScope.$new(true);
                var nxt = response.data.version;
                if (nxt != version) {
                    $rootScope.isOut = true;
                }
            },
            function(response) {
                $rootScope = $rootScope.$new(true);
                    $rootScope.isOut = true;
            }
        ).finally(function() {
        });

        $q.all([promise, promise2]).then(function() {
            $state.go('login');
        });
    };

    $scope.clearCache = function() {
        $templateCache.removeAll();
        toastr.info("Cleared cache");
    }

    // $scope.clearCache();

    $rootScope.height = $document.height();

    $rootScope.test = function(){
        if($scope.showRead == true){
            $rootScope.closeText = "------------------  Closed  ------------------";
            $rootScope.closedNotification = $rootScope.readNotification;
        } else {
            $rootScope.closeText = "";
            $rootScope.closedNotification = [];
        }
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

    loadNotifications = function(){
        webSvc.getNotifications(true).success(function (data) {
            //console.log("NOTIFICATION", data.response[0]);
            if (data == null) return;
            if(data.status.code == 0){
                while($rootScope.readNotification.length > 0){
                    $rootScope.readNotification.pop();
                }
                while($rootScope.unreadNotification.length > 0){
                    $rootScope.unreadNotification.pop();
                }

                for(i = 0; i < data.response.length; i++){
                    var obj = data.response[i];
                    var m = moment(obj.date);
                    obj.date = m.fromNow()
                    if(data.response[i].closed){
                        $rootScope.readNotification.push(obj);
                    } else {
                        $rootScope.unreadNotification.push(obj);
                    }
                }
            }
        });
    }
    $interval(loadNotifications, 10*60*1000); // 10 minutes
    $scope.reload = function() {
        //-- check authenticate
        if (localDbSvc.getToken() == '_') {
            toastr.warning('Your session was expired!')
            return $scope.logout();
        }
        reloadUserIfNeed();
        if ($state.current && $rootScope.previousState) {
            if ($state.current.name == $rootScope.previousState.name) {
                $state.go($state.current, {}, { reload: true });
            }
        }
    };
    function reloadUserIfNeed () {
        $scope.AuthToken = localDbSvc.getToken();

        if ($rootScope.AuthToken != $scope.AuthToken) {
            $rootScope.AuthToken = $scope.AuthToken;
            //--reset
            $rootScope.readNotification = [];
            $rootScope.unreadNotification = [];
            $rootScope.closedNotification = [];
            webSvc.getUser({}, true).success(function (data) {
                if(data.status.code == 0){
                    //$rootScope.User = data.response;
                    $rootScope.User = data.response;
                    localDbSvc.set('InternalCompany', data.response.internalCompany);
                    localDbSvc.setDegreeUnits(data.response.temperatureUnits);
                    loadNotifications();
                }
            });
        }

        if ($rootScope.RunningTime == null) {
            //reload user-time
            webSvc.getUserTime(true).success( function (timeData) {
                //console.log('USER-TIME', timeData);
                if (timeData.status.code == 0) {
                    localDbSvc.setUserTimezone(timeData.response.timeZoneId);
                    $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                    $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
                    $scope.tickInterval = 1000 //ms
                    var tick = function () {
                        if ($rootScope.moment) {
                            $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                            $timeout(tick, $scope.tickInterval); // reset the timer
                        }
                    }
                    // Start the timer
                    $timeout(tick, $scope.tickInterval);
                }
            });
        }
    }
});
