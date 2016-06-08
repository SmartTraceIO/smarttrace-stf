/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('ConfirmDeactivateCtrl', ['$scope', '$uibModalInstance', '$state', 'webSvc', 'tracker',
    function($scope, $uibModalInstance, $state, webSvc, tracker) {
        $scope.tracker = tracker;
        console.log('tracker', $scope.tracker);
        $scope.deactivateNow = function() {
            $scope.tracker.active = false; //-- deactivate
            webSvc.saveDevice($scope.tracker).success(function(data){
                console.log('DEACTIVATE-DEVICE', data);
                if (data.status.code == 0) {
                    toastr.success("Device has just deactivated successfully")
                    $state.go('tracker');
                } else {
                    toastr.error('Can\'t deactivate device!');
                }
                $uibModalInstance.close()
            });
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }])