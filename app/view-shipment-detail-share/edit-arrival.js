/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('EditShipmentArrival', EditShipmentArrival);
function EditShipmentArrival($uibModalInstance, webSvc, shipmentId) {
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
                    VM.shipment.noAlertsAfterArrivalMinutes = (VM.shipment.noAlertsAfterArrivalMinutes != null) ? VM.shipment.noAlertsAfterArrivalMinutes.toString() : '';
                    VM.shipment.noAlertsAfterStartMinutes = (VM.shipment.noAlertsAfterStartMinutes != null) ? VM.shipment.noAlertsAfterStartMinutes.toString() : '';
                    VM.shipment.shutdownDeviceAfterMinutes = (VM.shipment.shutdownDeviceAfterMinutes != null) ? VM.shipment.shutdownDeviceAfterMinutes.toString() : '';
                    VM.shipment.shutDownAfterStartMinutes = (VM.shipment.shutDownAfterStartMinutes != null) ? VM.shipment.shutDownAfterStartMinutes.toString() : '';
                    console.log('VM.shipment', VM.shipment);
                } else {
                    toastr.warning('An error occurred while get shipment #' + VM.shipmentId);
                }
            });
        }
    }
    VM.getShipment();

    VM.saveShipment = function() {
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
        var obj = {};
        obj.saveAsNewTemplate = false;
        obj.includePreviousData = false;
        obj.shipment = VM.shipment;
        webSvc.saveShipment(obj).success(function(data) {
            if (data.status.code == 0) {
                toastr.success('The shipment was updated success');
            }
            $uibModalInstance.close();
        })
    }
    //-- cancel
    VM.cancel = function() {
        $uibModalInstance.dismiss();
    }
}