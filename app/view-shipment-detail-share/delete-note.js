/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('DeleteNoteCtrl', ['$scope', '$uibModalInstance', 'webSvc', 'note',
    function($scope, $uibModalInstance, webSvc, note) {
        $scope.note = note;
        $scope.deleteNote = function() {
            var params = {
                params:{
                    "noteNum": note.noteNum,
                    "sn": note.sn,
                    "trip": note.trip
                }
            }
            webSvc.deleteNote(params).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. one note was deleted");
                    $uibModalInstance.close(note.noteNum);
                } else {
                    console.log('ERROR', data);
                    toastr.error("You have no permission to create note!");
                    $uibModalInstance.close(null);
                }
            })

        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        }
    }])