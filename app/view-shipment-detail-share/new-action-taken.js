/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('NewActionTakenController', NewActionTakenController);
function NewActionTakenController($uibModalInstance, $scope, rootScope, currentAlert, actionList) {
	//alert with corrective action info object.
	//{
	//    "id": 1063,
	//    "description": "battery low",
	//    "time": "13:03 18 Jul 2017",
	//    "timeISO": "2017-07-18 13:03",
	//    "correctiveActionListId": null,
	//    "type": "Battery"
	//}
    $scope.alert = currentAlert;
    
    //array of action elements. Element structure:
	//{
	//  "action": "Check the door opened",
	//  "requestVerification": false
	//}
    $scope.actions = actionList;

    //create action taken with minimum info
    //other info will set in parent controller
    //before sent the actionTaken to save
    $scope.actionTaken = {
        action: actionList[0],
        alert: currentAlert.id,
        comments: null,
        date: new Date()
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
