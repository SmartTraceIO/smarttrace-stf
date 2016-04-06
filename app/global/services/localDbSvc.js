﻿appSvcs.service("localDbSvc", ["$cookies", "$log", function ($cookies, $log) {

    //set localstorage item
    this.set = function (key, value) {
        localStorage.setItem(key, value);
    }
    //remove local storage item
    this.remove = function (key) {
        localStorage.removeItem(key);
    }
    //get local storage item
    this.get = function(key){
        return localStorage.getItem(key);
    };
    //set token to the cookie
    this.setToken = function(token, expireDate){
        var exp = new Date(expireDate);
        $cookies.put('Token', token, {'expires': exp});
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