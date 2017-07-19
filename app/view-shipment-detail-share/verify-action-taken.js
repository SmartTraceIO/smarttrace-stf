/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('VerifyActionTakenController', VerifyActionTakenController);
function VerifyActionTakenController($uibModalInstance, $scope, rootScope, currentAction, alert) {
    $scope.actionTaken = currentAction;
    console.log(currentAction.action);
    $scope.alert = alert;



    //-- cancel
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };
    $scope.verifyActionTaken = function() {
    	$scope.cancel();
//        rootScope.verifyActionTaken($scope.actionTaken);
//        $uibModalInstance.dismiss();
    };
}
