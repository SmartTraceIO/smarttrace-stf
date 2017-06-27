/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('EditShipmentRoute', EditShipmentRoute);
function EditShipmentRoute($uibModalInstance, webSvc, shipmentId, $filter, $q) {
    VM = this;
    VM.shipmentId = shipmentId;
    VM.shipment = null;

    VM.oldInterimStops = [];
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
                    if (!VM.shipment.startDate) {
                        //startDate:"2016-06-01T12:27"
                        VM.dateTimeFrom = moment(VM.shipment.shipmentDate,'YYYY-MM-DDTHH:mm').toDate();
                    } else {
                        VM.dateTimeFrom = moment(VM.shipment.startDate,'YYYY-MM-DDTHH:mm').toDate();
                    }

                    if (VM.shipment.actualArrivalDate) {
                        VM.dateTimeTo = moment(VM.shipment.actualArrivalDate,'YYYY-MM-DDTHH:mm').toDate();
                    } else {
                        VM.dateTimeTo = null;
                    }

                    if (VM.shipment.status == "Arrived") {
                        VM.posibleStatus = ["Arrived", "Ended"];
                    } else if (VM.shipment.status == "Ended") {
                        VM.posibleStatus = ["Ended", "Arrived"];
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
        	   var stops = data.response;
        	   for (var i = 0; i < stops.length; i++) {
        		   var stp = stops[i];

        		   stp.interimStop = stp.locationId;
        		   stp.elapsedTime = stp.time;
        		   stp.stopDate = moment(stp.stopDate,'YYYY-MM-DD HH:mm').toDate();
        		   stp.dateTimeStopped = stp.stopDate;

        		   VM.oldInterimStops[i] = stp;
            	   VM.interimStops[i] = stp;
        	   }
        	   
           }
        });
    }

    VM.getShipment();
    VM.getLocations();
    VM.getInterimStops();

    VM.isCorrect = function(obj) {
    	return obj != null && typeof obj != 'undefined';
    };

    VM.deleteInterimStop = function(stp) {
    	//only delete interim stop from model. It will really deleted
    	//from application during saving the shipment.
    	var index = VM.interimStops.indexOf(stp);
    	if (index > -1) {
    		VM.interimStops.splice(index, 1);
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
            // console.log("SAVING-DATE#", VM.dateTimeFrom);
            VM.shipment.startDate = moment(VM.dateTimeFrom).format('YYYY-MM-DDTHH:mm');
            VM.shipment.shipmentDate = moment(VM.dateTimeFrom).format('YYYY-MM-DDTHH:mm');
            // console.log("SAVING-DATE2#", VM.shipment.startDate);
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
            //update interim stops.
            //-- filter interimStops
            //var currentStop = filter(VM.interimStops, {locationId: VM.interimStop}, true);
            //calculate interim stop updates
            var toRemove = VM.oldInterimStops.slice();
            var toSave = [];
            
            for (var i = 0; i < VM.interimStops.length; i++) {
            	var stp = VM.interimStops[i];

            	var index = toRemove.indexOf(stp);
            	if (index > -1) {
            		//should not remove if presented to old and new arrays
            		toRemove.splice(index, 1);

            		//check if changed, need to save it
            		if (stp.interimStop != stp.locationId
        				|| stp.elapsedTime != stp.time
        				|| "" + stp.dateTimeStopped != "" + stp.stopDate) {
                		toSave[toSave.length] = stp;
            		}
            	} else {
            		//if newly added but have configured interim stop location
            		//need to save it
            		toSave[toSave.length] = stp;
            	}
            }
            
            updateInterimStopsOnServer(toSave, toRemove);
        })
    }

    VM.shutdownAndUpdateParent = function() {
        VM.resultObject.shipment = VM.shipment;
        if (VM.shipment.status == "Ended") {
            //--trigger shutdown
            webSvc.shutdownDevice(VM.shipmentId).success(function(data) {
                if (data.status.code == 0) {
                    // toastr.success("Success. The shutdown process has been triggered for this device");
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
    };

	VM.addInterimStop = function() {
		// create new empty interim stop
		var newStp = {
			id : null,
			shipmentId : VM.shipmentId,
			locationId : null,
			time : null,
			stopDate : null,
			interimStop : null,
			elapsedTime : 10,
			dateTimeStopped : null
		};

		VM.interimStops[VM.interimStops.length]= newStp;
	};
    
	function updateInterimStopsOnServer(toSave, removing) {
		if (toSave.length > 0) {
			var stp = toSave.shift();
			if (VM.isCorrect(stp.interimStop) && VM.isCorrect(stp.dateTimeStopped)) {

				//create save interim stop request (in fact is the interim stop object
				//in origin format
				var saving = {};
				saving.shipmentId = VM.shipmentId;
	            saving.locationId = stp.interimStop;
	            saving.time = stp.elapsedTime;
	            saving.stopDate = moment(stp.dateTimeStopped).format('YYYY-MM-DD HH:mm');
				
	            webSvc.saveInterimStop(saving).success(function(data) {
	                var status = data.status;
	                //console.log("Interim", data);
	            	updateInterimStopsOnServer(toSave, removing);
	            });
			} else {
				//process next synchronously
            	updateInterimStopsOnServer(toSave, removing);
			}
		} else if (removing.length > 0) {
			var stp = removing.shift();

			webSvc.deleteInterimStop(stp.id, VM.shipmentId).success(function(data) {
                var status = data.status;
            	updateInterimStopsOnServer(toSave, removing);
            });
		} else {
            VM.shutdownAndUpdateParent();
		}
	}

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
                if (!VM.shipment.startDate) {
                    //startDate:"2016-06-01T12:27"
                    VM.dateTimeFrom = moment(VM.shipment.shipmentDate,'YYYY-MM-DDTHH:mm').toDate();
                } else {
                    VM.dateTimeFrom = moment(VM.shipment.startDate,'YYYY-MM-DDTHH:mm').toDate();
                }

                if (VM.shipment.actualArrivalDate) {
                    VM.dateTimeTo = moment(VM.shipment.actualArrivalDate,'YYYY-MM-DDTHH:mm').toDate();
                } else {
                    VM.dateTimeTo = null;
                }

                if (VM.shipment.status == "Arrived") {
                    VM.posibleStatus = ["Arrived", "Ended"];
                } else if (VM.shipment.status == "Ended") {
                    VM.posibleStatus = ["Ended", "Arrived"];
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
