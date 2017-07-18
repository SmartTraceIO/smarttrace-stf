/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('NewActionTakenController', NewActionTakenController);
function NewActionTakenController($uibModalInstance, $scope, webSvc, currentAlert, actionList) {
    $scope.alert = {
        type: 'Hot',
        description: '> 5C for more than 10mins',
        timeStr: '2012/07/12'
    };
var a1={action: 'Action 1',requestVerification: true};

    $scope.actions = [
        a1,
        {action: 'Action 2',requestVerification: false}
    ];

    $scope.actionTaken = {
        action: a1,
        comments: 'any comment',
        date: new Date()
    };

    //-- cancel
    $scope.cancel = function() {
        $uibModalInstance.dismiss();
    };
    
    $scope.saveActionTaken = function() {
    	$scope.cancel();
    };
}
