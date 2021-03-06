angular.module('lodash', [])
    .factory('_', ['$window', function ($window) {
    return $window._;
}]);

var appCtrls = angular.module('appCtrls', []);
var appDirs = angular.module('appDirs', []);
var appSvcs = angular.module('appSvcs', []);
var appProviders = angular.module('appProviders', []);
var appValues = angular.module('appValues', []);
var appConstants = angular.module('appConstants', []);
var appFilters = angular.module('appFilters', []);

// appSvcs.factory("_", ["$window", function ($window) {
//     if (!$window._) {
//         return null;
//     }
//     return $window._;
// }]);


var app = angular.module("app",
    [
        'lodash',
        'highcharts-ng',
        'ngMap',
        'ui.select',
        'ngSanitize',
        'ngTouch',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'ui.router',
        'ngResource',
        'ngCookies',
        'appCtrls',
        'appDirs',
        'appSvcs',
        'appProviders',
        'appValues',
        'appConstants',
        'appFilters',
        'ngSanitize',
        'ngAnimate',
        'LocalStorageModule',
        'templates-main'
    ],

    function ($rootScopeProvider) {
    ////this method skip error of $digest and $watch Error: $digest reaches maximum iteration
    $rootScopeProvider.digestTtl(25);
});

toastr.options = {
    "closeButton": true,
    "debug": false,
    "positionClass": "toast-bottom-right",
    "onclick": null,
    "showDuration": "1000",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "3000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

