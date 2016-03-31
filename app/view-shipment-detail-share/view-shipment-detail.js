﻿appCtrls.controller('ViewShipmentDetailShareCtrl',
function ($scope, rootSvc, webSvc, localDbSvc, $stateParams, $modal, $state,
              $filter, NgMap, $sce, $rootScope, $templateCache, $timeout, $window, $location)
{
    rootSvc.SetPageTitle('View Shipment Detail');
    rootSvc.SetActiveMenu('View Shipment');
    rootSvc.SetPageHeader("View Shipment Detail");

    $scope.AuthToken = localDbSvc.getToken();
    //$scope.ShipmentId = $stateParams.vsId;
    if ($stateParams.vsId) {
        $scope.ShipmentId = $stateParams.vsId;
    } else {
        $scope.sn = $stateParams.sn;
        $scope.trip = $stateParams.trip;
    }

    //--update $rootScope roles
    function reloadIfNeed() {
        if ($rootScope.User) {
            return $rootScope.User;
        } else {
            webSvc.getUser().success(function (data) {
                if(data.status.code == 0){
                    $rootScope.User = data.response;
                }
            });
        }

        if ($rootScope.RunningTime == null) {
            //reload user-time
            webSvc.getUserTime().success( function (timeData) {
                //console.log('USER-TIME', timeData);
                if (timeData.status.code == 0) {
                    $rootScope.RunningTimeZoneId = timeData.response.timeZoneId // get the current timezone
                    $rootScope.moment = moment.tz($rootScope.RunningTimeZoneId);
                    $scope.tickInterval = 1000 //ms
                    var tick = function () {
                        $rootScope.RunningTime = $rootScope.moment.add(1, 's').format("Do-MMM-YYYY h:mm a");
                        $timeout(tick, $scope.tickInterval); // reset the timer
                    }
                    // Start the timer
                    $timeout(tick, $scope.tickInterval);
                }
            });
        }
    }
    reloadIfNeed();

    var plotLines = new Array();
    $scope.vm = this;
    $scope.specialMarkers = new Array();
    $scope.normalMarkers = new Array();
    $scope.previousActiveMarker = -1;
    //includes all tracker info here
    $scope.trackers = new Array();
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
    $scope.trackerPath = [];
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
    });
    //------Reload data every 10 min END-------

    $scope.$on('mapInitialized', function(event, m) {
        $scope.vm.map = m;
        if(bounds != null){
            $scope.vm.map.fitBounds(bounds); 
        }
        if(trackerRoute != null){
            trackerRoute.setMap($scope.vm.map);
        }
    });

    $scope.Print = function(){
        //$print = $("#print-content").detach();
        //$print.empty();
        //$print.append($(".left-panel").clone());
        //$print.append($("#chart1").clone());
        //$print.append($("ng-map").clone());
        //// $print.append($(".col-sm-9").clone());
        //$("body").append($print);

        /*var printDoc = document.createElement('div');
        printDoc.style.position='fixed';
        printDoc.style.top=0;
        printDoc.style.bottom=0;
        printDoc.innerHTML = document.getElementsByClassName('left-panel') + document.getElementById('chart1');
        //printDoc.appendChild(document.getElementById('chart1'));
        printDoc.print();*/
        setTimeout(print, 100);
    }
    function print(){
        $window.print();
    }

    function updateMapData(index){
        var locations = subSeries[index];

        $scope.trackerPath.length = 0;
        $scope.specialMarkers.length = 0;
        $scope.normalMarkers.length = 0;

        // console.log($scope.vm.map);
        bounds = new google.maps.LatLngBounds;
        //for (var j = 0; j < $scope.trackers[index].locations.length; j++) {
        //    bounds.extend(new google.maps.LatLng($scope.trackers[index].locations[j].lat, $scope.trackers[index].locations[j].long))
        //}

        for(i = 0 ; i < locations.length; i ++){
            var ll = new google.maps.LatLng(locations[i][3], locations[i][4]);
            bounds.extend(ll);
            $scope.trackerPath.push({lat: locations[i][3], lng: locations[i][4]});
            //markers
            var pos = [locations[i][3], locations[i][4]];
            if(locations[i][2].length > 0){
                if(locations[i][2][0].type == 'LastReading'){
                    $scope.specialMarkers.push(
                        {
                            index: $scope.specialMarkers.length,
                            len: 16,
                            oi: i,
                            pos: pos,
                            data: locations[i],
                            iconUrl: "theme/img/Tracker" + (index + 1) + ".png",
                            icon: {
                                url:"theme/img/Tracker" + (index + 1) + ".png",
                                scaledSize:[16, 16],
                                anchor:[8, 8]
                            },
                            tinyIconUrl: "theme/img/tinyTracker" + (index + 1) + ".png"
                        }
                    );
                } else if(locations[i][2][0].type.toLowerCase() != 'lighton' && locations[i][2][0].type.toLowerCase() != 'lightoff') {
                    $scope.specialMarkers.push(
                        {
                            index: $scope.specialMarkers.length,
                            len: 24,
                            oi: i,
                            pos: pos,
                            data: locations[i],
                            iconUrl: "theme/img/alert" + locations[i][2][0].type + ".png",
                            icon: {
                                url:"theme/img/alert" + locations[i][2][0].type + ".png",
                                scaledSize:[24, 24],
                                anchor:[12, 12]
                            },
                            tinyIconUrl: "theme/img/tinyAlert" + locations[i][2][0].type + ".png"
                        }
                    );
                }
            }
            // $scope.normalMarkers.push({index: $scope.normalMarkers.length, oi: i, data: locations[i], iconUrl: "theme/img/edot.png", len: 12, normal: true});
        }

        //map bound part
        // console.log($scope.mapInfo);
        //if($scope.mapInfo.endLocationForMap != null)
        //    bounds.extend(new google.maps.LatLng($scope.mapInfo.endLocationForMap.latitude, $scope.mapInfo.endLocationForMap.longitude));
        //if($scope.mapInfo.startLocationForMap != null)
        //bounds.extend(new google.maps.LatLng($scope.mapInfo.startLocationForMap.latitude, $scope.mapInfo.startLocationForMap.longitude));
        
        if(trackerRoute != null){
            trackerRoute.setMap(null);
        }

//        console.log('TrackerPath', $scope.trackerPath);

        trackerRoute = new google.maps.Polyline({
            path: $scope.trackerPath,
            strokeColor: $scope.trackers[index].siblingColor,
            strokeOpacity: 1,
            strokeWeight: 5
        });
        // console.log($scope.vm.map, bounds);
        if($scope.vm.map != undefined){
            $scope.vm.map.fitBounds(bounds);
            trackerRoute.setMap($scope.vm.map);
            //Apply Shape route first
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        }
    }

    $scope.switchTracker = function(index){
        $scope.chartConfig.redraw= true;
        updateMapData(index);
        $scope.changeActiveTracker(index);
    }

    $scope.changeActiveTracker = function(index){

        $scope.MI = index;
        if($scope.trackers[index].locations.length == 0){
            toastr.warning("No data recorded yet!", "Empty Track");
            return;
        }

        //console.log($scope.trackerInfo);
        prepareMainHighchartSeries();
        prepareTrackerMessage();
        prepareAlertHighchartSeries();
        refreshHighchartSeries();

        //-------PREPARE HIGHCHART DATA-------
        // prepareHighchartSeries();
        //Map start and end location info
        $scope.mapInfo.startLocationForMap = $scope.trackers[index].startLocationForMap;
        $scope.mapInfo.startTimeISO = $scope.trackers[index].startTimeISO;
        $scope.mapInfo.startLocation = $scope.trackers[index].startLocation;
        $scope.mapInfo.endLocationForMap = $scope.trackers[index].endLocationForMap;
        $scope.mapInfo.endLocation = $scope.trackers[index].endLocation;
        $scope.mapInfo.etaISO = $scope.trackers[index].etaISO;
        $scope.mapInfo.arrivalTimeISO = $scope.trackers[index].arrivalTimeISO;
        $scope.mapInfo.lastReadingTimeISO = $scope.trackers[index].lastReadingTimeISO;

        $scope.trackerInfo = $scope.trackers[index];

        //-- update trackerInfo here
        $scope.trackerInfo.shutdownDeviceAfterMinutesText = parseInt($scope.trackerInfo.shutdownDeviceAfterMinutes/60) + " hr(s) after arrival";
        $scope.trackerInfo.shutDownAfterStartMinutesText = parseInt($scope.trackerInfo.shutDownAfterStartMinutes/60) + " hr(s) after start";

        //check if latest shipment here
        $scope.shutdownAlready=false;
        $scope.suppressAlready=false;
        currentShipmentId = $scope.trackerInfo.shipmentId;
        webSvc.getShipment(currentShipmentId).success(function(data) {
            console.log('CURRENT-SHIPMENT',currentShipmentId, data)
            currentShipment = data.response;
            if (currentShipment.shutdownTime) {
                $scope.shutdownAlready = true;
            }
            if (currentShipment.status == 'Ended' || currentShipment.status == 'Arrived') {
                $scope.suppressAlready = true;
                $scope.isEndedOrArrived = true;
            }
            webSvc.getDevice(currentShipment.deviceImei).success(function(dd) {
                console.log('CURRENT-DEVICE', dd);
                currentDevice = dd.response;
                if (currentShipmentId != currentDevice.lastShipmentId) {
                    $scope.isLatest = false;
                } else {
                    $scope.isLatest = true;
                }
            })
        })


        updatePlotLines();
    }

    function updatePlotLines(){
        while(plotLines.length > 0){
            plotLines.pop();
        }

        var ti = $scope.trackers[$scope.MI].locations;
        var lastPoint = ti.length - 1;
        var mainTrackerPeriod = parseDate(ti[lastPoint].timeISO) - parseDate(ti[0].timeISO);
        mainTrackerPeriod /= 25;
        var color = "#000";
        var width = 2;
        // <b class="bold-font">' + $scope.mapInfo.startLocation + '</b>
        plotLines.push({
            color: color, // Color value
            dashStyle: 'solid', // Style of the plot line. Default to solid
            value: parseDate($scope.mapInfo.startTimeISO), // Value of where the line will appear
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
        if($scope.trackers[$scope.MI].status.toLowerCase() == "arrived"){
            time = parseDate($scope.trackerInfo.arrivalTimeISO);
        } else {
            var time = new Date();
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
                text:   '<img src="theme/img/locationStop.png" style="float:right; vertical-align:bottom;">' + 
                        '<span style="text-align:right;float:right">' + 
                            '<b class="bold-font">' + $scope.mapInfo.endLocation + '</b><br/>' + 
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
        while($scope.trackerMsg.length > 0){
            $scope.trackerMsg.pop();
        }

        for(i = 0; i < subSeries[$scope.MI].length; i++){
                    //prepare tracker message data
            var obj = {};
            obj.title = "Tracker " + info[i][6] + "(" + info[i][5] + ")";
            obj.lines = ['<div><span class="tt_temperature">' + info[i][1].toFixed(1) + '<sup>o</sup>C</span><span>' + formatDate(info[i][0]) + '</span></div>'];
            $scope.trackerMsg.push([obj]);
        }
        // console.log($scope.trackerMsg.length);
    }

    $scope.showPathInfo = function(){
        // console.log(this);
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
//        console.log('msgForMap', $scope.msgForMap);
        $scope.diagColor = $scope.trackerColor;
        
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        // if($scope.markerData.data.alerts[0].type == "LastReading"){
            // $scope.diagColor = $scope.trackerColor;
        // }
        // updateMapMarker();
    }
    $scope.hideAlertsUI = function(){
        $scope.ttShow = false;
    }
    $scope.showAlerts = function(index){
        //mouse out
        if(index == -1){
            $scope.currentPoint.iconUrl = "theme/img/edot.png";
            $scope.currentPoint.len = 12;
            $scope.currentPoint.icon = {
                url: 'theme/img/edot.png',
                anchor: [6,6]
            }
        } else {
            //For alerts, only black circle without point in it.
            $scope.currentPoint.iconUrl = "theme/img/dot.png";
            //$scope.currentPoint.loc = $scope.trackers[$scope.MI].locations[index];
            $scope.currentPoint.loc = {lat: subSeries[$scope.MI][index][3], long: subSeries[$scope.MI][index][4]};
            $scope.currentPoint.icon = {
                url: 'theme/img/dot.png',
                anchor: [17.5,17.5]
            };
            $scope.currentPoint.len = 35;
            //console.log($scope.specialMarkers);
            for(i = 0; i < $scope.specialMarkers.length; i++){
                if($scope.specialMarkers[i].oi == index){
                    $scope.currentPoint.iconUrl = "theme/img/outdot.png";
                    $scope.currentPoint.icon = {
                        url: 'theme/img/outdot.png',
                        anchor: [17.5,17.5]
                    };
                    break;
                }
            }

        }
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }

    loadTrackerData();    

    function loadTrackerData(){

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
                    sn : $scope.sn,
                    trip : $scope.trip
                }
            };
        }

        //console.log('PARAMS', params);
        webSvc.getSingleShipmentShare(params).success( function (graphData) {
            console.log("SINGLE-SHIPMENT", graphData);
            if(graphData.status.code !=0){
                toastr.error(graphData.status.message, "Error");
                return;
            }

            var info = graphData.response;

            //--------Remove Light On, Off---------
            for(alert = 0; alert < info.alertSummary.length; alert ++){
                if(info.alertSummary[alert].toLowerCase() == "lighton" 
                    || info.alertSummary[alert].toLowerCase() == "lightoff") {
                    info.alertSummary.splice(alert --, 1);
                }
            }
            //--------Remove Light On, Off---------
            //console.log(info);

            

            // console.log("******", info.locations.length);

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
            //console.log("MainTracker", tempObj.locations.length);
            //$scope.trackers[0] is the main tracker here.
            //at the first time, it addes new tracker info to the $scope.trackers
            //next time, it only updates the main tracker info, not insert it to $scope.trackers
            if($scope.trackers.length == 0){
                $scope.trackers.push(tempObj);
                for(i = 0; i < info.siblings.length; i++){
                    $scope.trackers.push(info.siblings[i]);
                    $scope.trackers[i + 1].loaded = false;
                }
            }
            else
                $scope.trackers[0] = tempObj;

            //Load Sibling Shipment details
            
            //refresh siblings
            
            //reload sibling info
            for(i = 0; i < info.siblings.length; i++){
                $scope.trackers[i + 1].loadedForIcon = false;

                /*var params = {
                 params: {
                 shipmentId: shipmentId
                 }
                 };*/
                var params = {
                    params: {
                        shipmentId: info.siblings[i].shipmentId
                    }
                }
                //console.log('PARAMS', params)
                webSvc.getSingleShipmentShare(params).success( function (graphData) {
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
            }
            for(i = 0; i < $scope.trackers.length; i++){
                $scope.trackers[i].siblingColor = rootSvc.getTrackerColor(i);
                $scope.trackers[i].index = i;
            }
            //------------PREPARE TRACKERS INFO    END-------------

            //set tracker information
            angular.forEach(tempObj.alertsNotificationSchedules, function(child, index){
                child.index = index;
            });

            //start and end location info

            var locations = info.locations;
            //google map data
            $scope.firstPoint = locations[0];
            $scope.currentPoint.loc = locations[0];
            $scope.currentPoint.iconUrl = "theme/img/edot.png";
            $scope.changeActiveTracker($scope.MI);
            updateMapData($scope.MI);

            // console.log($scope.trackerPath);
            $scope.chartConfig = {
                redraw: false,
                options:{
                    plotOptions: {
                        series: {
                            point: {
                                events: {
                                    mouseOver: function () {
                                        var idx;
                                        for(index = 0; index < subSeries[$scope.MI].length; index ++){
                                            if(subSeries[$scope.MI][index][0] == this.x){
                                                idx = index;
                                                break;
                                            }
                                        }
                                        // $scope.firstPoint = $scope.trackers[$scope.MI].locations[idx];
                                        // console.log(idx);
                                        $scope.showAlerts(idx);
                                    },
                                    mouseOut: function () {
                                        $scope.showAlerts(-1);
                                    }
                                }
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
                            var index;
                            for(index = 0; index < subSeries[$scope.MI].length; index ++){
                                if(subSeries[$scope.MI][index][0] == this.x) break;
                            }
                            var color = this.points[0].series.color;
                            msg = $scope.trackerMsg[index];
                            var message = "";

                            for(var j = 0; j < msg.length; j ++){
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
                            text: 'Temperature °C',
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

        });
    }   

    function refreshHighchartSeries(){

        // console.log($scope.MI);
        while(chartSeries.length > 0){
            chartSeries.pop();
        }

        chartSeries.push({
            name: "Tracker " + $scope.trackers[$scope.MI].deviceSN + "(" + $scope.trackers[$scope.MI].tripCount + ")",
            marker: {
                symbol: 'url(theme/img/dot.png)'
            },
            color: $scope.trackers[$scope.MI].siblingColor,
            lineWidth: 3,
            data: subSeries[$scope.MI]
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
                enableMouseTracking: false,
                data: alertData[i]
            });
        }
    }

    function prepareAlertHighchartSeries(){
        
        //while(lightPlotBand.length > 0){
        //    lightPlotBand.pop();
        //}
        lightPlotBand.length = 0;

        var plot = {};
        plot.from = null;
        /*while(alertData.length > 0){
            alertData.pop();
        }*/
        alertData.length = 0;
        // console.log($scope.MI);
        // debugger;
        //for(i = 0 ; i < $scope.trackers[$scope.MI].locations.length; i ++){
        for(i = 0 ; i < subSeries[$scope.MI].length; i ++){
        //    var alertinfo = $scope.trackers[$scope.MI].locations[i].alerts;
            var alertinfo = subSeries[$scope.MI][i][2];
            if(alertinfo.length == 1){
                var str = alertinfo[0].type;
                var alert = "";
                
                
                if(str == "LastReading") str = "Tracker" + ($scope.MI + 1);
                else alert = "Alert";
                obj = {};
                obj.x = subSeries[$scope.MI][i][0]; //time-x
                obj.y = subSeries[$scope.MI][i][1]; //temperature-y
                obj.marker = {
                    enabled: true,
                    symbol: 'url(theme/img/' + alert.toLowerCase() + str + '.png)'
                };

                if(str.toLowerCase() == "lighton"){
                    plot.from = subSeries[$scope.MI][i][0];
                } else if(str.toLowerCase() == "lightoff"){
                    plot.to = subSeries[$scope.MI][i][0];
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

                msg.title = "<img src='theme/img/tiny" + alert + str + ".png'/><span>" + alertinfo[0].title + "</span>";
                msg.lines = [alertinfo[0].Line1];   
                if(alertinfo[0].Line2 != undefined){
                    msg.lines.push(alertinfo[0].Line2);
                }
                $scope.trackerMsg[i] = [msg];
            } else if(alertinfo.length > 1){
                obj = {};
                obj.x = subSeries[$scope.MI][i][0];
                obj.y = subSeries[$scope.MI][i][1];
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
                        plot.from = subSeries[$scope.MI][i][0];
                    } else if(str.toLowerCase() == "lightoff"){
                        plot.to = subSeries[$scope.MI][i][0];
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
                    msg.title = "<img src='theme/img/tiny" + alert + str + ".png'/><span>" + alertinfo[k].title + "</span>";
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
        //Destination
        obj = {};
        // console.log(subSeries, $scope.MI, lastPoint);
        obj.x = subSeries[$scope.MI][lastPoint][0];
        obj.y = subSeries[$scope.MI][lastPoint][1];
        obj.z = 30;
        obj.marker = {
            enabled: true,
            symbol: 'url(theme/img/tracker' + ($scope.MI + 1) + '.png)'
        };

        // trackerDest.pop();
        // trackerDest.push(obj);
    }

    $scope.generatePDF = function(){

        console.log("clicked pdf button");
        var printContents ='<html><head><link rel="stylesheet" href="./css/app.css"/></head><body id="pdf">'+document.getElementById("print-content").innerHTML+'</body></html>';
        alert("OK");
        alert(document.getElementById("print-content").innerHTML);
        var popupWin = window.open('', 'app', '');
        popupWin.document.open();
        popupWin.document.write(printContents);
        try{
            //var pdf = new jsPDF('p','pt','a4');
            var pdf = new jsPDF('landscape');
            pdf.addHTML(popupWin.document.body,function() {
                var string = pdf.output('datauristring');
                $('.preview-pane').attr('src', string);
            });
        }
        catch(e) {
            console.error(e.message,e.stack,e);
        }

        var file ='Demo';

        if (typeof doc !== 'undefined') {
            doc.save(file + '.pdf');
        } else if (typeof pdf !== 'undefined') {
            setTimeout(function() {
                pdf.save(file + '.pdf');
            }, 2000);
        } else {
            alert('Error 0xE001BADF');
        }
    }

    function prepareMainHighchartSeries(){
        
        /*while(subSeries.length > 0){
            subSeries.pop();
        }*/
        subSeries.length = 0;

        //calculate chart arrange and cut down the others
        var startTime = parseDate($scope.trackers[$scope.MI].locations[0].timeISO);
        var endTime = parseDate($scope.trackers[$scope.MI].locations[$scope.trackers[$scope.MI].locations.length - 1].timeISO);
        
        var gap = (endTime - startTime) / 25;

        startTime -= gap;
        endTime += gap;

        //Add siblings tracker data to the subSeries
        var tempMin = null, tempMax = null;   //to calculate y-axis interval;
//        console.log('TrackerI', $scope.trackers);
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
                if(j != 0){
                    if(++tmpCnt <= skipCnt) {
                        if(locations[j].alerts.length == 0) continue;
                    } else {
                        tmpCnt = 0;
                    }
                }

                temp = new Array();
                temp.push(parseDate(locations[j].timeISO)); //--[0]
                temp.push(locations[j].temperature);        //--[1]
                temp.push(locations[j].alerts);             //--[2]
                temp.push(locations[j].lat);                //--[3]
                temp.push(locations[j].long);               //--[4]
                //--
                temp.push($scope.trackers[i].tripCount);    //--[5]
                temp.push($scope.trackers[i].deviceSN);     //--[6]
                //--
                //temp.push($scope.trackers[i].startLocationForMap);
                //temp.push($scope.trackers[i].endLocationForMap);

                if(tempMax < locations[j].temperature){
                    tempMax = locations[j].temperature;
                }
                if(tempMin > locations[j].temperature){
                    tempMin = locations[j].temperature;
                }
                if(startTime <= temp[0] && temp[0] <= endTime){
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
        var newDate = date.replace('-', '/').replace('-', '/') + ":00";
        return Date.parse(newDate);
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

    $scope.viewReading = function() {
        $state.go('#/view-shipment-detail-table?sn='+$scope.trackerInfo.deviceSN+'&trip='+$scope.trackerInfo.tripCount);
    }

    $scope.confirmShutdown = function(shipmentId) {
        if ($scope.isLatest) {
            if (!$scope.shutdownAlready) {
                var modalInstance = $modal.open({
                    templateUrl: '/app/view-shipment-detail-share/confirm-shutdown.html',
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
                toastr.warning ('You have already shutdown this device!');
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
            var link = '<a href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'
            toastr.warning("Warning. This device can only be shutdown from the latest shipment " + link);
        }
    };
    $scope.confirmSuppress = function(Id) {
        if ($scope.isEndedOrArrived || $scope.suppressAlready) {
            var temShipmentNumber = currentDevice.shipmentNumber;
            if (temShipmentNumber){
                var idx1 = temShipmentNumber.indexOf('(');
                var idx2 = temShipmentNumber.indexOf(')');
                var n = temShipmentNumber.substr(idx1+1, idx2-1);
                currentDevice.tripCount = parseInt(n);
            }
            currentDevice.sn = parseInt(currentDevice.sn);
            var link = '<a href=\'#/view-shipment-detail?sn='+currentDevice.sn+'&trip='+currentDevice.tripCount+'\'><u>'+currentDevice.sn +'(' + currentDevice.tripCount + ')' +'</u></a>'

            toastr.warning('Warning. This device can only suppress alert from latest shipment ' + link);
        } else {
            var modalInstance = $modal.open({
                templateUrl: '/app/view-shipment-detail-share/confirm-suppress.html',
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
        var modalInstance = $modal.open({
            templateUrl: '/app/view-shipment-detail-share/edit-description.html',
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
    $scope.EditComment = function(Id) {
        var modalInstance = $modal.open({
            templateUrl: '/app/view-shipment-detail-share/edit-comment.html',
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
});

appCtrls.controller('EditShipmentDetailDescription', ['$scope', '$modalInstance', 'webSvc', 'editId',
function($scope, $modalInstance, webSvc, editId) {
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
        $modalInstance.close($scope.shipment.shipmentDescription);
    }
    $scope.cancelEdit = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
appCtrls.controller('EditShipmentDetailComment', ['$scope', '$modalInstance', 'webSvc', 'editId',
    function($scope, $modalInstance, webSvc, editId) {
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
            $modalInstance.close($scope.shipment.commentsForReceiver);
        }
        $scope.cancelEdit = function () {
            $modalInstance.dismiss('cancel');
        };
}]);
