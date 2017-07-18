/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('NewActionTakenController', NewActionTakenController);
function NewActionTakenController($uibModalInstance, $scope, webSvc, currentAlert, actionList) {
    $scope.alert = {
        type: 'Hot',
        description: '> 5C for more than 10mins',
        time: new Date()
    };

    $scope.actions = [
        {action: 'Action 1',requestVerification: true},
        {action: 'Action 2',requestVerification: false}
    ];

    $scope.actionTaken = {
        action: null,
        comments: null,
        date: null
    };

    //-- cancel
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };
    
    $scope.saveActionTaken = function() {
    	$scope.cancel();
    };
}
