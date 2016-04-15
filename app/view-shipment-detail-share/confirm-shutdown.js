/**
 * Created by beou on 29/03/2016.
 */
appCtrls.controller('ConfirmShutdownCtrl', ['$scope', '$uibModalInstance', 'webSvc', 'shipmentId',
    function($scope, $uibModalInstance, webSvc, shipmentId) {
        $scope.shipmentId = shipmentId;
        console.log('ShipmentId', $scope.shipmentId);
        $scope.shutdownNow = function(id) {
            webSvc.shutdownDevice(id).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. The shutdown process has been triggered for this device");
                } else {
                    toastr.error("You have no permission to shutdown this device!");
                }
                //--close anyway
                $uibModalInstance.close()
            })

        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
}])