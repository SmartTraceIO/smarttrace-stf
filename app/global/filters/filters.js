/**
 * Created by beou on 25/03/2016.
 */
appFilters.filter('arrayToString', function() {
    return function (input) {
        if (angular.isArray(input)) {
            return input.join(', ');
        } else {
            return input;
        }
    }
});