appCtrls.controller('LoginCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $log,
										   $rootScope, $location, $templateCache, $timeout, $window) {
    if ($rootScope.isOut == true) {
        $window.location.reload();
        $rootScope.isOut = false;
    }
	$rootScope.showHeader = true;
	$scope.toggle = false;
	$scope.username = localDbSvc.getUsername();
	$scope.password = localDbSvc.getPassword();
	localDbSvc.setToken("_");
	$scope.AuthToken = "_";
	var loginTimer;
	
	function loginTimeOut(){
		toastr.error("Login timeout! Please try again");
	}

	$scope.login = function(){
		if($scope.toggle){
			localDbSvc.setUsername($scope.username);
			localDbSvc.setPassword($scope.password);
		}
        // console.log("Updating tracker data...");
        loginTimer = $timeout(loginTimeOut, 5000);
		webSvc.login($scope.username, $scope.password).success(
			function(data) {
				$timeout.cancel(loginTimer);
				if (data.status.code == 0) {
					localDbSvc.setToken(data.response.token, data.response.expired);
					$scope.AuthToken = data.response.token;
					$rootScope.AuthToken = data.response.token;
					if ($rootScope.redirectUrl == "" || $rootScope.redirectUrl == undefined) {
						$rootScope.redirectUrl = "/view-shipment";
					}
					$rootScope.showHeader = false;
                    $scope.loadUserAndMove($rootScope.redirectUrl);
                    //$location.url($rootScope.redirectUrl);
					$rootScope.redirectUrl = "";
					toastr.success("Successfully logged in.");
				} else {
					toastr.warning("User e-mail address or password is incorrect.");
				}
			});
	}
    $scope.loadUserAndMove = function(url) {
        webSvc.getUser().success(function (data) {
            $log.debug('Login.User', data);
            $rootScope.User = data.response;
			localDbSvc.setDegreeUnits(data.response.temperatureUnits); //Celsius or Fahrenheit
        })
        webSvc.getUserTime().success( function (timeData) {
            //console.log('USER-TIME', timeData);
            if (timeData.status.code == 0) {
                localDbSvc.setUserTimezone(timeData.response.timeZoneId);
                $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
                $scope.tickInterval = 1000 //ms
                var tick = function () {
                    $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                    $timeout(tick, $scope.tickInterval); // reset the timer
                }
                // Start the timer
                $timeout(tick, $scope.tickInterval);
            }
        }).then(function(){
            //move to new url after update user-time
            $location.url(url);
        });
    }

});