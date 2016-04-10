appCtrls.controller('LoginCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $state, $log,
										   $rootScope, $location, $templateCache, $timeout, $window, $q) {
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
        var promise0 = webSvc.login($scope.username, $scope.password).success(function(data) {
				$timeout.cancel(loginTimer);
				if (data.status.code == 0) {
                    console.log('Login', data);
					localDbSvc.setToken(data.response.token, data.response.expired);
					toastr.success("Successfully logged in.");
				} else {
					toastr.warning("User e-mail address or password is incorrect.");
				}
			});
        promise0.then(function() {
            if ($rootScope.redirectUrl == "" || $rootScope.redirectUrl == undefined) {
                $rootScope.redirectUrl = "/view-shipment";
            }
            $rootScope.showHeader = false;
            loadUserAndMove($rootScope.redirectUrl);
        });
	}
    var loadUserAndMove = function(url) {
        var promise1 = webSvc.getUser({}, {noCancelOnRouteChange:true}).success(function (data) {
            $rootScope.User = data.response;
			localDbSvc.setDegreeUnits(data.response.temperatureUnits); //Celsius or Fahrenheit
			localDbSvc.setUserTimezone(data.response.timeZone);
            localDbSvc.set('InternalCompany', data.response.internalCompany);
			localDbSvc.setUserProfile(data.response);
        });
        var promise2 = webSvc.getUserTime({}, {noCancelOnRouteChange:true}).success( function (timeData) {
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
        });
		$q.all([promise1, promise2]).then(function(){
            $location.url(url);
        });
    }

});