appDirs.directive('mAlert', function () {
    return {
        restrict: 'E',
        scope: {
            alert: '='
        },
        templateUrl: 'app/global/directives/m-alert/m-alert.directive.html',
        controller: ['$scope', function ($scope) {
            //console.log('shipment', $scope.shipment);
        }]
    };
});