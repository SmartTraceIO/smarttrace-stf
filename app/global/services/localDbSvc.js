appSvcs.service("localDbSvc", [function () {

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

}]);