appCtrls.controller('ListCorrectiveActionListsCtrl', function ($rootScope, $scope, $state, rootSvc, localDbSvc, webSvc, $window,
                                               $timeout, $log, $uibModal, $interval, $controller, $location) {
    rootSvc.SetPageTitle('List Correcitve Actions');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Corrective Action lists");

    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }

    $scope.Print = function() {
        $window.print();
    }
    var BindCorrectiveActionLists = function () {
        webSvc.getCorrectiveActionLists($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
            if (data.status.code == 0) {
                $scope.CorrectiveActionLists = data.response;
                //$log.debug('CorrectiveActionLists', data.response);
                $scope.CorrectiveActionLists.totalCount = data.totalCount;
                angular.forEach($scope.CorrectiveActionLists, function (val, key) {
                    var allActions = "";
                    angular.forEach(val.actions, function (subVal, subKey) {
                        if (subKey == 0) {
                            allActions = subVal.action;
                        }
                        else {
                            allActions = allActions + ", " + subVal.action;
                        }
                    })
                    val["allActions"] = allActions;
                })
            }
        });
    }

    $scope.Init = function () {
        $scope.PageSize = '20';
        $scope.PageIndex = 1;
        $scope.So = "asc";
        $scope.Sc = "listName";
        BindCorrectiveActionLists();
    }

    $scope.PageSizeChanged = function () {
        BindCorrectiveActionLists();
    }

    $scope.PageChanged = function () {
        BindCorrectiveActionLists();
    }

    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindCorrectiveActionLists();
    }

    $scope.confirmDelete = function (listId) {
        $scope.ListIdToDeleteCorrectiveActions = listId;
        $log.debug('listId', listId);
        $("#confirmModel").modal("show");
    }

    $scope.DeleteCorrectiveActions = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteCorrectiveActionList($scope.ListIdToDeleteCorrectiveActions).success(function (data) {
            if (data.status.code == 0) {
                toastr.success("Correctve actions list deleted successfully");
                BindCorrectiveActionLists();
            } else {
                toastr.warning('Warning. Cannot delete this corrective actions list.');
            }
        });
    }
});

appCtrls.controller('EditCorrectiveActionListCtrl', function ($rootScope, $scope, rootSvc, localDbSvc, $stateParams, webSvc, $state,
                                               $timeout, $interval, $window, $log, $controller, $location) {
    {
        this.rootScope  = $rootScope;
        this.state      = $state;
        this.log        = $log;
        this.webSvc     = webSvc;
        this.localDbSvc = localDbSvc;
        this.timeout    = $timeout;
        this.interval   = $interval;
        this.location = $location;
        $controller('BaseCtrl', {VM:this});
    }

    $scope.ListId = null;
    if ($stateParams.aId) {
        $scope.ListId = $stateParams.aId;
    }

    $scope.labels = {};
    $scope.cfgName;
    if ($scope.ListId) {
    	$scope.PageTitle = 'Edit Corrective Action List';
        $scope.Action = "Edit";
        $scope.routeCfgName = 'manage.addcorrectiveactions';
    } else {
    	$scope.PageTitle = 'Add Corrective Action List';
        $scope.Action = "Add";
        $scope.routeCfgName = 'manage.editcorrectiveactions';
    }
    
    $scope.ActiveMenu = 'Setup';
    $scope.PageHeader = "Corrective Action Lists";
    
    $scope.AuthToken = localDbSvc.getToken();

    $scope.WarnUserAndRedirectToListPage = function () {
        $("#confirmModel").modal("hide");
        setTimeout(function () { 
            $state.go($scope.routeCfgName);
        }, 200)
    }

    $scope.close = function () {
        if (confirm("Any unsaved changes will be lost including delete, are you sure you want to cancel?")) {
            $rootScope.modalInstance.dismiss('cancel');
        }
    }
    $scope.Print = function() {
        $window.print();
    }

    $scope.Init = function () {
    	$scope.CorrectiveActionsList = null;
        if ($scope.ListId) {
            webSvc.getCorrectiveActionList($scope.ListId).success(function (data) {
                if (data.status.code == 0) {
                    //$log.debug('Alert', data.response);
                    $scope.CorrectiveActionsList = data.response;
                }
            });
        } else {
            $scope.CorrectiveActionsList = {
    			listId: null,
    		    listName: null,
    		    description: null,
    		    actions: []		
        	};
        }
    }

    $scope.AddAction = function () {
    	$scope.CorrectiveActionsList.actions.push({
             action: null,
             requestVerification: true
         });
    }

    $scope.DeleteAction = function (action) {
    	var actions = $scope.CorrectiveActionsList.actions;

    	var index = actions.indexOf(action);
        if (index > -1) {
            actions.splice(index, 1);
        }
    }
    $scope.MoveUp = function (action) {
    	var actions = $scope.CorrectiveActionsList.actions;
    	var index = actions.indexOf(action);
        if (index > 0) {
        	var newIndex = index - 1;
        	var old = actions[newIndex];
        	actions[newIndex] = action;
        	actions[index] = old;
        }
    }
    $scope.MoveDown = function (action) {
    	var actions = $scope.CorrectiveActionsList.actions;
    	var index = actions.indexOf(action);
        if (index > -1 && index < actions.length - 1) {
        	var newIndex = index + 1;
        	var old = actions[newIndex];
        	actions[newIndex] = action;
        	actions[index] = old;
        }
    }

    $scope.SaveData = function (isValid) {
        $log.debug('IsValid', isValid);
        if (isValid) {
            webSvc.saveCorrectiveActionList($scope.CorrectiveActionsList).success(function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    toastr.success("Corrective action list saved successfully")
                } else {
                    toastr.warning('Warning. An error has occured while updating current alert');
                }
                
                $state.go('manage.correctiveactions');
            }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            });
        }
    }
});
