/**
 * Created by beou on 25/03/2016.
 */
appFilters.filter('arrayToString', function() {
    return function (input) {
        if (input == null) {
            return '';
        } else
        if (angular.isArray(input)) {
            return input.join(', ');
        } else {
            return input;
        }
    }
});
appFilters.filter('temperature', function (localDbSvc) {
    return function (input) {
        if (input) {
            input = input.toFixed(1);
            if(localDbSvc.getDegreeUnits()=="Celsius") {
                return input+ '\u2103';
            } else {
                return input+'\u2109';
            }
        } else {
            return '';
        }
    }
});

appFilters.filter('volt', function() {
    //max 4226 -- 100%
    // 4220 -- 95%
    // 4070 -- 60%
    //3620 -- 10% --> 47
    //min 3147 -- 0%
    return function (input) {
        if (input) {
            var v = Number(parseInt(input, 10)/1000).toFixed(1) + "V";
            if (input <= 3194.3) {
                return '0% (' + v + ")";
            } else if (input <= 3241.6) {
                return '1% (' + v + ')';
            } else if (input <= 3288.9) {
                return '2% (' + v + ')';
            } else if (input <= 3336.2) {
                return '3% (' + v + ')';
            } else if (input <= 3383.5) {
                return '4% (' + v + ')';
            } else if (input <= 3430.8) {
                return '5% (' + v + ')';
            } else if (input <= 3478.1) {
                return '6% (' + v + ')';
            } else if (input <= 3525.4) {
                return '7% (' + v + ')';
            } else if (input <= 3572.7) {
                return '8% (' + v + ')';
            } else if (input <= 3620) {
                return '9% (' + v + ')'; // start rolling out
            } else if (input <= 3695) {
                return '10% (' + v + ")";
            } else if (input <=3770) {
                return '20% (' + v + ")";
            } else if (input <= 3845) {
                return '30% (' + v + ")";
            //} else if (input <= 3920) {
            } else if (input <= 3895) {
                return '40% (' + v + ")";
            //} else if (input <= 3995) {
            } else if (input <= 3925) {
                return '50% (' + v + ")";
            //} else if (input <= 4070) {
            } else if (input <= 3975) {
                return '60% (' + v + ")";
            //} else if (input <= 4109) {
            } else if (input <= 4025) {
                return '70% (' + v + ")";
            //} else if (input <= 4148) {
            } else if (input <= 4075) {
                return '80% (' + v + ")";
            //} else if (input <= 4187) {
            } else if (input <= 4125) {
                return '90% (' + v + ")";
            //} else if (input < 4220) {
            } else if (input < 4150) {
                return '95% (' + v + ")";
            } else {
                return '100% (' + v + ")";
            }
        }
    }
});
appFilters.filter('convertDate', function(localDbSvc) {
    return function (input) {
        if (input) {
            var dt = moment.tz(input, localDbSvc.getUserTimezone());
            return dt.format('HH:mm DD-MMM-YYYY');
        } else  {
            return '';
        }
    }
})
