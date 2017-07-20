appCtrls.controller('UserViewCtrl', function ($scope, webSvc, userId, $stateParams, $rootScope, $window) {
	$scope.User = null;

	$scope.Init = function() {
		var id = null;
		if (userId) {
			id = userId;
		} else if ($stateParams.userId) {
	    	id = $stateParams.userId;
	    }

	    if (id != null) {
	        webSvc.getUser(id).success(function (data) {
	            $scope.User = data.response;
	        });
	    }
	}

    $scope.cancel = function(){
        if($rootScope.modalInstance) {
            $rootScope.modalInstance.dismiss();
        }
    }
});
