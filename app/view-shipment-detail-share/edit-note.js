/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('EditNoteCtrl', ['$scope', '$uibModalInstance', 'webSvc', 'note',
    function($scope, $uibModalInstance, webSvc, note) {
        $scope.note = {};
        $scope.note.activeFlag = note.activeFlag;
        $scope.note.createdBy = note.createdBy;
        $scope.note.creationDate = note.creationDate;
        $scope.note.noteNum = note.noteNum;
        $scope.note.noteText = note.noteText;
        $scope.note.noteType = note.noteType;
        $scope.note.shipmentId = note.shipmentId;
        $scope.note.sn = note.sn;
        $scope.note.trip = note.trip;
        $scope.note.timeOnChart = note.timeOnChart;

        $scope.saveNote = function(isInvalid) {
            if (!isInvalid) {
                if (!$scope.note.noteText) $scope.note.noteText = "";
                webSvc.saveNote($scope.note).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. one note was updated.");
                        $uibModalInstance.close($scope.note);
                    } else {
                        console.log('ERROR', data);
                        toastr.error("You have no permission to create note!");
                        $uibModalInstance.close(null);
                    }
                })
            } else {
                toastr.warning('Note must be less than 1000 characters');
            }
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }])