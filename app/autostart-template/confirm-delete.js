/**
 * Created by beou on 31/03/2016.
 */
appCtrls.controller('ConfirmDeleteAutoStartCtrl', ['$scope', '$uibModalInstance', 'webSvc', 'templateId',
    function($scope, $uibModalInstance, webSvc, templateId) {
        $scope.templateId = templateId;
        //console.log('ShipmentId', $scope.shipmentId);
        $scope.deleteTemplate = function(templateId) {
            webSvc.deleteAutoStartShipment(templateId).success(function(data){
                if (data.status.code == 0) {
                    toastr.success("Shipment template deleted successfully");
                } else {
                    toastr.error('You have no permission to delete this template!')
                }
            }).finally(function() {
                $uibModalInstance.close();
            });
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }]);