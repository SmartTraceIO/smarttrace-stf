appCtrls.controller('ViewShipmentCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $filter, temperatureFilter, Color, $q,
                                                  $rootScope, $state, $window, $log, $timeout, $interval, $controller,
                                                  localStorageService, $location) {
    rootSvc.SetPageTitle('View Shipments');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipments");

    var VM = this;
    var filter = $filter('filter');
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
    var token = localDbSvc.getToken();
    if (token == '_' || token == null) {
        $rootScope.go('login');
        return;
    }

    VM.expectPath = null;
    VM.destMarker = null;
    VM.objectToRemove = [];
    VM.oldMarker = null;
    VM.currentMarker = null;
    VM.dynMarkers = [];
    VM.labelMarkers = [];

    VM.specificDates = false;
    VM.ViewShipment = {
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
        goods: null,
        sc: 'lastReadingTimeISO',
        so: 'desc'
    };
    VM.sc = 'lastReadingTimeISO';

    //VM.vm = this;

    VM.SearchBasic = function () {
        VM.ViewShipment.shipmentDescription = null;
        VM.ViewShipment.deviceImei = null;
        VM.ViewShipment.shippedFrom = [];
        VM.ViewShipment.shippedTo = [];
        VM.ViewShipment.status = null;
        VM.ViewShipment.goods=null;
        VM.BindCards();
    }

    VM.SearchAdvance = function () {
        if(VM.ViewShipment.status == "")
            VM.ViewShipment.status = null;
        if (VM.tracker) {
            VM.ViewShipment.deviceImei = VM.tracker.imei;
        }
        VM.BindCards();
    }

    VM.Print = function(){
        $window.print();
    }

    VM.AdvanceSearch = localStorageService.get('advancedSearch');
    VM.ViewShipment.excludePriorShipments = localStorageService.get("excludesivePrior");
    VM.LocationOptions = { multiple: true };
    VM.anyDevice = {sn: '--Please Select--'}
    VM.TrackerListPlus = [VM.anyDevice];
    
    var BindShipmentList = function () {
        $log.debug('ViewShipment', VM.ViewShipment);

        localStorageService.set("excludesivePrior", VM.ViewShipment.excludePriorShipments);
        VM.loading = true;

        if (VM.ViewShipment.shippedFromLocation) {
            VM.ViewShipment.shippedFrom = VM.ViewShipment.shippedFromLocation.map(function(val) {
                return val.locationId;
            });
        }
        if (VM.ViewShipment.shippedToLocation) {
            VM.ViewShipment.shippedTo = VM.ViewShipment.shippedToLocation.map(function(val) {
                return val.locationId;
            });
        }

        if (VM.tracker) {
            VM.ViewShipment.deviceImei = VM.tracker.imei;
        }
        //console.log('VM.tracker', VM.tracker);
        var devicesPromise = webSvc.getDevices(1000000, 1, 'locationName', 'asc').success( function (data) {
            if (data.status.code == 0) {
                VM.TrackerList = data.response;
                angular.forEach(VM.TrackerList, function(tracker, key) {
                    if (!isNaN(tracker.sn)) {
                        VM.TrackerList[key].sn=parseInt(tracker.sn, 10);
                    }
                });
                VM.TrackerListPlus = [VM.anyDevice];
                VM.TrackerListPlus = VM.TrackerListPlus.concat(VM.TrackerList);
                $log.debug('view-shipment', VM.TrackerListPlus);
            }
        });

        var shipmentsPromise = webSvc.getShipments(VM.ViewShipment).success( function (data, textStatus, XmlHttpRequest) {
            //console.log('VM.ViewShipment', VM.ViewShipment);
            if (data.status.code == 0) {
                VM.ShipmentList = data.response;
                $log.debug('ShipmentList', VM.ShipmentList);
                VM.ShipmentList.totalCount = data.totalCount;
            } else if(data.status.code == 1){
                $rootScope.redirectUrl = "/view-shipment";
                $rootScope.go("login");
            };
            VM.loading = false;

        });
        VM.ProcessedList = [];
        $q.all([devicesPromise, shipmentsPromise]).then(function() {
            angular.forEach(VM.ShipmentList, function(v, k) {
                if (!isNaN(v.deviceSN)) {
                    VM.ShipmentList[k].deviceSN = parseInt(v.deviceSN, 10);
                }

                //-- bind color to shipment here by get color of device.
                var d = filter(VM.TrackerList, {sn: VM.ShipmentList[k].deviceSN}, true);
                VM.ShipmentList[k].color = Color[0].name;
                if (d && (d.length > 0)) {
                    //found a device
                    VM.ShipmentList[k].color = d[0].color;
                }
                //if (!VM.ShipmentList[k].color){
                //    VM.ShipmentList[k].color = Color[0].name;
                //}
                //-- position
                VM.ShipmentList[k].position = [v.lastReadingLat, v.lastReadingLong];
                VM.ShipmentList[k].icon = {
                    url:"theme/img/transparent16.png",
                    scaledSize:[16, 16],
                    anchor:[8, 8]
                }
                //-- update interimL;
                var interimL = [];
                for (ik in v) {
                    if (/interimStop[0-9]{1,2}$/.test(ik)) {
                        var time = ik + 'Time';
                        var itl = {
                            name: v[ik],
                            time: v[time]
                        }
                        interimL.push(itl);
                    }
                }
                v.interimStops = interimL;
                var oldLat = 0;
                var oldLon = 0;
                if (v.keyLocations == null) {
                    v.keyLocations = [];
                }
                for (var i = 0; i < v.keyLocations.length; i++) {
                    //--
                    if (!v.keyLocations[i].lat) {
                        v.keyLocations[i].lat = oldLat;
                    } else {
                        oldLat = v.keyLocations[i].lat;
                    }
                    //--
                    if (!v.keyLocations[i].lon) {
                        v.keyLocations[i].lon = oldLon;
                    } else {
                        oldLon = v.keyLocations[i].lon;
                    }
                }
                for (var i = v.keyLocations.length -1; i>= 0; i--) {
                    if (!v.keyLocations[i].lat) {
                        v.keyLocations[i].lat = oldLat;
                    } else {
                        oldLat = v.keyLocations[i].lat;
                    }
                    //--
                    if (!v.keyLocations[i].lon) {
                        v.keyLocations[i].lon = oldLon;
                    } else {
                        oldLon = v.keyLocations[i].lon;
                    }
                }
                //-- trim shippedFrom
                var indexShippedFrom = 0;
                var indexFirstReading = 0;
                for(var i = 0; i < v.keyLocations.length; i++) {


                    if (v.keyLocations[i].key == "shippedFrom") {
                        indexShippedFrom = i;
                    }
                    if (v.keyLocations[i].key == "firstReading") {
                        indexFirstReading = i;
                    }
                }
                if (indexShippedFrom > 0) {
                    v.keyLocations.splice(0, indexShippedFrom);
                } else {
                    v.keyLocations.splice(0, indexFirstReading);
                }
                //-- trim shippedTo
                var indexShippedTo = 0;
                var indexLastReading = 0;
                for(var i = 0; i < v.keyLocations.length; i++) {
                    if (v.keyLocations[i].key == 'shippedTo') {
                        indexShippedTo = i;
                    }
                    if (v.keyLocations[i].key == 'lastReading') {
                        indexLastReading = i;
                        //-- update last reading
                        if (!v.lastReadingLat) {
                            v.lastReadingLat = v.keyLocations[i].lat;
                            v.lastReadingLong = v.keyLocations[i].lon;
                        }
                    }
                }
                if (v.status == 'Arrived') {
                    if (indexShippedTo > 0) {
                        v.keyLocations.splice(indexShippedTo+1);
                    } else {
                        v.keyLocations.splice(indexLastReading+1);
                    }
                } else if (v.status == 'Ended') {
                    if (indexShippedTo > 0) {
                        v.keyLocations.splice(indexShippedTo, 1);
                    }
                }

                //--
                if (oldLat != 0 && oldLon != 0) {
                    VM.ProcessedList.push(v);
                }
            });
        }).then(function() {
            //remove all invalid shipment
            //VM.ShipmentList = VM.ProcessedList;
            if (VM.map) {
                VM.updateMap();
            }
        });
    };
    VM.Sorting = function (expression) {
        VM.ViewShipment.so = VM.ViewShipment.so == "asc" ? "desc" : "asc";
        VM.ViewShipment.sc = expression;
        BindShipmentList();
    }
    VM.ResetSearchCriteria = function () {
        VM.ViewShipment = {
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
            pageSize: "20",
            goods: null,
            so: 'desc',
            sc: 'lastReadingTimeISO'
        };
        VM.sc = "lastReadingTimeISO";
        VM.tracker = null;
        BindShipmentList();
    }

    VM.BindCards = function () {
        BindShipmentList();
    }

    BindShipmentList();

    VM.LocationListFrom = [];
    VM.LocationListTo = [];
    VM.LocationListInterim = [];
    webSvc.getLocations(1000000, 1, 'locationName', 'asc').success( function (data) {
        $log.debug("LocationList", data);
        if (data.status.code == 0) {
            VM.LocationList = data.response;
            angular.forEach(VM.LocationList, function (val, key) {
                if (val.companyName) {
                    var dots = val.companyName.length > 20 ? '...' : '';
                    var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                    VM.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                }
                else {
                    VM.LocationList[key].DisplayText = val.locationName;
                }

                if (val.startFlag=='Y') {
                    VM.LocationListFrom.push(val);
                }
                if (val.endFlag == 'Y') {
                    VM.LocationListTo.push(val)
                }
                if (val.interimFlag == 'Y') {
                    VM.LocationListInterim.push(val);
                }
            })
        }
    });

    VM.SortOptionChanged = function(){
        var order = VM.sc.substr(-1);
        if(order == '1'){
            VM.ViewShipment.sc = VM.sc.substr(0, VM.sc.length - 1);
            VM.ViewShipment.so = "desc";
        } else{
            VM.ViewShipment.sc = VM.sc;
            VM.ViewShipment.so = "asc";
        }
        BindShipmentList();
    }
    VM.PageSizeChanged = function () {
        BindShipmentList();
    }
    VM.PageChanged = function () {
        //console.log('Page-changed');
        BindShipmentList();
    }

    VM.lastView = localStorageService.get('LastViewShipment');
    if (!VM.lastView) {
        VM.lastView = 1;
    }
    VM.showTable = function() {
        VM.lastView = 1;
        localStorageService.set('LastViewShipment', 1);
    };
    VM.showCard = function() {
        VM.lastView = 2;
        localStorageService.set('LastViewShipment', 2);
    }
    VM.showMap = function() {
        VM.lastView = 3;
        localStorageService.set('LastViewShipment', 3);
    }
    VM.toggleSearch = function() {
        VM.AdvanceSearch = !VM.AdvanceSearch;
        localStorageService.set('advancedSearch', VM.AdvanceSearch);
    }

    VM.updatePolylines = function (shipment) {
        var path2 = [];
        if (VM.objectToRemove.length > 0) {
            angular.forEach(VM.objectToRemove, function(v, k) {
                if (VM.objectToRemove[k]) VM.objectToRemove[k].setMap(null);
            });
        }

        var valFrLocName = shipment.shippedFrom ? shipment.shippedFrom : '';
        var valToLocName = shipment.shippedTo ? shipment.shippedTo : '';
        var homeLocation = filter(VM.LocationListFrom, {locationName: valFrLocName}, true);
        if (homeLocation && (homeLocation.length > 0)) {
            homeLocation = homeLocation[0];
        } else {
                homeLocation = null;
        }
        var destLocation = filter(VM.LocationListTo, {locationName: valToLocName}, true);
        if (destLocation && (destLocation.length > 0)) {
            destLocation = destLocation[0];
        } else {
            destLocation = null;
        }

        //-- create array of interimMarker
        //VM.objectToRemove
        if (VM.objectToRemove && (VM.objectToRemove.length > 0)) {
            for (var i = 0; i< VM.objectToRemove.length; i++) {
                if (VM.objectToRemove[i]) VM.objectToRemove[i].setMap(null);
            }
        }
        if (shipment.shippedToLat && shipment.shippedToLong) {
            var destContent = '';
            destContent += '<div style="width: 28px; height: 28px; border: 2px solid '+shipment.color+'; border-radius: 14px!important; background-color: #ffffff;">';
            if (shipment.status == 'Arrived') {
                destContent += '<img class="rev-horizon" src="theme/img/locationStop.png">'
            } else {
                destContent += '<img class="rev-horizon" src="theme/img/locationStopToBeDetermined.png">'
            }
            destContent += '</div>';
            var destLlng = new google.maps.LatLng(shipment.shippedToLat, shipment.shippedToLong);
            var destText = '';
            if (destLocation && destLocation.locationName) {
                destText = destLocation.locationName
            } else {
                destText = 'To be determined'
            }
            path2.push({lat:shipment.shippedToLat, lng:shipment.shippedToLong});
            VM.destMarker = new RichMarker({
                position: destLlng,
                flat: true,
                anchor: RichMarkerPosition.MIDDLE,
                content: destContent,
                map: VM.map,
                zIndex: 1e4
            });
            var destLabel = new MapLabel({
                position: destLlng,
                align: "left",
                map: VM.map,
                fontSize: 15,
                text: destText,
            });
            VM.destMarker.bindTo('position', destLabel);
            VM.objectToRemove.push(destLabel);
            VM.objectToRemove.push(VM.destMarker);
        }

        //-- starting path1
        //must find color of shipment here
        var c = filter(Color, {name: shipment.color}, true);
        if (c && c.length>0) {
            c = c[0];
        } else {
            c = Color[0];
        }

        var arrowSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 2,
            strokeWeight:2,
            strokeColor: shadeColor2(c.code, -0.3),
            fillColor: shadeColor2(c.code, -0.3),
            fillOpacity: 1
        };
        //-- init markers
        var infoWindow = new InfoBubble({
            //content: htmlAlert,
            shadowStyle: 3,
            padding: 0,
            borderRadius: 2,
            arrowSize: 10,
            borderWidth: 0,
            borderColor: '#7ed56d',
            disableAutoPan: true,
            arrowPosition: 10,
            hideCloseButton:true,
            arrowStyle: 2,
        });
        VM.objectToRemove.push(infoWindow);
        var icontent = null;
        var label = null;
        //var ilabel = null;
        var oldLat = 0;
        var oldLon = 0;
        angular.forEach(shipment.keyLocations, function(v, k) {
            //if (v.key == "shippedFrom") {
            var latlng = new google.maps.LatLng(v.lat, v.lon);
            if (k==0) {
                icontent = '';
                icontent += '<div style="width: 28px; height: 28px; border: 2px solid; border-radius: 14px!important;  border-color:'+shipment.color+'; background-color: #ffffff;">';
                icontent += '<img src="theme/img/locationStart.png">';
                icontent += '</div>';
                //--maplabel
                label = "Default";
                if (homeLocation && homeLocation.locationName) {
                    label = homeLocation.locationName
                } else {
                    label = 'Default'
                }
                var imarker = new RichMarker({
                    position: latlng,
                    flat: true,
                    anchor: RichMarkerPosition.MIDDLE,
                    content: icontent,
                    map: VM.map,
                    zIndex: 1e4
                });
                if (label) {
                    ilabel = new MapLabel({
                        position: latlng,
                        map: VM.map,
                        align: 'left',
                        fontSize: 15,
                        text: label
                    });
                    imarker.bindTo('position', ilabel);
                    VM.objectToRemove.push(ilabel);
                }
                VM.objectToRemove.push(imarker);
            } else if (v.key == "shippedTo") {
            } else if (v.key == "reading") {
            } else if (v.key == "lastReading") {
                path2.push({lat:v.lat, lng:v.lon});
            } else if (v.key == "interimStop") {
                icontent = '';
                icontent += '<table>';
                icontent += '<tr>';
                icontent += '<td>';
                icontent += '<img src="theme/img/tinyInterimLocation.png">'
                icontent += '</td>';
                icontent += '</tr>';
                icontent += '</table>';
                var imarker = new RichMarker({
                    position: latlng,
                    flat: true,
                    anchor: RichMarkerPosition.MIDDLE,
                    content: icontent,
                    map: VM.map
                });
                VM.objectToRemove.push(imarker);
            } else { //-- alert
                /*if (v.key == "LightOnAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertLightOn.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "LightOffAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertLightOff.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else */if (v.key == "ColdAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertCold.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "HotAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertHot.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "CriticalColdAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertCriticalCold.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "CriticalHotAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertCriticalHot.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "BatteryAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertBattery.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                } else if (v.key == "MovementStartAlert") {
                    icontent = '';
                    icontent += '<table>';
                    icontent += '<tr>';
                    icontent += '<td>';
                    icontent += '<img src="theme/img/alertMovementStart.png">'
                    icontent += '</td>';
                    icontent += '</tr>';
                    icontent += '</table>';
                }
                var imarker = new RichMarker({
                    position: latlng,
                    flat: true,
                    anchor: RichMarkerPosition.MIDDLE,
                    content: icontent,
                    map: VM.map
                });
                google.maps.event.addListener(imarker, 'mouseover', function () {
                    //show info window
                    //-- get alert content here;
                    var alertContent = getAlertContent(v, shipment.deviceSN, shipment.tripCount, shipment.color);
                    if (alertContent) {
                        infoWindow.setContent(alertContent);
                        infoWindow.open(VM.map, imarker);
                    }
                });
                google.maps.event.addListener(imarker, 'mouseout', function() {
                    infoWindow.close();
                });
                VM.objectToRemove.push(imarker);
            }
            //----------------------------------------------------------------------------------------------------------
            //----------------------------------------------------------------------------------------------------------

            //----------------------------------------------------------------------------------------------------------
            //----------------------------------------------------------------------------------------------------------
            if (k+1 < shipment.keyLocations.length) {
                var v1 = shipment.keyLocations[k+1];
                //v1.lat = v1.lat ? v1.lat : v.lat;
                //v1.lon = v1.lon ? v1.lon : v.lon;

                var spart = [{lat: v.lat, lng: v.lon}, {lat: v1.lat, lng: v1.lon}];
                var fromLlng = new google.maps.LatLng(v.lat, v.lon);
                var toLlng = new google.maps.LatLng(v1.lat, v1.lon);
                var distance = getDistance(fromLlng, toLlng);
                var rpath = null;
                if (distance < 1000) {
                    rpath = new google.maps.Polyline({
                        path: spart,
                        strokeColor: shipment.color,
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        map: VM.map,
                    });
                } else {
                    rpath = new google.maps.Polyline({
                        path: spart,
                        strokeColor: shipment.color,
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        map: VM.map,
                        icons: [{
                            icon: arrowSymbol,
                            offset: '50%'
                        }],
                    });
                }

                VM.objectToRemove.push(rpath);
            }
        }); // end of travel

        var lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            strokeColor: shipment.color,
            scale: 4
        };
        if (VM.expectPath) {
            VM.expectPath.setMap(null);
        }
        if (shipment.status == "Default") {
            VM.expectPath = new google.maps.Polyline({
                path: path2,
                geodesic: true,
                strokeOpacity: 0,
                strokeWeight: 2,
                strokeColor: shipment.color,
                icons: [{
                 icon: lineSymbol,
                 offset: '0',
                 repeat: '20px'
                 }],
            });
        } else if (shipment.status == "Arrived") {
            VM.expectPath = new google.maps.Polyline({
                path: path2,
                geodesic: true,
                strokeOpacity: 1,
                strokeWeight: 2,
                strokeColor: shipment.color,
            });
        }
        //objectToRemove.setMap(VM.map);
        //console.log("shipement", shipment);
        //console.log("shipement.status", shipment.status);
        if ((shipment.status == 'Arrived') || (shipment.status == "Default")) {
            VM.expectPath.setMap(VM.map);
        }
    }

    VM.initMap = function() {
        VM.map = new google.maps.Map(document.getElementById('shipmentMap'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            zoomControl: false,
            streetViewControl: false,
            scaleControl: true,
            styles: [
                {
                    featureType:"poi",
                    elementType: "all",
                    stylers: [
                        { visibility: "off" }
                    ]
                }
            ]
        });

        //-- setup bottom-left control
        var bottomLeftInfo = document.createElement('div');
        var bliHtml = '';
        bliHtml += '<div style="margin-bottom: 15px; margin-left: 15px; border: 1px solid #aaaaaa;">';
        bliHtml += '<div style="background-color: #aaaaaa; color: #ffffff; padding: 5px; font-weight: 600;">';
        bliHtml += '<span>Index</span>';
        bliHtml += '</div>';
        bliHtml += '<div style="background-color: #ffffff; padding: 5px;">';
        bliHtml += '<table style="text-align: left;">';
        //--
        bliHtml += '<tr>';
        bliHtml += '<td  style="padding-bottom: 5px;">';
        bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px;">';
        bliHtml += '</div>';
        bliHtml += '</td>';
        bliHtml += '<td>';
        bliHtml += '<span>Shipment is active</span>';
        bliHtml += '</td>';
        bliHtml += '</tr>';
        //--
        bliHtml += '<tr>';
        bliHtml += '<td  style="padding-bottom: 5px;">';
        bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position:relative;">';
        bliHtml += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
        bliHtml += '</div>';
        bliHtml += '</td>';
        bliHtml += '<td>';
        bliHtml += '<span>Shipment has arrived</span>';
        bliHtml += '</td>';
        bliHtml += '<td>';
        bliHtml += '</td>';
        bliHtml += '</tr>';
        //--
        bliHtml += '<tr>';
        bliHtml += '<td  style="padding-bottom: 5px;">';
        bliHtml += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position: relative">';
        bliHtml += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&times;</span>';
        bliHtml += '</div>';
        bliHtml += '</td>';
        bliHtml += '<td>';
        bliHtml += '<span>Shipment has ended</span>';
        bliHtml += '</td>';
        bliHtml += '<td>';
        bliHtml += '</td>';
        bliHtml += '</tr>';
        //--
        bliHtml += '</table>';
        bliHtml += '</div>';
        bliHtml += '</div>';

        bottomLeftInfo.innerHTML = bliHtml;
        VM.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].pop();
        VM.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(bottomLeftInfo);

        if (VM.ShipmentList) {
            //--update map
            VM.updateMap();
        }
    }

    VM.updateMap = function() {
        //-- reset first
        VM.resetMap();
        $log.debug('update Maps', VM.ProcessedList);
        // console.log('Custom Markers', VM.map.customMarkers);
        var bounds = new google.maps.LatLngBounds;
        var infoBoxElement = document.createElement('div');

        angular.forEach(VM.ProcessedList, function(shipment, key) {
            VM.boundsExtend(bounds, shipment);
            var llng = new google.maps.LatLng(shipment.lastReadingLat, shipment.lastReadingLong);
            var marker = new RichMarker({
                position: llng,
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.MIDDLE,
             });
            marker.shipment = shipment;
            VM.getMarkerContent(marker, false);

            google.maps.event.addListener(marker, 'click', function() {
                VM.oldMarker = VM.currentMarker;
                VM.currentMarker = marker;
                VM.origContent = marker.getContent();

                VM.getInfoBoxElement(infoBoxElement, marker);
                //marker.setContent(brContent);

                if (VM.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
                    var pContent = VM.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
                    if (VM.expectPath) VM.expectPath.setMap(null);
                    if (VM.destMarker) VM.destMarker.setMap(null);
                    if (VM.objectToRemove && VM.objectToRemove.length > 0) {
                        for (var i = 0; i< VM.objectToRemove.length; i++) {
                            if (VM.objectToRemove[i]) VM.objectToRemove[i].setMap(null);
                        }
                    }
                    if (VM.oldMarker != VM.currentMarker) {
                        VM.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoBoxElement);
                        VM.getMarkerContent(VM.oldMarker, false);
                        VM.getMarkerContent(VM.currentMarker, true);
                        VM.updatePolylines(marker.shipment);
                    } else {
                        VM.getMarkerContent(VM.currentMarker, false);
                    }
                } else {
                    VM.map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoBoxElement);
                    VM.getMarkerContent(marker, true);
                    VM.updatePolylines(marker.shipment);
                }
            });
            VM.dynMarkers.push(marker);
        });

        VM.markerClusterer = new MarkerClusterer(VM.map, VM.dynMarkers, {
            averageCenter:true,
            spiderer:true,
            imagePath: 'Scripts/google-map/images/m',
            styles: [{
                height: 30,
                width: 30,
                textSize: 15,
            }]
        });

        if(bounds != null){
            VM.map.setCenter(bounds.getCenter());
            VM.map.fitBounds(bounds);
        }
    }

    VM.boundsExtend = function(bounds, shipment) {
        if (!bounds) {
            bounds = new google.maps.LatLngBounds;
        }
        angular.forEach(shipment.keyLocations, function(v, k) {
            var latlng = new google.maps.LatLng(v.lat, v.lon);
            bounds.extend(latlng);
        });
        return bounds;
    }

    VM.getInfoBoxElement = function(controlInfo, marker) {
        var shipment = marker.shipment;
        var htmlContent = '';
        htmlContent += '<div class="portlet box" style="border: 2px solid; border-color:'+shipment.color+'">';  //+1
        htmlContent += '<div style="padding-left: 10px; padding-right: 10px; padding-top: 10px; padding-bottom: 10px; background-color: #bababa; color: #ffffff;">';                                                                   //+2
        htmlContent += '<table width="100%" height="100%" style="font-size: 13px;">';
        htmlContent += '<tr>';
        htmlContent += '<td>';
        htmlContent += '<table>';
        htmlContent += '<tr>';
        htmlContent += '<td>'
        htmlContent += '<span class="pull-left bold">';
        htmlContent += '<a href="#/view-shipment-detail?sn='+shipment.deviceSN+'&trip='+shipment.tripCount+'">';
        htmlContent +=  '<u style="color: #ffffff">Shipment ' + shipment.deviceSN + ' (' + shipment.tripCount + ')</u></a>';
        htmlContent += '</span>';
        htmlContent += '</td>'
        htmlContent += '</tr>';
        htmlContent += '</table>';
        htmlContent += '</td>';
        htmlContent += '<td>';
        htmlContent += '<span class="pull-right">';
        if (shipment.alertSummary.LightOn)          htmlContent += '<img src="theme/img/alertLightOn.png"/>';
        if (shipment.alertSummary.LightOff)         htmlContent += '<img src="theme/img/alertLightOff.png"/>';
        if (shipment.alertSummary.Cold)             htmlContent += '<img src="theme/img/alertCold.png"/>';
        if (shipment.alertSummary.Hot)              htmlContent += '<img src="theme/img/alertHot.png"/>';
        if (shipment.alertSummary.CriticalCold)     htmlContent += '<img src="theme/img/alertCriticalCold.png"/>';
        if (shipment.alertSummary.CriticalHot)      htmlContent += '<img src="theme/img/alertCriticalHot.png"/>';
        if (shipment.alertSummary.Battery)          htmlContent += '<img src="theme/img/alertBattery.png"/>';
        if (shipment.alertSummary.MovementStart)    htmlContent += '<img src="theme/img/alertShock.png"/>';
        htmlContent += '</span>';
        htmlContent += '</td>';

        htmlContent += '<td>';

        if (shipment.siblingCount > 2) {
            htmlContent += '<span class="pull-left">';
            htmlContent += '<img src="theme/img/similarTrips.png"/>'
            htmlContent += (shipment.siblingCount - 1) + ' others';
            htmlContent += '</span>';
        } else if (shipment.siblingCount == 2) {
            htmlContent += '<span class="pull-left">';
            htmlContent += '<img src="theme/img/similarTrips.png"/>'
            htmlContent += (shipment.siblingCount - 1) + ' other';
            htmlContent += '</span>';
        }

        htmlContent += '</td>';

        htmlContent += '<td style="text-align: right; width: 10px;">';
        htmlContent += '&nbsp;';
        htmlContent += '</td>';
        htmlContent += '</tr>';
        htmlContent += '</table>';
        htmlContent += '</div>';                                                                                        //-2

        htmlContent += '<div style="background-color: #ffffff; padding: 5px; border-bottom: 1px solid; border-color: '+shipment.color+'">'; //+5
        htmlContent += '<div style="font-weight: 700;">Description:</div>';
        htmlContent += '<div>'+shipment.shipmentDescription+'</div>'
        if (shipment.palletId || shipment.assetNum) {
            htmlContent += '<div>'
            if (shipment.palletId) {
                htmlContent += '<span>(PalletID: ' + shipment.palletId + ')</span>'
            }
            if (shipment.assetNum) {
                htmlContent += '<span>(AssetNum: ' + shipment.assetNum + ')</span>'
            }
            htmlContent += '</div>'
        }
        htmlContent += '</div>';

        htmlContent += '<div class="portlet-body" style="padding: 5px!important;">'; //+5
        htmlContent += '<table style="text-align: left;">';
        htmlContent += '<tr>';
        htmlContent += '<td>';
        htmlContent += '<img src="theme/img/locationStart.png">';
        htmlContent += '</td>';
        htmlContent += '<td>';
        if (shipment.shippedFrom) {
            htmlContent += '<p class="bold no-margin no-padding">'+shipment.shippedFrom+'</p>';
        } else {
            htmlContent += '<p class="bold no-margin no-padding">Default</p>';
        }
        if (shipment.shipmentDate) {
            htmlContent += '<p class="text-muted no-margin no-padding" style="height: 17px;">'+ shipment.shipmentDate+'</p>';
        } else {
            htmlContent += '<p class="text-muted no-margin no-padding" style="height: 17px;">'+ shipment.firstReadingTime+'</p>';
        }
        htmlContent += '</td>';
        htmlContent += '</tr>';
        //-- interim stop here

        if (shipment.interimStops) {
            angular.forEach(shipment.interimStops, function(v, k) {
                htmlContent += '<tr>';
                htmlContent += '<td>';
                htmlContent += '<img src="theme/img/tinyInterimLocation.png">';
                htmlContent += '</td>';
                htmlContent += '<td>';
                htmlContent += '<div class="bold">' + v.name + '</div>';
                htmlContent += '<div>' + v.time + '</div>';
                htmlContent += '</td>';
                htmlContent += '</tr>';
            });
        }

        //--end
        htmlContent += '<tr>';
        htmlContent += '<td>';
        if (shipment.status == "Ended" || shipment.status == "Default") {
            htmlContent += '<img src="theme/img/locationStopToBeDetermined.png">';
        } else {
            htmlContent += '<img class="rev-horizon" src="theme/img/locationStop.png">';
        }
        htmlContent += '</td>';
        htmlContent += '<td>';
        if (shipment.shippedTo) {
            htmlContent += '<p class="bold no-margin no-padding" style="height: 17px;">'+shipment.shippedTo+'</p>';
        } else {
            htmlContent += '<p class="bold no-margin no-padding" style="height: 17px;">To be determined</p>';
        }
        if (shipment.status == 'Arrived') {
            htmlContent += '<p class="text-muted no-margin no-padding">';
            htmlContent += '<span>ARRIVED AT</span>: '+shipment.actualArrivalDate+'</p>';
        } else if (shipment.status == 'Ended'){
            htmlContent += '<p class="text-muted no-margin no-padding">';
            htmlContent += '<span>ENDED AT</span>: '+shipment.lastReadingTime+'</p>';
        }
        htmlContent += '</td>';
        htmlContent += '</tr>';
        htmlContent += '</table>';
        htmlContent += '<table>';
        htmlContent += '<tr>';
        htmlContent += '<td>';
        htmlContent += '<span style="font-weight: 600; padding-right: 5px">Status:</span>';
        htmlContent += '</td>';
        htmlContent += '<td>';
        htmlContent += '<span>'+shipment.status+'</span>'
        htmlContent += '</td>';
        htmlContent += '</tr>'
        htmlContent += '</table>';
        htmlContent += '</div>';

        htmlContent += '<div style="background-color: #ffffff; padding: 5px; border-top: 1px solid; border-color: '+shipment.color+'">'; //+5
        htmlContent += '<table style="text-align: left;">';
        htmlContent += '<tr>';

        htmlContent += '<td style="width: 20px;">';
        if (shipment.status == 'Ended') {
            htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ shipment.color +'; margin-right: 5px; position:relative;">';
            htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&times;</span>'
            htmlContent += '</div>';
        } else if (shipment.status == 'Arrived') {
            htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ shipment.color +';margin-right: 5px; position:relative;">';
            htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
            htmlContent += '</div>';
        } else {
            htmlContent += '<div style="width: 15px; height: 15px;  background-color: '+ shipment.color +';margin-right: 5px;">';
            htmlContent += '</div>';
        }
        htmlContent += '</td>';


        var temperature = shipment.lastReadingTemperature;

        var temtype = localDbSvc.getDegreeUnits() == "Celsius" ? "℃" : "°F";
        if (!isNaN(temperature)) {
            temperature = temperature.toFixed(1) + temtype;
        } else {
            temperature = '';
        }
        var voltage = shipment.lastReadingBattery;
        if (!isNaN(voltage)) {
            voltage = voltToImg(voltage);
        }

        //"8:11 26 May 2016"
        var lastReading = moment.tz(shipment.lastReadingTime, "h:m DD MMM YYYY", VM.rootScope.RunningTimeZoneId).fromNow();
        htmlContent += '<td>';
        htmlContent += '<span style="font-weight: 600; padding-right: 5px">Last Reading:</span>';
        htmlContent += '</td>';
        if (lastReading) {
            htmlContent += '<td>';
            htmlContent += lastReading;
            htmlContent += '</td>';
        }
        if (temperature) {
            htmlContent += '<td>';
            htmlContent += '<span style="font-weight: 700; padding-left: 5px; color: '+shipment.color+'">';
            htmlContent += temperature;
            htmlContent += '</span>';
            htmlContent += '</td>';
        }
        if (voltage) {
            htmlContent += '<td>';
            htmlContent += '<span style="padding-left: 5px;">';
            htmlContent += voltage;
            htmlContent += '</span>';
            htmlContent += '</td>';
        }
        htmlContent += '</tr>'
        htmlContent += '</table>'
        htmlContent += '</div>';
        htmlContent += '</div>';

        //-- controls
        //-- htmlContent += '<span style="font-size: 20px;">&times;</span>';
        var closeBtn = document.createElement('div');
        closeBtn.style.position='absolute';
        closeBtn.style.top='5px';
        closeBtn.style.right='10px';
        closeBtn.style.color='#ffffff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.innerHTML = '<span style="font-size: 20px;">&times;</span>';
        closeBtn.addEventListener('click', function() {
            VM.oldMarker = VM.currentMarker;
            VM.getMarkerContent(marker, false);
            //VM.updateCluster();
            if (VM.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
                var pContent = VM.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
                if (VM.expectPath) VM.expectPath.setMap(null);
                if (VM.destMarker) VM.destMarker.setMap(null);
                if (VM.objectToRemove && VM.objectToRemove.length > 0) {
                    for (var i = 0; i< VM.objectToRemove.length; i++) {
                        if (VM.objectToRemove[i]) VM.objectToRemove[i].setMap(null);
                    }
                }
            }
        });

        controlInfo.innerHTML = htmlContent;
        controlInfo.appendChild(closeBtn);
        return controlInfo;
    }

    VM.getMarkerContent = function(marker, isBorder) {
        var shipment = marker.shipment;
        var htmlIcon = '';
        if (isBorder) {
            htmlIcon += '<table style="background-color: #fff; border-top: 2px solid; border-bottom: 2px solid; border-right: 2px solid; border-color: '+shipment.color+';">';
        } else {
            htmlIcon += '<table style="background-color: #ffffff">';
        }
        htmlIcon += '<tr>';
        htmlIcon += '<td>';
        htmlIcon += '<div style="width: 17px; height: 17px; background-color:'+shipment.color+'; cursor: pointer; ">';
        if (shipment.status == 'Ended') {
            htmlIcon += "<div style='position:relative;'>";
            htmlIcon += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -3px; left: 3px;;">&times;</span>'
            htmlIcon += '</div>';
        } else if (shipment.status == 'Arrived') {
            htmlIcon += "<div style='position:relative;'>";
            htmlIcon += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -3px; left: 2px;;">&check;</span>'
            htmlIcon += '</div>';
        } else {
            htmlIcon += "<div style='cursor: pointer;'></div>";
        }
        htmlIcon += '</div>';
        htmlIcon += '</td>';
        htmlIcon += '<td>';
        htmlIcon += '<div>';
        htmlIcon += (shipment.deviceSN + "(" + shipment.tripCount + ")");
        htmlIcon += '</div>';
        htmlIcon += '</td>';
        htmlIcon += '<td>';
        var alerts = [];
        if (shipment.alertSummary.Hot || shipment.alertSummary.CriticalHot) {
            alerts.push({type: 'hot', color: '#DF2410'});
        }
        if (shipment.alertSummary.Cold || shipment.alertSummary.CriticalCold) {
            alerts.push({type: 'cold', color: '#57BEFC'});
        }
        if (shipment.alertSummary.Battery) {
            alerts.push({type: 'batt', color: '#000000'});
        }
        if (alerts.length == 1) {
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[0].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px;" aria-hidden="true"></i>'
        } else if (alerts.length == 2) {
            htmlIcon += '<table>';
            htmlIcon += '<tr>';
            htmlIcon += '<td style="line-height: 8px;">';
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[0].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px; line-height: 8px;" aria-hidden="true"></i>'
            htmlIcon += '</td>';
            htmlIcon += '</tr>';
            htmlIcon += '<tr>';
            htmlIcon += '<td style="line-height: 8px;">';
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[1].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px; line-height: 8px;" aria-hidden="true"></i>'
            htmlIcon += '</td>';
            htmlIcon += '</tr>';
            htmlIcon += '</table>';
        } else if (alerts.length == 3) {
            htmlIcon += '<table>';
            htmlIcon += '<tr>';
            htmlIcon += '<td style="line-height: 8px;">';
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[0].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px; line-height: 8px;" aria-hidden="true"></i>'
            htmlIcon += '</td>';
            htmlIcon += '<td style="line-height: 8px;">';
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[2].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px; line-height: 8px;" aria-hidden="true"></i>'
            htmlIcon += '</td>';
            htmlIcon += '</tr>';
            htmlIcon += '<tr>';
            htmlIcon += '<td style="line-height: 8px;">';
            htmlIcon += '<i class="fa fa-circle" style="color: '+alerts[1].color+'; margin-right: 0px; margin-left: 2px; font-size: 8px; line-height: 8px;" aria-hidden="true"></i>'
            htmlIcon += '</td>';
            htmlIcon += '</tr>';
            htmlIcon += '</table>';
        }
        htmlIcon += '</td>';
        htmlIcon += '</tr>';
        htmlIcon += '</table>';

        marker.setContent(htmlIcon);
        //return htmlIcon;
    }

    VM.resetMap = function() {
        if (VM.markerClusterer) {
            // Unset all markers
            var ms = VM.markerClusterer.getMarkers();
            var l = ms ? ms.length : 0;
            for (var i = 0; i<l; i++) {
                ms[i].setMap(null)
            }
            // Clears all clusters and markers from the clusterer.
            VM.markerClusterer.clearMarkers();
        }
        if (VM.dynMarkers) {
            var lx = VM.dynMarkers ? VM.dynMarkers.length : 0;
            for (var i = 0; i < lx; i++) {
                VM.dynMarkers[i].setMap(null);
            }
        }
        if (VM.labelMarkers) {
            angular.forEach(VM.labelMarkers, function(label, k) {
                label.setMap(null);
            });
        }
        VM.dynMarkers.length = 0;
        VM.labelMarkers.length = 0;
        VM.oldMarker = null;
        VM.currentMarker = null;
        if (VM.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
            var pContent = VM.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
            if (VM.expectPath) VM.expectPath.setMap(null);
            if (VM.destMarker) VM.destMarker.setMap(null);
            if (VM.objectToRemove && VM.objectToRemove.length > 0) {
                for (var i = 0; i < VM.objectToRemove.length; i++) {
                    if (VM.objectToRemove[i]) VM.objectToRemove[i].setMap(null);
                }
            }
        }
    }
});

