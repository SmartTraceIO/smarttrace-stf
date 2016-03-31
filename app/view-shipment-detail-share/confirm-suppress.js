/**
 * Created by beou on 30/03/2016.
 */
appCtrls.controller('ConfirmSuppressCtrl', ['$scope', '$modalInstance', 'webSvc', 'shipmentId',
    function($scope, $modalInstance, webSvc, shipmentId) {
        $scope.shipmentId = shipmentId;
        console.log('ShipmentId', $scope.shipmentId);
        $scope.suppressFurtherAlert = function(id) {
            webSvc.suppressAlerts(id).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. Alerts will stop being monitored and no one will receive future notifications");
                } else {
                    toastr.error("You have no permission to suppress alert on this device!");
                }
            }).error(function(){
                toastr.error('Not implemented!')
            }).finally(function() {
                $modalInstance.close()
            })
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    }])