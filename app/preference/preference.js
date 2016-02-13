appCtrls.controller('PreferenceCtrl', ['$cookies', '$scope', 'rootSvc', 'Api', 'localDbSvc', '$stateParams', '$resource', '$state','$rootScope', '$location', 
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
    var BindLanguages = function () {
        resourceApi.get({ action: "getLanguages", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }

    var BindTimezones = function () {
        resourceApi.get({ action: "getTimeZones ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    $scope.SaveData = function(){
    	var url = Api.url + 'updateUserDetails/' + $scope.AuthToken;

    	var userData = {};
        
        userData.user = $scope.User.id;
    	userData.temperatureUnits = $scope.User.temperatureUnits;
    	userData.measurementUnits = $scope.User.measurementUnits;
    	userData.language = $scope.User.language;
    	userData.timeZone = $scope.User.timeZone;

        $.ajax({
            type: "POST",
            datatype: "json",
            processData: false,
            contentType: "text/plain",
            data: JSON.stringify(userData),
            url: url,
            success: function (data, textStatus, XmlHttpRequest) {
                if(data.status.code == 0){
                    toastr.success("Successfully updated the user preferences");
                    toastr.info("Please login again...");
                    $state.go("login");
                    resourceApi.get({ action: 'getUserTime', token: localDbSvc.getToken() }, function (timeData) {
                        if (timeData.status.code == 0) {
                            $rootScope.RunningTime = new Date(timeData.response.dateTimeIso);
                            $rootScope.RunningTimeZoneId = timeData.response.timeZoneId;
                        }
                    });
                }
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                toastr.warning("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            }
        });
    }

	BindLanguages();
	BindTimezones();

}]);