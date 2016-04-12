/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('EditGroupCtrl', EditGroupCtrl);
function EditGroupCtrl(rootSvc, $state, $stateParams, webSvc, $q) {
    var self = this;
    self.state = $state;
    self.WebSvc = webSvc;
    //properties
    self.name = $stateParams.name;
    self.description = '';
    self.deviceList = [];
    self.deviceListToAdd = [];
    self.origDeviceList = [];
    self.all = $q.all;

    rootSvc.SetPageTitle('List Tracker Groups');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Tracker Groups");
    //get all Devices
    var p2 = self.GetDeviceGroup(self.name);
    self.all([p2]).then(function() {
        console.log('deviceList', self.deviceList);
        console.log('deviceListToAdd', self.deviceListToAdd);
    })
}

EditGroupCtrl.prototype.GetDeviceGroup = function(name){
    var self = this;
    if (!name) {
        return null;
    }

    var imeiList = [];
    var p1 = self.WebSvc.getDevices(1000, 1, 'description', 'asc').success(function(response) {
        if (response.status.code == 0) {
            self.deviceList = response.response;
            imeiList = self.deviceList.map(function(val) {
                return val.imei;
            })
        }
    }).then(function() {
        self.WebSvc.getDevicesOfGroup(name).success(function(data) {
            if (data.status.code == 0) {
                angular.forEach(data.response, function(val, key) {
                    var idx = imeiList.indexOf(val.imei);
                    if (idx >= 0) {
                        self.deviceListToAdd.push(self.deviceList[idx]);
                        self.origDeviceList.push(self.deviceList[idx]);
                    }
                });
            } else {
                toastr.error('An error occured while get devices of group #' + name);
            }
        });
    });

    var p11 = self.WebSvc.getDeviceGroup(name).success (function(data) {
        if (data.status.code == 0) {
            self.description = data.response.description;
        }
    });
    return self.all([p1, p11]);
}

EditGroupCtrl.prototype.saveGroup = function() {
    var self = this;
    var deviceGroup = {'name':this.name, 'description':this.description};
    self.WebSvc.saveDeviceGroup(deviceGroup).then(function(response) {
        var data = response.data;
        if (data.status.code == 0) {
            toastr.success('The trackers group was updated successful');
            self.state.go('manage.group')
        } else {
            toastr.error('An error has occured while trying to create new device group');
        }
    }).then(function() {
        self.addDevices();
    });
}

EditGroupCtrl.prototype.addDevices = function() {
    var self = this;
    var promises = [];
    angular.forEach(self.origDeviceList, function(val, key) {
        if (self.deviceListToAdd.indexOf(val) < 0) {
            var p = self.WebSvc.removeDeviceFromGroup(self.name, val.imei);
            promises.push(p);
        }
    });
    angular.forEach(self.deviceListToAdd, function(val, key) {
        if (self.origDeviceList.indexOf(val) < 0) {
            var p = self.WebSvc.addDeviceToGroup(self.name, val.imei);
            promises.push(p);
        }
    });
    self.all(promises);
}

EditGroupCtrl.prototype.cancel = function() {
    var self = this;
    self.state.go('manage.group');
}

EditGroupCtrl.prototype.buildDeviceObject = function(object) {
    var d = {};
    d.sn = object.sn;
    d.imei = object.imei;
    d.name = object.name;
    d.description = object.description;
    d.active = object.active;
    d.autostartTemplateId = object.autostartTemplateId;
    return d;
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