app.constant("Api", { url: "https://smarttrace.com.au/web/vf/rest/" });
app.constant("Color", [
    {"name": "Green", "code":"#008000"}, //-- default color
    //{"name": "Aqua", "code":"#00FFFF"},
    {"name": "Black", "code":"#000000"},
    {"name": "Blue", "code":"#0000FF"},
    {"name": "BlueViolet", "code":"#8A2BE2"},
    {"name": "Brown", "code":"#A52A2A"},
    //{"name": "Crimson", "code":"#DC143C"},
    //{"name": "Cyan", "code":"#00FFFF"},
    {"name": "DarkBlue", "code":"#00008B"},
    {"name": "DarkCyan", "code": "#008B8B"},
    {"name": "DarkGoldenrod", code: "#B8860B"},
    {"name": "DarkGreen", "code":"#006400"},
    {"name": "DarkKhaki", "code": "#BDB76B"},
    {"name": "DarkMagenta", "code": "#8B008B"},
    {"name": "DarkOlivegreen", "code": "#556B2F"},
    {"name": "DarkOrange", "code":"#FF8C00"},
    {"name": "DarkOrchid", "code": "#9932CC"},
    {"name": "DarkRed", "code":"#8B0000"},
    {"name": "DarkSalmon", "code":"#E9967A"},
    {"name": "DarkTurquoise", "code":"#00CED1"},
    {"name": "DarksLategray", "code":"#2F4F4F"},
    {"name": "DimGray", "code":"#696969"},
    //{"name": "Fuchsia", "code":"#FF00FF"},
    //{"name": "Gold", "code":"#FFD700"},
    {"name": "GoldenRod", "code":"#DAA520"},
    {"name": "Gray", "code":"#808080"},
    //{"name": "Green", "code":"#008000"}, //-- default color
    {"name": "HotPink", "code":"#FF69B4"},
    {"name": "IndianRed ", "code":"#CD5C5C"},
    {"name": "Indigo ", "code":"#4B0082"},
    //{"name": "Lime", "code":"#00FF00"},
    //{"name": "Magenta", "code":"#FF00FF"},
    {"name": "Maroon", "code":"#800000"},
    {"name": "MediumAquamarine", "code":"#66CDAA"},
    {"name": "MediumsLateBlue", "code":"#7B68EE"},
    {"name": "Navy", "code":"#000080"},
    {"name": "Olive", "code":"#808000"},
    //{"name": "Orange", "code":"#FFA500"},
    //{"name": "OrangeRed", "code":"#FF4500"},
    {"name": "PaleVioletRed", "code":"#DB7093"},
    {"name": "Peru", "code":"#CD853F"},
    {"name": "Purple", "code":"#800080"},
    //{"name": "Red", "code":"#FF0000"},
    {"name": "RosyBrown", "code":"#BC8F8F"},
    {"name": "RoyalBlue", "code":"#4169E1"},
    {"name": "SaddleBrown", "code":"#8B4513"},
    {"name": "Salmon", "code":"#FA8072"},
    {"name": "SandyBrown", "code":"#F4A460"},
    {"name": "SeaGreen", "code":"#2E8B57"},
    {"name": "Sienna", "code":"#A0522D"},
    {"name": "SlateBlue", "code":"#6A5ACD"},
    {"name": "SteelBlue", "code":"#4682B4"},
    {"name": "Tan", "code":"#D2B48C"},
    {"name": "Teal", "code":"#008080"},
    {"name": "Tomato", "code":"#FF6347"},
    //{"name": "Turquoise", "code":"#40E0D0"},
    {"name": "Violet", "code":"#EE82EE"},
    {"name": "YellowGreen", "code":"#9ACD32"}
]);

// executes only once for an app, calls evertime when page refreshed by user
app.run(function ($state, $rootScope, $resource, localDbSvc, $timeout, $templateCache, $uibModalStack) {

    $rootScope.go = function(url){
        $state.go(url);
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) { 
        $rootScope.$storage = $localStorage; 
        console.log("Before clear");
        if (typeof (current) !== 'undefined') { 
            $templateCache.remove(current.templateUrl); 
            console.log("Cleared");
        } 
    });

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {

            if (toState) {
                $rootScope.previousState = toState
            }
            else {
                $rootScope.previousState = fromState
            };

            /*if ($rootScope.modalInstance)
                $rootScope.modalInstance.close('cancel');*/
            $uibModalStack.dismissAll();

        });
});

app.run(function($rootScope, $window) {
    $rootScope.$on("$viewContentLoaded", function () {
        //-- scroll top
        $window.scrollTo(0, 0);
    });
});

app.config(['$locationProvider', '$stateProvider', '$controllerProvider', '$provide',
    '$httpProvider', '$compileProvider', '$filterProvider', '$injector', '$logProvider',
    function ($locationProvider, $stateProvider, $controllerProvider, $provide,
              $httpProvider, $compileProvider, $filterProvider, $injector, $logProvider) {
    ////register controller,service,factory,value,constant etc....
    appCtrls.controller = $controllerProvider.register;
    appDirs.directive = $compileProvider.directive;;
    appFilters.filter = $filterProvider.register;
    appSvcs.factory = $provide.factory;
    appSvcs.service = $provide.service;
    appValues.value = $provide.value;
    appConstants.constant = $provide.constant;

    //--enable debug
    $logProvider.debugEnabled(true);

    //#endregion Register Controllers,Services,Factorys,Values,Constants,Directives & Filters

    $httpProvider.defaults.cache = false;
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    // disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['Access-Control-Allow-Methods'];
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    $httpProvider.interceptors.push([
        '$injector',
        function ($injector){
            return $injector.get('AuthInterceptor');
        }
    ]);
}]);

app.config(function($httpProvider) {
        $httpProvider.interceptors.push('HttpRequestTimeoutInterceptor');
    })
    .run(function ($rootScope, HttpPendingRequestsService) {
        //$rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
        //    if (newUrl != oldUrl) {
        //        HttpPendingRequestsService.cancelAll();
        //    }
        //})
         $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name != fromState.name) {
                HttpPendingRequestsService.cancelAll();
            }
        })
    });
app.config(function(localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('smartTrace')
        .setStorageType('localStorage');
});