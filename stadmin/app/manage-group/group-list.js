/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('ListGroupCtrl', ListGroupCtrl);

function ListGroupCtrl($rootScope, $uibModal, $state, rootSvc, $window, webSvc, localDbSvc, $timeout, $interval, $q, $log, $controller) {
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        $controller('BaseCtrl', {VM:this});
    }

    var self = this;
    self.params = {
        pageSize:"20",
        pageIndex: 1,
        so: 'desc',
        sc: 'name'
    }
    rootSvc.SetPageTitle('List Tracker Groups');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Tracker Groups");
    //--inject services
    self.RootSvc = rootSvc;
    self.PrintService = $window;
    self.WebSvc = webSvc;
    self.all = $q.all;
    self.modal = $uibModal;
    self.debug = $log.debug;

    self.GetDeviceGroups(
        function(data, total){
            self.groupList = data;
            self.totalCount = total;
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
        self.all(promises);
    });
};
ListGroupCtrl.prototype.Print = function() {
    this.PrintService.print();
}
ListGroupCtrl.prototype.PageSizeChanged = function() {
    var self = this;
    //change size of page
    self.GetDeviceGroups(
        function(data, total){
            self.groupList = data;
            self.totalCount = total;
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
        self.all(promises);
    });

}
ListGroupCtrl.prototype.PageChanged = function() {
    var self = this;
    console.log('PageIndex', self.params.pageIndex);
    //change size of page
    self.GetDeviceGroups(
        function(data, total){
            self.groupList = data;
            self.totalCount = total;
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
        self.all(promises);
    });

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
    console.log('Params', self.params);
    return self.WebSvc.getDeviceGroups(self.params).then(
        function(response){
            var data = response.data;
            if (data.status.code == 0) {
                resolve(data.response, data.totalCount);
            } else {
                reject(data);
            }
        },
        function(response) {
            reject(response.data);
        }
    )
}
