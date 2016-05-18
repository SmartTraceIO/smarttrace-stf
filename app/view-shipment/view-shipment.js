appCtrls.controller('ViewShipmentCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $filter, temperatureFilter, Color, $q,
                                                  $rootScope, $state, $window, $log, $timeout, $interval, $controller,
                                                  localStorageService) {
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
        $controller('BaseCtrl', {VM:this});
    }
    var token = localDbSvc.getToken();
    if (token == '_' || token == null) {
        $rootScope.go('login');
        return;
    }

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
        VM.BindCards();
    }

    VM.SearchAdvance = function () {
        if(VM.ViewShipment.status == "")
            VM.ViewShipment.status = null;
        VM.BindCards();
    }

    VM.Print = function(){
        $window.print();
    }

    VM.AdvanceSearch = localStorageService.get('advancedSearch');
    VM.LocationOptions = { multiple: true };

    
    var BindShipmentList = function () {
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

        var devicesPromise = webSvc.getDevices(1000000, 1, 'locationName', 'asc').success( function (data) {
            if (data.status.code == 0) {
                VM.TrackerList = data.response;
                angular.forEach(VM.TrackerList, function(tracker, key) {
                    if (!isNaN(tracker.sn)) {
                        VM.TrackerList[key].sn=parseInt(tracker.sn, 10);
                    }
                });
                $log.debug('view-shipment', VM.TrackerList);
            }
        });

        var shipmentsPromise = webSvc.getShipments(VM.ViewShipment).success( function (data, textStatus, XmlHttpRequest) {
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

        $q.all([devicesPromise, shipmentsPromise]).then(function() {
            angular.forEach(VM.ShipmentList, function(v, k) {
                if (!isNaN(v.deviceSN)) {
                    VM.ShipmentList[k].deviceSN = parseInt(v.deviceSN, 10);
                }

                //-- bind color to shipment here by get color of device.
                var d = filter(VM.TrackerList, {sn: VM.ShipmentList[k].deviceSN}, true);
                var colorName = null;
                if (d && (d.length > 0)) {
                    //found a device
                    colorName = d[0].color;
                } else {
                    colorName = Color[0].name;
                }
                var color = filter(Color, {name: colorName}, true);
                if (color && (color.length > 0)) {
                    VM.ShipmentList[k].color = color[0];
                } else {
                    VM.ShipmentList[k].color = Color[0];
                }
                //-- position
                VM.ShipmentList[k].position = [v.lastReadingLat, v.lastReadingLong];
                VM.ShipmentList[k].icon = {
                    url:"theme/img/transparent16.png",
                    scaledSize:[16, 16],
                    anchor:[8, 8]
                }
                //-- update interimL;
                var interimL = [];
                for (iterimKey in v) {
                    if (/interimStop[0-9]{1,2}$/.test(iterimKey)) {
                        var time = iterimKey + 'Time';
                        console.log('Key', iterimKey);
                        console.log('v[iterimKey]', v[iterimKey]);
                        console.log('v[time]', v[time]);
                        var itl = {
                            name: v[iterimKey],
                            time: v[time]
                        }
                        interimL.push(itl);
                    }
                }
                v.interimLocations = interimL;
                //bounds.extend(new google.maps.LatLng(v.lastReadingLat, v.lastReadingLong));
            });
        }).then(function() {
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
            so: 'desc',
            sc: 'lastReadingTimeISO'
        };
        VM.sc = "lastReadingTimeISO";

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
        console.log('Page-changed');
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
        /*if (VM.map) {
            VM.updateMap(null);
        } else {
            NgMap.getMap('shipmentMap').then(function(map) {
                VM.updateMap(map);
            });
        }*/
    }
    VM.toggleSearch = function() {
        VM.AdvanceSearch = !VM.AdvanceSearch;
        localStorageService.set('advancedSearch', VM.AdvanceSearch);
    }

    VM.updatePolylines = function (shipment, key) {
        var valFrLocName = shipment.shippedFrom ? shipment.shippedFrom : '';
        var valToLocName = shipment.shippedTo ? shipment.shippedTo : '';
        var homeLocation = filter(VM.LocationListFrom, {locationName: valFrLocName}, true);
        if (homeLocation && (homeLocation.length > 0)) {
            homeLocation = homeLocation[0];
        } else if (shipment.firstReadingLat && shipment.firstReadingLong){
            homeLocation = {};
            homeLocation.location = {
                lat: shipment.firstReadingLat,
                lon: shipment.firstReadingLong
            };
        } else {
            homeLocation = null;
        }
        var destLocation = filter(VM.LocationListTo, {locationName: valToLocName}, true);
        if (destLocation && (destLocation.length > 0)) {
            destLocation = destLocation[0];
        } else {
            destLocation = null;
        }
        if (homeLocation && destLocation) {
            $log.debug('Home/Dest', homeLocation, destLocation);
            //create home-marker & dest-marker
            var homeHtmlIcon = '';
            homeHtmlIcon += '<table>';
            homeHtmlIcon += '<tr>';
            homeHtmlIcon += '<td>';
            homeHtmlIcon += '<img src="theme/img/locationStart.png">';
            homeHtmlIcon += '</td>';
            homeHtmlIcon += '<td>';
            homeHtmlIcon += '<div style="padding-left: 5px; padding-right: 5px; background-color: #fff">';
            if (homeLocation.locationName) {
                homeHtmlIcon += homeLocation.locationName
            } else {
                homeHtmlIcon += 'Default'
            }
            homeHtmlIcon += '</div>';
            homeHtmlIcon += '</td>';
            homeHtmlIcon += '</tr>';
            homeHtmlIcon += '</table>';
            var homMarker = new RichMarker({
                position: new google.maps.LatLng(homeLocation.location.lat, homeLocation.location.lon),
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.BOTTOM_LEFT,
                content: homeHtmlIcon,
            });

            //var destHtmlIcon = '<i class="fa fa-flag fa-flip-horizontal fa-2x"></i>';
            var destHtmlIcon = '';
            destHtmlIcon += '<table>';
            destHtmlIcon += '<tr>';
            destHtmlIcon += '<td>';
            destHtmlIcon += '<img class="rev-horizon" src="theme/img/locationStop.png">';
            destHtmlIcon += '</td>';
            destHtmlIcon += '<td>';
            destHtmlIcon += '<div style="padding-left: 5px; padding-right: 5px; background-color: #fff">';
            if (destLocation.locationName) {
                destHtmlIcon += destLocation.locationName
            } else {
                destHtmlIcon += 'Default'
            }
            destHtmlIcon += '</div>';
            destHtmlIcon += '</td>';
            destHtmlIcon += '</tr>';
            destHtmlIcon += '</table>';
            var destMarker = new RichMarker({
                position: new google.maps.LatLng(destLocation.location.lat, destLocation.location.lon),
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.BOTTOM_LEFT,
                content: destHtmlIcon,
            });

            var path = [
                {lat: homeLocation.location.lat, lng: homeLocation.location.lon},
                {lat: destLocation.location.lat, lng: destLocation.location.lon},
                {lat: shipment.lastReadingLat, lng: shipment.lastReadingLong},
            ];

            $log.debug('Path', path);

            var flightPath = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: shipment.color.code,
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(VM.map);
            return {
                path: flightPath,
                home: homMarker,
                dest: destMarker
            };
        }
        return null;
    }

    VM.initMap = function() {
        VM.map = new google.maps.Map(document.getElementById('shipmentMap'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8,
            mapTypeControl: false,
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
        bliHtml += '<div style="margin-bottom: 15px; margin-left: 15px; border: 1px solid;">';
        bliHtml += '<div style="background-color: #5e5e5e; color: #ffffff; padding: 5px; font-weight: 600;">';
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
        VM.dynMarkers = [];

        $log.debug('update Maps', VM.ShipmentList);
        // console.log('Custom Markers', VM.map.customMarkers);
        var bounds = new google.maps.LatLngBounds;

        angular.forEach(VM.ShipmentList, function(shipment, key) {
            var llng = new google.maps.LatLng(shipment.lastReadingLat, shipment.lastReadingLong);
            var htmlIcon = '';
            htmlIcon += "<table style=''>";
            htmlIcon += "<tr>";
            htmlIcon += "<td>";
            htmlIcon += "<div style=' border:2px solid #5e5e5e; width: 16px; height: 16px; background-color:"+shipment.color.code+"; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); cursor: pointer;'></div>";
            htmlIcon += "</td>";
            htmlIcon += "<td  style='background-color: white'>";
            htmlIcon += "<div>";
            htmlIcon += shipment.deviceSN + "(" + shipment.tripCount + ")";
            htmlIcon += "</div>"
            htmlIcon += "</td>";
            htmlIcon += "</tr>";
            htmlIcon += "<tr>";
            htmlIcon += "<td colspan=2>"
            htmlIcon += "<div style='margin-top: 5px;'>"

            htmlIcon += "<div class='progress' style='height: 5px; border: #5BCA45 solid 1px;'>";
            htmlIcon += "<div class='progress-bar' role='progressbar' aria-valuenow='"+shipment.percentageComplete+"' aria-valuemin='0' aria-valuemax='100' style='background-color:#5BCA45;width:"+shipment.percentageComplete+"%'>";
            htmlIcon += "</div>";
            htmlIcon += "</div>";


            htmlIcon += "</div>"
            htmlIcon += "</td>";
            htmlIcon += "</tr>";
            htmlIcon += "</table>";

            var marker = new RichMarker({
                position: llng,
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.TOP,
                content: htmlIcon,
             });

            var htmlContent = '';
            htmlContent += '<div class="portlet box" style="border: 1px solid; border-color: '+shipment.color.code+'">';  //+1

            htmlContent += '<div style="padding-left: 10px; padding-right: 10px; padding-top: 10px; padding-bottom: 10px; color: #ffffff; background-color: '+ shipment.color.code +'">';                                                                   //+2
            htmlContent += '<table width="100%" height="100%" style="font-size: 13px;">';
            htmlContent += '<tr>';
            htmlContent += '<td>';
            htmlContent += '<table>';
            htmlContent += '<tr>';
            htmlContent += '<td>';

            if (shipment.status == 'Ended') {
                htmlContent += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position:relative;">';
                htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
                htmlContent += '</div>';
            } else if (shipment.status == 'Arrived') {
                htmlContent += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px; position:relative;">';
                htmlContent += '<span style="color: #ffffff; font-size: 15px; font-weight: 600; position: absolute; top: -2px; left: 3px;;">&check;</span>'
                htmlContent += '</div>';
            } else {
                htmlContent += '<div style="width: 15px; height: 15px; background-color: #5BCA45; margin-right: 5px;">';
                htmlContent += '</div>';
            }

            htmlContent += '</td>';
            htmlContent += '<td>'
            htmlContent += '<span class="pull-left bold">Shipment ';
            htmlContent += '<a href="#/view-shipment-detail?sn='+shipment.deviceSN+'&trip='+shipment.tripCount+'">';
            htmlContent +=  '<u style="color: #ffffff" ">' + shipment.deviceSN + ' (' + shipment.tripCount + ')</u></a>';
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
            htmlContent += '</tr>';
            htmlContent += '</table>';
            htmlContent += '</div>';                                                                                        //-2

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
            htmlContent += '<td>';

            if (shipment.siblingCount > 0) {
                htmlContent += '<span class="pull-left">';
                htmlContent += '<img src="theme/img/similarTrips.png"/>'
                htmlContent += shipment.siblingCount + ' others';
                htmlContent += '</span>';
            }

            htmlContent += '</td>';
            htmlContent += '</tr>';
            //-- interim stop here

            if (shipment.interimLocations) {
                angular.forEach(shipment.interimLocations, function(v, k) {
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
            htmlContent += '<img class="rev-horizon" src="theme/img/locationStop.png">';
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
            htmlContent += '</div>';
            htmlContent += '<div style="background-color: #ffffff; padding: 5px; border-top: 1px solid; border-color: '+shipment.color.code+'">'; //+5
            htmlContent += '<table style="text-align: left;">';
            htmlContent += '<tr>';
            htmlContent += '<td>';
            htmlContent += '<span style="font-weight: 600; padding-right: 5px">Desc:</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span>'+shipment.shipmentDescription+'</span>'
            htmlContent += '</td>';
            htmlContent += '</tr>';

            htmlContent += '<tr>';
            htmlContent += '<td>';
            htmlContent += '<span style="font-weight: 600; padding-right: 5px">Status:</span>';
            htmlContent += '</td>';
            htmlContent += '<td>';
            htmlContent += '<span>'+shipment.status+'</span>'
            htmlContent += '</td>';
            htmlContent += '</tr>'

            var temperature = shipment.lastReadingTemperature;
            if (!isNaN(temperature)) {
                temperature = temperature.toFixed(1) + '℃';
            } else {
                temperature = '';
            }
            var lastMoment = shipment.lastReadingTimeISO ? shipment.lastReadingTimeISO : '';
            if (lastMoment) {
                $log.debug('RunningTimezone', $rootScope.RunningTimeZoneId);
                lastReading = moment(lastMoment).tz($rootScope.RunningTimeZoneId).format('h:ma DD-MMM-YYYY');
            }

            lastReading = shipment.lastReadingTime ? shipment.lastReadingTime : lastReading;

            if (temperature || lastReading) {
                htmlContent += '<tr>';
                htmlContent += '<td>';
                htmlContent += '<span style="font-weight: 600; padding-right: 5px">Last Reading:</span>';
                htmlContent += '</td>';
                htmlContent += '<td>';
                htmlContent += temperature + ' at ' + lastReading;
                htmlContent += '</td>';
                htmlContent += '</tr>'
            }
            htmlContent += '</table>'
            htmlContent += '</div>';
            htmlContent += '</div>';

            //-- control
            var controlInfo = document.createElement('div');
            controlInfo.innerHTML = htmlContent;

            marker.addListener('click', function() {
                if (VM.map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0) {
                    var pContent = VM.map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
                    if (!pContent.childNodes[0].isEqualNode(controlInfo.childNodes[0])) {
                        VM.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlInfo);
                    }
                } else {
                    VM.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlInfo);
                }
            });
            VM.dynMarkers.push(marker);
            bounds.extend(llng);
        });

        VM.markerClusterer = new MarkerClusterer(VM.map, VM.dynMarkers, {minimumClusterSize:4});
        VM.markerClusterer.addListener('click', function() {
            $log.debug('Marker clustered clicked!');
        });
        VM.map.setCenter(bounds.getCenter());
        if(bounds != null){
            VM.map.fitBounds(bounds);
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
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
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