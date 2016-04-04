/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('EditNoteCtrl', ['$scope', '$modalInstance', 'webSvc', 'note',
    function($scope, $modalInstance, webSvc, note) {
        $scope.note = note;
        $scope.saveNote = function() {
            webSvc.saveNote($scope.note).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. one note was created");
                } else {
                    console.log('ERROR', data);
                    toastr.error("You have no permission to create note!");
                }
                //--close anyway
                $modalInstance.close()
            })

        }

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        }
    }])