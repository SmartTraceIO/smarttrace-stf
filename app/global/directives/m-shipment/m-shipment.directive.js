appDirs.directive('mShipment', function () {
    return {
        restrict: 'E',
        scope: {
            shipment: '='
        },
        templateUrl: 'app/global/directives/m-shipment/m-shipment.directive.html',
        controller: ['$scope', function ($scope) {
            //console.log('shipment', $scope.shipment);
        }]
    };
});