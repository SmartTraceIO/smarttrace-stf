/**
 * Created by beou on 04/04/2016.
 */
appCtrls.controller('EditNoteCtrl', ['$scope', '$modalInstance', 'webSvc', 'note',
    function($scope, $modalInstance, webSvc, note) {
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

        console.log('Edit', note);

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