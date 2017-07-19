/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('VerifyActionTakenController', VerifyActionTakenController);
function VerifyActionTakenController($uibModalInstance, $scope, rootScope, currentAction, alert) {
	//action taken to verify. Object structure:
	//{
	//    "id": 121,
	//    "action": {
	//      "action": "Check the door opened",
	//      "requestVerification": false
	//    },
	//    "time": "2017-06-14T09:25",
	//    "comments": "Any comments",
	//    "confirmedComments": "Any comments",
	//    "alert": 582,
	//    "confirmedBy": 1714,
	//    "verifiedBy": null,
	//    "alertTime": "2017-06-14T09:25", //view only parameter
	//    "alertDescription": ">18.0°C for 0 min in total", //view only parameter
	//    "confirmedByEmail": "a@b.c", //view only parameter
	//    "confirmedByName": "Yury Gagarin", //view only parameter
	//    "verifiedByEmail": null, //view only parameter
	//    "verifiedByName": "", //view only parameter
	//    "shipmentSn": "039485", //view only parameter
	//    "shipmentTripCount": 1 //view only parameter
	// }	
    $scope.actionTaken = currentAction;
	//alert with corrective action info object.
	//{
	//    "id": 1063,
	//    "description": "battery low",
	//    "time": "13:03 18 Jul 2017",
	//    "timeISO": "2017-07-18 13:03",
	//    "correctiveActionListId": null,
	//    "type": "Battery"
	//}
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
