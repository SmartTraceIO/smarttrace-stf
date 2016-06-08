appCtrls.controller('PreferenceCtrl', function ($cookies, $scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $rootScope, $log) {

	$scope.AuthToken = localDbSvc.getToken();
	$scope.User = $rootScope.User;
    if($scope.User == undefined){
        webSvc.getUser().success( function (data) {
            $rootScope.User = data.response;
            $scope.User = data.response;
        });
    }
    var BindLanguages = function () {
        webSvc.getLanguages().success( function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }

    var BindTimezones = function () {
        webSvc.getTimeZones().success( function (data) {            
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    $scope.SaveData = function(){
        //update part here
    	var userData = {};
        userData.user = $scope.User.id;
    	userData.temperatureUnits = $scope.User.temperatureUnits;
    	userData.measurementUnits = $scope.User.measurementUnits;
    	userData.language = $scope.User.language;
    	userData.timeZone = $scope.User.timeZone;

        $log.debug('User', userData);

        webSvc.updateUserDetails(userData).success( function (data, textStatus, XmlHttpRequest) {
            if(data.status.code == 0){
                toastr.success("Successfully updated the user preferences");
                toastr.info("Please login again...");
                $state.go("login");

            }
        }).error( function (xmlHttpRequest, textStatus, errorThrown) {
            toastr.warning("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
        })/*.then(function() {
            webSvc.getUserTime().success( function (timeData) {
                if (timeData.status.code == 0) {
                    console.log('UPDATE-USER', timeData);
                    //$rootScope.RunningTime = new Date(timeData.response.dateTimeIso);
                    //$rootScope.RunningTimeZoneId = timeData.response.timeZoneId;
                    $rootScope.RunningTimeZoneId = $scope.User.timeZone;
                }
            });
        })*/
    }

	BindLanguages();
	BindTimezones();

});