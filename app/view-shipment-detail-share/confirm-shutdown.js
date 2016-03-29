/**
 * Created by beou on 29/03/2016.
 */
appCtrls.controller('ConfirmShutdownCtrl', ['$scope', '$modalInstance', 'webSvc', 'shipmentId',
    function($scope, $modalInstance, webSvc, shipmentId) {
        $scope.shipmentId = shipmentId;
        console.log('ShipmentId', $scope.shipmentId);
        $scope.shutdownNow = function(id) {
            webSvc.shutdownDevice(id).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. The shutdown process has been triggered for this device");
                    $modalInstance.close()
                } else {
                    toastr.error("You have no permission to shutdown this device!");
                }
            })

        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
}])