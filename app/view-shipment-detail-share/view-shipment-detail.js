appCtrls.controller('ViewShipmentDetailShareCtrl', ViewShipmentDetailShareCtrl);

function ViewShipmentDetailShareCtrl($scope, rootSvc, webSvc, localDbSvc, $stateParams, $uibModal, $state, $q, $log,
              $filter, $sce, $rootScope, $timeout, $window, $location, $interval, $controller, Color, NgMap) {
    rootSvc.SetPageTitle('View Shipment Detail');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipment Detail");
    var filter = $filter('filter')
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

    var tempUnits = localDbSvc.getDegreeUnits();
    if (tempUnits == 'Celsius') {
        tempUnits = 'C';
    } else {
        tempUnits = 'F';
    }

    var orderBy = $filter('orderBy');

    //$scope.AuthToken = localDbSvc.getToken();
    //$scope.ShipmentId = $stateParams.vsId;
    if ($stateParams.vsId) {
        $scope.ShipmentId = $stateParams.vsId;
    } else {
        $scope.sn = $stateParams.sn;
        $scope.trip = $stateParams.trip;
    }

    var plotLines = [];
    $scope.specialMarkers = [];
    $scope.normalMarkers = [];
    $scope.previousActiveMarker = -1;
    //includes all tracker info here
    $scope.trackers = [];
    var trackerRoute = null;
    //------MAIN TRACKER INDEX ------
    $scope.MI = 0;
    $scope.mapInfo = {};
    var bounds= null;

    //------CHART SERIES DATA  ------
    var chartSeries = new Array();
    var subSeries = new Array();
    var alertData = new Array();
    var lightPlotBand = new Array();
    var noteData = new Array();

    var currentShipmentId = null;
    var currentShipment = {};
    var currentDevice = {};
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
    }


    //google map first point
    $scope.firstPoint = {};
    $scope.currentPoint = {};
    //$scope.trackerPath = [];
    $scope.trackerColor = rootSvc.getTrackerColor(0);
    $scope.trackerMsg = new Array();

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
        if(trackerRoute != null){
            trackerRoute.setMap(null);
            trackerRoute = null;
        }
    });

    $scope.Print = function(){
        setTimeout(print, 100);
    }
    function print(){
        $window.print();
    }

    $scope.ViewReading = function($e, sn, trip) {
        $e.preventDefault();
        var url = $state.href('viewshipmentdetailtable', {sn:sn, trip: trip});
        var w = window.innerWidth * 0.7; //70% of fullwidth
        var options = "toolbar=0, titlebar=0, scrollbars=1, location=0, resizable=no, menubar=0, status=0, height=600, width=" + w;
        $log.debug('#Url', url);
        window.open(url,"_blank", options);
    }

    function updateMapData(index){
        NgMap.getMap('shipment-detail-map').then(function(map) {
            drawMap(map, index);
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
            var ll = new google.maps.LatLng(locations[i].lat, locations[i].lng);
            bounds.extend(ll);
            trackerPath.push({lat: locations[i].lat, lng: locations[i].lng});
            //markers
            var pos = [locations[i].lat, locations[i].lng];
            if(locations[i].alerts.length > 0){
                //console.log('Alert', locations[i].alerts)
                if(locations[i].alerts[0].type.toLowerCase() == 'lastreading'){
                    $scope.specialMarkers.push({
                        index: $scope.specialMarkers.length,
                        len: 16,
                        oi: i,
                        pos: pos,
                        data: locations[i],
                        icon: {
                            url:"theme/img/Tracker" + (index + 1) + ".png",
                            scaledSize:[16, 16],
                            anchor:[8, 8]
                        },
                        tinyIconUrl: "theme/img/tinyTracker" + (index + 1) + ".png"
                    });
                } else if (locations[i].alerts[0].type.toLowerCase() == 'lighton' || locations[i].alerts[0].type.toLowerCase() == 'lightoff') {
                    $scope.specialMarkers.push({
                        index:$scope.specialMarkers.length,
                        oi: i
                    })
                } else {
                    $scope.specialMarkers.push(
                        {
                            index: $scope.specialMarkers.length,
                            len: 24,
                            oi: i,
                            pos: pos,
                            data: locations[i],
                            //iconUrl: "theme/img/alert" + locations[i].alerts[0].type + ".png",
                            icon: {
                                url:"theme/img/alert" + locations[i].alerts[0].type + ".png",
                                scaledSize:[24, 24],
                                anchor:[12, 12]
                            },
                            tinyIconUrl: "theme/img/tinyAlert" + locations[i].alerts[0].type + ".png"
                        }
                    );
                }
            }
        }

        if(trackerRoute != null){
            trackerRoute.setMap(null);
            trackerRoute = null;
        }

        trackerRoute = new google.maps.Polyline({
            path: trackerPath,
            strokeColor: $scope.trackers[index].siblingColor,
            strokeOpacity: 1,
            strokeWeight: 5,
            map: map
        });
        map.fitBounds(bounds);
        //trackerRoute.setMap(map);
        //Apply Shape route first
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }

    $scope.switchTracker = function($event, index){
        $event.preventDefault();
        $log.debug('SwithTracker...', index)
        $location.search('sn', $scope.trackers[index].deviceSN);
        $location.search('trip', $scope.trackers[index].tripCount);
        $scope.chartConfig.redraw= true;
        $scope.changeActiveTracker(index);
    }

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
        $scope.mapInfo.startLocationForMap = $scope.trackers[index].startLocationForMap;
        $scope.mapInfo.startTimeISO = $scope.trackers[index].startTimeISO;
        $scope.mapInfo.startLocation = $scope.trackers[index].startLocation;
        $scope.mapInfo.endLocationForMap = $scope.trackers[index].endLocationForMap;
        $scope.mapInfo.endLocation = $scope.trackers[index].endLocation;
        if (!$scope.mapInfo.endLocation) {
            $scope.mapInfo.endLocation = 'Default';
        }

        $scope.mapInfo.etaISO = $scope.trackers[index].etaISO;
        $scope.mapInfo.arrivalTimeISO = $scope.trackers[index].arrivalTimeISO;
        $scope.mapInfo.lastReadingTimeISO = $scope.trackers[index].lastReadingTimeISO;

        $scope.trackerInfo = $scope.trackers[index];

        //-- update trackerInfo here
        $scope.trackerInfo.shutdownDeviceAfterMinutesText = parseInt($scope.trackerInfo.shutdownDeviceAfterMinutes/60) + " hr(s) after arrival";
        $scope.trackerInfo.shutDownAfterStartMinutesText = parseInt($scope.trackerInfo.shutDownAfterStartMinutes/60) + " hr(s) after start";

        $scope.trackerInfo.isNotifying = false;
        if ($scope.trackerInfo.arrivalNotificationWithinKm) {
            $scope.trackerInfo.arrivalNotificationText = $scope.trackerInfo.arrivalNotificationWithinKm + "km away";
            $scope.trackerInfo.isNotifying = true;
        } else if ($scope.trackerInfo.arrivalNotificationWithinKm==0){
            $scope.trackerInfo.arrivalNotificationText = "Upon Arrival";
            $scope.trackerInfo.isNotifying = true;
        } else {
            $scope.trackerInfo.arrivalNotificationText = "Don't notify";
            $scope.trackerInfo.isNotifying = false;
        }

        //check if latest shipment here
        $scope.shutdownAlready=false;
        $scope.suppressAlready=false;
        currentShipmentId = $scope.trackerInfo.shipmentId;

        var promise = webSvc.getShipment(currentShipmentId).success(function(data) {
            //console.log('CURRENT-SHIPMENT',currentShipmentId, data)
            currentShipment = data.response;
            if (currentShipment.shutdownTime) {
                $scope.shutdownAlready = true;
            }
            if (currentShipment.status == 'Ended' || currentShipment.status == 'Arrived') {
                $scope.isEndedOrArrived = true;
            }
            if ($scope.trackerInfo.alertsSuppressionTime) {
                $scope.suppressAlready = true;
            }
        }).then(function() {
            webSvc.getDevice(currentShipment.deviceImei).success(function(dd) {
                //console.log('CURRENT-DEVICE', dd);
                currentDevice = dd.response;
                if (currentShipmentId != currentDevice.lastShipmentId) {
                    $scope.isLatest = false;
                } else {
                    $scope.isLatest = true;
                }
            });
        });


        $q.all([promise]).then(function() {
            updatePlotLines();
            updateMapData($scope.MI);
        });
    }

    function updatePlotLines(){
        //--reset plotline
        plotLines.length = 0;
        //var ti = $scope.trackers[$scope.MI].locations;
        //plotLines.splice(0, plotLines.length);// = 0;
        //plotLines = [];
        //$log.debug('SubSeries', subSeries);
        //$log.debug('Tracker.MI', $scope.trackers[$scope.MI]);
        //$log.debug('MI', $scope.MI);
        var ti = subSeries[$scope.MI];
        var lastPoint = ti.length - 1;

        var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
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

        
        var dottext = "";
        var endLocationText = '';
        if($scope.trackers[$scope.MI].status.toLowerCase() == "arrived"){
            time = parseDate($scope.trackerInfo.arrivalTimeISO);
            endLocationText = $scope.mapInfo.endLocation;
        } else {
            var time = new Date();
            endLocationText += "To be determined";
        }

        if(time > parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod ||
            $scope.trackers[$scope.MI].status.toLowerCase() != "arrived"){
            color = "#ccc";
            width = 1;
            time = parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod + 1;
            dottext = '<sup><b class="dottext">...</b></sup>';
        }

        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: time,//mainData[lastPoint][0], // Value of where the line will appear
            width: width, // Width of the line    
            label: {
                //text:   '<img src="theme/img/locationStop.png" style="float:right; vertical-align:bottom;">' +
                text:   '<img src="theme/img/tinyLocationStop.png" class="rev-horizon" style="float:right; vertical-align:bottom;">' +
                        '<span style="text-align:right;float:right">' +
                            //'<b class="bold-font">' + $scope.mapInfo.endLocation + '</b><br/>' +
                            '<b class="bold-font">' + endLocationText + '</b><br/>' +
                            dottext +
                        '</span>',
                rotation: 0,
                useHTML: true,
                align: 'right',
                y: -20,
                x: -15
            }
        });
    }

    function prepareTrackerMessage(){
        var info = subSeries[$scope.MI];
        $scope.trackerMsg.length = 0;
        for(i = 0; i < info.length; i++){
            //prepare tracker message data
            var obj = {};
            obj.title = "Tracker " + info[i].deviceSN + "(" + info[i].tripCount + ")";
            obj.lines = ['<div><span class="tt_temperature">' + info[i].y.toFixed(1) + '<sup>o</sup>C</span><span>' + formatDate(info[i].x) + '</span></div>'];
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
        $scope.diagColor = $scope.trackers[$scope.MI].siblingColor;
        
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }
    $scope.hideAlertsUI = function(){
        $scope.ttShow = false;
    }
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
                        //$scope.currentPoint.iconUrl = "theme/img/outdot.png";
                        $scope.currentPoint.icon = {
                            url: 'theme/img/outdot.png',
                            anchor: [17.5,17.5]
                        };
                        break;
                    }
                }
            }
        })
    }

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
        timeBetweenClicks:1000,
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

        var groupList = [];
        var deviceSnListSameGroup = [];
        var info = null;
        webSvc.getSingleShipmentShare(params).success(function(graphData) {
            $log.debug("SINGLE-SHIPMENT", graphData);
            if(graphData.status.code !=0){
                toastr.error(graphData.status.message, "Error");
                return;
            }
            info = graphData.response;
            if (info == null) {
                $log.debug('Current user does not own this shipment!');
                $state.go('viewshipment'); //move to shipment-list
                return;
            }

            //--update color of tracker by calling getDevice

            groupList = info.deviceGroups ? info.deviceGroups : [];
            //$log.debug('Info', info);
            //$log.debug('groupList', groupList);

        }).then(function() {
            var promises = [];
            if (groupList.length > 0) {
                angular.forEach(groupList, function (val, key) {
                    var p = webSvc.getDevicesOfGroup(val.groupId).success(function (data) {
                        $log.debug('DevicesOfGroup#' + key, data);
                        angular.forEach(data.response, function (val, key) {
                            var serialNumber = val.sn;
                            if (!isNaN(serialNumber)) {
                                serialNumber = parseInt(val.sn, 10);
                            }
                            deviceSnListSameGroup.push(serialNumber);
                        })
                    });
                    promises.push(p);
                });
                $q.all(promises).then(function() {
                    calculateAndDraw();
                });
            } else {
                //-- groupList == [] only one device!
                calculateAndDraw();
            }
        });

        function calculateAndDraw() {
            if (!info) return;
            var numberOfSiblings = info.siblings.length;
            //-- modify siblings
            var siblings = [];
            //$log.debug('Number of Siblings', numberOfSiblings);
            //$log.debug('deviceSnListSameGroup', deviceSnListSameGroup);
            for(var i = 0; i<numberOfSiblings; i++) {
                if (deviceSnListSameGroup.indexOf(parseInt(info.siblings[i].deviceSN, 10)) >= 0) {
                    siblings.push(info.siblings[i]);
                }
            }

            numberOfSiblings = siblings.length;
            if (numberOfSiblings >= 5) {
                siblings.splice(5);
                $scope.notListed = numberOfSiblings - 5;
            }
            info.siblings = siblings;
            if (info == null) {
                $log.error('GRAPHDATA', graphData);
                return;
            }
            //--------Remove Light On, Off---------
            for(alert = 0; alert < info.alertSummary.length; alert ++){
                if(info.alertSummary[alert].toLowerCase() == "lighton"
                    || info.alertSummary[alert].toLowerCase() == "lightoff") {
                    info.alertSummary.splice(alert --, 1);
                }
            }
            //------------PREPARE TRACKERS INFO  BEGIN-------------
            var tempObj = {};
            for(var k in info){
                if(info.hasOwnProperty(k)){
                    tempObj[k] = info[k];
                }
            }
            if(tempObj.alertYetToFire != null)
                tempObj.alertYetToFire = tempObj.alertYetToFire.split(",");
            tempObj.loaded = true;
            tempObj.loadedForIcon = true;
            //next time, it only updates the main tracker info, not insert it to $scope.trackers
            if($scope.trackers.length == 0){
                $scope.trackers.push(tempObj);
                for(i = 0; i < info.siblings.length; i++){
                    $scope.trackers.push(info.siblings[i]);
                    $scope.trackers[i + 1].loaded = false;
                }
            } else {
                $scope.trackers[0] = tempObj;
            }

            var promiseSibling = [];
            angular.forEach(info.siblings, function(val, key) {
                var params =     {
                    params: {
                        shipmentId: val.shipmentId
                    }
                }
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
                            //prepareMainHighchartSeries();
                            //refreshHighchartSeries();
                            break;
                        }
                    }
                });
                promiseSibling.push(p);
            });
            var deviceList = [];
            var promiseDevice = webSvc.getDevices(1000, 1, 'description', 'asc').success(function(data) {
                //console.log('DeviceList', data.response);
                deviceList = data.response;
            });
            promiseSibling.push(promiseDevice);
            $q.all(promiseSibling).then(function() {
                //update color of tracker here
                //var promiseTrackers = [];
                angular.forEach($scope.trackers, function(tracker, k) {
                    //update color
                    var colorName = filter(deviceList, {sn: tracker.deviceSN}, true);
                    if (colorName && (colorName.length > 0)) {
                        colorName = colorName[0].color;
                    }
                    var color = filter(Color, {name: colorName}, true);
                    if (color && (color.length > 0)) {
                        color = color[0];
                    } else {
                        color = Color[0];
                    }
                    $scope.trackers[k].siblingColor = color.code;
                    $scope.trackers[k].index = k;

                    //-- update deviceSN
                    if (!isNaN(tracker.deviceSN)) {
                        $scope.trackers[k].deviceSN = parseInt(tracker.deviceSN, 10);
                    }
                });
                //prepareMainHighchartSeries();
                //refreshHighchartSeries();
            }).then(function () {
                $scope.changeActiveTracker($scope.MI);
            });

            //set tracker information
            angular.forEach(tempObj.alertsNotificationSchedules, function(child, index){
                child.index = index;
            });

            //start and end location info

            var locations = info.locations;
            //google map data
            $scope.firstPoint = locations[0];
            //$scope.currentPoint.loc = locations[0];
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
                                },
                            }
                        }
                    },
                    scrollbar : {
                        enabled : false,
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
                        hideDelay: 500,
                        formatter: function () {
                            if (this.points) {
                                var index, length = subSeries[$scope.MI].length;
                                for(index = 0; index < length; index ++){
                                    var x = subSeries[$scope.MI][index].x;
                                    var x1 = index+1 < length ? subSeries[$scope.MI][index+1].x : 0;
                                    if (index == 0 && this.x < x) break;
                                    if(x <= this.x && this.x < x1) break;
                                    if (index == length-1) {
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
                                c += "<div class='tt_title' style='background-color:" + color + "'>"
                                c += "Note " + this.point.noteNum + "</div>"
                                c += "<div style='clear:both;'></div>";
                                c += "<div class='tt_body wordwrap'>";
                                c += this.point.noteText;
                                c += "</div>"
                                c += "</div>"
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
                            text: 'Temperature °'+ tempUnits,
                            y: -10
                        },
                        labels:{
                            align:'right',
                            x:-10
                        },
                        tickInterval: tickInterval,
                        plotBands: [{
                            from: 0,
                            to: 5,
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
            color: $scope.trackers[$scope.MI].siblingColor,
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
        var gap = new Array(); 
        gap.push([parseDate(ti[0].timeISO) - mainTrackerPeriod, ti[0].temperature]);
        gap.push([parseDate(ti[lastPoint].timeISO) + mainTrackerPeriod, ti[lastPoint].temperature]);

        for (i = 0; i < subSeries.length; i ++) {
            if(i == $scope.MI || !$scope.trackers[i].loaded) continue;
            chartSeries.push({
                name: "Tracker " + $scope.trackers[i].deviceSN + "(" + $scope.trackers[i].tripCount + ")",
                color: $scope.trackers[i].siblingColor,
                lineWidth: 1,
                data: subSeries[i],
                enableMouseTracking: false
            });   
        }

        // console.log(chartSeries);
        chartSeries.push({
            data: gap,
            enableMouseTracking: false,
            color: gapColor
        });

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
            color: $scope.trackers[$scope.MI].siblingColor,
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
        // console.log($scope.MI);
        // debugger;
        //for(i = 0 ; i < $scope.trackers[$scope.MI].locations.length; i ++){
        for(i = 0 ; i < subSeries[$scope.MI].length; i ++){
        //    var alertinfo = $scope.trackers[$scope.MI].locations[i].alerts;
            var alertinfo = subSeries[$scope.MI][i].alerts;
            if(alertinfo.length == 1){
                var str = alertinfo[0].type;
                var alert = "";
                
                
                if(str == "LastReading") str = "Tracker" + ($scope.MI + 1);
                else alert = "Alert";
                obj = {};
                obj.x = subSeries[$scope.MI][i].x; //time-x
                obj.y = subSeries[$scope.MI][i].y; //temperature-y
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/' + alert.toLowerCase() + str + '.png)'
                };

                if(str.toLowerCase() == "lighton"){
                    plot.from = subSeries[$scope.MI][i].x;
                } else if(str.toLowerCase() == "lightoff"){
                    plot.to = subSeries[$scope.MI][i].x;
                    plot.color = 'rgba(255, 255, 0, 0.2)';
                    if(plot.from != null){
                        lightPlotBand.push(plot);
                        plot = {};
                        plot.from = null;
                    }
                } else {
                    var tmpArray = new Array();
                    tmpArray.push(obj);
                    alertData.unshift(tmpArray);
                }
                //update msg
                var msg = {};

                msg.title = "<table><tr><td valign='middle'><img style='float: left; padding-right: 3px' src='theme/img/tiny" + alert + str + ".png'/></td><td>" + alertinfo[0].title + "</td></tr></table>";
                msg.lines = [alertinfo[0].Line1];   
                if(alertinfo[0].Line2 != undefined){
                    msg.lines.push(alertinfo[0].Line2);
                }
                $scope.trackerMsg[i] = [msg];
            } else if(alertinfo.length > 1){
                obj = {};
                obj.x = subSeries[$scope.MI][i].x;
                obj.y = subSeries[$scope.MI][i].y;
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/alerts.png)'
                };
                var tmpArray = new Array();
                tmpArray.push(obj);
                alertData.unshift(tmpArray);
                //update msg
                var alertmsg = [];
                for(var k = 0; k < alertinfo.length; k++){
                    var str = alertinfo[k].type;
                    //for light on/off, show yellow bar and hide icons
                    //by not adding to the alert list
                    if(str.toLowerCase() == "lighton"){
                        plot.from = subSeries[$scope.MI][i].x;
                    } else if(str.toLowerCase() == "lightoff"){
                        plot.to = subSeries[$scope.MI][i].x;
                        plot.color = 'rgba(255, 255, 0, 0.2)';
                        if(plot.from != null){
                            lightPlotBand.push(plot);
                            plot = {};
                            plot.from = null;
                        }
                    }
                    var alert = "";
                    if(str == "LastReading") str = "Tracker" + ($scope.MI + 1);
                    else alert = "Alert";
                    var msg = {};
                    msg.title = "<span><img src='theme/img/tiny" + alert + str + ".png'/></span><span>" + alertinfo[k].title + "</span>";
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
        
        var gap = (endTime - startTime) / 25;
        startTime -= gap;
        endTime += gap;

        //Add siblings tracker data to the subSeries
        var tempMin = null, tempMax = null;   //to calculate y-axis interval;
        //console.log('TrackerI', $scope.trackers);
        for(i = 0; i < $scope.trackers.length; i++){
            if(!$scope.trackers[i].loaded) {
                subSeries.push(new Array());
                continue;
            }
            var locations = $scope.trackers[i].locations;
            var skipCnt = locations.length / 300;
            var tmpCnt = 0;
            var series = new Array();
            if(tempMax == null){
                tempMax = tempMin = locations[0].temperature;
            }
            for(j = 0; j < locations.length; j++){
                //-- update shipmentNotes
                var check = updateNote(locations[j]);
                if(j != 0){
                    if(++tmpCnt <= skipCnt) {
                        if((locations[j].alerts.length == 0) && !check){
                            continue;
                        }
                    } else {
                        tmpCnt = 0;
                    }
                }

                temp = {};
                temp.x = parseDate(locations[j].timeISO);
                temp.y = locations[j].temperature;
                temp.timeISO = locations[j].timeISO;
                temp.alerts = locations[j].alerts;
                temp.lat = locations[j].lat;
                temp.lng = locations[j].long;
                temp.shipmentId = $scope.trackers[i].shipmentId;
                temp.tripCount = $scope.trackers[i].tripCount;
                temp.deviceSN = $scope.trackers[i].deviceSN;

                if(tempMax < locations[j].temperature){
                    tempMax = locations[j].temperature;
                }
                if(tempMin > locations[j].temperature){
                    tempMin = locations[j].temperature;
                }
                if(startTime <= temp.x && temp.x <= endTime){
                    series.push(temp);
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
        var m_names = new Array("Jan", "Feb", "Mar", 
            "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
            "Oct", "Nov", "Dec");
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
        var m_names = new Array("Jan", "Feb", "Mar", 
            "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
            "Oct", "Nov", "Dec");
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
        if ($scope.isLatest) {
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
            var temShipmentNumber = currentDevice.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                currentDevice.tripCount = parseInt(n);
            }
            currentDevice.sn = parseInt(currentDevice.sn);
            var link = '<a ng-href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            toastr.warning("Warning. This device can only be shutdown from the latest shipment " + link);
        }
    };
    $scope.confirmSuppress = function(Id) {
        if ($scope.suppressAlready) {
            toastr.warning('Alerts have already been suppressed for this shipment.');
        } else
        if ($scope.isEndedOrArrived) {
            var temShipmentNumber = currentDevice.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                currentDevice.tripCount = parseInt(n, 10);
            }
            currentDevice.sn = parseInt(currentDevice.sn);
            var link = '<a href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            toastr.warning('Warning. This shipment was ended or arrived ' + link);
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

    $scope.EditDescription = function(Id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-description.html',
            controller: 'EditShipmentDetailDescription',
            resolve: {
                editId : function() {
                    return Id;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                $scope.trackerInfo.shipmentDescription = result;
            }
        );
    }
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
    }
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
    }
    $scope.EditComment = function(Id) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/view-shipment-detail-share/edit-comment.html',
            controller: 'EditShipmentDetailComment',
            resolve: {
                editId : function() {
                    return Id;
                }
            }
        });
        modalInstance.result.then(
            function(result) {
                $scope.trackerInfo.commentsForReceiver = result;
            }
        );
    }

    //-- edit shippment from
    $scope.EditShipmentFrom = function() {

    }
    //-- edit shipment to
    $scope.EditShipmentTo = function() {

    }
    //-- edit shipment status
    $scope.EditShipmentStatus = function() {

    }


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
    }
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
    }
};

