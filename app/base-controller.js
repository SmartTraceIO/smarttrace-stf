/**
 * Created by beou on 18/04/2016.
 */
appCtrls.controller('BaseCtrl', function(VM) {
    //-- check authenticate
    var rootScope   = VM.rootScope;
    var state       = VM.state;
    var webSvc      = VM.webSvc;
    var localDbSvc  = VM.localDbSvc;
    var log         = VM.log;
    var timeout     = VM.timeout;
    var interval    = VM.interval;

    log.debug('Starting base controller ...');
    if (localDbSvc.getToken() == '_') {
        toastr.warning('Your session was expired!')
        return state.go('login');
    }

    VM.loadNotifications = function() {
        if (!rootScope.loadedNotification) {
            webSvc.getNotifications(true).success(function (data) {
                log.debug('Notification', data);
                if (data == null) return;
                if(data.status.code == 0){
                    if (angular.isArray(rootScope.readNotification)) {
                        rootScope.readNotification.length = 0;
                    } else {
                        rootScope.readNotification = [];
                    }
                    if (angular.isArray(rootScope.unreadNotification)) {
                        rootScope.unreadNotification.length = 0;
                    } else {
                        rootScope.unreadNotification = [];
                    }

                    for(i = 0; i < data.response.length; i++){
                        var obj = data.response[i];
                        var m = moment(obj.date);
                        obj.date = m.fromNow()
                        //-- manipulate link
                        var idxLink = obj.link.indexOf('#');
                        obj.link = obj.link.substr(idxLink);

                        if(data.response[i].closed){
                            rootScope.readNotification.push(obj);
                        } else {
                            rootScope.unreadNotification.push(obj);
                        }
                    }
                }
            });
            rootScope.loadedNotification = true;
        }
    }
    VM.reloadUserIfNeed = function() {
        log.debug('reload user if needed!');
        var token = localDbSvc.getToken();
        if (rootScope.AuthToken != token) {
            rootScope.AuthToken = token;
            //--update user data
            webSvc.getUser({}, true).success(function (data) {
                if(data.status.code == 0){
                    rootScope.User = data.response;
                    localDbSvc.set('InternalCompany', data.response.internalCompany);
                    localDbSvc.setDegreeUnits(data.response.temperatureUnits);
                    interval(function() {
                        rootScope.loadedNotification = false;
                        VM.loadNotifications;
                    }, 10*60*1000); // 10 minutes
                }
            });
        }

        if (rootScope.RunningTime == null) {
            webSvc.getUserTime(true).success( function (timeData) {
                if (timeData.status.code == 0) {
                    localDbSvc.setUserTimezone(timeData.response.timeZoneId);
                    rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                    rootScope.moment = moment.tz(rootScope.RunningTimeZoneId);
                    var tick = function () {
                        if (rootScope.moment) {
                            rootScope.RunningTime = rootScope.moment.add(1, 's').format("DD-MMM-YYYY h:mm a");
                            timeout(tick, 1000); // reset the timer
                        }
                    }
                    // Start the timer
                    timeout(tick, 1000);
                }
            });
        }
    }
    VM.reloadUserIfNeed();
    VM.loadNotifications();
})