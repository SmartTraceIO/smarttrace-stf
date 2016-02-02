appSvcs.factory("AuthInterceptor", ["$rootScope", "$location", function ($rootScope, $location) {
    
    return {
        response: function(response){
            if(response.data.status != undefined && response.data.status.code == 1){
            	$rootScope.redirectUrl = $location.path();
                $rootScope.go("login");
            }
            return response;
        }
    }
}]);