/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('CreateNoteCtrl', ['$scope', '$uibModalInstance', 'webSvc', 'point',
    function($scope, $uibModalInstance, webSvc, point) {
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

        $scope.saveNote = function(isInvalid) {
            if (!isInvalid) {
                webSvc.saveNote($scope.note).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. A new note was added.");
                        $uibModalInstance.close($scope.note)
                    } else {
                        toastr.error("You have no permission to create note!");
                        $uibModalInstance.close(null)
                    }
                    //--close anyway
                })
            } else {
                toastr.warning('Note must be less than 1000 characters!')
            }

        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }])