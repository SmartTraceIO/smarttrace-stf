/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('CreateNoteCtrl', ['$scope', '$modalInstance', 'webSvc', 'point',
    function($scope, $modalInstance, webSvc, point) {
        $scope.point = point;
        $scope.note = {};
        $scope.note.activeFlag=true;
        $scope.note.createdBy=null;
        $scope.note.creationDate=null;
        $scope.note.noteNum=null;
        $scope.note.noteText='';
        $scope.note.shipmentId=point.shipmentId;
        $scope.note.noteType='simple';
        $scope.note.sn=parseInt(point.deviceSN, 10);
        $scope.note.trip=point.tripCount;
        $scope.note.timeOnChart=point.timeISO;

        $scope.saveNote = function(isValid) {
            if (isValid) {
                webSvc.saveNote($scope.note).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. A new note was added.");
                        $modalInstance.close($scope.note)
                    } else {
                        toastr.error("You have no permission to create note!");
                        $modalInstance.close(null)
                    }
                    //--close anyway
                })
            } else {
                toastr.warning('Note must be less than 1000 characters!')
            }

        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    }])