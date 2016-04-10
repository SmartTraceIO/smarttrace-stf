appConstants.constant('Role', {
    SmartTraceAdmin:1000,
    Admin : 999,
    Normal : 99,
    Basic : 9
});
appSvcs.service("localDbSvc", ["$cookies", "$log", '$q', function ($cookies, $log, $q) {

    //set localstorage item
    /*this.set = function (key, value) {
        localStorage.setItem(key, value);
    }
    //remove local storage item
    this.remove = function (key) {
        localStorage.removeItem(key);
    }
    //get local storage item
    this.get = function(key){
        return localStorage.getItem(key);
    };*/

    this.set = function(key, value) {
        $cookies.put(key, value);
    }
    this.remove = function(key) {
        $cookies.remove(key);
    }
    this.get = function(key) {
        return $cookies.get(key);
    }

    //set token to the cookie
    this.setToken = function(token, expireDate){
        var exp = new Date(expireDate);
        $cookies.put('Token', token);
        //$cookies.put('Token', token, {'expires': exp});
    }
    // expire now
    this.expireNow = function() {
        var deferred = $q.defer();
        this.setToken('_', -1);
        return deferred.promise;
    }
    //get token from the cookie
    this.getToken = function(){
        if($cookies.get('Token') == undefined)
            return "_";
        return $cookies.get('Token');
    }
    //set username
    this.setUsername = function(username){
        $cookies.put("login_username", username);
    }
    //get username
    this.getUsername = function(){
        return $cookies.get("login_username");
    }
    //set password
    this.setPassword = function(password){
        $cookies.put("login_password", password);
    }
    //get password
    this.getPassword = function(){
        return $cookies.get("login_password");
    }

    this.setUserProfile = function(userProfile) {
        $cookies.put("profile", JSON.stringify(userProfile));
    }
    this.getUserProfile = function() {
        var user = null;
        try {
            user = JSON.parse($cookies.get("profile"));
        } catch (err) {
            user = null;
        }
        return user;
    }

    this.setDegreeUnits = function(dunit) {
        $cookies.put('degree_units', dunit); //C, F
    }
    this.getDegreeUnits = function() {
        return $cookies.get('degree_units');
    }

    this.setUserTimezone = function(timeZone) {
        $cookies.put("user_timezone", timeZone);
    }
    this.getUserTimezone = function() {
        return $cookies.get("user_timezone");
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