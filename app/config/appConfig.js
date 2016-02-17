app.constant("Api", { url: "http://139.162.3.8:8080/web/vf/rest/" });

// executes only once for an app, calls evertime when page refreshed by user
app.run(function ($state, $rootScope, Api, $resource, localDbSvc, $timeout, $templateCache) {
  
    $rootScope.go = function(url){
        $state.go(url);
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) { 
        $rootScope.$storage = $localStorage; 
        console.log("Before clear");
        if (typeof (current) !== 'undefined') { 
            $templateCache.remove(current.templateUrl); 
            console.log("Cleared");
        } 
    }); 
    
    // $templateCache.removeAll();
    

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            var resourceApi = $resource(Api.url + ':action/:token');

            if (toState) {
                $rootScope.previousState = toState
            }
            else {
                $rootScope.previousState = fromState
            };

            if ($rootScope.modalInstance)
                $rootScope.modalInstance.close('cancel');

            //call every time when route changed
            // if (!localDbSvc.getToken()) {
            //     resourceApi.get({ action: 'login', email: 'developer@visfresh.com', password: 'password' }, function (data) {
            //         if (data.status.code == 0) {
            //             localDbSvc.set("AuthToken", data.response.token);
            //             localDbSvc.set("TokenExpiredOn", data.response.expired);

            //         }
            //     });
            // }


            // resourceApi.get({ action: 'getUserTime', token: localDbSvc.getToken() }, function (timeData) {
            //     if (timeData.status.code == 0) {
            //         var tickInterval = 1000 //ms
            //         $rootScope.RunningTime = new Date(timeData.response.dateTimeIso);

            //         var tick = function () {
            //             $rootScope.RunningTime.setSeconds($rootScope.RunningTime.getSeconds() + 1);
            //             $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
            //             $timeout(tick, tickInterval); // reset the timer
            //         }

            //         // Start the timer
            //         $timeout(tick, tickInterval);
            //     }
            // })
        });
});

app.config(['$locationProvider', '$stateProvider', '$controllerProvider', '$provide', '$httpProvider', '$compileProvider', '$filterProvider', '$injector', function ($locationProvider, $stateProvider, $controllerProvider, $provide, $httpProvider, $compileProvider, $filterProvider, $injector) {
    ////register controller,service,factory,value,constant etc....
    appCtrls.controller = $controllerProvider.register;
    appDirs.directive = $compileProvider.directive;;
    appFilters.filter = $filterProvider.register;
    appSvcs.factory = $provide.factory;
    appSvcs.service = $provide.service;
    appValues.value = $provide.value;
    appConstants.constant = $provide.constant;
   
    //#endregion Register Controllers,Services,Factorys,Values,Constants,Directives & Filters
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['Access-Control-Allow-Methods'];
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    $httpProvider.interceptors.push([
        '$injector',
        function ($injector){
            return $injector.get('AuthInterceptor');
        }
    ]);
}]);