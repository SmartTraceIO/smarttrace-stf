appCtrls.controller('ListUserCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', 'Api', function ($scope, rootSvc, $resource, localDbSvc, Api) {
    rootSvc.SetPageTitle('List User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.get("AuthToken");
    var userApi = $resource(Api.url + ':action/:token');
    var BindUserList = function () {
        userApi.get({ action: "getUsers", token: $scope.AuthToken, pageSize: $scope.PageSize, pageIndex: $scope.PageIndex, so: $scope.So, sc: $scope.Sc }, function (data) {
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
        userApi.get({ action: "deleteUser", token: $scope.AuthToken, userId: $scope.UserIdToDeleteUser }, function (data) {
            if (data.status.code == 0) {
                toastr.success("User deleted successfully")
                BindUserList();
            }
        });
    }

}]);

appCtrls.controller('AddUserCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', 'Api', '$state', '$filter', '$modal', '$rootScope', function ($scope, rootSvc, $resource, localDbSvc, Api, $state, $filter, $modal, $rootScope) {
    rootSvc.SetPageTitle('Add User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.get("AuthToken");
    $scope.InternalCompany = localDbSvc.get("InternalCompany");
    var userApi = $resource(Api.url + ':action/:token');
    $scope.Action = "Add";
    $scope.AddUser = true;
    var BindRoles = function () {
        userApi.get({ action: "getRoles", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }


    var BindLanguages = function () {
        userApi.get({ action: "getLanguages", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        userApi.get({ action: "getTimeZones ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        userApi.get({ action: "getDeviceGroups ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }

    $scope.Init = function () {
        BindRoles();
        BindLanguages();
        BindTimezones();
        BindDeviceGroups();
        $scope.User = {};
        $scope.User.user = {};
        $scope.User.user.temperatureUnits = "Celsius";
        $scope.User.user.measurementUnits = "Metric";
        $scope.User.user.language = "English";
        $scope.User.user.timeZone = "Antarctica/Casey";
        $scope.User.user.external = false;
        $scope.User.resetOnLogin = false;
        $scope.User.user.active = false;
        if ($scope.InternalCompany)
            $scope.User.user.externalCompany = $scope.InternalCompany;
    }

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.User.user.externalCompany = $scope.InternalCompany
            }
            else {
                $scope.User.user.externalCompany = $scope.externalCompany;
            }
        }
    })

    $scope.SaveData = function (isValid) {
        if (isValid) {
            var url = Api.url + 'saveUser/' + $scope.AuthToken
            $scope.User.user.deviceGroup = 'All Devices';
            $.ajax({
                type: "POST",
                datatype: "json",
                processData: false,
                contentType: "text/plain",
                data: JSON.stringify($scope.User),
                url: url,
                success: function (data, textStatus, XmlHttpRequest) {
                    toastr.success("User added successfully")
                    $state.go('manage.user')
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                }
            });
        }
    }
}]);

appCtrls.controller('EditUserCtrl', ['$scope', 'rootSvc', '$resource', 'localDbSvc', '$stateParams', 'Api', '$state', '$filter', '$rootScope', function ($scope, rootSvc, $resource, localDbSvc, $stateParams, Api, $state, $filter, $rootScope) {
    rootSvc.SetPageTitle('Edit User');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Users");
    $scope.AuthToken = localDbSvc.get("AuthToken");
    var userApi = $resource(Api.url + ':action/:token');
    $scope.Action = "Edit";
    $scope.AddUser = false;
    var BindRoles = function () {
        userApi.get({ action: "getRoles", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.RoleList = data.response;
            }
        });
    }


    var BindLanguages = function () {
        userApi.get({ action: "getLanguages", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.LanguageList = data.response;
            }
        });
    }


    var BindTimezones = function () {
        userApi.get({ action: "getTimeZones ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.TimezoneList = data.response;
            }
        });
    }

    var BindDeviceGroups = function () {
        userApi.get({ action: "getDeviceGroups ", token: $scope.AuthToken }, function (data) {
            if (data.status.code == 0) {
                $scope.DeviceGroupList = data.response;
            }
        });
    }

    BindRoles();
    BindLanguages();
    BindTimezones();
    BindDeviceGroups();
    $scope.Init = function () {

        $scope.UId = $stateParams.uId
        $scope.User = {};
        if ($scope.UId) {

            userApi.get({ action: "getUser", token: $scope.AuthToken, userId: $scope.UId }, function (data) {
                if (data.status.code == 0) {
                    $scope.User = {};
                    $scope.User.user = data.response;
                    $scope.externalCompany = data.response.externalCompany;
                    console.log($scope.User.user)
                }
            })


            //$scope.$watch("User.user.external", function (nVal, oVal) {
            //    if (nVal) {
            //        $scope.User.user.company = "";
            //    }
            //    else {
            //        $scope.User.user.company = $scope.User.user.internalCompany;
            //    }
            //})

        }
    }

    $scope.$watch("User.user.external", function (nVal, oVal) {
        if ($scope.User && $scope.User.user) {
            if (!nVal) {
                $scope.User.user.externalCompany = $scope.User.user.internalCompany
            }
            else {
                $scope.User.user.externalCompany = $scope.externalCompany;
            }
        }
    })

    $scope.SaveData = function (isValid) {
        if (isValid) {
            var url = Api.url + 'saveUser/' + $scope.AuthToken
            $.ajax({
                type: "POST",
                datatype: "json",
                processData: false,
                contentType: "text/plain",
                data: JSON.stringify($scope.User),
                url: url,
                success: function (data, textStatus, XmlHttpRequest) {
                    toastr.success("User updated successfully")
                    $state.go('manage.user')
                },
                error: function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                }
            });
        }
    }
}]);