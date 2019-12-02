(function (angular) {

    function rowFilter() {
        return function (input) {
            if (input == 0) {
                return 'firstrow';
            } else if (input % 2 !== 0) {
                return 'oddrow';
            }

        };
    };

    angular.
        module('sudokuApp')
        .filter('rowFilter', [rowFilter]);
})(window.angular);