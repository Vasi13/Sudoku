(function (angular) {

    function columnFilter() {
        return function (input) {
            if (input == 0) {
                return 'firstcol';
            } else if (input == 2) {
                return 'middlecol';
            } else if (input == 5) {
                return 'lastcol';
            }


        };
    };

    angular.
        module('sudokuApp')
        .filter('columnFilter', [columnFilter]);
})(window.angular);