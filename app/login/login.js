appCtrls.controller('LoginCtrl', ['$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state','$rootScope', '$location', 
function ($scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state, $rootScope, $location) {

	$rootScope.showHeader = true;
	$scope.toggle = false;
	$scope.username = localDbSvc.getUsername();
	$scope.password = localDbSvc.getPassword();
	localDbSvc.set("AuthToken", "_");
	$scope.AuthToken = "_";

	var resourceApi = $resource(Api.url + ':action/:token');
	$scope.login = function(){

		if($scope.toggle){
			localDbSvc.setUsername($scope.username);
			localDbSvc.setPassword($scope.password);
		}

		resourceApi.get({ action: 'login', email: $scope.username, password: $scope.password }, function (data) {
		    if (data.status.code == 0) {
		    	localDbSvc.setToken(data.response.token, data.response.expired);
		    	console.log(data.response);
				console.log(localDbSvc.getToken());
				
		        $scope.AuthToken = data.response.token;
		        $rootScope.AuthToken = data.response.token;
		        if($rootScope.redirectUrl == "" || $rootScope.redirectUrl == undefined){
		        	$rootScope.redirectUrl = "/view-shipment";
		        }
		        $rootScope.showHeader = false;
		        $location.path($rootScope.redirectUrl);
		        $rootScope.redirectUrl = "";
		        toastr.success("Successfully logged in.");
		        resourceApi.get({ action: 'getUser', token: $scope.AuthToken }, function (data) {
		        	$rootScope.User = data.response;
		        	console.log($rootScope.User);
		        });
		    } else {
		    	toastr.warning("User e-mail address or password is incorrect.");
		    }
		});

		
	}

}]);