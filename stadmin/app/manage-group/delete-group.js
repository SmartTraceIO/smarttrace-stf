/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('DeleteGroupCtrl', DeleteGroupCtrl);
function DeleteGroupCtrl($uibModalInstance, webSvc, group) {
    var self = this;
    self.modalInstance = $uibModalInstance;
    self.WebSvc = webSvc;
    self.group = group;
}

DeleteGroupCtrl.prototype.delete = function() {
    var self = this;
    self.WebSvc.deleteDeviceGroup(self.group.id).success(function(data) {
        if (data.status.code == 0) {
            self.modalInstance.close(self.group);
        } else {
            toastr.error('An error occured while trying to delete group #' + self.group.name);
        }
    });
}
DeleteGroupCtrl.prototype.cancel = function() {
    var self = this;
    self.modalInstance.dismiss('cancel');
}