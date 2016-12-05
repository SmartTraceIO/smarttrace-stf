/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('EditShipmentRoute', EditShipmentRoute);
function EditShipmentRoute($uibModalInstance, webSvc, shipmentId, $filter, $q) {
    VM = this;
    VM.shipmentId = shipmentId;
    VM.shipment = null;
    VM.elapsedTime = 10;

    VM.interimStops = [];
    VM.resultObject = {};

    var filter = $filter('filter');

    VM.getShipment = function() {
        if (VM.shipmentId) {
            webSvc.getShipment(VM.shipmentId).success(function(data) {
                if (data.status.code == 0) {
                    VM.shipment = data.response;
                    if (!isNaN(VM.shipment.deviceSN)) {
                        VM.shipment.deviceSN = parseInt(VM.shipment.deviceSN, 10);
                    }
                    VM.shipment.noAlertsAfterArrivalMinutes = (VM.shipment.noAlertsAfterArrivalMinutes && !isNaN(VM.shipment.noAlertsAfterArrivalMinutes)) ? VM.shipment.noAlertsAfterArrivalMinutes.toString() : '';
                    VM.shipment.noAlertsAfterStartMinutes = (VM.shipment.noAlertsAfterStartMinutes && !isNaN(VM.shipment.noAlertsAfterStartMinutes)) ? VM.shipment.noAlertsAfterStartMinutes.toString() : '';
                    VM.shipment.shutdownDeviceAfterMinutes = (VM.shipment.shutdownDeviceAfterMinutes && !isNaN(VM.shipment.shutdownDeviceAfterMinutes)) ? VM.shipment.shutdownDeviceAfterMinutes.toString() : '';
                    VM.shipment.shutDownAfterStartMinutes = (VM.shipment.shutDownAfterStartMinutes && !isNaN(VM.shipment.shutDownAfterStartMinutes)) ? VM.shipment.shutDownAfterStartMinutes.toString() : '';

                    console.log('Date-Time', VM.shipment.startDate);
                    if (VM.shipment.startDate) {
                        //startDate:"2016-06-01T12:27"
                        //VM.dateTimeFrom = moment.tz(VM.shipment.startDate,'YYYY-MM-DDThh:mm', $rootScope.RunningTimeZoneId).toDate();
                        VM.dateTimeFrom = moment(VM.shipment.shipmentDate,'YYYY-MM-DDTHH:mm').toDate();
                    } else {
                        VM.dateTimeFrom = null;
                    }

                    if (VM.shipment.actualArrivalDate) {
                        VM.dateTimeTo = moment(VM.shipment.actualArrivalDate,'YYYY-MM-DDTHH:mm').toDate();
                    } else {
                        VM.dateTimeTo = null;
                    }

                    if (VM.shipment.status == "Arrived") {
                        VM.posibleStatus = ["Arrived", "Ended"];
                    } else if (VM.shipment.status == "Ended") {
                        VM.posibleStatus = ["Ended"];
                    } else {
                        VM.posibleStatus = ["Default", "Arrived", "Ended"];
                    }

                    VM.dateTimeStopped = new Date();
                    //console.log('VM.shipment', VM.shipment);
                } else {
                    toastr.warning('An error occurred while get shipment #' + VM.shipmentId);
                }
            });
        }
    }
    VM.getLocations = function() {
        webSvc.getLocations(1000, 1, 'locationName', 'asc').success( function (data) {
            if (data.status.code == 0) {
                VM.FromLocationList = [];
                VM.ToLocationList = [];
                VM.InterimLocationList = [];
                VM.LocationList = data.response;
                //console.log("LocationList", VM.LocationList);
                angular.forEach(VM.LocationList, function (val, key) {
                    if (val.companyName) {
                        var dots = val.companyName.length > 20 ? '...' : '';
                        var companyName = $filter('limitTo')(val.companyName, 20) + dots;
                        VM.LocationList[key].DisplayText = val.locationName + ' (' + companyName + ')';
                    }
                    else {
                        VM.LocationList[key].DisplayText = val.locationName;
                    }
                    if (val.startFlag == "Y")
                        VM.FromLocationList.push(val);
                    if (val.interimFlag == "Y")
                        VM.InterimLocationList.push(val);
                    if (val.endFlag == "Y")
                        VM.ToLocationList.push(val);
                })
            }
        });
    }

    VM.getInterimStops = function() {
        webSvc.getInterimStops(VM.shipmentId).success(function(data) {
            //console.log("Data", data);
           if (data.status.code == 0) {
               VM.interimStops = data.response;
               if (VM.interimStops[0]) {
                   VM.interimStop = VM.interimStops[0].locationId;
                   VM.elapsedTime = VM.interimStops[0].time;
                   //"2016-10-04 10:32"
                   VM.dateTimeStopped = moment(VM.interimStops[0].stopDate,'YYYY-MM-DD HH:mm').toDate();
               }
           }
        });
    }

    VM.getShipment();
    VM.getLocations();
    VM.getInterimStops();

    VM.deleteInterimStop = function() {
        if (!VM.interimStop) return;
        var currentStop = filter(VM.interimStops, {locationId: VM.interimStop}, true);
        if (currentStop && currentStop.length > 0) {
            currentStop = currentStop[0];

            webSvc.deleteInterimStop(currentStop.id, VM.shipmentId).success(function(data) {
                var status = data.status;
                if (status.code == 0) {
                    // clear
                    VM.interimStop = null;
                }
            });
        }
    }

    VM.saveShipment = function() {
        //console.log("saving shipment changes", VM.shipment);
        if (!isNaN(VM.shipment.noAlertsAfterArrivalMinutes)){
            VM.shipment.noAlertsAfterArrivalMinutes = parseInt(VM.shipment.noAlertsAfterArrivalMinutes, 10);
        }
        if (!isNaN(VM.shipment.noAlertsAfterStartMinutes)) {
            VM.shipment.noAlertsAfterStartMinutes = parseInt(VM.shipment.noAlertsAfterStartMinutes, 10);
        }
        if (!isNaN(VM.shipment.shutdownDeviceAfterMinutes)) {
            VM.shipment.shutdownDeviceAfterMinutes = parseInt(VM.shipment.shutdownDeviceAfterMinutes, 10);
        }
        if (!isNaN(VM.shipment.shutDownAfterStartMinutes)) {
            VM.shipment.shutDownAfterStartMinutes = parseInt(VM.shipment.shutDownAfterStartMinutes, 10);
        }

        if (VM.dateTimeFrom) {
            //startDate:"2016-06-01T12:27"
            console.log("SAVING-DATE#", VM.dateTimeFrom);
            VM.shipment.startDate = moment(VM.dateTimeFrom).format('YYYY-MM-DDTHH:mm');
            console.log("SAVING-DATE2#", VM.shipment.startDate);
        }
        if (VM.dateTimeTo) {
            VM.shipment.actualArrivalDate = moment(VM.dateTimeTo).format('YYYY-MM-DDTHH:mm');
            VM.shipment.endDate = moment(VM.dateTimeTo).format('YYYY-MM-DDTHH:mm');
        }

        /*if (VM.interimStop) {
            VM.shipment.interimStops=[];
            VM.shipment.interimStops.push(VM.interimStop);
        } else {
            VM.shipment.interimStops=[];
        }*/

        var obj = {};
        obj.saveAsNewTemplate = false;
        obj.includePreviousData = false;
        obj.shipment = VM.shipment;

        if (VM.shipment.status == "Arrived" && !VM.dateTimeTo) {
            toastr.warning("Please enter \"Arrival Date\"");
            return;
        }

        webSvc.saveShipment(obj).success(function(data) {
            if (data.status.code == 0) {
                toastr.success('The shipment was updated success');
            } else {
                console.log("Error", data);
                toastr.error('Cannot save the shipment this time. Try again later!');
            }
        }).then(function() {
            if (VM.interimStop) {
                //var d = filter(VM.TrackerList, {sn: VM.ShipmentList[k].deviceSN}, true);
                var stopLocation = filter(VM.InterimLocationList, {locationId: VM.interimStop}, true);
                if (stopLocation && stopLocation.length > 0) {
                    stopLocation = stopLocation[0];
                }
                if (stopLocation.location) {
                    VM.interimStopLatitude = stopLocation.location.lat;
                    VM.interimStopLongitude = stopLocation.location.lon;
                }
                if (VM.dateTimeStopped) {
                    VM.stoppedTime = moment(VM.dateTimeStopped).format('YYYY-MM-DD HH:mm');
                }
                //-- filter interimStops
                //var currentStop = filter(VM.interimStops, {locationId: VM.interimStop}, true);
                var currentStop = null; // VM.interimStops[0];
                if (VM.interimStops && VM.interimStops.length > 0) {
                    currentStop = VM.interimStops[0];
                }
                if (currentStop) {
                    currentStop.shipmentId = VM.shipmentId;
                    currentStop.locationId = VM.interimStop;
                    currentStop.time = VM.elapsedTime;
                    currentStop.stopDate = VM.stoppedTime;

                    webSvc.deleteInterimStop(currentStop.id, VM.shipmentId).success(function(data) {
                        var status = data.status;
                        if (status.code == 0) {

                        } else {

                        }
                    }).then(function(){
                        webSvc.saveInterimStop(currentStop).success(function(data) {
                            if (data.status.code == 0) {
                                toastr.success("Success to update the interimStop")
                                VM.resultObject.interimStop = currentStop;
                                VM.resultObject.interimStop.location = stopLocation;
                            } else {
                                console.log("Error", data);
                            }
                        }).then(function() {
                            VM.shutdownAndUpdateParent()
                        });
                    });
                } else {
                    // need to add new stop
                    //add to interimStops
                    var params = {
                        "shipmentId": VM.shipmentId,
                        "locationId": VM.interimStop,
                        "latitude": VM.interimStopLatitude,
                        "longitude": VM.interimStopLongitude,
                        "time": VM.elapsedTime,
                        "stopDate": VM.stoppedTime //"2016-09-28 06:13"
                    };
                    webSvc.addInterimStop(params).success(function(data) {
                        var status = data.status;
                        //console.log("Interim", data);
                        if (status.code == 0) {
                            params.location = stopLocation;
                            VM.resultObject.interimStop = params;
                            toastr.success("Success to add an interimStop");
                        }
                    }).then(function() {
                        VM.shutdownAndUpdateParent();
                    });
                }
            }else {
                VM.resultObject.interimStop = null;
                VM.shutdownAndUpdateParent();
            }
        })/*.then(function() {
            if (VM.shipment.status == "Ended") {
                //--trigger shutdown
                webSvc.shutdownDevice(VM.shipmentId).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. The shutdown process has been triggered for this device");
                    } else {
                        toastr.error("You have no permission to shutdown this device!");
                    }
                    VM.resultObject.shipment = VM.shipment;
                    //--close anyway
                    //$uibModalInstance.close(VM.shipment);
                    $uibModalInstance.close(VM.resultObject);
                })
            } else {
                VM.resultObject.shipment = VM.shipment;
                $uibModalInstance.close(VM.resultObject);
            }
        });*/
    }

    VM.updateInterimStop = function() {
        if (VM.interimStop) {
            var stopLocation = filter(VM.InterimLocationList, {locationId: VM.interimStop}, true);
            if (stopLocation && stopLocation.length > 0) {
                stopLocation = stopLocation[0];
            }
            if (stopLocation.location) {
                VM.interimStopLatitude = stopLocation.location.lat;
                VM.interimStopLongitude = stopLocation.location.lon;
            }
            if (VM.dateTimeStopped) {
                VM.stoppedTime = moment(VM.dateTimeStopped).format('YYYY-MM-DD HH:mm');
            }
            //-- filter interimStops
            //var currentStop = filter(VM.interimStops, {locationId: VM.interimStop}, true);
            var currentStop = null; // VM.interimStops[0];
            if (VM.interimStops && VM.interimStops.length > 0) {
                currentStop = VM.interimStops[0];
            }
            console.log("VM.interimStop", VM.interimStop);
            console.log("currentStop", currentStop);
            console.log("VM.interimStops", VM.interimStops);
            if (currentStop) {
                currentStop.shipmentId = VM.shipmentId;
                currentStop.locationId = VM.interimStop;
                currentStop.time = VM.elapsedTime;
                currentStop.stopDate = VM.stoppedTime;

                return webSvc.deleteInterimStop(currentStop.id, VM.shipmentId).success(function(data) {
                    var status = data.status;
                    if (status.code == 0) {

                    } else {

                    }
                }).then(function(){
                    webSvc.saveInterimStop(currentStop).success(function(data) {
                        if (data.status.code == 0) {
                            toastr.success("Success to update the interimStop")
                            VM.resultObject.interimStop = currentStop;
                            VM.resultObject.interimStop.location = stopLocation;
                        } else {
                            console.log("Errored");
                        }
                    }).then(VM.shutdownAndUpdateParent());
                });
            } else {
                // need to add new stop
                //add to interimStops
                var params = {
                    "shipmentId": VM.shipmentId,
                    "locationId": VM.interimStop,
                    "latitude": VM.interimStopLatitude,
                    "longitude": VM.interimStopLongitude,
                    "time": VM.elapsedTime,
                    "stopDate": VM.stoppedTime //"2016-09-28 06:13"
                };
                return webSvc.addInterimStop(params).success(function(data) {
                    var status = data.status;
                    console.log("Interim", data);
                    if (status.code == 0) {
                        params.location = stopLocation;
                        VM.resultObject.interimStop = params;
                        toastr.success("Success to add an interimStop");
                    }
                }).then(VM.shutdownAndUpdateParent());
            }
        } else {
            return null;
        }
    }
    VM.shutdownAndUpdateParent = function() {
        VM.resultObject.shipment = VM.shipment;
        if (VM.shipment.status == "Ended") {
            //--trigger shutdown
            webSvc.shutdownDevice(VM.shipmentId).success(function(data) {
                if (data.status.code == 0) {
                    toastr.success("Success. The shutdown process has been triggered for this device");
                } else {
                    toastr.error("You have no permission to shutdown this device!");
                }
                //--close anyway
                //$uibModalInstance.close(VM.shipment);
                $uibModalInstance.close(VM.resultObject);
            })
        } else {
            //VM.resultObject.shipment = VM.shipment;
            $uibModalInstance.close(VM.resultObject);
        }
    }
    //-- cancel
    VM.cancel = function() {
        $uibModalInstance.dismiss();
    }
}