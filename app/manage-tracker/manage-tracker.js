﻿appCtrls.controller('ListTrackerCtrl',
    function ($scope, $filter, rootSvc, localDbSvc, webSvc) {
        rootSvc.SetPageTitle('List Trackers');
        rootSvc.SetActiveMenu('Tracker');
        rootSvc.SetPageHeader("Trackers");

        $scope.AuthToken = localDbSvc.getToken();

        var BindTrackerList = function () {
            webSvc.getDevices($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
                console.log("TRACKER", data);
                if (data.status.code == 0) {
                    $scope.TrackerList = data.response;
                    $scope.TrackerList.totalCount = data.totalCount;
                    console.log(data);
                }
            });
        }

        $scope.Init = function () {
            $scope.PageSize = '20';
            $scope.PageIndex = 1;
            $scope.So = "asc";
            $scope.Sc = "name";
            BindTrackerList();
        }

        $scope.PageSizeChanged = function () {
            BindTrackerList();
        }

        $scope.PageChanged = function (page) {
            $scope.PageIndex = page;
            BindTrackerList();
        }

        /*$scope.Sorting = function (expression) {
            $scope.So = $scope.So == "asc" ? "desc" : "asc";
            $scope.Sc = expression;
            console.log($scope.So);
            console.log($scope.Sc);
            BindTrackerList();
        }*/

        var orderBy = $filter('orderBy');
        $scope.Sorting = function(predicate) {
            $scope.predicate = predicate;
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.TrackerList = orderBy($scope.TrackerList, predicate, $scope.reverse);
        };
});
/**
 * Created by beou on 09/03/2016.
 */
appFilters.filter('volt', function() {
    return function (input) {
        return Number(input/1000).toFixed(1) + 'V';
    }
});
appFilters.filter('friendlyDate', function() {
    return function (input) {
        if (input == null) {
            input = "0";
        }
        cdate = new Date(input);
        return cdate.getTime();
    }
});
