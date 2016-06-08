/**
 * Created by beou on 08/06/2016.
 */
appCtrls.controller('TrackerCtrl', TrackerCtrl);
function TrackerCtrl (webSvc) {
    var VM = this;

    VM.moveDevice = function() {
        webSvc.moveDevice({company: VM.newCompany, device: VM.deviceImei}).success(function(data) {
            //check success here
            if (data.status.code == 0) {
                toastr.success('Device was moved!');
            }
        });
    }
    VM.cancelMove = function() {
        VM.deviceImei = null;
        VM.option = null;
        VM.newCompany = null;
    }
}