/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('EditShipmentRoute', EditShipmentRoute);
function EditShipmentRoute($uibModalInstance, webSvc, shipmentId, $filter) {
    VM = this;
    VM.shipmentId = shipmentId;
    VM.shipment = null;
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
                        VM.dateTimeFrom = moment(VM.shipment.shipmentDate,'YYYY-MM-DDThh:mm').toDate();
                    } else {
                        VM.dateTimeFrom = null;
                    }

                    if (VM.shipment.actualArrivalDate) {
                        //VM.dateTimeTo = moment.tz(VM.shipment.actualArrivalDate,'YYYY-MM-DDThh:mm', $rootScope.RunningTimeZoneId).toDate();
                        VM.dateTimeTo = moment(VM.shipment.actualArrivalDate,'YYYY-MM-DDThh:mm').toDate();
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
                    VM.interimStop = VM.shipment.interimLocations[0];
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
                console.log('LocationList', VM.LocationList);
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
    VM.getShipment();
    VM.getLocations();

    VM.saveShipment = function() {
        console.log("saving shipment changes", VM.shipment);
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
            VM.shipment.startDate = moment(VM.dateTimeFrom).format('YYYY-MM-DDThh:mm');
        }
        if (VM.dateTimeTo) {
            VM.shipment.actualArrivalDate = moment(VM.dateTimeTo).format('YYYY-MM-DDThh:mm');
            VM.shipment.endDate = moment(VM.dateTimeTo).format('YYYY-MM-DDThh:mm');
        }

        if (VM.interimStop) {
            VM.shipment.interimLocations=[];
            VM.shipment.interimLocations.push(VM.interimStop);
        } else {
            VM.shipment.interimLocations=[];
        }

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
                toastr.error('Cannot save the shipment this time. Try again later');
            }
        }).then(function() {
            if (VM.shipment.status == "Ended") {
                //--trigger shutdown
                webSvc.shutdownDevice(VM.shipmentId).success(function(data) {
                    if (data.status.code == 0) {
                        toastr.success("Success. The shutdown process has been triggered for this device");
                    } else {
                        toastr.error("You have no permission to shutdown this device!");
                    }
                    //--close anyway
                    $uibModalInstance.close(VM.shipment);
                })
            } else {
                $uibModalInstance.close(VM.shipment);
            }
        });
    }
    //-- cancel
    VM.cancel = function() {
        $uibModalInstance.dismiss();
    }
}