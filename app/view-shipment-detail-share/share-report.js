/**
 * Created by beou on 31/05/2016.
 */
appCtrls.controller('ShareReportCtrl', ShareReportCtrl);
function ShareReportCtrl($uibModalInstance, webSvc, $rootScope, $filter, sn, trip) {
    VM = this;
    VM.report={};
    VM.report.sn = sn;
    VM.report.trip = trip;
    VM.userList = [];
    VM.report.subject = "Share Report for " + VM.report.sn + "(" + VM.report.trip + ")";

    webSvc.getUsers(1000, 1, null, "desc").success(function(data) {
        if (data.status.code == 0) {
            //--
            VM.userList = data.response;
            console.log("UserList", data.response);
        } else {
            toastr.error("Cannot get user list");
        }
    })

    //-- share
    VM.share = function() {
        console.log("Users", VM.users);
        console.log("Emails", VM.emails);
        VM.report.recipients = [];
        if (VM.users) {
            angular.forEach(VM.users, function(user, key) {
                VM.report.recipients.push({
                    "type":"user",
                    "value": user.id
                });
            });
        }
        if (VM.emails) {
            var emailArray = VM.emails.split(";");
            angular.forEach(emailArray, function(email, key) {
                VM.report.recipients.push({
                    "type": "email",
                    "value": email
                });
            });
        }
        webSvc.emailShipmentReport(VM.report).success(function(data) {
            if (data.status.code == 0) {
                toastr.success("You have shared a shipment report");
            } else {
                toastr.error("There are some hard while sharing this shipment report");
            }

        }).error(function(err) {
            toastr.error("There is an error while contacting to server");
        });
        $uibModalInstance.close();
    }
    //-- cancel
    VM.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    }
}
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