appCtrls.controller('UserUpdateCtrl', ['$cookies', '$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state','$rootScope', '$location', 
function ($cookies, $scope, rootSvc, Api, localDbSvc, $stateParams, $resource, $state, $rootScope, $location) {

	var resourceApi = $resource(Api.url + ':action/:token');
	$scope.AuthToken = localDbSvc.getToken();
	$scope.User = $rootScope.User;

    if($scope.User == undefined){
        resourceApi.get({ action: 'getUser', token: $scope.AuthToken }, function (data) {
            $rootScope.User = data.response;
            $scope.User = data.response;
        });
    }

    isValidPassword = function(password){
		if(password.length < 8 || !/[0-9]/.test(password)){
			return false;
		}
		return true;
	}

    $scope.SavePassword = function(){

    	if($scope.password1 != $scope.password2){
    		toastr.warning("Password do not match!");
    	} else if(!isValidPassword($scope.password1)){
			toastr.warning("Password length should be at least 8 and should included at least 1 number.", "Invalid password format!");
		} else {
    		var userData = {};
	    	userData.user = $scope.User.id;
	    	userData.password = $scope.password1;
    		var url = Api.url + 'updateUserDetails/' + $scope.AuthToken;
	    	$.ajax({
	            type: "POST",
	            datatype: "json",
	            processData: false,
	            contentType: "text/plain",
	            data: JSON.stringify(userData),
	            url: url,
	            success: function (data, textStatus, XmlHttpRequest) {
	                if(data.status.code == 0)
	                    toastr.success("Successfully updated the password");
	                else
	                    toastr.warning(data.status.message);
	            },
	            error: function (xmlHttpRequest, textStatus, errorThrown) {
	                toastr.warning("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
	            }
	        });
    	}
    	
    }
    
}]);