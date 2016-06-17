/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('AddGroupCtrl', AddGroupCtrl);
function AddGroupCtrl($rootScope, rootSvc, $state, webSvc, $q, $timeout, $interval, $log, localDbSvc, $controller, $location) {
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }

    var self = this;
    self.state = $state;
    self.WebSvc = webSvc;
    //properties
    self.name = '';
    self.description = '';
    self.deviceList = [];
    self.all = $q.all;
    self.debug = $log.debug;
    //$rootScope.RunningTime =
    self.debug('Add group!');
    rootSvc.SetPageTitle('List Tracker Groups');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Tracker Groups");

    //get all Devices
    self.WebSvc.getDevices(100000, 1, 'description', 'asc').success(function(response) {
        if (response.status.code == 0) {
            self.deviceList = response.response;
            self.debug('DeviceList', self.deviceList);
        }
    });
}

AddGroupCtrl.prototype.addGroup = function() {
    var self = this;
    var deviceGroup = {'name':this.name, 'description':this.description};
    self.WebSvc.saveDeviceGroup(deviceGroup).then(function(response) {
        var data = response.data;
        if (data.status.code == 0) {
            toastr.success('A new device group was added');
            self.debug('After added', response);
            if (data.response) {
                self.id = data.response.deviceGroupId;
            }
            self.state.go('manage.group')
        } else {
            toastr.error('An error has occured while trying to create new device group');
        }
    }).then(function() {
        self.addDevices();
    });
}

AddGroupCtrl.prototype.addDevices = function() {
    var self = this;
    var promise = [];
    angular.forEach(self.deviceListToAdd, function(val, key) {
        var p = self.WebSvc.addDeviceToGroup(self.id, val.imei);
        promise.push(p);
    });
    self.all(promise).then(function() {
        self.debug('Add all device');
    });
}
AddGroupCtrl.prototype.cancel = function() {
    var self = this;
    self.state.go('manage.group');
}
appFilters.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;
                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }
        return out;
    };
});