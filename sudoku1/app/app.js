(function (angular) {
    var sudokuApp = angular.module('sudokuApp', [
        'ngMaterial',
        'ngRoute',
        'ngAnimate',
        'ngMessages',
        'material.svgAssetsCache'
    ]);

    sudokuApp.config(function ($locationProvider) {
        $locationProvider.hashPrefix("!");
    });
    
})(window.angular);

