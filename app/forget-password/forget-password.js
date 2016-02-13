appCtrls.controller('ForgetCtrl', ['$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state', '$location',
function ($scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state, $location) {
	$scope.toggle = false;
	$scope.usermail;
	
	var resourceApi = $resource(Api.url + ':action/');
	$scope.forget = function(){
		var absUrl = $location.absUrl();
		absUrl = absUrl.replace('?', '');
		var url = $location.url();
		var baseUrl = absUrl.substr(0, absUrl.length - url.length);
		baseUrl = baseUrl + "/change-password?";
		baseUrl = baseUrl + "email=" + $scope.usermail + "&";

		resourceApi.get({ action: 'forgetRequest', baseUrl: baseUrl, email: $scope.usermail }, function (data) {
		    if (data.status.code == 0) {
		        toastr.success("An email has been sent to <b>" + $scope.usermail + "</b>", "Success!");
		    } else {
		    	// alert("Username or password is not correct.");
		    	toastr.warning(data.status.message);
		    }
		});
		// alert("forget clicked..." + $scope.usermail);
	}

	$scope.back = function(){
		$state.go("login");
	}

}]);