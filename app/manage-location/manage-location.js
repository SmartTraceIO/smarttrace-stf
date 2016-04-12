﻿appCtrls.controller('ListLocCtrl', function ($scope, webSvc, rootSvc, localDbSvc, $window) {
    rootSvc.SetPageTitle('Manage Location');
    rootSvc.SetActiveMenu('Setup');
    rootSvc.SetPageHeader("Locations");
    $scope.AuthToken = localDbSvc.getToken();
    var BindLocationList = function () {
        webSvc.getLocations($scope.PageSize, $scope.PageIndex, $scope.Sc, $scope.So).success(function(data){
            if (data.status.code == 0) {
                console.log('LocationList', data.response);
                $scope.LocationList = data.response;
                $scope.LocationList.totalCount = data.totalCount;
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
        $scope.Sc = "locationName";
        BindLocationList();
    }
    $scope.PageChanged = function (page) {
        $scope.PageIndex = page;
        BindLocationList();
    }
    $scope.PageSizeChanged = function () {
        BindLocationList();
    }
    $scope.Sorting = function (expression) {
        $scope.So = $scope.So == "asc" ? "desc" : "asc";
        $scope.Sc = expression;
        BindLocationList();
    }

    $scope.confirm = function (locationId) {
        $scope.LocationIdToDeleteLocation = locationId;
        $("#confirmModel").modal("show");
    }

    $scope.DeleteLocation = function () {
        $("#confirmModel").modal("hide");
        webSvc.deleteLocation($scope.LocationIdToDeleteLocation).success(function(data){
            if (data.status.code == 0) {
                toastr.success("Location deleted successfully");
                BindLocationList();
            } else {
                console.log(data.status);
                toastr.error("Unable to delete this location", data.status.message);
            }
        });
    }
});

appCtrls.controller('AddLocCtrl', function ($scope, rootSvc, localDbSvc, webSvc, $state, $rootScope, $timeout, $window) {
    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Add Location');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Locations");
    }
    else {
        $scope.PageTitle = 'Add Location';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Locations";
    }
    $scope.Action = "Add";
    $scope.myLatLng = { lat: -33.865143, lng: 151.209900 };
    $scope.Location = {};
    $scope.Location.startFlag = true;
    $scope.Location.interimFlag = false;
    $scope.Location.endFlag = true;
    $scope.Print = function() {
        $window.print();
    }
    $scope.fromModalPopup = false;
    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true
    }
    $scope.geocode = function(isRev, param, fn) {
        var geocoder = new google.maps.Geocoder();
        var params = null;
        if (isRev){
            params = {'address': param};
        } else {
            params = {'location': param};
        }
        geocoder.geocode(params, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $scope.$apply(fn(results))
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }
    function fixInfoWindow() {
        //Here we redefine set() method.
        //If it is called for map option, we hide InfoWindow, if "noSupress" option isnt true.
        //As Google doesn't know about this option, its InfoWindows will not be opened.
        var set = google.maps.InfoWindow.prototype.set;
        google.maps.InfoWindow.prototype.set = function (key, val) {
            if (key === 'map') {
                if (!this.get('noSupress')) {
                    console.log(this);
                    //$scope.myLatLng.lat = this.position.lat();
                    //$scope.myLatLng.lng = this.position.lng();
                    //$scope.SetMap();
                    return;
                }
            }
            set.apply(this, arguments);
        }
    }

    fixInfoWindow();


    //this function is to ready map with ll functionality like center at given lat lang and draw circle of 3000m by default
    $scope.SetMap = function () {

        if (!$scope.radious)
            $scope.radious = 3000;

        $scope.mapOptions = {
            zoom: 13,
            center: $scope.myLatLng,
            draggable: true,
            disableDoubleClickZoom:true,
            draggableCursor: 'crosshair',
        }

        $scope.MakeMapResponsive();
        $scope.map = new google.maps.Map(document.getElementById('mapLocation'), $scope.mapOptions);
        $scope.map.setCenter($scope.myLatLng);
        $scope.marker = new google.maps.Marker({
            position: $scope.myLatLng,
            map: $scope.map,
            draggable:true,
            labelContent: '<i class="fa fa-home fa-lg" style="color:rgba(153,102,102,0.8);"></i>',
        });
        $scope.marker.setMap($scope.map);
        $scope.marker.addListener('dragend', function(e) {
            console.log(e.latLng.lat());
            console.log(e.latLng.lng());
            $scope.myLatLng.lat = e.latLng.lat();
            $scope.myLatLng.lng = e.latLng.lng();
            $scope.cityCircle.setCenter($scope.myLatLng);
            $scope.geocode(false, $scope.myLatLng, function(res) {
                $scope.Location.address = res[0].formatted_address;
            });
        })
        $scope.geocode(false, $scope.myLatLng, function(res) {
            $scope.Location.address = res[0].formatted_address;
        });
        $scope.ChangeRadious($scope.radious)
        google.maps.event.addListener($scope.map, "dblclick", function (e) {
            $scope.myLatLng.lat = e.latLng.lat();
            $scope.myLatLng.lng = e.latLng.lng();
            $scope.marker.setPosition($scope.myLatLng);
            $scope.cityCircle.setCenter($scope.myLatLng);
            $scope.geocode(false, $scope.myLatLng, function(res) {
                $scope.Location.address = res[0].formatted_address;
            });
        });
        google.maps.event.addDomListener(window, "resize", function () {
            $scope.MakeMapResponsive();
            google.maps.event.trigger($scope.map, "resize");
            $scope.map.setCenter($scope.myLatLng);
            $scope.marker.setMap($scope.map);
        });

        var legendDiv = document.createElement("div");
        legendDiv.setAttribute("style", "background-color:lightblue;padding:5px;font-weight:bold;margin-left:10px;width:130px;font-size:16px");
        legendDiv.innerHTML = "Drag and drop to point on the map to create a location at that point.";
        $scope.map.controls[google.maps.ControlPosition.LEFT_TOP].push(legendDiv);

        //$scope.SetAddress();
    }
    //this function is use to draw circle with given radious
    $scope.ChangeRadious = function (radious) {
        $scope.radious = radious;
        $scope.Location.radiusMeters = radious;
        if ($scope.cityCircle)
            $scope.cityCircle.setMap(null);

        $scope.cityCircle = new google.maps.Circle({
            strokeColor: '#62BDE3',
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: '#B3D8E5',
            fillOpacity: 0.6,
            map: $scope.map,
            center: $scope.myLatLng,
            radius: $scope.radious,
            cursor: "crosshair"
        });

        google.maps.event.addListener($scope.cityCircle, "click", function (e) {
            google.maps.event.trigger($scope.map, "click", e);
        })
    }
    //add height = width of parent / 2 to map so can it is responsive in all screens
    $scope.MakeMapResponsive = function () {
        var height = $('#mapLocation').parent().width();
        $('#mapLocation').height(height / 1.5);
    }
    //This method is callback of google javascript and this function is called from javascript on manage-location > add-edit.html
    $scope.InitMap = function () {
        $scope.SetMap();
    }

    if (!$rootScope.modalInstance)
        $scope.InitMap();
    else {
        $rootScope.modalInstance.opened.then(function () {
            $timeout(function () {
                $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                $scope.InitMap();
            }, 300);
        })
    }

    $scope.close = function () {
        $rootScope.modalInstance.dismiss('cancel');
    }

    $scope.SaveData = function (isValid, closeModalPopup) {
        if (isValid) {
            var isOk = false;
            if (!$scope.Location.startFlag && !$scope.Location.interimFlag && !$scope.Location.endFlag) {
                if (confirm("this location will not appear in the list of Start, Interim or End Locations. Are you sure you want to Save?")) {
                    isOk = true;
                }
            }
            else {
                isOk = true;
            }

            if (isOk) {
                $scope.Location.location = {};
                $scope.Location.location.lat = $scope.myLatLng.lat;
                $scope.Location.location.lon = $scope.myLatLng.lng;

                $scope.Location.startFlag = $scope.Location.startFlag == true ? "Y" : "N";
                $scope.Location.interimFlag = $scope.Location.interimFlag == true ? "Y" : "N";
                $scope.Location.endFlag = $scope.Location.endFlag == true ? "Y" : "N";

                webSvc.saveLocation($scope.Location).success( function (data, textStatus, XmlHttpRequest) {
                    toastr.success("Location added successfully")
                    if (closeModalPopup) {
                        $rootScope.modalInstance.close('cancel');
                    }
                    else {
                        $state.go('manage.loc')
                    }
                }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                        alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                });
                //call 
            }
        }
    }
});

appCtrls.controller('EditLocCtrl', function ($resource, $scope, rootSvc, localDbSvc, $stateParams, webSvc, $state, $window, $rootScope, $timeout) {
    if (!$rootScope.modalInstance) {
        rootSvc.SetPageTitle('Edit Location');
        rootSvc.SetActiveMenu('Setup');
        rootSvc.SetPageHeader("Locations");
    }
    else {
        $scope.PageTitle = 'Edit Location';
        $scope.ActiveMenu = 'Setup';
        $scope.PageHeader = "Locations";
    }
    $scope.Action = "Edit";
    $scope.AuthToken = localDbSvc.getToken();
    $scope.fromModalPopup = false;
    if ($rootScope.modalInstance) {
        $scope.fromModalPopup = true;
    }
    $scope.Print = function() {
        $window.print();
    }
    $scope.locationId = $stateParams.lId
    if ($scope.locationId || $rootScope.locationIdForModalPopup) {
        var locId;
        if ($scope.locationId) {
            locId = $scope.locationId;
        }
        else {
            locId = $rootScope.locationIdForModalPopup;
        }

        webSvc.getLocation(locId).success(function(data){
            if (data.status.code == 0) {
                $scope.Location = data.response;
                console.log(data.response);
                $scope.myLatLng = {};
                $scope.myLatLng.lat = data.response.location.lat;
                $scope.myLatLng.lng = data.response.location.lon;
                $scope.radious = data.response.radiusMeters;
                console.log($scope.radious);
                $scope.Location.startFlag = $scope.Location.startFlag == "Y" ? true : false;
                $scope.Location.interimFlag = $scope.Location.interimFlag == "Y" ? true : false;
                $scope.Location.endFlag = $scope.Location.endFlag == "Y" ? true : false;

                if (!$rootScope.modalInstance)
                    $scope.InitMap();
                else {
                    $rootScope.modalInstance.opened.then(function () {
                        $timeout(function () {
                            $("div.modal-dialog").addClass("modal-lg").attr("style", "width:90%");
                            $scope.InitMap();
                        }, 300);
                    })
                }
                $scope.ChangeRadious($scope.radious);
            }
        })
    }

    $scope.geocode = function(isRev, param, fn) {
        var geocoder = new google.maps.Geocoder();
        var params = null;
        if (isRev){
            params = {'address': param};
        } else {
            params = {'location': param};
        }
        geocoder.geocode(params, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $scope.$apply(fn(results))
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    //this function is to ready map with ll functionality like center at given lat lang and draw circle of 3000m by default
    $scope.SetMap = function () {
        if (!$scope.radious)
            $scope.radious = 3000;
        $scope.mapOptions = {
            zoom: 13,
            center: $scope.myLatLng,
            draggable: true,
            disableDoubleClickZoom:true,
            draggableCursor: 'crosshair',
        }
        $scope.MakeMapResponsive();
        $scope.map = new google.maps.Map(document.getElementById('mapLocation'), $scope.mapOptions);
        $scope.map.setCenter($scope.myLatLng);
        $scope.marker = new google.maps.Marker({
            position: $scope.myLatLng,
            map: $scope.map,
            draggable:true,
            labelContent: '<i class="fa fa-home fa-lg" style="color:rgba(153,102,102,0.8);"></i>',
        });
        $scope.marker.setMap($scope.map);

        $scope.marker.addListener('dragend', function(e) {
            console.log(e.latLng.lat());
            console.log(e.latLng.lng());
            $scope.myLatLng.lat = e.latLng.lat();
            $scope.myLatLng.lng = e.latLng.lng();
            $scope.cityCircle.setCenter($scope.myLatLng);
            $scope.geocode(false, $scope.myLatLng, function(res) {
                $scope.Location.address = res[0].formatted_address;
            });
        })
        $scope.geocode(false, $scope.myLatLng, function(res) {
            $scope.Location.address = res[0].formatted_address;
        });
        $scope.ChangeRadious($scope.radious)
        google.maps.event.addListener($scope.map, "dblclick", function (e) {
            $scope.myLatLng.lat = e.latLng.lat();
            $scope.myLatLng.lng = e.latLng.lng();
            $scope.marker.setPosition($scope.myLatLng);
            $scope.cityCircle.setCenter($scope.myLatLng);
            $scope.geocode(false, $scope.myLatLng, function(res) {
                $scope.Location.address = res[0].formatted_address;
            });
        });

        google.maps.event.addDomListener(window, "resize", function () {
            $scope.MakeMapResponsive();
            google.maps.event.trigger($scope.map, "resize");
            $scope.map.setCenter($scope.myLatLng);
            $scope.marker.setMap($scope.map);
        });

        var legendDiv = document.createElement("div");
        legendDiv.setAttribute("style", "background-color:lightblue;padding:5px;font-weight:bold;margin-left:10px;width:130px;font-size:16px");
        legendDiv.innerHTML = "Drag and drop to point on the map to create a location at that point.";
        $scope.map.controls[google.maps.ControlPosition.LEFT_TOP].push(legendDiv);

        //$scope.SetAddress();
    }
    //this function is use to draw circle with given radious
    $scope.ChangeRadious = function (radious) {
        $scope.radious = radious;
        $scope.Location.radiusMeters = radious;
        if ($scope.cityCircle)
            $scope.cityCircle.setMap(null);

        $scope.cityCircle = new google.maps.Circle({
            strokeColor: '#62BDE3',
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: '#B3D8E5',
            fillOpacity: 0.6,
            map: $scope.map,
            center: $scope.myLatLng,
            radius: $scope.radious,
            cursor: "crosshair"
        });

        google.maps.event.addListener($scope.cityCircle, "click", function (e) {
            google.maps.event.trigger($scope.map, "click", e);
        })
    }
    //add height = width of parent / 2 to map so can it is responsive in all screens
    $scope.MakeMapResponsive = function () {
        var height = $('#mapLocation').parent().width();
        $('#mapLocation').height(height / 1.5);
    }
    //This method is callback of google javascript and this function is called from javascript on manage-location > add-edit.html
    $scope.InitMap = function () {
        $scope.SetMap();
        google.maps.event.addListener($scope.map, "click", function (e) {
            $scope.myLatLng.lat = e.latLng.lat();
            $scope.myLatLng.lng = e.latLng.lng();
            $scope.SetMap();
        });
    }

    $scope.close = function () {
        $rootScope.modalInstance.dismiss('cancel');
    }

    $scope.SaveData = function (isValid, closeModalPopup) {
        if (isValid) {
            var isOk = false;
            if (!$scope.Location.startFlag && !$scope.Location.interimFlag && !$scope.Location.endFlag) {
                if (confirm("this location will not appear in the list of Start, Interim or End Locations. Are you sure you want to Save?")) {
                    isOk = true;
                }
            }
            else {
                isOk = true;
            }

            if (isOk) {
                $scope.Location.location = {};
                $scope.Location.location.lat = $scope.myLatLng.lat;
                $scope.Location.location.lon = $scope.myLatLng.lng;

                $scope.Location.startFlag = $scope.Location.startFlag == true ? "Y" : "N";
                $scope.Location.interimFlag = $scope.Location.interimFlag == true ? "Y" : "N";
                $scope.Location.endFlag = $scope.Location.endFlag == true ? "Y" : "N";

                webSvc.saveLocation($scope.Location).success( function (data, textStatus, XmlHttpRequest) {
                    toastr.success("Location updated successfully")
                    if (closeModalPopup) {
                        $rootScope.modalInstance.close('cancel');
                    }
                    else {
                        $state.go('manage.loc')
                    }
                }).error( function (xmlHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
                });
            }
        }
    }
});