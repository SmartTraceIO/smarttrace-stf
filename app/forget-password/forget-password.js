appCtrls.controller('ForgetCtrl', ['$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state', function ($scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state) {
	$scope.toggle = false;
	$scope.usermail;
	var resourceApi = $resource(Api.url + ':action/:token');

	$scope.forget = function(){
		// resourceApi.get({ action: 'login', email: $scope.username, password: $scope.password }, function (data) {
		//     if (data.status.code == 0) {
		//         localDbSvc.set("AuthToken", data.response.token);
		//         localDbSvc.set("TokenExpiredOn", data.response.expired);
		//         $scope.AuthToken = data.response.token;
		//         $state.go("newshipment");
		//     } else {
		//     	alert("Username or password is not correct.");
		//     }
		// });
		alert("forget clicked..." + $scope.usermail);
	}

	$scope.back = function(){
		$state.go("login");
	}

}]);