appCtrls.controller('ForgetCtrl', function ($scope, $rootScope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $location) {
	rootSvc.SetPageTitle('Reset password');
	$scope.toggle = false;
	$scope.usermail;
	$rootScope.showHeader = true;
	
	$scope.forget = function(){
		var absUrl = $location.absUrl();
		absUrl = absUrl.replace('?', '');
		var url = $location.url();
		var baseUrl = absUrl.substr(0, absUrl.length - url.length);
		baseUrl = baseUrl + "/change-password?";
		baseUrl = baseUrl + "email=" + $scope.usermail + "&";

		webSvc.forgetRequest(baseUrl, $scope.usermail).success(function(data){
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

});