/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('VerifyActionTakenController', VerifyActionTakenController);
function VerifyActionTakenController($uibModalInstance, $scope, rootScope, currentAction, alert) {
    $scope.actionTaken = currentAction;
    $scope.alert = alert;
    $scope.dateDialog = {
		opened: false
    };

    //-- cancel
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };
    $scope.verifyActionTaken = function() {
        rootScope.verifyActionTaken($scope.actionTaken);
        $uibModalInstance.dismiss();
    };
}
