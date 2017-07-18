/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('NewActionTakenController', NewActionTakenController);
function NewActionTakenController($uibModalInstance, $scope, rootScope, currentAlert, actionList) {
    $scope.alert = currentAlert;
    $scope.actions = actionList;

    $scope.actionTaken = {
        action: null,
        alert: currentAlert.id,
        comments: null,
        date: null
    };

    //-- cancel
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };
    
    $scope.saveActionTaken = function() {
        rootScope.saveActionTaken($scope.actionTaken);
        $uibModalInstance.dismiss();
    };
}
