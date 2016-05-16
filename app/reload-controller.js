appCtrls.controller('reloadCtrl', function ($scope, $state, $rootScope, $location, $interval, $window, $log, $q,
                                            localDbSvc, webSvc, $timeout, $document, $templateCache, $http, Role) {
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
