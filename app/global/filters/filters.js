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
    return function (input) {
        if (input) {
            var v = Number(parseInt(input, 10)/1000).toFixed(1) + "V";
            if (input <= 3355) {
                return '0% (' + v + ")";
            } else if (input <= 3441.3) {
                return '10% (' + v + ")";
            } else if (input <=3527.6) {
                return '20% (' + v + ")";
            } else if (input <= 3613.9) {
                return '30% (' + v + ")";
            } else if (input <= 3700.2) {
                return '40% (' + v + ")";
            } else if (input <= 3786.5) {
                return '50% (' + v + ")";
            } else if (input <= 3872.8) {
                return '60% (' + v + ")";
            } else if (input <= 3959.1) {
                return '70% (' + v + ")";
            } else if (input <= 4045.4) {
                return '80% (' + v + ")";
            } else if (input <= 4131.7) {
                return '90% (' + v + ")";
            } else if (input < 4218) {
                return '95% (' + v + ")";
            } else {
                return '100% (' + v + ")";
            }
        }
        //return Number(input/1000).toFixed(1) + 'V';
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