appCtrls.controller('EditShipmentDetailDescription', ['$scope', '$uibModalInstance', 'webSvc', 'editId',
function($scope, $uibModalInstance, webSvc, editId) {
    $scope.editId = editId;
    webSvc.getShipment(editId).success(function(data) {
        if (data.status.code == 0) {
            $scope.shipment = data.response;
        }
    })
    $scope.saveShipment  = function() {
        var savingObject = {};
        savingObject.saveAsNewTemplate = false;
        savingObject.includePreviousData = false;

        savingObject.shipment = $scope.shipment;
        console.log('Shipment', $scope.shipment);
        webSvc.saveShipment(savingObject).success(function(data) {
            if (data.status.code == 0) {
                toastr.success('Description updated for shipment ' + $scope.shipment.deviceSN + '(' + $scope.shipment.tripCount + ')');
            } else {
                toastr.error('You have no permission to update shipment');
            }
        })
        $uibModalInstance.close($scope.shipment.shipmentDescription);
    }
    $scope.cancelEdit = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
appCtrls.controller('EditShipmentDetailComment', ['$scope', '$uibModalInstance', 'webSvc', 'editId',
    function($scope, $uibModalInstance, webSvc, editId) {
        $scope.editId = editId;
        webSvc.getShipment(editId).success(function(data) {
            if (data.status.code == 0) {
                $scope.shipment = data.response;
            }
        });
        $scope.saveShipment  = function() {
            var savingObject = {};
            savingObject.saveAsNewTemplate = false;
            //savingObject.includePreviousData = false;

            savingObject.shipment = $scope.shipment;
            webSvc.saveShipment(savingObject).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success('Comment updated for shipment ' + $scope.shipment.deviceSN + '(' + $scope.shipment.tripCount + ')');
                } else {
                    toastr.error('You have no permission to update shipment');
                }
            })
            $uibModalInstance.close($scope.shipment.commentsForReceiver);
        }
        $scope.cancelEdit = function () {
            $uibModalInstance.dismiss('cancel');
        };
}]);
