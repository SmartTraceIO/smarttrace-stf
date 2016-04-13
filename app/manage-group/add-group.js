/**
 * Created by beou on 11/04/2016.
 */
appCtrls.controller('AddGroupCtrl', AddGroupCtrl);
function AddGroupCtrl($rootScope, rootSvc, $state, webSvc, $q, $timeout, localDbSvc) {
    var self = this;
    if ($rootScope.User) {
        return $rootScope.User;
    } else {
        $rootScope.User = localDbSvc.getUserProfile();
    }
    if ($rootScope.RunningTime == null) {
        $rootScope.RunningTime = localDbSvc.getUserTimezone();
        $rootScope.RunningTimeZoneId = localDbSvc.getUserTimezone() // get the current timezone
        $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
        var tickInterval = 1000 //ms
        var tick = function () {
            $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
            $timeout(tick, tickInterval); // reset the timer
        }
        $timeout(tick, tickInterval);
    }
    self.state = $state;
    self.WebSvc = webSvc;
    //properties
    self.name = '';
    self.description = '';
    self.deviceList = [];
    self.all = $q.all;
    //$rootScope.RunningTime =

    rootSvc.SetPageTitle('List Tracker Groups');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Tracker Groups");


    //get all Devices
    self.WebSvc.getDevices(1000, 1, 'description', 'asc').success(function(response) {
        if (response.status.code == 0) {
            self.deviceList = response.response;
        }
    })

}

AddGroupCtrl.prototype.addGroup = function() {
    var self = this;
    var deviceGroup = {'name':this.name, 'description':this.description};
    self.WebSvc.saveDeviceGroup(deviceGroup).then(function(response) {
        var data = response.data;
        if (data.status.code == 0) {
            toastr.success('A new device group was added');
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
        var p = self.WebSvc.addDeviceToGroup(self.name, val.imei);
        promise.push(p);
    });
    self.all(promise).then(function() {
        console.log('Add all device');
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