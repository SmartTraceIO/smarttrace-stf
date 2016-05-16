/**
 * Created by beou on 16/05/2016.
 */

appCtrls.controller('ListSimulatorCtrl', ListSimulatorCtrl);
appCtrls.controller('EnterTimeCtrl', EnterTimeCtrl);
function ListSimulatorCtrl ($rootScope, $state, $log, webSvc, localDbSvc, $timeout, $interval, $controller, $q, $uibModal) {
    var self = this;
    self.simulatorList = [];
    self.userList = [];
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


    var ps = [];
    function pall() {
        if (!self.rootScope.isSmartTraceAdmin) return;
        self.simulatorList.length = 0;

        self.webSvc.getUsers(10000, 1, '', '').success(function(data) {
            if (data.status.code == 0) {
                self.userList = data.response;
                self.log.debug('UserList', self.userList);
            } else {
                toastr.warning('You don\'t have permission to get list of user!');
                return;
            }
        }).then(function() {
            angular.forEach(self.userList, function(v, k) {
                var param = {user: v.email}
                var p = self.webSvc.getSimulator(param).success (function(data) {
                    //console.log('Simulator for: ' + v.email,  data);
                    if (data.status.code == 0) {
                        if (data.response) {
                            self.simulatorList.push(data.response);
                        }
                    } else {
                        toastr.warning('An error has occured while geting the list of simulator');
                    }
                });
                ps.push(p);
            })
        }).then(function() {
            $q.all(ps).then(function() {
                console.log('Simulator list', self.simulatorList);
            })
        });
    }

    pall();
    self.saveSimulator = function() {
        self.webSvc.saveSimulator(self.simulator).success(function(data) {
            console.log('Data', data);
        });
    }
    self.startSimulator = function(simulator) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/simulator/enter-time.html',
            controller: 'EnterTimeCtrl as VME',
            resolve: {
                sim: function () {
                    return simulator;
                }
            }
        })
        modalInstance.result.then(
            function() {
                pall();
            }
        );
    }
    self.stopSimulator = function(simulator) {
        var param = {
            user: simulator.user
        }
        webSvc.stopSimulator(param).success(function(data) {
            if (data.status.code == 0) {
                toastr.success('Stop simulator successfully.');
            }
        }).finally(function() {
            pall();
        });
    }
}
function EnterTimeCtrl($uibModalInstance, convertSimDateFilter, webSvc, sim) {
    var self = this;
    self.sim = sim;
    self.endTime = null;
    self.startTime = null;

    console.log('Sim', sim);
    webSvc.getDevice(sim.sourceDevice).success(function(data) {
        if (data.status.code == 0) {
            if (data.response) {
                console.log("Device", data.response);
                self.lastShipmentId = data.response.lastShipmentId;
                self.endTime = convertSimDateFilter(data.response.lastReadingTime);
            }
        } else {
            return;
        }
    }).then(function() {
        //get lastshipment
        webSvc.getShipment(self.lastShipmentId).success(function(data) {
            console.log('LastShipment', data);
            if (data.status.code == 0) {
                if (data.response) {
                    self.startTime = convertSimDateFilter(data.response.startDate);
                }
            } else {
                return;
            }
        })
    })

    self.startSim = function() {
        var sSim = {
            "user": self.sim.user, // if null, current logged it user will used.
            "startDate": self.startTime, //start of time interval. can be null
            "endDate": self.endTime,  //end of time interval. can be null
            "velosity": self.velosity // t1new - tonew = (t1old - t0old) / velosity
        }
        webSvc.startSimulator(sSim).success(function(data) {
            console.log('Start Sim', data);
        }).finally(function() {
            $uibModalInstance.close();
        });
    }
    self.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    }

}

appFilters.filter('convertSimDate', function(localDbSvc) {
    return function (input) {
        if (input) {
            var dt = moment.tz(input, localDbSvc.getUserTimezone());
            return dt.format('YYYY-MM-DD HH:mm');
        } else  {
            return '';
        }
    }
})