appFilters.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().startsWith(text)/* !== -1*/) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
function voltToImg (input) {
    if (input) {
        var v = Number(parseInt(input, 10)/1000).toFixed(1) + "V";
        if (input <= 3194.3) {
            return '<img style="height: 16px;" src="theme/img/bat0.png"> 0%';
        } else if (input <= 3241.6) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 1%';
        } else if (input <= 3288.9) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 2%';
        } else if (input <= 3336.2) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 3%';
        } else if (input <= 3383.5) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 4%';
        } else if (input <= 3430.8) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 5%';
        } else if (input <= 3478.1) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 6%';
        } else if (input <= 3525.4) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 7%';
        } else if (input <= 3572.7) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 8%';
        } else if (input <= 3620) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 9%'; // start rolling out
        } else if (input <= 3695) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 10%';
        } else if (input <=3770) {
            return '<img style="height: 16px;" src="theme/img/bat10.png"> 20%';
        } else if (input <= 3845) {
            return '<img style="height: 16px;" src="theme/img/bat20.png"> 30%';
        } else if (input <= 3920) {
            return '<img style="height: 16px;" src="theme/img/bat20.png">  40%';
        } else if (input <= 3995) {
            return '<img style="height: 16px;" src="theme/img/bat20.png">  50%';
        } else if (input <= 4070) {
            return '<img style="height: 16px;" src="theme/img/bat30.png"> 60%';
        } else if (input <= 4109) {
            return '<img style="height: 16px;" src="theme/img/bat30.png"> 70%';
        } else if (input <= 4148) {
            return '<img style="height: 16px;" src="theme/img/bat40.png"> 80%';
        } else if (input <= 4187) {
            return '<img style="height: 16px;" src="theme/img/bat40.png"> 90%';
        } else if (input < 4220) {
            return '<img style="height: 16px;" src="theme/img/bat50.png"> 95%';
        } else {
            return '<img style="height: 16px;" src="theme/img/bat50.png"> 100%';
        }
    }
};

