(function (angular) {

    ToastController.$inject = ['$scope', '$mdToast'];

    function ToastController($scope, $mdToast) {
            $scope.showSimpleToast = function () {
                $mdToast.show($mdToast
                    .simple()
                    .textContent('Hello!')
                    .position('top')
                    .hideDelay(0)
                    .toastClass('.toast')
                    .parent("#toastspace"));
            };
    };

        //$scope.showCustomToast = function () {
        //    var data = { type: "SUCCESS", message: "Well done!" };
        //    var toastClass;
        //    switch (data.type) {
        //        case "SUCCESS":
        //            toastClass = "success";
        //            break;
        //        case "ERROR":
        //            toastClass = "error";
        //            break;
        //        case "INFO":
        //            toastClass = "info";
        //            break;
        //        case "WARNING":
        //            toastClass = "warning";
        //            break;
        //    };

        //    $mdToast.show({
        //        hideDelay: 3000,
        //        parent: '#container',
        //        position: 'bottom',
        //        textcontent: 'Hello!',
        //        controller: 'ToastController',
        //        templateUrl: 'toast-template.html',
        //        locals: {
        //            data: data
        //        },
        //        toastClass: toastClass
        //    });
        //};

    


    angular
        .module('sudokuApp')
        .controller('ToastController', ToastController);
})(window.angular);