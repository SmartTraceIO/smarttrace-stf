appCtrls.controller('ViewShipmentDetailShareCtrl', ViewShipmentDetailShareCtrl);

function ViewShipmentDetailShareCtrl($scope, rootSvc, webSvc, localDbSvc, $stateParams, $uibModal, $state, $q, $log,
              $filter, $sce, $rootScope, $timeout, $window, $location, $interval, $controller, NgMap, Api, localStorageService) {
    rootSvc.SetPageTitle('View Shipment Detail');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipment Detail");
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

    var tempUnits = localDbSvc.getDegreeUnits();
    if (tempUnits == 'Celsius') {
        // tempUnits = 'C';
        tempUnits = '\u2103';
    } else {
        // tempUnits = 'F';
        tempUnits = '\u2109';
    }

    var orderBy = $filter('orderBy');

    if ($stateParams.vsId) {
        $scope.ShipmentId = $stateParams.vsId;
        $scope.downloadUrl = Api.url + 'getReadings/' + localDbSvc.getToken() + "?shipmentId="+$scope.ShipmentId;
        $scope.downloadPdfUrl = Api.url + 'getShipmentReport/' + localDbSvc.getToken() + "?shipmentId="+$scope.ShipmentId;
    } else {
        $scope.sn = $stateParams.sn;
        $scope.trip = $stateParams.trip;
        $scope.downloadUrl = Api.url + 'getReadings/' + localDbSvc.getToken() + "?sn="+$scope.sn + "&trip="+$scope.trip;
        $scope.downloadPdfUrl = Api.url + 'getShipmentReport/' + localDbSvc.getToken() + "?sn="+$scope.sn + "&trip="+$scope.trip;
    }



    var plotLines = [];
    $scope.specialMarkers = [];
    $scope.alertsWithCorrectiveActions = [];
    $scope.normalMarkers = [];
    $scope.previousActiveMarker = -1;
    //includes all tracker info here
    $scope.trackers = [];
    var trackerRoute = [];
    $scope.objectToRemove = [];
    //----------------------------------------------
    $scope.isLoading = true;
    //----------------------------------------------

    //------MAIN TRACKER INDEX ------
    $scope.MI = 0;
    //$scope.mapInfo = {};
    var bounds= null;

    //------CHART SERIES DATA  ------
    var chartSeries = [];
    var subSeries = [];
    var alertData = [];
    var lightPlotBand = [];
    var noteData = [];

    $scope.roles = {};
    $scope.roles.SmartTraceAdmin = 1000;
    $scope.roles.Admin = 999;
    $scope.roles.Normal = 99;
    $scope.roles.Basic = 9;
    $scope.getRole = function () {
        if (!$rootScope.User || !$rootScope.User.roles) {
            return $scope.roles.Basic;
        }
        else if ($rootScope.User.roles.indexOf('SmartTraceAdmin') >= 0) {
            return $scope.roles.SmartTraceAdmin;
        } else if ($rootScope.User.roles.indexOf('Admin') >= 0) {
            return $scope.roles.Admin;
        } else if ($rootScope.User.roles.indexOf('Normal') >= 0) {
            return $scope.roles.Normal;
        } else {
            return $scope.roles.Basic;
        }
    };


    //google map first point
    $scope.firstPoint = {};
    $scope.currentPoint = {};
    $scope.currentPoint.icon = {
        url: 'theme/img/edot.png'
    };
    //$scope.trackerPath = [];
    $scope.trackerColor = rootSvc.getTrackerColor(0);
    $scope.trackerMsg = [];

    //------Reload data every 10 min BEGIN-------
    var refreshTimer;
    function refreshData(){
        loadTrackerData();
        // console.log("Updating tracker data...");
        refreshTimer = $timeout(refreshData, 300000);
    }
    var tickInterval = 5;

    refreshTimer = $timeout(refreshData, 300000);
    $scope.$on("$destroy", function(event){
        $timeout.cancel(refreshTimer);
        if(trackerRoute != null && trackerRoute.length > 0){
            for(var i = 0; i< trackerRoute.length; i++) {
                trackerRoute[i].setMap(null);
            }
            trackerRoute = [];
        }
    });

    $scope.Print = function(){
        setTimeout(print, 100);
    };
    function print(){
        $window.print();
    }

    $scope.ViewReport = function($e, url) {
        $e.preventDefault();
        var w = window.innerWidth * 0.7; //70% of fullwidth
        var h = window.innerHeight * 0.95;
        var options = "toolbar=0, titlebar=0, scrollbars=1, location=0, resizable=no, menubar=0, status=0, height="+ h +", width=" + w;
        $log.debug('#Url', url);
        window.open(url,"_blank", options);
    };

    $scope.shareReport = function($e) {
        $e.preventDefault();
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/share-report.html',
            controller: 'ShareReportCtrl as VM',
            resolve: {
                sn: function() {
                    return $scope.sn;
                },
                trip: function() {
                    return $scope.trip;
                }
                //note : function() {
                //    return note;
                //}
            }
        });
        modalInstance.result.then(
            /*function(result) {
                //$scope.trackerInfo.shipmentDescription = result;
                console.log('Result', result);
                if (result) {
                    var params = null;
                    if (result.shipmentId) {
                        params = {
                            params: {
                                shipmentId: result.shipmentId
                            }
                        };
                    } else {
                        params = {
                            params: {
                                sn: result.sn,
                                trip: result.trip
                            }
                        };
                    }
                    var promise = promiseGetNotes(params);
                    promise.then(
                        function (res) {
                            console.log('Note', res);
                            $scope.trackerInfo.notes = res;
                            $scope.shipmentNotes = res;
                            prepareMainHighchartSeries();
                            prepareNoteChartSeries();
                            refreshHighchartSeries();
                        },
                        function (status) {
                        }
                    );
                }
            }*/
        );


    };

    $scope.ViewReading = function($e, sn, trip) {
        $e.preventDefault();
        var url = $state.href('viewshipmentdetailtable', {sn:sn, trip: trip});
        var w = window.innerWidth * 0.7; //70% of fullwidth
        var h = window.innerHeight * 0.95;
        var options = "toolbar=0, titlebar=0, scrollbars=1, location=0, resizable=no, menubar=0, status=0, height="+ h +", width=" + w;
        $log.debug('#Url', url);
        window.open(url,"_blank", options);
    };

    $scope.map = null;
    //-reset zoom
    $scope.oldBound = null;
    var checkFirst = 0;
    localStorageService.set('zooom', null);
    //$scope.oldBound = localStorageService.get('zooom');
    function updateMapData(index){
        NgMap.getMap('shipment-detail-map').then(function(map) {
            $scope.map = map;
            drawMap(map, index);
        }).then(function() {
            $scope.map.addListener('bounds_changed', function() {
                if (checkFirst > 0) {
                    var zooom = $scope.map.getBounds();
                    localStorageService.set('zooom', zooom);
                }
                checkFirst++;
            });
        });
    }
    function  drawMap(map, index) {
        var locations = subSeries[index];
        var trackerPath = [];
        $scope.specialMarkers.length = 0;
        $scope.normalMarkers.length = 0;

        // console.log($scope.map);
        bounds = new google.maps.LatLngBounds;

        for(i = 0 ; i < locations.length; i ++){
            if (locations[i].lat == 0 && locations[i].lng==0) {
                continue;
            }
            if (!$scope.trackerInfo.startLocationForMap) {
                $scope.trackerInfo.startLocationForMap = {};
                $scope.trackerInfo.startLocationForMap.latitude = locations[i].lat;
                $scope.trackerInfo.startLocationForMap.longitude = locations[i].lng;
            }
            var ll = new google.maps.LatLng(locations[i].lat, locations[i].lng);
            if (locations[i].notOptimize === true || !refinePath(ll, trackerPath)
            		|| locations[i].alerts.length > 0) {
                trackerPath.push(ll);
                bounds.extend(ll);
                //markers
                var pos = [locations[i].lat, locations[i].lng];
                if (locations[i].alerts.length > 0) {
                    //console.log('Alert', locations[i].alerts)
                    //console.log("Alert type:", locations[i].alerts[0].type)
                    if (locations[i].alerts[0].type.toLowerCase() == 'lastreading') {
                        $scope.specialMarkers.push({
                            index: $scope.specialMarkers.length,
                            len: 16,
                            oi: i,
                            pos: pos,
                            data: locations[i],
                            icon: {
                                path: 'M-8,-8 L-8,8 L8,8 L8,-8 Z',
                                fillColor: $scope.trackers[index].deviceColor,
                                fillOpacity: 1,
                                scale: 1,
                                strokeWeight: 1,
                                strokeColor: "#FFF"
                            },
                            tinyIconUrl: "theme/img/tinyTracker" + (index + 1) + ".png"
                        });
                    } else if (locations[i].alerts[0].type.toLowerCase() == 'lighton' || locations[i].alerts[0].type.toLowerCase() == 'lightoff') {
                    } else {
                        $scope.specialMarkers.push(
                            {
                                index: $scope.specialMarkers.length,
                                len: 24,
                                oi: i,
                                pos: pos,
                                data: locations[i],
                                icon: {
                                    url: "theme/img/alert" + locations[i].alerts[0].type + ".png",
                                    scaledSize: [24, 24],
                                    anchor: [12, 12]
                                },
                                tinyIconUrl: "theme/img/tinyAlert" + locations[i].alerts[0].type + ".png"
                            }
                        );
                    }
                }
            }
        }

        if(trackerRoute != null && trackerRoute.length > 0){
            for (var i = 0; i< trackerRoute.length; i++) {
                trackerRoute[i].setMap(null);
            }
            trackerRoute = [];
        }

        var color = $scope.trackers[index].deviceColor;
        color = colourNameToHex(color);
        console.log("Color", color);
        var arrowIcon = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 2,
            strokeWeight:2,
            strokeColor: shadeColor2(color, -0.3),
            fillColor: shadeColor2(color, -0.3),
            fillOpacity: 1
        };
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var whd = google.maps.geometry.spherical.computeDistanceBetween(ne, sw);
        var le = trackerPath.length;
        var step = le/7;
        var count = 0;
        for (var i = 0; i < le-1; i++) {
            var tll = trackerPath[i];
            var tll1 = trackerPath[i+1];
            var pt = [{lat:tll.lat(), lng:tll.lng()}, {lat:tll1.lat(), lng:tll1.lng()}];
            var route = null;
            var d = google.maps.geometry.spherical.computeDistanceBetween(tll, tll1);
            if (d > whd/10 || count >= step) {
                count = 0;
                route = new google.maps.Polyline({
                    path:pt,
                    strokeColor: $scope.trackers[index].deviceColor,
                    strokeOpacity: 1,
                    strokeWeight: 4,
                    map: map,
                    icons: [{
                        icon: arrowIcon,
                        offset: '50%'
                    }],
                });
            } else {
                count++;
                route = new google.maps.Polyline({
                    path:pt,
                    strokeColor: $scope.trackers[index].deviceColor,
                    strokeOpacity: 1,
                    strokeWeight: 4,
                    map: map,
                });
            }
            trackerRoute.push(route);
        }
        $scope.oldBound = localStorageService.get('zooom');
        if (checkFirst == 0) {
            if (google.maps.geometry.spherical.computeDistanceBetween(ne, sw) < 10000) {
                map.setZoom(10);
                map.setCenter(bounds.getCenter());
            } else {
                map.fitBounds(bounds);
            }
        } else {
            //map.fitBounds($scope.oldBound);
        }
    }


    $scope.switchTracker = function($event, index){
        $event.preventDefault();
        $location.search('sn', $scope.trackers[index].deviceSN);
        $location.search('trip', $scope.trackers[index].tripCount);
        $scope.chartConfig.redraw= true;

        $scope.changeActiveTracker(index);
    };

    $scope.changeActiveTracker = function(index){
        $log.debug('changeActiveTracker...', index);
        $scope.MI = index;
        if($scope.trackers[index].locations.length == 0){
            toastr.warning("No data recorded yet!", "Empty Track");
            return;
        }
        $scope.shipmentNotes = $scope.trackers[$scope.MI].notes;

        prepareMainHighchartSeries();
        prepareTrackerMessage();
        prepareAlertHighchartSeries();
        prepareNoteChartSeries();
        refreshHighchartSeries();
        //-------PREPARE HIGHCHART DATA-------
        $scope.trackerInfo = $scope.trackers[index];
        //-- update trackerInfo here
        $scope.trackerInfo.shutdownDeviceAfterMinutesText = parseInt($scope.trackerInfo.shutdownDeviceAfterMinutes/60) + " hr(s) after arrival";
        $scope.trackerInfo.shutDownAfterStartMinutesText = parseInt($scope.trackerInfo.shutDownAfterStartMinutes/60) + " hr(s) after start";

        setArrivalNotificationInfo($scope.trackerInfo);

        //check if latest shipment here
        $scope.shutdownAlready=false;
        $scope.suppressAlready=false;

        if ($scope.trackerInfo.shutdownTime) {
            $scope.shutdownAlready = true;
        }
        if ($scope.trackerInfo.status == 'Ended' || $scope.trackerInfo.status == 'Arrived') {
            $scope.isEndedOrArrived = true;
        }
        if ($scope.trackerInfo.alertsSuppressionTime) {
            $scope.suppressAlready = true;
        }

        updateTrackerInfo();
        updatePlotLines();
        updateMapData($scope.MI);
    };

    function setArrivalNotificationInfo(trackerInfo) {
    	trackerInfo.arrivalNotificationLabel = 'Report sent';
        trackerInfo.arrivalNotificationText = "No";

        if (trackerInfo.arrivalReportSent) {
            trackerInfo.arrivalNotificationText = "Yes";
        } else if (trackerInfo.status == 'Default' || trackerInfo.status == 'InProgress') {
        	trackerInfo.arrivalNotificationLabel = 'Send report';
        	if (trackerInfo.sendArrivalReport) {
                trackerInfo.arrivalNotificationText = "On arrival";
                
                if (trackerInfo.arrivalReportOnlyIfAlerts) {
                	trackerInfo.arrivalNotificationText += ", if alerts";
                }
        	}
        }

        trackerInfo.isNotifying = false;
        if (trackerInfo.arrivalNotificationWithinKm) {
            trackerInfo.isNotifying = true;
        }
    }

    function updateTrackerInfo() {
        //update trackerInfo
        $scope.trackerInfo.endLocationText = "";
        $scope.trackerInfo.endLocationTextPrefix = "";
        if (!$scope.trackerInfo.endLocation) {
            //-- status == default
            if ($scope.trackerInfo.status=="Default") {
                $scope.trackerInfo.endLocationAlternatives;
                $scope.trackerInfo.endLocationTextPrefix = "To be determined";
                $scope.trackerInfo.endLocationText = getEndLocationAlt();
            } else if ($scope.trackerInfo.status=="Ended") {
                $scope.trackerInfo.endLocationTextPrefix = "Undetermined";
                $scope.trackerInfo.endLocationText = getEndLocationAlt();
            } else if ($scope.trackerInfo.status=="Arrived") {
                $scope.trackerInfo.endLocationTextPrefix = "Undetermined";
                $scope.trackerInfo.endLocationText = getEndLocationAlt();
            }
        } else {
            if ($scope.trackerInfo.status=="Default") {
                $scope.trackerInfo.endLocationTextPrefix = "To be determined";
                $scope.trackerInfo.endLocationText = $scope.trackerInfo.endLocation;
            } else if ($scope.trackerInfo.status=="Ended") {
                $scope.trackerInfo.endLocationTextPrefix = "Undetermined";
                $scope.trackerInfo.endLocationText = $scope.trackerInfo.endLocation;
            } else if ($scope.trackerInfo.status=="Arrived") {
                $scope.trackerInfo.endLocationTextPrefix = $scope.trackerInfo.endLocation;
            }
        }

        //--update for map
        if ($scope.trackerInfo.status =="Arrived") {
            $scope.trackerInfo.endLocationIcon = {
                'url':'theme/img/locationStopRev.png',
                'anchor': [12,12]};
        } else {
            $scope.trackerInfo.endLocationIcon = {
                'url':'theme/img/locationStopToBeDetermined.png',
                'anchor': [12,12]};
        }

        if (!$scope.trackerInfo.startLocation) {
            $scope.trackerInfo.startLocationText = "Undetermined";
        } else {
            $scope.trackerInfo.startLocationText = $scope.trackerInfo.startLocation;
        }

        //update interimStops
        if ($scope.trackerInfo.interimStops) {
            var items = $scope.trackerInfo.interimStops.slice();
            $scope.trackerInfo.interimStops = items;
        }
    }

    function getEndLocationAlt() {
        var endAlter = $scope.trackerInfo.endLocationAlternatives;
        var length = endAlter.length;
        if (length <= 0) {
            return "";
        } else if (length == 1) {
            return endAlter[0].locationName;
        } else if (length == 2) {
            return endAlter[0].locationName + ", " + endAlter[1].locationName;
        } else {
            return endAlter[0].locationName + ", " + endAlter[1].locationName + " or " + (length - 2) + " others";
        }
    }

    function updatePlotLines(){
        //--reset plotline
        plotLines.length = 0;
        var ti = subSeries[$scope.MI];
        var lastPoint = ti.length - 1;

        var firstTime = parseDate(ti[0].timeISO);
        var lastTime = parseDate(ti[lastPoint].timeISO);

        //var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
        var mainTrackerPeriod = lastTime - firstTime;

        mainTrackerPeriod /= 25;
        var color = "#000";
        var width = 2;
        // <b class="bold-font">' + $scope.mapInfo.startLocation + '</b>
        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: parseDate(ti[0].timeISO), // Value of where the line will appear
            //value: parseDate($scope.mapInfo.startTimeISO), // Value of where the line will appear
            width: width, // Width of the line
            label: {
                text: '<table><tr><td style="vertical-align:top;"><img src="theme/img/locationStart.png"></td>' + 
                        '<td><br/>' + 
                        '</td></tr></table>',
                rotation: 0,
                useHTML: true,
                align: 'left',
                y: -20,
                x: -10
            }
        });

        //TODO add interim stops
        for (var i = 0; i < $scope.trackerInfo.interimStops.length; i++) {
        	var stp = $scope.trackerInfo.interimStops[i];

        	plotLines.push({
                color: color, // Color value
                dashStyle: 'solid', // Style of the plot line. Default to solid
                value: parseDate(stp.stopDateISO), // Value of where the line will appear
                //value: parseDate($scope.mapInfo.startTimeISO), // Value of where the line will appear
                width: width, // Width of the line
                label: {
                    text: '<div style="display: table-cell; vertical-align: middle;' + 
                    		' border-radius: 50% !important; text-align: center;' + 
                    		' border: 1px solid black;font-weight: bold; background: white;' +
                    		' width: 20px; height: 20px">' + 
                    		(i + 1) + 
                            '<div>',
                    rotation: 0,
                    useHTML: true,
                    align: 'left',
                    y: -20,
                    x: -10
                }
            });
        }
        
        var startLocationText='';
        if ($scope.trackerInfo.startLocation) {
            startLocationText = $scope.trackerInfo.startLocation;
        } else {
            startLocationText = "Undetermined";
        }
        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: parseDate(ti[0].timeISO), // Value of where the line will appear
            width: width, // Width of the line
            label: {
                text: '<span><b class="bold-font">' + startLocationText + '</b></span>',
                rotation: 0,
                useHTML: true,
                align: 'left',
                y: -15,
                x: 15
            }
        });

        
        var dotIcon = "";
        var dotText = "";
        var endLocationText = '';
        if($scope.trackerInfo.status == "Arrived"){
            time = parseDate($scope.trackerInfo.arrivalTimeISO);
        } else {
            time = new Date();

        }

        if (!$scope.trackerInfo.endLocation) {
            if ($scope.trackerInfo.status == "Default") {
                endLocationText = "To be determined";
            } else {
                endLocationText = "Undetermined";
            }
        } else {
            endLocationText = $scope.trackerInfo.endLocation;
        }

        if(time > parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod ||
            $scope.trackers[$scope.MI].status.toLowerCase() != "arrived"){
            color = "#ccc";
            width = 1;
            time = parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod + 1;
            dotIcon = '<span><img src="theme/img/locationStopToBeDetermined.png"></span>';
        } else {
            dotIcon = '<span><img class="rev-horizon" src="theme/img/locationStop.png"></span>';
        }
        dotText = '<span><b class="bold-font">' + endLocationText + '</b></span>';

        //console.log("Shipment-status", status)
        if (time < (firstTime + lastTime)/2) {
            plotLines.push({
                color: color, // Color value
                dashStyle: 'solid', // Style of the plot line. Default to solid
                value: time,//mainData[lastPoint][0], // Value of where the line will appear
                width: width, // Width of the line
                label: {
                    text: dotIcon,
                    rotation: 0,
                    useHTML: true,
                    align: 'center',
                    y: -10,
                    x: -10
                }
            });

            plotLines.push({
                color: color, // Color value
                value: time,//mainData[lastPoint][0], // Value of where the line will appear
                width: 1, // Width of the line
                label: {
                    text: dotText,
                    rotation: 0,
                    useHTML: true,
                    align: 'left',
                    y: -5,
                    x: 0
                }
            });
        } else {
            plotLines.push({
                color: color, // Color value
                dashStyle: 'solid', // Style of the plot line. Default to solid
                value: time,//mainData[lastPoint][0], // Value of where the line will appear
                width: width, // Width of the line
                label: {
                    text: dotIcon,
                    rotation: 0,
                    useHTML: true,
                    align: 'center',
                    y: -16,
                    x: -10
                }
            });

            plotLines.push({
                color: color, // Color value
                value: time,//mainData[lastPoint][0], // Value of where the line will appear
                width: 1, // Width of the line
                label: {
                    text: dotText,
                    rotation: 0,
                    useHTML: true,
                    align: 'right',
                    y: -10,
                    x: -30
                }
            });
        }
    }

    function prepareTrackerMessage(){
        var info = subSeries[$scope.MI];
        $scope.trackerMsg.length = 0;
        for(i = 0; i < info.length; i++){
            //prepare tracker message data
            var obj = {};
            obj.title = "Tracker " + info[i].deviceSN + "(" + info[i].tripCount + ")";
            obj.lines = ['<div><span class="tt_temperature">' + info[i].y.toFixed(1) + tempUnits + '</span><span>' + formatDate(info[i].x) + '</span></div>'];
            $scope.trackerMsg.push([obj]);
        }
    }

    $scope.showAlertsUI = function(){
        //console.log("UI", this.data);
        $scope.markerData = this.data;

        $scope.ttShow = true;
        $scope.msgForMap = [];

        for(var i = 0; i < $scope.trackerMsg[this.data.oi].length; i++){
            var tmp = {};
            tmp.mkttl = $sce.trustAsHtml($scope.trackerMsg[this.data.oi][i].title);
            tmp.mapMarkerMessage = $scope.trackerMsg[this.data.oi][i].lines;
            $scope.msgForMap.push(tmp);
        }
        //console.log('msgForMap', $scope.msgForMap);
        //$scope.diagColor = $scope.trackers[$scope.MI].siblingColor;
        $scope.diagColor = $scope.trackers[$scope.MI].deviceColor;

        if(!$scope.$$phase) {
            $scope.$apply();
        }
    };
    $scope.hideAlertsUI = function(){
        $scope.ttShow = false;
    };
    $scope.showAlerts = function(index){
        if (index === undefined) {
            return;
        }
        //mouse out
        $scope.$apply(function() {
            if(index == -1){
                $scope.currentPoint.icon = {
                    url: 'theme/img/edot.png',
                }
            } else {
                //For alerts, only black circle without point in it.
                //$scope.currentPoint.loc = $scope.trackers[$scope.MI].locations[index];
                $scope.currentPoint.len = 35;
                $scope.currentPoint.loc = {lat: subSeries[$scope.MI][index].lat, long: subSeries[$scope.MI][index].lng};
                $scope.currentPoint.icon = {
                    url: 'theme/img/dot.png',
                    anchor: [17.5,17.5]
                };
                for(i = 0; i < $scope.specialMarkers.length; i++){
                    if($scope.specialMarkers[i].oi == index) {
                        $scope.currentPoint.icon = {
                            url: 'theme/img/outdot.png',
                            anchor: [17.5,17.5]
                        };
                        break;
                    }
                }
            }
        })
    };

    function  promiseGetNotes (params) {
        return $q(function(resolve, reject) {
            webSvc.getNotes(params).success(function(data) {
                console.log('GetNote', data);
                if (data.status.code == 0) {
                    resolve(data.response);
                } else {
                    reject(data.status);
                }
            })
        })
    }

    //--double click implementation
    var doubleClicker = {
        timeBetweenClicks:1000
    };
    var resetDoubleClick = function() {
        clearTimeout(doubleClicker.timer);
        doubleClicker.timer = null;
        doubleClicker.clickedOnce = false;
    };

    // the actual callback for a double-click event
    var ondbclick = function(e, point) {
        if (!point.noteNum) {
            //var point = point;
            //var chart1 = document.getElementById("chart1");
            var modalInstance = $uibModal.open({
                templateUrl: 'app/view-shipment-detail-share/create-note.html',
                controller: 'CreateNoteCtrl',
                backdrop: false,
                //size: 'sm',
                //appendTo: chart1,
                resolve: {
                    point: function () {
                        return point;
                    },
                    shipmentId: function() {

                    }
                }
            });
            modalInstance.result.then(
                function(note) {
                    //getNotes
                    var params = null;
                    if (note.shipmentId) {
                        params = {
                            params: {
                                shipmentId: note.shipmentId
                            }
                        };
                    } else {
                        params = {
                            params: {
                                sn: note.sn,
                                trip: note.trip
                            }
                        };
                    }

                    var promise = promiseGetNotes(params);
                    promise.then(
                        function (res) {
                            console.log('Note', res);
                            $scope.trackerInfo.notes = res;
                            $scope.shipmentNotes = res;
                            prepareMainHighchartSeries();
                            prepareNoteChartSeries();
                            refreshHighchartSeries();
                        },
                        function (status) {
                        }
                    );
                }
            );
        } else {
            var note = point;
            var modalInstance = $uibModal.open({
                templateUrl: 'app/view-shipment-detail-share/edit-note.html',
                controller: 'EditNoteCtrl',
                resolve: {
                    note : function() {
                        return note;
                    }
                }
            });
            modalInstance.result.then(
                function(result) {
                    //$scope.trackerInfo.shipmentDescription = result;
                    console.log('Result', result);
                    if (result) {
                        var params = null;
                        if (result.shipmentId) {
                            params = {
                                params: {
                                    shipmentId: result.shipmentId
                                }
                            };
                        } else {
                            params = {
                                params: {
                                    sn: result.sn,
                                    trip: result.trip
                                }
                            };
                        }
                        var promise = promiseGetNotes(params);
                        promise.then(
                            function (res) {
                                console.log('Note', res);
                                $scope.trackerInfo.notes = res;
                                $scope.shipmentNotes = res;
                                prepareMainHighchartSeries();
                                prepareNoteChartSeries();
                                refreshHighchartSeries();
                            },
                            function (status) {
                            }
                        );
                    }
                }
            );
        }
    };

    loadTrackerData();
    function loadTrackerData() {
        //initialize locations by empty arrays
        $scope.LocationListFrom = [];
        $scope.LocationListTo = [];
        $scope.LocationListInterim = [];

        console.log('start load tracker data');
        var params = null;
        if ($scope.ShipmentId) {
            params = {
                params: {
                    shipmentId: $scope.ShipmentId
                }
            };
        } else {
            params = {
                params: {
                    sn: $scope.sn,
                    trip: $scope.trip
                }
            };
        }

        //var groupList = [];
        //var deviceSnListSameGroup = [];
        var info = null;
        webSvc.getSingleShipmentShare(params).success(function(graphData) {
            $log.debug("SINGLE-SHIPMENT", graphData);
            if(graphData.status.code !=0){
                toastr.error(graphData.status.message, "Error");
                return;
            }
            info = graphData.response;
            if (info == null) {
                //$log.debug('Current user does not own this shipment!');
                $state.go('viewshipment'); //move to shipment-list

            }
        }).then(function() {
            //load alert profile
            calculateAndDraw();
            loadLocations();
            $scope.updateActionTakens();
        });

    	$scope.updateActionTakens = function(){
        	webSvc.getActionTakens(info.shipmentId).success(function(resp) {
                createActionTakensModel(info, resp.response);
            });
    	};

    	function loadLocations() {
         webSvc.getLocations(1000000, 1, 'locationName', 'asc').success( function (data) {
            $log.debug("LocationList", data);
            if (data.status.code == 0) {
                $scope.LocationList = data.response;
                angular.forEach($scope.LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        $scope.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        $scope.LocationList[key].DisplayText = val.locationName;
                    }

                    if (val.startFlag=='Y') {
                        $scope.LocationListFrom.push(val);
                    }
                    if (val.endFlag == 'Y') {
                        $scope.LocationListTo.push(val)
                    }
                    if (val.interimFlag == 'Y') {
                        $scope.LocationListInterim.push(val);
                    }
                })
            }
        });
      }

    	function calculateAndDraw() {
            if (!info) return;
            var numberOfSiblings = info.siblings.length;
            if (numberOfSiblings >= 5) {
                info.siblings.splice(5);
                $scope.notListed = numberOfSiblings - 5;
            }
            //info.siblings = siblings;
            //--------Remove Light On, Off---------
            for (alert = 0; alert < info.alertSummary.length; alert++) {
                if (info.alertSummary[alert].toLowerCase() == "lighton"
                    || info.alertSummary[alert].toLowerCase() == "lightoff") {
                    info.alertSummary.splice(alert--, 1);
                }
            }
            //------------PREPARE TRACKERS INFO  BEGIN-------------
            var tempObj = {};
            for (var k in info) {
                if (info.hasOwnProperty(k)) {
                    tempObj[k] = info[k];
                }
            }
            if (tempObj.alertYetToFire != null)
                tempObj.alertYetToFire = tempObj.alertYetToFire.split(",");
            tempObj.loaded = true;
            tempObj.loadedForIcon = true;
            //next time, it only updates the main tracker info, not insert it to $scope.trackers
            if ($scope.trackers.length == 0) {
                $scope.trackers.push(tempObj);
                for (i = 0; i < info.siblings.length; i++) {
                    $scope.trackers.push(info.siblings[i]);
                    $scope.trackers[i + 1].loaded = false;
                }
            } else {
                $scope.trackers[0] = tempObj;
            }

            //set tracker information
            angular.forEach(tempObj.alertsNotificationSchedules, function(child, index){
                child.index = index;
            });

            //set interim stop information
            angular.forEach(tempObj.interimStops, function(stp, index){
                protectNearestReading(stp, info.locations);
            });

            $scope.isLoading = false;
            $scope.changeActiveTracker(0); //load first
            loadSibling();
        }
        
        function protectNearestReading(stp, locations) {
        	var d = 10000000.0;
        	var nearest = null;
        	
        	for (var i = 0; i < locations.length; i++) {
        		var loc = locations[i];
        		var dlat = stp.latitude - loc.lat;
        		var dlon = stp.longitude - loc.long;
        		var dt = parseDate(stp.stopDateISO) - parseDate(loc.timeISO);

        		//the distance in (x, y, time) coordinates. The sqrt is avoided for optimization.
        		var dist = dlat * dlat + dlon * dlon + dt * dt;
        		if (dist < d) {
        			d = dist;
        			nearest = loc;
        		}
        	}
        	
        	if (nearest != null) {
        		nearest.notOptimize = true;
        	}
        }

        function createActionTakensModel(shipmentInfo, actionTakens) {
        	var alerts = [];
        	for(var i = 0; i < shipmentInfo.alertsWithCorrectiveActions.length; i++) {
        		var a = shipmentInfo.alertsWithCorrectiveActions[i];
        		alerts.push({
    				id: a.id,
    				type: a.type,
    				actionListId: a.correctiveActionListId,
    				time: parseDate(a.timeISO),
    				timeStr: a.time,
    				description: a.description,
    				actions: getActionTakensForAlert(a, actionTakens)
        		});
        	}
        	
        	$scope.alertsWithCorrectiveActions = alerts;
        }
        
        function getActionTakensForAlert(alert, actionTakens) {
        	var actions = [];
        	for (var i = 0; i < actionTakens.length; i++) {
        		if (alert.id == actionTakens[i].alert) {
        			actions.push(actionTakens[i]);
        		}
        	}
        	
        	return actions;
        }

        function loadSibling() {
            var promiseSibling = [];
            angular.forEach(info.siblings, function(val, key) {
                var params =     {
                    params: {
                        shipmentId: val.shipmentId
                    }
                };
                var p = webSvc.getSingleShipmentShare(params).success( function (graphData) {
                    if(graphData.status.code != 0) return;
                    dt = graphData.response;
                    // debugger;
                    for(j = 1; j < $scope.trackers.length; j++){
                        if($scope.trackers[j].shipmentId == dt.shipmentId){
                            for(var k in dt){
                                if(dt.hasOwnProperty(k)){
                                    $scope.trackers[j][k] = dt[k];
                                }
                            }
                            if($scope.trackers[j].alertYetToFire != null)
                                $scope.trackers[j].alertYetToFire = $scope.trackers[j].alertYetToFire.split(",");
                            $scope.trackers[j].loaded = true;
                            $scope.trackers[j].loadedForIcon = true;
                            prepareMainHighchartSeries();
                            refreshHighchartSeries();
                            break;
                        }
                    }
                });
                promiseSibling.push(p);
            });
            $q.all(promiseSibling).then(function() {
                //update color of tracker here
                //var promiseTrackers = [];
                angular.forEach($scope.trackers, function(tracker, k) {
                    $scope.trackers[k].index = k;
                    //-- update deviceSN
                    if (!isNaN(tracker.deviceSN)) {
                        $scope.trackers[k].deviceSN = parseInt(tracker.deviceSN, 10);
                    }
                });
                //prepareMainHighchartSeries();
                //refreshHighchartSeries();
            }).then(function () {
                $scope.isLoading = false;
                $scope.changeActiveTracker($scope.MI);
            });



            //start and end location info

            var locations = info.locations;
            //-- get first valid point
            var firstValidPoint = {lat: 0, lng : 0};
            for (var i = locations.length -1 ; i >=0; i--) {
                if (!info.locations[i].lat || !info.locations[i].long) {
                    info.locations[i].lat = firstValidPoint.lat;
                    info.locations[i].long = firstValidPoint.lng;
                } else {
                    firstValidPoint.lat = info.locations[i].lat;
                    firstValidPoint.lng = info.locations[i].long;
                }
            }

            //google map data
            $scope.firstPoint = locations[0];
            $scope.currentPoint.loc = locations[0];
            //$scope.currentPoint.iconUrl = "theme/img/edot.png";

            //$scope.changeActiveTracker($scope.MI);


            // console.log($scope.trackerPath);
            $scope.chartConfig = {
                redraw: false,
                options:{
                    plotOptions: {
                        series: {
                            events: {
                                mouseOut: function () {
                                    $scope.showAlerts(-1);
                                }
                            }
                        }
                    },
                    scrollbar : {
                        enabled : false
                    },
                    credits: {
                        enabled: false
                    },
                    rangeSelector: {
                        selected: 2,
                        enabled: true,
                        inputEnabled: false,
                        buttonTheme: {
                            visibility: 'hidden'
                        },
                        labelStyle: {
                            visibility: 'hidden'
                        }
                    },
                    navigator: {
                        enabled: true
                    },
                    // yAxis: {
                    //  title: {
                    //      align: 'left',
                    //      text: "Temperature <sup>o</sup>C"
                    //  }
                    // },
                    tooltip: {
                        style: {
                            padding: '0px',
                        },
                        shadow: false,
                        backgroundColor: 'rgba(249, 249, 249, 0)',
                        borderWidth: 0,
                        useHTML: true,
                        hideDelay: 1000,
                        formatter: function () {
                            //console.log("Tooltip", this);
                            if (this.points) {
                                var index, length = subSeries[$scope.MI].length;

                                for (index = 0; index < length; index++) {
                                    var x = subSeries[$scope.MI][index].x;
                                    if (x < this.x) {

                                    } else {
                                        break;
                                    }
                                }

                                var color = this.points[0].series.color;
                                msg = $scope.trackerMsg[index];

                                var message = "";
                                for(var j = 0; (j < msg.length); j ++){
                                    //if this message is for alert show title
                                    if(msg[j].title.indexOf(".png") != -1){
                                        message += "<div class='tt_title' style='background-color:" + color + "'>"
                                            + msg[j].title + "<div style='clear:both;'></div></div>";
                                    }
                                    message += "<div class='tt_body'>";
                                    for(var k = 0; k < msg[j].lines.length; k ++){
                                        message += "<div>" + msg[j].lines[k] + "</div>";
                                    }
                                    message += "</div>";
                                }

                                var cont = "";
                                cont += "<div class='ttbox' style='z-index: 100; border-color:" + color + "'>";
                                cont += message;
                                cont += "</div>";
                                return cont;
                            } else {
                                //--flags
                                var color = this.point.color;
                                var c = "";
                                c += "<div class='ttbox' style='z-index: 100; min-width: 300px; border-color:" + color + "'>";
                                c += "<div class='tt_title' style='background-color:" + color + "'>";
                                c += "Note " + this.point.noteNum + "</div>";
                                c += "<div style='clear:both;'></div>";
                                c += "<div class='tt_body wordwrap'>";
                                c += this.point.noteText;
                                c += "</div>";
                                c += "</div>";
                                return c;
                            }
                        }
                    },
                    yAxis:{
                        labelAlign: 'left',
                        opposite: false,
                        gridLineColor: '#CCC',
                        lineColor:"#000",
                        tickColor:"#000",
                        lineWidth:1,
                        tickWidth: 1,
                        title: {
                            align: 'middle',
                            offset: 40,
                            text: 'Temperature'+ tempUnits,
                            y: -10
                        },
                        labels:{
                            align:'right',
                            x:-10
                        },
                        tickInterval: tickInterval,
                        plotBands: [{
                            from: info.alertProfile ? info.alertProfile.lowerTemperatureLimit : 0, //0
                            to: info.alertProfile ? info.alertProfile.upperTemperatureLimit : 5, //5,
                            color: 'rgba(0, 255, 0, 0.2)',
                        }, {
                            from: -25,
                            to: -18,
                            color: 'rgba(0, 0, 255, 0.2)',
                        }]
                    },
                    xAxis:{
                        type: 'datetime',
                        labels: {
                            formatter: function() {
                                // return this.value + "Date";
                                return formatDateAxis(this.value);
                            },
                        },
                        plotBands: lightPlotBand,
                        lineWidth:1,
                        ordinal: false,
                        lineColor:"#000",
                        tickColor:"#000",
                        gridLineDashStyle: "Solid",
                        gridLineWidth: 1,
                        plotLines: plotLines
                    },
                    navigation: {
                        buttonOptions: {
                            enabled: false
                        }
                    }
                },
                series: chartSeries,
                useHighStocks: true,
                func : function(chart) {
                    //#--
                    //var hChart = $("#chart-print").highcharts();
                    //hChart.
                    if (!$scope.loaded) {
                        $scope.loaded = true;
                        if (window.matchMedia) {
                            var mediaQueryList = window.matchMedia("print");
                            mediaQueryList.addListener(function (mql) {
                                if (mql.matches) {
                                    if (chart && ($location.path() == '/view-shipment-detail')) {
                                        chart = $("#chart-print").highcharts();
                                        chart.reflow();
                                    }
                                } else {
                                }
                            });
                        }
                        window.addEventListener("beforeprint", function (ev) {
                            chart = $("#chart-print").highcharts();
                            if (chart && ($location.path() == '/view-shipment-detail')) {
                                //chart.oldParams = [chart.chartWidth, chart.chartHeight, false];
                                //chart.setSize(590, 400, false);
                                chart.reflow();
                            }
                        });
                        window.addEventListener("afterprint", function (ev) {
                            if (chart && ($location.path() == '/view-shipment-detail')) {
                                chart.setSize.apply(chart, chart.oldParams)
                            }
                        });
                    }
                }
            };

            $scope.hasSibling = $scope.trackers.length > 1;

            if ($scope.hasSibling) {
                $scope.sDisplay = 'block'
            } else {
                $scope.sDisplay = 'none'
            }
        }
    }

    function refreshHighchartSeries(){
        chartSeries.length=0;
        chartSeries.push({
            name: "Tracker " + $scope.trackers[$scope.MI].deviceSN + "(" + $scope.trackers[$scope.MI].tripCount + ")",
            id: 'dataseries',
            marker: {
                symbol: 'url(theme/img/dot.png)'
            },
            //color: $scope.trackers[$scope.MI].siblingColor,
            color: $scope.trackers[$scope.MI].deviceColor,
            lineWidth: 3,
            data: subSeries[$scope.MI],
            //turboThreshold: 2000,
            point: {
                events: {
                    mouseOver: function () {
                        var idx, length = subSeries[$scope.MI].length;
                        for(idx = 0; idx < length; idx ++){
                            var x = subSeries[$scope.MI][idx].x;
                            if (idx == 0 && this.x < x) {
                                break;
                            }
                            var x1 = (idx + 1 < subSeries[$scope.MI].length) ? subSeries[$scope.MI][idx+1].x : 0;
                            if ((x <= this.x) && (this.x < x1)) {
                                break;
                            }
                            if (idx == length-1) {
                                break
                            }
                        }
                        $scope.showAlerts(idx);
                    },
                    click: function(e) {
                        if (doubleClicker.clickedOnce === true && doubleClicker.timer) {
                            resetDoubleClick();
                            ondbclick(e, this);
                        } else {
                            doubleClicker.clickedOnce = true;
                            doubleClicker.timer = setTimeout(function(){
                                resetDoubleClick();
                            }, doubleClicker.timeBetweenClicks);
                        }
                    }
                }
            }
        });

        //Add gap to the start and end
        var ti = $scope.trackers[$scope.MI].locations;
        var lastPoint = ti.length - 1;
        var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
        mainTrackerPeriod /= 25;
        // console.log("MAIN", mainTrackerPeriod);
        var color = Highcharts.getOptions().colors[0];
        var gapColor = new Highcharts.Color(color).setOpacity(0).get();
        var gap = [];
        gap.push([parseDate(ti[0].timeISO) - mainTrackerPeriod, ti[0].temperature]);
        gap.push([parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod, ti[lastPoint].temperature]);

        for (i = 0; i < subSeries.length; i ++) {
            if(i == $scope.MI || !$scope.trackers[i].loaded) continue;
            chartSeries.push({
                name: "Tracker " + $scope.trackers[i].deviceSN + "(" + $scope.trackers[i].tripCount + ")",
                //color: $scope.trackers[i].siblingColor,
                color: $scope.trackers[i].deviceColor,
                lineWidth: 1,
                data: subSeries[i],
                enableMouseTracking: false
            });
        }

        chartSeries.push({
            data: gap,
            enableMouseTracking: false,
            color: gapColor
        });
        console.log(chartSeries);

        for(i = 0; i < alertData.length; i++){
            chartSeries.push({
                name: "Alerts",
                color: "#b3bcbf",
                lineWidth: 3,
                //enableMouseTracking: false,
                data: alertData[i],
                point: {
                    events: {
                        mouseOver: function () {
                            var idx;
                            for(index = 0; index < subSeries[$scope.MI].length; index ++){
                                if(subSeries[$scope.MI][index].x == this.x){
                                    idx = index;
                                    break;
                                }
                            }
                            $scope.showAlerts(idx);
                        }
                    }
                }

            });
        }
        chartSeries.push({
            name: "Notes",
            type: 'flags',
            onSeries : 'dataseries',
            shape : 'circlepin',
            cursor: 'pointer',
            //color: $scope.trackers[$scope.MI].siblingColor,
            color: $scope.trackers[$scope.MI].deviceColor,
            stackDistance: 16,
            width: 8,
            style: {
                fontSize: '8px',
                fontWeight: 'normal',
                textAlign: 'center',
            },
            data:noteData
        })
    }
    function prepareNoteChartSeries() {
        noteData.length = 0; //reset noteData
        console.log('$scope.shipmentNotes',$scope.shipmentNotes);
        angular.forEach($scope.shipmentNotes, function(val, key) {
            $scope.shipmentNotes[key].x = parseDate(val.timeOnChart);
        });
        var sortedNotes = orderBy($scope.shipmentNotes, 'x');
        $log.debug('SortedNotes', sortedNotes);


        noteData = sortedNotes.map(function(val) {
            val.title=val.noteNum;
            val.text=val.noteText;
            return val;
        });
    }
    function prepareAlertHighchartSeries(){
        lightPlotBand.length = 0;

        var plot = {};
        plot.from = null;
        alertData.length = 0;
        //console.log("prepareAlertHighchartSeries", subSeries);
        // debugger;
        for(i = 0 ; i < subSeries[$scope.MI].length; i ++){
            //-- update plotBand
            var location = subSeries[$scope.MI][i];
            var eventType = location.type;
            if(eventType && eventType.toLowerCase() == "lighton"){
                plot.from = location.x;
            }
            if(eventType && eventType.toLowerCase() == "lightoff"){
                plot.to = location.x;
                plot.color = 'rgba(255, 255, 0, 0.2)';
                if(plot.from != null){
                    lightPlotBand.push(plot);
                    plot = {};
                    plot.from = null;
                }
            }

            var alertinfo = location.alerts;
            if(alertinfo.length == 1){
                var str = alertinfo[0].type;
                var alert = "";
                obj = {};
                obj.x = location.x; //time-x
                obj.y = location.y; //temperature-y
                if(str == "LastReading") {
                    str = "Tracker0";
                    obj.marker = {
                        enabled: true,
                        symbol: 'square',
                        height: 16,
                        width: 16,
                        radius: 8,
                        //fillColor:$scope.trackers[$scope.MI].siblingColor,
                        fillColor:$scope.trackers[$scope.MI].deviceColor,
                        states: {
                            hover: {
                                enabled: false,
                            }
                        }
                    };

                    //-- check if door is opened
                    if (plot.from) {
                        plot.to = location.x;
                        plot.color = 'rgba(255, 255, 0, 0.2)';
                        lightPlotBand.push(plot);
                    }
                } else {
                    alert = "Alert";
                    obj.marker = {
                        enabled: true,
                        symbol: 'url(theme/img/' + alert.toLowerCase() + str + '.png)'
                    };
                }

                if(str.toLowerCase() == "lighton"){
                    //plot.from = location.x;
                } else if(str.toLowerCase() == "lightoff"){
                    //plot.to = location.x;
                    //plot.color = 'rgba(255, 255, 0, 0.2)';
                    //if(plot.from){
                    //    lightPlotBand.push(plot);
                    //    plot = {};
                    //    plot.from = null;
                    //}
                } else {
                    var tmpArray = [];
                    tmpArray.push(obj);
                    alertData.unshift(tmpArray);
                }
                //update msg
                var msg = {};

                msg.title = "<table><tr><td valign='middle'><img style='float: left; padding-right: 3px' src='theme/img/tiny" + alert + str + ".png'/></td><td valign='middle'>" + alertinfo[0].title + "</td></tr></table>";
                msg.lines = [alertinfo[0].Line1];
                if(alertinfo[0].Line2 != undefined){
                    msg.lines.push(alertinfo[0].Line2);
                }
                $scope.trackerMsg[i] = [msg];
            } else if(alertinfo.length > 1){
                obj = {};
                obj.x = location.x;
                obj.y = location.y;
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/alerts.png)'
                };
                var tmpArray = [];
                tmpArray.push(obj);
                alertData.unshift(tmpArray);
                //update msg
                var alertmsg = [];
                for(var k = 0; k < alertinfo.length; k++){
                    var str = alertinfo[k].type;
                    //for light on/off, show yellow bar and hide icons
                    //by not adding to the alert list
                    if(str.toLowerCase() == "lighton"){
                        //plot.from = location.x;
                    } else if(str.toLowerCase() == "lightoff"){
                        //plot.to = location.x;
                        //plot.color = 'rgba(255, 255, 0, 0.2)';
                        //if(plot.from != null){
                        //    lightPlotBand.push(plot);
                        //    plot = {};
                        //    plot.from = null;
                        //}
                    }
                    var alert = "";
                    if(str == "LastReading") str = "Tracker0";// + ($scope.MI + 1);
                    else alert = "Alert";
                    var msg = {};
                    //msg.title = "<span><img src='theme/img/tiny" + alert + str + ".png'/></span><span>" + alertinfo[k].title + "</span>";
                    msg.title = "<table><tr><td valign='middle'><img style='float: left; padding-right: 3px' src='theme/img/tiny" + alert + str + ".png'/></td><td valign='middle'>" + alertinfo[k].title + "</td></tr></table>";

                    msg.lines = [alertinfo[k].Line1];
                    if(alertinfo[k].Line2 != undefined){
                        msg.lines.push(alertinfo[k].Line2);
                    }
                    alertmsg.push(msg);
                }

                $scope.trackerMsg[i] = alertmsg;
            }
        }

        lastPoint = subSeries[$scope.MI].length - 1;
        //console.log('LastPoint', lastPoint);
        //Destination
        obj = {};
        obj.x = subSeries[$scope.MI][lastPoint].x;
        obj.y = subSeries[$scope.MI][lastPoint].y;
        obj.z = 30;
        obj.marker = {
            enabled: true,
            symbol: 'url(theme/img/tracker' + ($scope.MI + 1) + '.png)'
        };
    }

    //var sol = 0;
    function updateNote(location) {
        for (var i = 0; i< $scope.shipmentNotes.length; i++) {
            var time = parseDate(location.timeISO);
            if ($scope.shipmentNotes[i].x == time) {
                $scope.shipmentNotes[i].y = location.temperature;
                return true;
            } else if ($scope.shipmentNotes[i].x > time){
                return false;
            }
        }
        return false;
    }

    function prepareMainHighchartSeries(){
        subSeries.length = 0;
        //calculate chart arrange and cut down the others
        var startTime = parseDate($scope.trackers[$scope.MI].locations[0].timeISO);
        var endTime = parseDate($scope.trackers[$scope.MI].locations[$scope.trackers[$scope.MI].locations.length - 1].timeISO);
        var status = $scope.trackers[$scope.MI].status;
        var arrivalTime = parseDate($scope.trackers[$scope.MI].arrivalTimeISO);

        var gap = (endTime - startTime) / 25;
        startTime -= gap;
        endTime += gap;

        //Add siblings tracker data to the subSeries
        var tempMin = null, tempMax = null;   //to calculate y-axis interval;
        //console.log('TrackerI', $scope.trackers);
        for(i = 0; i < $scope.trackers.length; i++){
            if(!$scope.trackers[i].loaded) {
                subSeries.push([]);
                continue;
            }
            var locations = $scope.trackers[i].locations;
            var skipCnt = locations.length / 300;
            var tmpCnt = 0;
            var series = [];
            if(tempMax == null){
                tempMax = tempMin = locations[0].temperature;
            }

            var lastValidLat = 0;
            var lastValidLng = 0;
            var temPath = [];
            var oldX = 0;
            for(j = 0; j < locations.length; j++){
                //-- update shipmentNotes
                var check = updateNote(locations[j]);
                var isLightEvent = false;
                if (locations[j].type == "LightOn" || locations[j].type == "LightOff") {
                    isLightEvent = true;
                }
                if(j != 0){
                    if(++tmpCnt <= skipCnt) {
                        if((locations[j].alerts.length == 0) && !check && !isLightEvent){
                            continue;
                        }
                    } else {
                        tmpCnt = 0;
                    }
                }

                var ll = new google.maps.LatLng(locations[j].lat, locations[j].long);
                var xvalue = parseDate(locations[j].timeISO);
                if (!refinePath(ll, temPath) ||
                    locations[j].alerts.length > 0 ||
                    (oldX < arrivalTime && arrivalTime <= xvalue)) {
                    temPath.push(ll);
                    if (locations[j].lat && (locations[j].lat != 0)) lastValidLat = locations[j].lat;
                    if (locations[j].long && (locations[j].long != 0)) lastValidLng = locations[j].long;

                    temp = {};
                    temp.x = xvalue;
                    temp.y = locations[j].temperature;
                    temp.timeISO = locations[j].timeISO;
                    temp.alerts = locations[j].alerts;
                    temp.type = locations[j].type;
                    temp.lat = lastValidLat;
                    temp.lng = lastValidLng;
                    temp.shipmentId = $scope.trackers[i].shipmentId;
                    temp.tripCount = $scope.trackers[i].tripCount;
                    temp.deviceSN = $scope.trackers[i].deviceSN;

                    if (tempMax < locations[j].temperature) {
                        tempMax = locations[j].temperature;
                    }
                    if (tempMin > locations[j].temperature) {
                        tempMin = locations[j].temperature;
                    }
                    if (startTime <= temp.x && temp.x <= endTime) {
                        series.push(temp);
                    }
                } else {
                    temp = {};
                    temp.x = parseDate(locations[j].timeISO);
                    temp.y = locations[j].temperature;
                    temp.timeISO = locations[j].timeISO;
                    temp.alerts = locations[j].alerts;
                    temp.type = locations[j].type;
                    temp.lat = lastValidLat;
                    temp.lng = lastValidLng;
                    temp.shipmentId = $scope.trackers[i].shipmentId;
                    temp.tripCount = $scope.trackers[i].tripCount;
                    temp.deviceSN = $scope.trackers[i].deviceSN;

                    if (tempMax < locations[j].temperature) {
                        tempMax = locations[j].temperature;
                    }
                    if (tempMin > locations[j].temperature) {
                        tempMin = locations[j].temperature;
                    }
                    if (startTime <= temp.x && temp.x <= endTime) {
                        series.push(temp);
                    }
                }
            }
            //console.log("--------",series.length);
            subSeries.push(series);
        }
        //console.log("TEMP", tempMin, tempMax);
        if(tempMax - tempMin <= 10) tickInterval = 1;
        else tickInterval = 5;
    }

    function parseDate(date){
        var m = moment(date, 'YYYY-MM-DD hh:mm');
        return m.valueOf();
    }

    function formatDate(date){
        var m_names = ["Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"];
        var d = new Date(date);

        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();

        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var ampm = curr_hour >= 12 ? 'PM' : 'AM';
        curr_hour %= 12;
        curr_hour = curr_hour ? curr_hour : 12;
        curr_hour = ("00" + curr_hour).slice(-2);
        curr_min = ("00" + curr_min).slice(-2);
        return curr_hour + ":" + curr_min + ampm + " " + curr_date + " " + m_names[curr_month] + " " + curr_year;
    }

    function formatDateAxis(date){
        var m_names = ["Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"];
        var d = new Date(date);
  
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();

        var curr_hour = d.getHours();
        var curr_min = d.getMinutes();
        var ampm = curr_hour >= 12 ? 'PM' : 'AM';
        curr_hour %= 12;
        curr_hour = curr_hour ? curr_hour : 12;
        curr_hour = ("00" + curr_hour).slice(-2);
        curr_min = ("00" + curr_min).slice(-2);

        return curr_hour + ":" + curr_min + ampm + "<br/>" + curr_date + "." + m_names[curr_month] + "." + curr_year;
    }

    $scope.confirmShutdown = function(shipmentId) {
        if ($scope.trackerInfo.isLatestShipment) {
            if (!$scope.shutdownAlready) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/view-shipment-detail-share/confirm-shutdown.html',
                    controller: 'ConfirmShutdownCtrl',
                    resolve: {
                        shipmentId: function () {
                            return shipmentId;
                        }
                    }
                });
                modalInstance.result.then(
                    function() {
                        $scope.trackerInfo.shutdownTime = moment.tz($rootScope.RunningTimeZoneId).format("h:mmA DD MMM YYYY");
                        $scope.trackerInfo.status = 'Ended';
                        $scope.shutdownAlready = true;
                    }
                );
            } else {
                toastr.warning ('Device has already been shutdown during this shipment.');
            }
        } else {
            //var temShipmentNumber = currentDevice.shipmentNumber;
            //if (temShipmentNumber){
            //    var idx1 = temShipmentNumber.indexOf('(');
            //    var idx2 = temShipmentNumber.indexOf(')');
            //    var n = temShipmentNumber.substr(idx1+1, idx2-1);
            //    currentDevice.tripCount = parseInt(n);
            //}
            //currentDevice.sn = parseInt(currentDevice.sn);
            //var link = '<a ng-href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            //toastr.warning("Warning. This device can only be shutdown from the latest shipment " + link);
            toastr.warning("Warning. This device can only be shutdown from the latest shipment.");
        }
    };
    $scope.confirmSuppress = function(Id) {
        if ($scope.suppressAlready) {
            toastr.warning('Alerts have already been suppressed for this shipment.');
        } else
        if ($scope.isEndedOrArrived) {
            //var temShipmentNumber = currentDevice.shipmentNumber;
            //if (temShipmentNumber){
            //    var idx1 = temShipmentNumber.indexOf('(');
            //    var idx2 = temShipmentNumber.indexOf(')');
            //    var n = temShipmentNumber.substr(idx1+1, idx2-1);
            //    currentDevice.tripCount = parseInt(n, 10);
            //}
            //currentDevice.sn = parseInt(currentDevice.sn);
            //var link = '<a href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            //toastr.warning('Warning. This shipment was ended or arrived ' + link);
            toastr.warning('Warning. This shipment was ended or arrived.');
        } else {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/view-shipment-detail-share/confirm-suppress.html',
                controller: 'ConfirmSuppressCtrl',
                resolve: {
                    shipmentId: function() {
                        return Id;
                    }
                }
            });
            modalInstance.result.then(function() {
                //update data after suppress
                $scope.suppressAlready = true;
            });
        }
    };

    $scope.EditNote = function(note) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-note.html',
            controller: 'EditNoteCtrl',
            resolve: {
                note : function() {
                    return note;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                //$scope.trackerInfo.shipmentDescription = result;
                console.log('Result', result);
                if (result) {
                    var params = null;
                    if (result.shipmentId) {
                        params = {
                            params: {
                                shipmentId: result.shipmentId
                            }
                        };
                    } else {
                        params = {
                            params: {
                                sn: result.sn,
                                trip: result.trip
                            }
                        };
                    }
                    var promise = promiseGetNotes(params);
                    promise.then(
                        function (res) {
                            console.log('Note', res);
                            $scope.trackerInfo.notes = res;
                            $scope.shipmentNotes = res;
                            prepareMainHighchartSeries();
                            prepareNoteChartSeries();
                            refreshHighchartSeries();
                        },
                        function (status) {
                        }
                    );
                }
            }
        );
    };
    $scope.DeleteNote = function(note) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/delete-note.html',
            controller: 'DeleteNoteCtrl',
            resolve: {
                note : function() {
                    return note;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                if (result !=null) {
                    console.log('NoteNum', result);
                    console.log('Note', $scope.trackerInfo.notes);
                    for (var i = 0; i< $scope.trackerInfo.notes.length; i++) {
                        var tmp = $scope.trackerInfo.notes[i];

                        if (tmp.noteNum == result) {
                            $scope.trackerInfo.notes.splice(i, 1);
                            break;
                        }
                    }
                    //console.log($scope.trackerInfo);
                    prepareMainHighchartSeries();
                    prepareNoteChartSeries();
                    refreshHighchartSeries();
                }
                //$state.go($state.current, {}, { reload: true });
            }
        );
    };
    //-- Edit shipment alerts
    $scope.EditShipmentAlerts =function(trackerInfo) {
        //-- open confirmation of edit alert
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-alerts.html',
            controller: 'EditShipmentAlerts as VM',
            size: 'lg',
            resolve: {
                shipmentId : function() {
                    if (trackerInfo) {
                        return trackerInfo.shipmentId;
                    }
                    return null;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                //TODO: update after share here
                //$scope.trackerInfo.commentsForReceiver = result;
            }
        );
    };
    //-- Edit shipment arrival
    $scope.EditShipmentArrival = function(trackerInfo) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-arrival.html',
            controller: 'EditShipmentArrival as VM',
            resolve: {
                shipmentId: function() {
                    if (trackerInfo) {
                        return trackerInfo.shipmentId;
                    }
                    return null;
                }
            }
        });
        modalInstance.result.then(function() {
           //todo: update
        });
    };
    $scope.EditMonitoredGoods = function(trackerInfo) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-goods.html',
            controller: 'EditMonitoredGoods as VM',
            resolve: {
                shipmentId: function() {
                    if (trackerInfo) {
                        return trackerInfo.shipmentId;
                    }
                    return null;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $scope.trackerInfo.shipmentDescription = result.shipmentDescription;
            $scope.trackerInfo.commentsForReceiver = result.commentsForReceiver;
            $scope.trackerInfo.palletId = result.palletId;
            $scope.trackerInfo.assetNum = result.assetNum;
        })
    };

    $scope.EditShipmentRoute = function(trackerInfo) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-route.html',
            controller: 'EditShipmentRoute as VM',
            size: 'lg',
            resolve: {
                shipmentId: function() {
                    if (trackerInfo) {
                        return trackerInfo.shipmentId;
                    }
                    return null;
                }
            }
        });
        modalInstance.result.then(function(resultObject) {
            console.log("Result Object", resultObject);
            console.log("Result shipment", resultObject.shipment);
            console.log("Result interimStop", resultObject.interimStop);

            var result = resultObject.shipment;
            var stLocation = filter($scope.LocationListFrom, {locationId: result.shippedFrom}, true);
            var endLocation = filter($scope.LocationListTo, {locationId: result.shippedTo}, true);

            if (stLocation && stLocation.length > 0) {
                stLocation = stLocation[0];
            }
            if (endLocation && endLocation.length > 0) {
                endLocation = endLocation[0];
            }

            //console.log("StartLocation Modified", stLocation);
            //console.log("EndLocation Modified", endLocation);

            $scope.trackerInfo.startLocation = stLocation.locationName;//must do filter
            $scope.trackerInfo.endLocation = endLocation.locationName;

            if (resultObject.interimStop) {
                $scope.trackerInfo.interimStops = [];
                $scope.trackerInfo.interimStops.push(resultObject.interimStop);
            } else {
                $scope.trackerInfo.interimStops = [];
            }
            //startTime:"12:27 1 Jun 2016"
            if (result.startDate) {
                $scope.trackerInfo.startTime = moment.tz(result.startDate,'YYYY-MM-DDTHH:mm', $rootScope.RunningTimeZoneId).format('HH:mm DD MMM YYYY');
            }
            if (result.endDate) {
                $scope.trackerInfo.arrivalTime = moment.tz(result.endDate,'YYYY-MM-DDTHH:mm', $rootScope.RunningTimeZoneId).format('HH:mm DD MMM YYYY');
            }

            $scope.trackerInfo.status = result.status;
            updateTrackerInfo();
            updatePlotLines();

        });
    };

    function shadeColor2(color, percent) {
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    function refinePath(point, listPoint) {
        if (listPoint == null || listPoint.length == 0) {
            return false;
        }
        var cascadiaFault = new google.maps.Polyline({
            path: listPoint
        });
        if (!google.maps.geometry.poly.isLocationOnEdge(point, cascadiaFault, 10e-3)) {
            return false;
        }
        return true;
        //return false;
    }

    function colourNameToHex(colour) {
        if (!colour) {
            colour = "green";
        }
        var colours = {
            "aliceblue":"#f0f8ff",
            "antiquewhite":"#faebd7",
            "aqua":"#00ffff",
            "aquamarine":"#7fffd4",
            "azure":"#f0ffff",
            "beige":"#f5f5dc",
            "bisque":"#ffe4c4",
            "black":"#000000",
            "blanchedalmond":"#ffebcd",
            "blue":"#0000ff",
            "blueviolet":"#8a2be2",
            "brown":"#a52a2a",
            "burlywood":"#deb887",
            "cadetblue":"#5f9ea0",
            "chartreuse":"#7fff00",
            "chocolate":"#d2691e",
            "coral":"#ff7f50",
            "cornflowerblue":"#6495ed",
            "cornsilk":"#fff8dc",
            "crimson":"#dc143c",
            "cyan":"#00ffff",
            "darkblue":"#00008b",
            "darkcyan":"#008b8b",
            "darkgoldenrod":"#b8860b",
            "darkgray":"#a9a9a9",
            "darkgreen":"#006400",
            "darkkhaki":"#bdb76b",
            "darkmagenta":"#8b008b",
            "darkolivegreen":"#556b2f",
            "darkorange":"#ff8c00",
            "darkorchid":"#9932cc",
            "darkred":"#8b0000",
            "darksalmon":"#e9967a",
            "darkseagreen":"#8fbc8f",
            "darkslateblue":"#483d8b",
            "darkslategray":"#2f4f4f",
            "darkturquoise":"#00ced1",
            "darkviolet":"#9400d3",
            "deeppink":"#ff1493",
            "deepskyblue":"#00bfff",
            "dimgray":"#696969",
            "dodgerblue":"#1e90ff",
            "firebrick":"#b22222",
            "floralwhite":"#fffaf0",
            "forestgreen":"#228b22",
            "fuchsia":"#ff00ff",
            "gainsboro":"#dcdcdc",
            "ghostwhite":"#f8f8ff",
            "gold":"#ffd700",
            "goldenrod":"#daa520",
            "gray":"#808080",
            "green":"#008000",
            "greenyellow":"#adff2f",
            "honeydew":"#f0fff0",
            "hotpink":"#ff69b4",
            "indianred ":"#cd5c5c",
            "indigo":"#4b0082",
            "ivory":"#fffff0",
            "khaki":"#f0e68c",
            "lavender":"#e6e6fa",
            "lavenderblush":"#fff0f5",
            "lawngreen":"#7cfc00",
            "lemonchiffon":"#fffacd",
            "lightblue":"#add8e6",
            "lightcoral":"#f08080",
            "lightcyan":"#e0ffff",
            "lightgoldenrodyellow":"#fafad2",
            "lightgrey":"#d3d3d3",
            "lightgreen":"#90ee90",
            "lightpink":"#ffb6c1",
            "lightsalmon":"#ffa07a",
            "lightseagreen":"#20b2aa",
            "lightskyblue":"#87cefa",
            "lightslategray":"#778899",
            "lightsteelblue":"#b0c4de",
            "lightyellow":"#ffffe0",
            "lime":"#00ff00",
            "limegreen":"#32cd32",
            "linen":"#faf0e6",
            "magenta":"#ff00ff",
            "maroon":"#800000",
            "mediumaquamarine":"#66cdaa",
            "mediumblue":"#0000cd",
            "mediumorchid":"#ba55d3",
            "mediumpurple":"#9370d8",
            "mediumseagreen":"#3cb371",
            "mediumslateblue":"#7b68ee",
            "mediumspringgreen":"#00fa9a",
            "mediumturquoise":"#48d1cc",
            "mediumvioletred":"#c71585",
            "midnightblue":"#191970",
            "mintcream":"#f5fffa",
            "mistyrose":"#ffe4e1",
            "moccasin":"#ffe4b5",
            "navajowhite":"#ffdead",
            "navy":"#000080",
            "oldlace":"#fdf5e6",
            "olive":"#808000",
            "olivedrab":"#6b8e23",
            "orange":"#ffa500",
            "orangered":"#ff4500",
            "orchid":"#da70d6",
            "palegoldenrod":"#eee8aa",
            "palegreen":"#98fb98",
            "paleturquoise":"#afeeee",
            "palevioletred":"#d87093",
            "papayawhip":"#ffefd5",
            "peachpuff":"#ffdab9",
            "peru":"#cd853f",
            "pink":"#ffc0cb",
            "plum":"#dda0dd",
            "powderblue":"#b0e0e6",
            "purple":"#800080",
            "red":"#ff0000",
            "rosybrown":"#bc8f8f",
            "royalblue":"#4169e1",
            "saddlebrown":"#8b4513",
            "salmon":"#fa8072",
            "sandybrown":"#f4a460",
            "seagreen":"#2e8b57",
            "seashell":"#fff5ee",
            "sienna":"#a0522d",
            "silver":"#c0c0c0",
            "skyblue":"#87ceeb",
            "slateblue":"#6a5acd",
            "slategray":"#708090",
            "snow":"#fffafa",
            "springgreen":"#00ff7f",
            "steelblue":"#4682b4",
            "tan":"#d2b48c",
            "teal":"#008080",
            "thistle":"#d8bfd8",
            "tomato":"#ff6347",
            "turquoise":"#40e0d0",
            "violet":"#ee82ee",
            "wheat":"#f5deb3",
            "white":"#ffffff",
            "whitesmoke":"#f5f5f5",
            "yellow":"#ffff00",
            "yellowgreen":"#9acd32"};

        if (typeof colours[colour.toLowerCase()] != 'undefined')
            return colours[colour.toLowerCase()];

        return false;
    }
    $scope.showAddActionTakenDialog = function(alert) {
    	webSvc.getCorrectiveActionList(alert.actionListId).success(function(data) {
            if (data.status.code == 0) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/view-shipment-detail-share/new-action-taken.html',
                    controller: 'NewActionTakenController as VM',
                    resolve: {
                    	currentAlert: function() {return alert;},
                    	actionList:function() {return data.response.actions;},
                    	rootScope: function() {return $scope;}
                    }
                });
            } else {
                reject(data.status);
            }
    	});
    };
    $scope.showVerifyActionTakenDialog = function(action, currentAlert) {
        $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/verify-action-taken.html',
            controller: 'VerifyActionTakenController as VM',
            resolve: {
            	currentAction: function() {return action;},
            	rootScope: function() {return $scope;},
            	alert: function() {return currentAlert;}
            }
        });
    }

    $scope.verifyActionTaken = function(action) {
    	//prepare action taken before save
    	var req = {
    		id: action.id,
			comments: action.verifiedComments
    	};
    	webSvc.verifyActionTaken(req).then($scope.updateActionTakens);
    };
    
    $scope.saveActionTaken = function(action) {
    	//prepare action taken before save
    	var a = {
			action: action.action,
			comments: action.comments,
			alert: action.alert,
			confirmedBy: $rootScope.User.id,
			//in this string the action.time is the date object from dialog, need to be converted to string.
			time: moment(action.time).format('YYYY-MM-DDTHH:mm')
    	};

    	saveActionTaken(a);
    };
    
    function saveActionTaken (action) {
    	webSvc.saveActionTaken(action).then($scope.updateActionTakens);
    };
    
    $scope.showViewUserDetailsDialog = function(theUserId) {
        $rootScope.modalInstance = $uibModal.open({
            templateUrl: 'app/user-view/user-view.html',
            controller: 'UserViewCtrl',
            resolve: {
            	userId: function() {return theUserId;}
            }
        });
    }
}
