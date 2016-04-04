/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('ConfirmDeactivateCtrl', ['$scope', '$modalInstance', '$state', 'webSvc', 'tracker',
    function($scope, $modalInstance, $state, webSvc, tracker) {
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
                $modalInstance.close()
            });
        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    }])