appCtrls.controller('ViewShipmentCtrl', function ($scope, rootSvc, webSvc, localDbSvc, $filter, temperatureFilter, Color,
                                                  $rootScope, $state, $window, $log, $timeout, $interval, $controller) {
    rootSvc.SetPageTitle('View Shipments');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipments");

    var VM = this;

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
        sc: 'shipmentId',
        so: 'desc'
    };
    VM.sc = 'shipmentId1';

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

    VM.AdvanceSearch = true;
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

        webSvc.getShipments(VM.ViewShipment).success( function (data, textStatus, XmlHttpRequest) {
            
            if (data.status.code == 0) {
                VM.ShipmentList = data.response;
                $log.debug('ShipmentList', VM.ShipmentList);
                VM.ShipmentList.totalCount = data.totalCount;
            } else if(data.status.code == 1){
                $rootScope.redirectUrl = "/view-shipment";
                $rootScope.go("login");
            };
            
            VM.loading = false;

        }).error( function (xmlHttpRequest, textStatus, errorThrown) {
            //alert("Status: " + textStatus + "; ErrorThrown: " + errorThrown);
            VM.loading = false;
        }).then(function() {
            angular.forEach(VM.ShipmentList, function(v, k) {
                if (!isNaN(v.deviceSN)) {
                    VM.ShipmentList[k].deviceSN = parseInt(v.deviceSN, 10);
                }
                //-- position
                VM.ShipmentList[k].position = [v.lastReadingLat, v.lastReadingLong];
                VM.ShipmentList[k].icon = {
                    url:"theme/img/transparent16.png",
                    scaledSize:[16, 16],
                    anchor:[8, 8]
                }
                //bounds.extend(new google.maps.LatLng(v.lastReadingLat, v.lastReadingLong));
            });
            VM.updateMap(null);
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
            PageSize: "20",
            so: 'desc',
            sc: 'shipmentDate'
        };
        VM.sc = "shipmentDate1";

        BindShipmentList();
    }

    VM.BindCards = function () {
        BindShipmentList();
    }

    BindShipmentList();

    $scope.$on('mapInitialized', function(event, m) {
        VM.updateMap(m);
    });

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

    webSvc.getDevices(1000000, 1, 'locationName', 'asc').success( function (data) {
        // console.log("Devi", data);
        if (data.status.code == 0) {
            VM.TrackerList = data.response;
            // console.log(data.response);
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
    VM.PageChanged = function (page) {
        VM.ViewShipment.pageIndex = page;
        //console.log("PAGE", page);
        BindShipmentList();
    }

    VM.viewCard = false;
    VM.viewTable = true;
    VM.viewMap = false;
    VM.showTable = function() {
        VM.viewTable = true;
        VM.viewCard = false;
        VM.viewMap = false;
        VM.AdvanceSearch = true;
    };
    VM.showCard = function() {
        VM.viewTable = false;
        VM.viewCard = true;
        VM.viewMap = false;

        VM.AdvanceSearch = true;
    }
    VM.showMap = function() {
        VM.viewTable = false;
        VM.viewCard = false;
        VM.viewMap = true;

        VM.AdvanceSearch = false;
    }
    var filter = $filter('filter');
    VM.updatePolylines = function (shipment, key) {
        var valFrLocName = shipment.shippedFrom ? shipment.shippedFrom : '';
        var valToLocName = shipment.shippedTo ? shipment.shippedTo : '';
        var homeLocation = filter(VM.LocationListFrom, {locationName: valFrLocName}, true);
        $log.debug('HomeLocation', homeLocation);
        if (homeLocation && (homeLocation.length > 0)) {
            homeLocation = homeLocation[0].location;
        } else {
            homeLocation = null;
        }
        var destLocation = filter(VM.LocationListTo, {locationName: valToLocName}, true);
        if (destLocation && (destLocation.length > 0)) {
            destLocation = destLocation[0].location;
        } else {
            destLocation = null;
        }
        if (homeLocation && destLocation) {
            $log.debug('Home/Dest', homeLocation, destLocation);
            //create home-marker & dest-marker
            var homeHtmlIcon = '<i class="fa fa-home fa-2x" aria-hidden="true"></i>';
            var homMarker = new RichMarker({
                position: new google.maps.LatLng(homeLocation.lat, homeLocation.lon),
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.TOP,
                content: homeHtmlIcon,
            });

            var destHtmlIcon = '<i class="fa fa-flag fa-flip-horizontal fa-2x"></i>';
            var destMarker = new RichMarker({
                position: new google.maps.LatLng(destLocation.lat, destLocation.lon),
                map: VM.map,
                flat: true,
                anchor: RichMarkerPosition.TOP,
                content: destHtmlIcon,
            });

            var path = [
                {lat: homeLocation.lat, lng: homeLocation.lon},
                {lat: shipment.lastReadingLat, lng: shipment.lastReadingLong},
                {lat: destLocation.lat, lng: destLocation.lon},
            ];

            $log.debug('Path', path);

            var flightPath = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: Color[key].code,
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            flightPath.setMap(VM.map);
        }
    }

    VM.updateMap = function(map) {
        if (map) {
            VM.map = map;
        }
        if (VM.map){
            $log.debug('update Maps', VM.ShipmentList);
            if (VM.dynMarkers) {
                // Unset all markers
                var i = 0, l = VM.dynMarkers.length;
                for (i; i<l; i++) {
                    VM.dynMarkers[i].setMap(null)
                }

                // Clears all clusters and markers from the clusterer.
                VM.markerClusterer.clearMarkers();
            }
            VM.dynMarkers = [];

            // console.log('Custom Markers', VM.map.customMarkers);
            var bounds = new google.maps.LatLngBounds;
            var openedInfoWindow = [];
            angular.forEach(VM.ShipmentList, function(shipment, key) {
                var llng = new google.maps.LatLng(shipment.lastReadingLat, shipment.lastReadingLong);
                /*var marker = new MarkerWithLabel({
                    position: llng,
                    map: VM.map,
                    icon: 'theme/img/tinyLocationStop.png',
                    labelContent: shipment.deviceSN + "(" + shipment.tripCount + ")",
                    labelAnchor: new google.maps.Point(-15, 15),
                    labelClass: "labels", // the CSS class for the label
                    labelStyle: {opacity: 1}
                });*/

                var htmlIcon = '';
                htmlIcon += "<table style=''>";
                htmlIcon += "<tr>";
                htmlIcon += "<td>";
                htmlIcon += "<div style=' border:2px solid #5e5e5e; width: 16px; height: 16px; background-color: #5BCA45; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);'></div>";
                htmlIcon += "</td>";
                htmlIcon += "<td>";
                htmlIcon += "<div style='background-color: white'>";
                htmlIcon += shipment.deviceSN + "(" + shipment.tripCount + ")";
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
                htmlContent += '<div class="portlet box green" style="margin-bottom: 0px!important; border: 0px!important;">';  //+1
                htmlContent += '<div class="portlet-title">';                                                                   //+2
                htmlContent += '<div class="caption">'+shipment.shipmentDescription+'</div>';                                   //+3 -3
                htmlContent += '<div class="pull-right" style="margin-top:6px">';                                               //+4
                htmlContent += '<a href="#/view-shipment-detail?sn='+shipment.deviceSN+'&trip='+shipment.tripCount+'"';
                htmlContent += 'class="btn btn-sm green-meadow" style="background-color:green;border-color:green">View</a>'
                htmlContent += '</div>';                                                                                        //-4
                htmlContent += '</div>';                                                                                        //-2
                htmlContent += '<div class="portlet-body" style="padding-top: 0px!important;padding-bottom: 0px!important; margin-bottom: 20px">'; //+5
                htmlContent += '<div class="row">';                                                                                               //+6
                htmlContent += '<table class="table" style="margin-bottom: 0px!important;">';
                htmlContent += '<tr>';
                htmlContent += '<td>';
                htmlContent += '<h5 class="pull-left">Tracker ' + shipment.deviceSN + ' (' + shipment.tripCount + ')</h5>'
                htmlContent += '</td>';
                htmlContent += '<td>';

                if (shipment.siblingCount > 0) {
                    htmlContent += '<h5 class="text-center">';
                    htmlContent += '<img src="theme/img/similarTrips.png"/>'
                    htmlContent += shipment.siblingCount + ' similar trips';
                    //htmlContent += '<i uib-tooltip="Waiting your tooltip text" tooltip-append-to-body="true" tooltip-trigger="mouseenter" tooltip-placement="top" class="fa fa-info-circle"></i>';
                    htmlContent += '</h5>';
                }

                htmlContent += '</td>';
                htmlContent += '<td>';
                htmlContent += '<h5 class="pull-right">';
                if (shipment.alertSummary.LightOn)          htmlContent += '<img src="theme/img/alertLightOn.png"/>';
                if (shipment.alertSummary.LightOff)         htmlContent += '<img src="theme/img/alertLightOff.png"/>';
                if (shipment.alertSummary.Cold)             htmlContent += '<img src="theme/img/alertCold.png"/>';
                if (shipment.alertSummary.Hot)              htmlContent += '<img src="theme/img/alertHot.png"/>';
                if (shipment.alertSummary.CriticalCold)     htmlContent += '<img src="theme/img/alertCriticalCold.png"/>';
                if (shipment.alertSummary.CriticalHot)      htmlContent += '<img src="theme/img/alertCriticalHot.png"/>';
                if (shipment.alertSummary.Battery)          htmlContent += '<img src="theme/img/alertBattery.png"/>';
                if (shipment.alertSummary.MovementStart)    htmlContent += '<img src="theme/img/alertShock.png"/>';
                htmlContent += '</h5>';
                htmlContent += '</td>';
                htmlContent += '</tr>';
                htmlContent += '</table>';

                htmlContent += '</div>'; //-- class row                                                                                 //-6
                htmlContent += '<div class="row">'; //row2                                                                              //+7
                htmlContent += '<div class="col-sm-12">'                                                                                //+8
                htmlContent += '<p class="col-xs-1 text-left no-margin no-padding"><i class="fa fa-home fa-2x"></i></p>';
                var assetTypeAndNum = '';
                assetTypeAndNum += (shipment.assetType ? shipment.assetType : '');
                assetTypeAndNum += (shipment.assetNum ? shipment.assetNum : '');
                assetTypeAndNum = (assetTypeAndNum ? assetTypeAndNum + '-' : '');
                htmlContent += '<p class="col-xs-10 no-margin no-padding text-center">' + assetTypeAndNum + shipment.status +'</p>';
                htmlContent += '<p class="col-xs-1 text-right no-margin no-padding"><i class="fa fa-flag fa-flip-horizontal fa-2x"></i></p>';
                htmlContent += '</div>'; //-- col-sm-12                                                                                 //-8
                htmlContent += '</div>'; //-- row2                                                                                      //-7

                htmlContent += '<div class="row">'; //--row3                                                                            //+9
                htmlContent += '<div class="col-sm-12">'                                                                                //+10
                htmlContent += '<div class="progress" style="max-height:5px">';                                                         //+11
                htmlContent += '<div style="width:' +(shipment.percentageComplete + 1) * 100 / 101 +'%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="'+ shipment.percentageComplete +'" role="progressbar" class="progress-bar progress-bar-info">'; //+12
                htmlContent += '<span class="sr-only">' + shipment.percentageComplete+ '% Complete </span>';
                htmlContent += '</div>';                                                                                                //-12
                htmlContent += '</div>';                                                                                                //-11
                htmlContent += '</div>';                                                                                                //-10
                htmlContent += '</div>';                                                                                                //-9

                htmlContent += '<div class="row">'; // row3                                                                             //+13
                htmlContent += '<div class="col-xs-6 text-left">';                                                                      //+14
                if (shipment.shippedFrom) {
                    htmlContent += '<p class="bold no-margin no-padding">'+shipment.shippedFrom+'</p>';
                }
                htmlContent += '<p class="text-muted no-margin no-padding">'+ shipment.shipmentDate+'</p>';
                htmlContent += '</div>';                                                                                                //-14

                htmlContent += '<div class="col-xs-6 text-right">';                                                                     //+15
                if (shipment.shippedTo) {
                    htmlContent += '<p class="bold no-margin no-padding">'+shipment.shippedTo+'</p>';
                }
                if (shipment.status == 'Arrived') {
                    htmlContent += '<p class="text-muted no-margin no-padding">';
                    htmlContent += '<span>ARRIVED AT</span>: '+shipment.actualArrivalDate+'</p>';
                }
                htmlContent += '</div>'; //col-xs-6 text-right                                                                          //-15
                htmlContent += '</div>'; // row3 end                                                                                    //-13
                htmlContent += '<!--row3-->'
                htmlContent += '</div>'; //-- portlet-body                                                                       //-5

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

                if (temperature || lastReading) {
                    htmlContent += '<div class="shipment-last-reading">'
                    htmlContent += '<div class="text-center">';
                    htmlContent += 'Last Reading ' + temperature + ' at ' + lastReading;
                    htmlContent += '</div>';
                    htmlContent += '</div>';
                }

                htmlContent += '</div>';


                var infowindow = new InfoBubble({
                    content: htmlContent,
                    shadowStyle: 1,
                    padding: 0,
                    borderRadius: 4,
                    arrowSize: 10,
                    borderWidth: 1,
                    borderColor: '#7ed56d',
                    disableAutoPan: true,
                    arrowPosition: 10,
                    //backgroundClassName: 'phoney',
                    //hideCloseButton:true,
                    //closeSrc:'theme/img/slimTimes.png',
                    arrowStyle: 2,
                    maxHeight: 200,
                    minWidth: 420
                });
                marker.addListener('click', function() {
                    if (infowindow.isOpen()) {
                        infowindow.close();
                    } else {
                        infowindow.open(VM.map, marker);
                    }
                    angular.forEach(openedInfoWindow, function(info, k) {
                        if (info.isOpen()) {
                            info.close();
                        }
                    })
                    openedInfoWindow.length = 0;
                    openedInfoWindow.push(infowindow);
                });
                VM.dynMarkers.push(marker);
                bounds.extend(llng);

                //draw polylines
                VM.updatePolylines(shipment, key);
            });

            VM.markerClusterer = new MarkerClusterer(VM.map, VM.dynMarkers, {});
            VM.map.setCenter(bounds.getCenter());
            if(bounds != null){
                VM.map.fitBounds(bounds);
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