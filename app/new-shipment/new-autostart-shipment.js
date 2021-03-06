appCtrls.controller('NewAutoStartShipmentCtrl', function ($scope, rootSvc, arrayToStringFilter, localDbSvc, webSvc, $state, _,
                                                 $filter, $timeout, $interval, $rootScope, $window, $log, $controller, $location) {
    rootSvc.SetPageTitle('New Shipment');
    rootSvc.SetActiveMenu('New Shipment');
    rootSvc.SetPageHeader("New Shipment");
    var VM = this;
    VM.trackers = [];
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
    $scope.Print = function() {
        $window.print();
    }
    $scope.ResetForm = function () {
        $state.go($state.current, {}, { reload: true });
        $scope.frmAddNewShipment.$setPristine()
    }

    //-- load all tracker
    VM.loadAllDevices = function() {
        return webSvc.getDevices(9999, 1, 'sn', '').success(function(data) {
            $log.debug(data);
            if (data.status.code == 0) {
                //VM.trackers = data.response;
                angular.forEach(data.response, function(v, k) {
                    if (v.active) {
                        // if (!isNaN(v.sn)) {
                        //     v.sn = parseInt(v.sn, 10);
                        // }
                        v.sn = _.padStart(v.sn, 6, '0');
                        VM.trackers.push(v);
                    }
                });
            } else {
                toastr.warning('Warngin. An error has occurred while trying to get list of trackers');
            }
        })
    }
    VM.loadAllDevices();

    VM.createNewAutoStartShipment = function(isValid) {
        if (isValid) {
            $log.debug(VM.tracker);
            webSvc.createNewAutoSthipment(VM.tracker.imei).success(function(data) {
                $log.debug(data);
                if (data.status.code == 0) {
                    toastr.success('Success. An AutoStart shipment was created successful');
                } else {
                    toastr.warning('Warngin. An error has occurred while creating an autostart shipment');
                }
            })
        } else {
            toastr.warning('Warning. An error has occurred while create a new autostart shipment.');
        }
    }
    VM.ResetForm = function() {
        VM.tracker = null;
    }
});

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