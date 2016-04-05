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

appFilters.filter('convertDate', function(localDbSvc) {
    return function (input) {
        if (input) {
            var dt = moment.tz(input, localDbSvc.getUserTimezone());
            return dt.format('hh:mmA DD MMM YYYY');
        } else  {
            return '';
        }
    }
})