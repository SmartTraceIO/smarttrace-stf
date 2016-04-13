appCtrls.controller('ListUserCtrl', function ($rootScope, $window, $scope, rootSvc, webSvc, $window) {
    rootSvc.SetPageTitle('List User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");

    var BindUserList = function () {
        webSvc.getUsers($scope.pageSize, $scope.pageIndex, $scope.Sc, $scope.So).success(function(data){
            if (data.status.code == 0) {
                $scope.UserList = data.response;
                angular.forEach(data.response, function (val, key) {
                    angular.forEach(val.roles, function (subVal, k) {
                        if (k != 0)
                            val.roles = val.roles + ", " + subVal;
                        else
                            val.roles = subVal;
                    })
                })
                $scope.UserList.totalCount = data.totalCount;
            }
        });
    }
    $scope.Print = function() {
        $window.print();
    }
    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "userName";
        BindUserList();
    }
    $scope.PageSizeChanged = function () {
        BindUserList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindUserList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindUserList();
    }

    $scope.confirm = function (userId) {
        $scope.UserIdToDeleteUser = userId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteUser = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteUser($scope.UserIdToDeleteUser).success(function(data){
            if (data.status.code == 0) {
                toastr.success("User deleted successfully")
                BindUserList();
            } else {
                toastr.success(data.status.message);
            }
        });
    }

});

appCtrls.controller('AddUserCtrl', function ($rootScope, $timeout, $scope, rootSvc, webSvc, localDbSvc, $state, $filter, $modal, $window, $q) {
    rootSvc.SetPageTitle('Add User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.company = localDbSvc.get("InternalCompany");
    $scope.Action = "Add";
    $scope.AddUser = true;

    $scope.Print = function() {
        $window.print();
    }
    //--
    function reloadIfNeed() {
        if ($rootScope.User) {
            return $rootScope.User;
        } else {
            $rootScope.User = localDbSvc.getUserProfile();
        }
        if ($rootScope.RunningTime == null) {
            $rootScope.RunningTime = localDbSvc.getUserTimezone();
            $rootScope.RunningTimeZoneId = localDbSvc.getUserTimezone() // get the current timezone
            $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
            $scope.tickInterval = 1000 //ms
            var tick = function () {
                $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                $timeout(tick, $scope.tickInterval); // reset the timer
            }
            $timeout(tick, $scope.tickInterval);
        }
    }
    reloadIfNeed();
    //--
    var BindRoles = function () {
        return webSvc.getRoles().success(function(data){
            //console.log('ROLELIST', data);
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }

    var BindLanguages = function () {
        return webSvc.getLanguages().success(function(data){
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        return webSvc.getTimeZones().success(function(data){
            if (data.status.code == 0) {
                //console.log('TIMEZONELIST', data.response);
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        return webSvc.getDeviceGroups().success(function(data){
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }
    $q.all([BindRoles(), BindLanguages(), BindTimezones(), BindDeviceGroups()]).then(function() {
        $scope.User = {};
        $scope.User.user = {};
        $scope.User.user.temperatureUnits = "Celsius";
        $scope.User.user.measurementUnits = "Metric";
        $scope.User.user.language = "English";
        $scope.User.user.timeZone = "Australia/Sydney";
        $scope.User.user.external = false;
        $scope.User.resetOnLogin = false;
        $scope.User.user.active = true;
        $scope.User.user.internalCompany = $scope.company;
    });

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.company = $scope.User.user.internalCompany
            }
            else {
                $scope.company = $scope.User.user.externalCompany;
            }
        }
    });

    $scope.SaveData = function (isValid) {
        if (isValid) {
            if ($scope.User.user.external) {
                $scope.User.user.externalCompany = $scope.company;
            } else {
                $scope.User.user.externalCompany = "";
            }
            webSvc.saveUser($scope.User).success( function (data, textStatus, XmlHttpRequest) {
                console.log('USER-TO-CREATE', $scope.User);
                if (data.status.code == 0) {
                    toastr.success("User added successfully");
                } else {
                    var errStr = data.status.message;
                    if (errStr.indexOf('Duplicate') >= 0) {
                        errStr = errStr.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
                        toastr.error("The email address "+errStr+" is already in use in the system.");
                    }
                }
                $state.go('manage.user');
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});

//-- edit user
appCtrls.controller('EditUserCtrl', function ($rootScope, $scope, rootSvc, webSvc, localDbSvc, $stateParams, $state,$timeout, $filter, $window, $q) {
    rootSvc.SetPageTitle('Edit User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.getToken();
    $scope.Action = "Edit";
    $scope.AddUser = false;
//--
    function reloadIfNeed() {
        if ($rootScope.User) {
            return $rootScope.User;
        } else {
            $rootScope.User = localDbSvc.getUserProfile();
        }
        if ($rootScope.RunningTime == null) {
            $rootScope.RunningTime = localDbSvc.getUserTimezone();
            $rootScope.RunningTimeZoneId = localDbSvc.getUserTimezone() // get the current timezone
            $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
            $scope.tickInterval = 1000 //ms
            var tick = function () {
                $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                $timeout(tick, $scope.tickInterval); // reset the timer
            }
            $timeout(tick, $scope.tickInterval);
        }
    }
    reloadIfNeed();
    //--
    $scope.Print = function() {
        $window.print();
    }


    var BindRoles = function () {
        return webSvc.getRoles().success(function(data){
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }

    var BindLanguages = function () {
        return webSvc.getLanguages().success(function(data){
        // .get({ action: "getLanguages", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        return webSvc.getTimeZones().success(function(data){
        // .get({ action: "getTimeZones ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        return webSvc.getDeviceGroups().success(function(data){
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }

    $q.all([BindRoles(), BindLanguages(), BindTimezones(),BindDeviceGroups()]).then(function() {
        $scope.UId = $stateParams.uId;
        $scope.User = {};
        if ($scope.UId) {
            var param = {
                userId: $scope.UId
            };
            webSvc.getUser(param).success(function(data){
                console.log('USER', data);
                if (data.status.code == 0) {
                    $scope.User = {};
                    $scope.User.user = data.response;
                    if ($scope.User.user.external) {
                        $scope.company = data.response.externalCompany
                    } else {
                        $scope.company = data.response.internalCompany;
                    }
                }
            });
        }
    });

    /*$scope.Init = function() {
        $scope.UId = $stateParams.uId;
        $scope.User = {};
        if ($scope.UId) {
            var param = {
                userId: $scope.UId
            };
            webSvc.getUser(param).success(function(data){
                if (data.status.code == 0) {
                    $scope.User = {};
                    $scope.User.user = data.response;
                    $scope.externalCompany = data.response.externalCompany;
                }
            });
        }
        BindRoles();
        BindLanguages();
        BindTimezones();
        BindDeviceGroups();
    }*/

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.company = $scope.User.user.internalCompany
            }
            else {
                $scope.company = $scope.User.user.externalCompany;
            }
        }
    });


    $scope.SaveData = function (isValid) {
        if (isValid) {
            if ($scope.User.user.external) {
                $scope.User.user.externalCompany = $scope.company;
            } else {
                $scope.User.user.externalCompany = "";
            }
            webSvc.saveUser($scope.User).success( function (data, textStatus, XmlHttpRequest) {
                console.log('EditUser', data);
                if (data.status.code == 0) {
                    toastr.success("User updated successfully")
                } else {
                    toastr.error(data.status.message);
                }
                $state.go('manage.user')
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});

