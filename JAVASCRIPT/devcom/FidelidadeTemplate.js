vlocity.cardframework.registerModule.controller('labsxdVlcPortabilidadeFidelidade', ['$scope', '$rootScope', 'bpService', function($scope, $rootScope, bpService) {

    console.log($scope.bpTree.pcId);

    $scope.prepareRequest = function (i) {
        $scope.bpTree.response[$scope.control.propSetMap.parameterActionName] = {
            "id":i.Id.value,
            "Fidelidade__c": i.Fidelidade__c.value

        };
    }
    $scope.addToCart = function (i) {
        $scope.prepareRequest(i);
        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionName)[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionExcuteGetInstallmentsMovel);
        console.log("request");
    }

    $scope.callbackFunctionExcuteGetInstallmentsMovel = function() {
        $rootScope.$broadcast('refreshCart');
    };
    $scope.getDependentesByParent=function ( product ) {
        console.log("getDependentesByParent product", product);
        product.sort((a,b) => (a.CreatedDate.value > b.CreatedDate.value) ? 1 : ((b.CreatedDate.value > a.CreatedDate.value) ? -1 : 0));

        return product;
    };


}]);