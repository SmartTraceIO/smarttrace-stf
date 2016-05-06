appConstants.constant('Role', {
    SmartTraceAdmin:1000,
    Admin : 999,
    Normal : 99,
    Basic : 9
});
appSvcs.service("localDbSvc", ["$cookies", "$log", '$q', 'localStorageService', function ($cookies, $log, $q, localStorageService) {
    this.set = function(key, value) {
        //$cookies.put(key, value);
        localStorageService.set(key, value);
    }
    this.remove = function(key) {
        //$cookies.remove(key);
        localStorageService.remove(key);
    }
    this.get = function(key) {
        //return $cookies.get(key);
        return localStorageService.get(key);
    }

    //set token to the cookie
    this.setToken = function(token, expireDate){
        var exp = new Date(expireDate);
        //$cookies.put('Token', token);
        localStorageService.cookie.set('Token', token);
    }
    // expire now
    this.expireNow = function() {
        this.setToken('_', -1);
    }
    //get token from the cookie
    this.getToken = function(){
        if(localStorageService.cookie.get('Token') == undefined)
            return "_";
        return localStorageService.cookie.get('Token');
    }
    //set username
    this.setUsername = function(username, isSave){
        if (isSave) {
            localStorageService.set("login_username", username);
        } else {
            localStorageService.cookie.set("login_username", username);
        }
    }
    //get username
    this.getUsername = function(){
        if (localStorageService.cookie.get("login_username"))
            return localStorageService.cookie.get("login_username");
        return localStorageService.get("login_username");
    }
    //set password
    this.setPassword = function(password, isSave){
        if (isSave) {
            localStorageService.set("login_password", password);
        } else {
            localStorageService.cookie.set("login_password", password);
        }
    }
    //get password
    this.getPassword = function(){
        if (localStorageService.cookie.get("login_password")) {
            return localStorageService.cookie.get("login_password");
        }
        return localStorageService.get("login_password");
    }

    this.setUserProfile = function(userProfile) {
        localStorageService.set("profile", JSON.stringify(userProfile));
    }
    this.getUserProfile = function() {
        var user = null;
        try {
            user = JSON.parse(localStorageService.get("profile"));
        } catch (err) {
            user = null;
        }
        return user;
    }

    this.setDegreeUnits = function(dunit) {
        localStorageService.set('degree_units', dunit); //C, F
    }
    this.getDegreeUnits = function() {
        return localStorageService.get('degree_units');
    }

    this.setUserTimezone = function(timeZone) {
        localStorageService.set("user_timezone", timeZone);
    }
    this.getUserTimezone = function() {
        return localStorageService.get("user_timezone");
    }

}]);
appSvcs.service('HttpPendingRequestsService', function ($q) {
    var cancelPromises = [];

    function newTimeout() {
        var cancelPromise = $q.defer();
        cancelPromises.push(cancelPromise);
        return cancelPromise.promise;
    }

    function cancelAll() {
        angular.forEach(cancelPromises, function (cancelPromise) {
            cancelPromise.promise.isGloballyCancelled = true;
            cancelPromise.resolve();
        });
        cancelPromises.length = 0;
    }

    return {
        newTimeout: newTimeout,
        cancelAll: cancelAll
    };
});