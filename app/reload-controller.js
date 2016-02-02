appCtrls.controller('reloadCtrl', ['$scope', '$state', '$resource', '$rootScope', '$location', 'Api','localDbSvc', '$timeout', function ($scope, $state, $resource, $rootScope, $location, Api, localDbSvc, $timeout) {
	
	var resourceApi = $resource(Api.url + ':action/:token');
	resourceApi.get({ action: 'getUserTime', token: localDbSvc.get("AuthToken") }, function (timeData) {
        if (timeData.status.code == 0) {
            $scope.tickInterval = 1000 //ms
            $rootScope.RunningTime = new Date(timeData.response.dateTimeIso);

            var tick = function () {
                $rootScope.RunningTime.setSeconds($rootScope.RunningTime.getSeconds() + 1);
                $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                $timeout(tick, $scope.tickInterval); // reset the timer
            }
            // Start the timer
            $timeout(tick, $scope.tickInterval);
        }
    });

	$(".menu-li a").on("click", function () {
        if ($state.current.name == $rootScope.previousState.name) {
            $state.go($state.current, {}, { reload: true }); 
        }
    })
}]);
