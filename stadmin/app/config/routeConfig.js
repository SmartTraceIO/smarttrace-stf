appConstants.constant('routes', [
    {
        name: 'login',
        config: {
            url: "/login"
            , views: {
                "content": {
                    templateUrl: "app/login/login.html?v="+ version
                    , controller: 'LoginCtrl'
                }
            }
        },
        dependencies: [
            'app/login/login.js?v=' + version,
        ]
    },
    {
        name: 'preference',
        config: {
            url: "/preference"
            , views: {
                "content": {
                    templateUrl: "app/preference/preference.html?v="+ version
                    , controller: 'PreferenceCtrl'
                }
            }
        },
        dependencies: [
            'app/preference/preference.js?v=' + version,
        ]
    },
    {
        name: 'user-update',
        config: {
            url: "/user-update"
            , views: {
                "content": {
                    templateUrl: "app/user-update/user-update.html?v="+ version
                    , controller: 'UserUpdateCtrl'
                }
            }
        },
        dependencies: [
            'app/user-update/user-update.js?v=' + version,
        ]
    },
    {
        name: 'forgetpassword',
        config: {
            url: "/forget-password"
            , views: {
                "content": {
                    templateUrl: "app/forget-password/forget-password.html?v="+ version
                    , controller: 'ForgetCtrl'
                }
            }
        },
        dependencies: [
            'app/forget-password/forget-password.js?v=' + version,
        ]
    },
    {
        name: 'changepassword',
        config: {
            url: "/change-password"
            , views: {
                "content": {
                    templateUrl: "app/change-password/change-password.html?v="+ version
                    , controller: 'ChangePWCtrl'
                }
            }
        },
        dependencies: [
            'app/change-password/change-password.js?v=' + version,
        ]
    },
    {
        name: 'manage',
        config: {
            url: "/manage",
            abstract:true
            , views: {
                "content": {
                    templateUrl: "app/global/layout/manage.html?v="+ version
                }
            }
        }
    },
    {
        name: 'manage.simulator',
        config: {
            url: '/simulator',
            'views': {
                'sub-content': {
                    templateUrl: 'app/simulator/list.html?v='+version,
                    controller: 'ListSimulatorCtrl as VM'
                }
            }
        },
        dependencies: [
            'app/simulator/manage-simulator.js?v=' + version
        ]
    },
    {
        name: 'manage.tracker',
        config: {
            url: '/tracker',
            views: {
                'sub-content': {
                    templateUrl: 'app/tracker/tracker.html',
                    controller: 'TrackerCtrl as VM'
                }
            }
        },
        dependencies: [
            'app/tracker/tracker.js'
        ]
    }
]);

//#endregion Register Routes Here

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'routes',
    function ($stateProvider, $urlRouterProvider, $httpProvider, routes) {
        ////following code is for add route with its dependancies for lazyloading
        angular.forEach(routes, function (route) {
            if (route.dependencies) {
                route.config.resolve = {
                    deps: function ($q, $rootScope) {
                        var deferred = $q.defer();
                        require(route.dependencies, function () {
                            $rootScope.$apply(function () {
                                deferred.resolve();
                            });
                        });
                        return deferred.promise;
                    }
                };
            }
            $stateProvider.state(route.name, route.config);
        });
        //$urlRouterProvider.otherwise('/new-shipment');
        $urlRouterProvider.otherwise('/login');
    }]);