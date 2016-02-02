appCtrls.controller('ViewShipmentCtrl', ['$scope', 'rootSvc', '$resource', 'Api', 'localDbSvc', '$filter', function ($scope, rootSvc, $resource, Api, localDbSvc, $filter) {
    rootSvc.SetPageTitle('View Shipments');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipments");
    $scope.AuthToken = localDbSvc.get("AuthToken");
    var resourceApi = $resource(Api.url + ':action/:token');
    $scope.specificDates = false;
    $scope.ViewShipment = {
        alertsOnly: false,
        last2Days: true,
        lastDay: false,
        lastWeek: false,
        lastMonth: false,
        deviceImei: null,
        shipmentDateFrom: null,
        shipmentDateTo: null,
        shippedFrom: [],
        shippedTo: [],
        status: null,
        shipmentDescription:null,
        pageIndex: 1,
        pageSize: "20",
        so: 'shipmentDate',
        sc: 'asc'
    };

    $scope.SearchBasic = function () {
        $scope.ViewShipment.shipmentDescription = null;
        $scope.ViewShipment.deviceImei = null;
        $scope.ViewShipment.shippedFrom = [];
        $scope.ViewShipment.shippedTo = [];
        $scope.ViewShipment.status = null;
        $scope.BindCards();
    }

    $scope.SearchAdvance = function () {
        $scope.BindCards();
    }

    $scope.AdvanceSearch = false;
    $scope.LocationOptions = { multiple: true };

    var url = Api.url + 'getShipments/' + $scope.AuthToken
    
    var BindShipmentList = function () {
        $scope.loading = true;
        //if ($scope.ViewShipment.shipmentDateFrom) {
        //    var shippedDateFrom = new Date($scope.ViewShipment.shipmentDateFrom).toDateString();
        //    $scope.ViewShipment.shipmentDateFrom = shippedDateFrom;
        //}

        //if ($scope.ViewShipment.shipmentDateTo) {
        //    var shippedDateFrom = new Date($scope.ViewShipment.shipmentDateTo).toDateString();
        //    $scope.ViewShipment.shipmentDateTo = shippedDateFrom;
        //}
        $.ajax({
            type: "POST",
            datatype: "json",
            processData: false,
            contentType: "text/plain",
            data: JSON.stringify($scope.ViewShipment),
            url: url,
            success: function (data, textStatus, XmlHttpRequest) {
                if (data.status.code == 0) {
                    // debugger;
                    $scope.ShipmentList = data.response;
                    $scope.ShipmentList.totalCount = data.totalCount;
                };

                $scope.loading = false;

                $scope.$apply();
            },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                $scope.loading = false;
            }
        });
    }

    $scope.ResetSearchCriteria = function () {
        $scope.ViewShipment = {
            alertsOnly: false,
            last2Days: true,
            lastDay: false,
            lastWeek: false,
            lastMonth: false,
            deviceImei: null,
            shipmentDateFrom: null,
            shipmentDateTo: null,
            shippedFrom: [],
            shippedTo: [],
            status: null,
            pageIndex: 1,
            PageSize: "20",
            so: 'shipmentDate',
            sc: 'asc'
        };

        BindShipmentList();
    }

    $scope.BindCards = function () {
        BindShipmentList();
    }

    BindShipmentList();
    resourceApi.get({ action: "getLocations", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'locationName', sc: 'asc' }, function (data) {
        if (data.status.code == 0) {
            $scope.LocationList = data.response;
            console.log(data.response);
            angular.forEach($scope.LocationList, function (val, key) {
                if (val.companyName) {
                    var dots = val.companyName.length > 20 ? '...' : '';
                    var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                    $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                }
                else {
                    $scope.LocationList[key].DisplayText = val.locationName;
                }
            })
        }
    });
    resourceApi.get({ action: "getDevices", token: $scope.AuthToken, pageSize: 1000000, pageIndex: 1, so: 'locationName', sc: 'asc' }, function (data) {
        if (data.status.code == 0) {
            $scope.TrackerList = data.response;
            console.log(data.response);
        }
    });

    $scope.PageSizeChanged = function () {
        BindShipmentList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindShipmentList();
    }

    $scope.$watch('ViewShipment.lastDay', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.last2Days', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.lastWeek', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = nVal;
            $scope.ViewShipment.lastMonth = !nVal;
        }
    })
    $scope.$watch('ViewShipment.lastMonth', function (nVal, oVal) {
        if ($scope.ViewShipment && nVal) {
            $scope.ViewShipment.lastDay = !nVal;
            $scope.ViewShipment.last2Days = !nVal;
            $scope.ViewShipment.lastWeek = !nVal;
            $scope.ViewShipment.lastMonth = nVal;
        }
    })
}]);