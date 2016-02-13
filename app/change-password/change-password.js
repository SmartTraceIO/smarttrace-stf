appCtrls.controller('ChangePWCtrl', ['$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state', '$location',
function ($scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state, $location) {
	$scope.usermail = $location.search().email;
	$scope.password;
	$scope.token = $location.search().token;
	
	var resourceApi = $resource(Api.url + ':action/');
	$scope.changePassword = function(){
		if(isValidPassword($scope.password)){
			resourceApi.get({ action: 'resetPassword', token: $scope.token, email: $scope.usermail, password: $scope.password }, function (data) {
			    if (data.status.code == 0) {
			        toastr.success(data.status.message);
			    } else {
			    	// alert("Username or password is not correct.");
			    	toastr.warning(data.status.message);
			    }
			    $state.go("login");
			});
		} else {
			toastr.warning("Password length should be at least 8 and should included at least 1 number.", "Invalid password format!");
		}
	}

	isValidPassword = function(password){
		if(password.length < 8 || !/[0-9]/.test(password)){
			return false;
		}
		return true;
	}

	// $scope.back = function(){
	// 	$state.go("login");
	// }
}]);