function getAlertContent(v, deviceSN, tripCount, color) {
    var alertImg = '';
    var alertText = '';
    if (v.key == "LightOnAlert") {
        alertImg="theme/img/alertLightOn.png";
        alertText = 'Light On Alert for shipment ';
        return null;
    } else if (v.key == "LightOffAlert") {
        alertImg="theme/img/alertLightOff.png";
        alertText = 'Light Off Alert for shipment ';
        return null;
    } else if (v.key == "ColdAlert") {
        alertImg="theme/img/alertCold.png";
        alertText = 'Cold Alert for shipment ';
    } else if (v.key == "HotAlert") {
        alertImg="theme/img/alertHot.png";
        alertText = 'Hot Alert for shipment ';
    } else if (v.key == "CriticalColdAlert") {
        alertImg="theme/img/alertCriticalCold.png";
        alertText = 'Critical Cold Alert for shipment ';
    } else if (v.key == "CriticalHotAlert") {
        alertImg="theme/img/alertCriticalHot.png";
        alertText = 'Critical Hot Alert for shipment ';

    } else if (v.key == "BatteryAlert") {
        alertImg="theme/img/alertBattery.png";
        alertText = 'Battery Alert for shipment ';
    } else if (v.key == "MovementStartAlert") {
        alertImg="theme/img/alertMovementStart.png";
        alertText = 'Movement Start Alert for shipment ';
    }

    var desc = v.desc ? v.desc.split('\n') : null;

    var htmlAlert = '';
    if (desc && alertText && alertImg) {
        htmlAlert += '<div style="width: 275px; height: 70px;">';
        htmlAlert += '<table width="100%">';
        htmlAlert += '<tr style="background-color: '+color+';">';
        htmlAlert += '<td style="width: 24px; margin-right: 5px; padding-left: 5px; padding-top: 5px; padding-bottom: 5px">';
        htmlAlert += '<img src="'+alertImg+'">'
        htmlAlert += '</td>';
        htmlAlert += '<td style="padding-top: 5px; padding-bottom: 5px; color: #ffffff">';
        htmlAlert += (alertText + deviceSN + ' (' + tripCount + ')');
        htmlAlert += '</td>';
        htmlAlert += '</tr>';
        if (desc[1] && desc[1] != 'undefined') {
            htmlAlert += '<tr>';
            htmlAlert += '<td colspan="2" style="padding-left: 5px; padding-right: 5px; padding-top: 5px;">';
            htmlAlert += desc[1];
            htmlAlert += '</td>';
            htmlAlert += '</tr>';
        }
        if (desc[2] && desc[2] != 'undefined') {
            htmlAlert += '<tr>';
            htmlAlert += '<td colspan="2" style="padding-left: 5px; padding-right: 5px;">';
            htmlAlert += desc[2];
            htmlAlert += '</td>';
            htmlAlert += '</tr>';
        }
        htmlAlert += '</table>';
        htmlAlert += '</div>';
    }
    return htmlAlert;
}

var rad = function(x) {
    return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
