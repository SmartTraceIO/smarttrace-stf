appCtrls.controller('LoginCtrl', ['$cookies', '$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state','$rootScope', '$location', function ($cookies, $scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state, $rootScope, $location) {

	$rootScope.showHeader = true;
	$scope.toggle = false;
	$scope.username = $cookies.get("login_username");
	$scope.password = $cookies.get("login_password");
	localDbSvc.set("AuthToken", "_");
	var resourceApi = $resource(Api.url + ':action/:token');
	$scope.login = function(){
		if($scope.toggle){
			$cookies.put("login_username", $scope.username);
			$cookies.put("login_password", $scope.password);
		}

		resourceApi.get({ action: 'login', email: $scope.username, password: $scope.password }, function (data) {
		    if (data.status.code == 0) {
		        localDbSvc.set("AuthToken", data.response.token);
		        localDbSvc.set("TokenExpiredOn", data.response.expired);
		        $scope.AuthToken = data.response.token;
		        if($rootScope.redirectUrl == "/login" || $rootScope.redirectUrl == undefined){
		        	$rootScope.redirectUrl = "/new-shipment";
		        }
		        $rootScope.showHeader = false;
		        $location.path($rootScope.redirectUrl);
		        toastr.success("Successfully logged in.");
		    } else {
		    	toastr.warning("User e-mail address or password is incorrect.");
		    }
		});

		
	}

}]);