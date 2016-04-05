/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('DeleteNoteCtrl', ['$scope', '$modalInstance', 'webSvc', 'note',
    function($scope, $modalInstance, webSvc, note) {
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
                    $modalInstance.close(note.noteNum);
                } else {
                    console.log('ERROR', data);
                    toastr.error("You have no permission to create note!");
                    $modalInstance.close(null);
                }
            })

        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    }])