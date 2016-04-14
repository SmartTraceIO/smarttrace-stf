/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('ListGroupCtrl', ListGroupCtrl);

function ListGroupCtrl($modal, rootSvc, $window, webSvc, $q, $log) {
    var self = this;

    rootSvc.SetPageTitle('List Tracker Groups');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Tracker Groups");
    //--inject services
    self.RootSvc = rootSvc;
    self.PrintService = $window;
    self.WebSvc = webSvc;
    self.all = $q.all;
    self.modal = $modal;


    self.GetDeviceGroups(
        function(data){
            self.groupList = data;
            $log.debug('GroupList', self.groupList);
        },
        function(data){}).then(function() {
        var promises = [];
        angular.forEach(self.groupList, function(val, key) {
            //self.groupList[key].deviceList = [];
            //get device for each group
            var p = self.WebSvc.getDevicesOfGroup(val.id).success(function(response) {
                var dl = response.response;
                if (dl) {
                    self.groupList[key].deviceList = dl.map(function(val) {
                        var sn = parseInt(val.sn, 10);
                        var name = val.name ? val.name.substr(0, 15) : '';
                        return val.sn+"<"+name+">";
                    })
                }
                //self.groupList[key].deviceList = response.response;
            });
            promises.push(p);
        });
        self.all(promises).then(function() {
            console.log('Get done!')
        });
    });
};
ListGroupCtrl.prototype.Print = function() {
    this.PrintService.print();
}
ListGroupCtrl.prototype.PageSizeChanged = function() {
    var self = this;
    //change size of page
}
ListGroupCtrl.prototype.Sorting = function() {
    var self = this;
    //sorting
}
ListGroupCtrl.prototype.confirm = function(group) {
    var self = this;
    var modalInstance = self.modal.open({
        templateUrl: 'app/manage-group/delete-group.html',
        controller: 'DeleteGroupCtrl as VM',
        resolve: {
            group: function () {
                return group;
            }
        }
    });
    modalInstance.result.then(
        function(deletedGroup) {
            var index = self.groupList.indexOf(deletedGroup);
            self.groupList.splice(index, 1);
        }
    );
}
ListGroupCtrl.prototype.GetDeviceGroups = function (resolve, reject){
    var self = this;
    return self.WebSvc.getDeviceGroups().then(
        function(response){
            var data = response.data;
            if (data.status.code == 0) {
                resolve(data.response);
            } else {
                reject(data);
            }
        },
        function(response) {
            reject(response.data);
        }
    )
}
