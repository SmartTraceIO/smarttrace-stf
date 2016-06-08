appSvcs.factory("AuthInterceptor", ["$rootScope", "$location", function ($rootScope, $location) {
    
    return {
        response: function(response){
            
            if(response.data.status != undefined &&
                response.data.status.code != undefined &&
                response.data.status.code == 1){
                // console.log($location.path());
                // console.log($location.path());
                // console.log("FAIL", response);
            	if($location.path() != "/login" && $location.path() != "/change-password"){
            		$rootScope.redirectUrl = $location.url();
                    $rootScope.go("login");
            	}
            }
            return response;
        }
    }
}]);

appSvcs.factory('HttpRequestTimeoutInterceptor', function ($q, HttpPendingRequestsService) {
    return {
        request: function (config) {
            config = config || {};
            if (config.timeout === undefined && !config.noCancelOnRouteChange) {
                config.timeout = HttpPendingRequestsService.newTimeout();
            }
            return config;
        },

        responseError: function (response) {
            if (response.config && response.config.timeout && response.config.timeout.isGloballyCancelled) {
                return $q.defer().promise;
            }
            return $q.reject(response);
        }
    };
});