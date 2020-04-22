vlocity.cardframework.registerModule.controller('labsxdVlcCatalogoController', ['$scope', '$rootScope', 'bpService', function($scope, $rootScope, bpService) {

    const NODE_PRODUCT_SELECTED_TMP = "NODE_PRODUCT_SELECTED_TMP";

    $scope.callBackFunctionFetchExcludeRulesAsync = function(response) {
        $scope.bpTree.response.ExcludeRules = response.ExcludeRules;
        $scope.isAsyncCallRunning = false;
    }

    $scope.fetchExcludeRulesAsync = function() {
        $scope.excludeActionElement = $scope.getElement('IPA_CEC0029')[0].control;
        if ($scope.excludeActionElement){
            $scope.isAsyncCallRunning = true;
            $scope.buttonClick($scope.bpTree.response, $scope.excludeActionElement, $scope, null, 'typeAheadSearch', null, $scope.callBackFunctionFetchExcludeRulesAsync);
        }
    }

    $scope.TemplateOrderIdCanais;
    $scope.output;

    $scope.isUnique = function(item,group) {
        var count = 0;
        for (var i = 0; i < group.length; i++) {
            if(item.Name == group[i].Name){
                ++count;
            }
        }
        if(count > 1 && item.Group == '-'){
            return false;
        }else{
            return true;
        }
    }

    // Creating Exclude Rules
    $scope.fetchExcludeRulesAsync();

    $scope.invokeAction = function(product) {
        $scope.TemplateOrderIdCanais = $scope.control.propSetMap.TemplateOrderIdCanais;
        $scope.output = $scope.control.propSetMap.ResponseCanais;
        $scope.bpTree.response[$scope.TemplateOrderIdCanais] = '801e0000001ocMJ';
        $scope.bpTree.response[$scope.TemplateOrderIdCanais] = product.TemplateOrderId__c;

        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionGetCanais)[0].control, $scope, null,'typeAheadSearch', null,$scope.callbackFunctionCanais);

    }

    $scope.callbackFunctionCanais = function(response) {
        console.log('IPA CEC0031');
        console.log(JSON.stringify(response));
        $scope.bpTree.response[$scope.output] = response;
        console.log(JSON.stringify($scope.bpTree.response[$scope.output]));
        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionSVCanais)[0].control, $scope, null,null, null,null);
    }

    $scope.getChannels = function (attachment) {
        $scope.bpTree.response['imgChannelsSRC'] = attachment.url;
        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionSVCanais)[0].control, $scope, null,null, null,null);
    }

    $scope.setSetValuesPromociones = function () {
        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionSetValuesPromociones)[0].control, $scope, null,null, null,null);
    }

    $scope.addToCart = function (product) {

        $scope.prepareRequest(product);
        $scope.planFamilyName = product.Family;
        if(!$scope.bpTree.response.FamilyAddedControl){
            $scope.bpTree.response.FamilyAddedControl = {}
        }
        $scope.bpTree.response.FamilyAddedControl[product.Family] = true;
        // First refresh request
        if( $rootScope.isCartRefreshed === undefined ){
            console.log('CEC_DEBUG | Setting isCartRefreshed first value');
            $rootScope.isCartRefreshed = false;
            $rootScope.enqueeuedRefreshActions = [];
            $rootScope.enqueeuedProducts = [];
            $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionName)[0].control, $scope, null, 'typeAheadSearch', null, $scope.addProductToListSelected);
        } else if( $rootScope.isCartRefreshed === false ){
            var action = $scope.getElement($scope.control.propSetMap.actionName)[0].control;
            $rootScope.enqueeuedRefreshActions.push( action );
            $rootScope.enqueeuedProducts.push( product );
            console.log('CEC_DEBUG | enqueeuing cart request');
        } else {
            var broadcastNewQueeue = false;
            if ( $rootScope.enqueeuedRefreshActions.length === 0 ){
                console.log('CEC_DEBUG | No queeue and cart already refreshed, create new queeue');
                broadcastNewQueeue = true;
            }
            var action = $scope.getElement($scope.control.propSetMap.actionName)[0].control;
            $rootScope.enqueeuedRefreshActions.push( action );
            $rootScope.enqueeuedProducts.push( product );
            console.log('CEC_DEBUG | enqueeuing cart request');
            if( broadcastNewQueeue === true ){
                $rootScope.$broadcast('cartRefreshed');
            }
        }

    }

    $scope.$on('cartRefreshed', function(event, data) {
        console.log('CEC_DEBUG | Cart has finished refreshing');
        var actionRow = $rootScope.enqueeuedRefreshActions.shift();
        var product = $rootScope.enqueeuedProducts.shift();

        if ( actionRow != undefined ){
            console.log('CEC_DEBUG | Executing enqueeuedRefreshActions');

            console.log('CEC_DEBUG | Action:' + JSON.stringify(actionRow) );
            console.log('CEC_DEBUG | Product:' + JSON.stringify(product) );

            // Re-aplly product family to store on cartRefreshed
            $scope.prepareRequest(product);
            $scope.planFamilyName = product.Family;
            if(!$scope.bpTree.response.FamilyAddedControl){
                $scope.bpTree.response.FamilyAddedControl = {}
            }
            $scope.bpTree.response.FamilyAddedControl[product.Family] = true;

            $scope.buttonClick($scope.bpTree.response, actionRow, $scope, null, 'typeAheadSearch', null, $scope.addProductToListSelected);
        }
        $rootScope.isCartRefreshed = true;
    });

    $scope.addProductToListSelected = function (response) {
        console.log('CEC_DEBUG | addProductToListSelected');
        // Run the getCartsItems VIP asynchronously if response 200
        if(response.errorCode === "INVOKE-200"){
            if( $rootScope.enqueeuedRefreshActions.length > 1 ) {
                // If there is a queeue of requests, do not waste time on pricing every product addition
                $rootScope.$broadcast('refreshCartNoPrice');
            } else {
                $rootScope.$broadcast('refreshCart');
            }
        } else {
            console.log('CEC_DEBUG | Error on addProductToListSelected', response);
            $scope.bpTree.response.FamilyAddedControl[$scope.planFamilyName] = false;
        }
    }

    $scope.prepareRequest = function (product) {
        $scope.bpTree.response[$scope.control.propSetMap.parameterActionName] = {
            Id:product.Id,
            Name:product.Name,
            vlocity_cmt__Type__c:product.vlocity_cmt__Type__c,
            TemplateOrderId__c:(product.TemplateOrderId__c) ? product.TemplateOrderId__c : null,
            Family: product.Family,
            itemId: product.PBEId
        };
        $scope.bpTree.response[NODE_PRODUCT_SELECTED_TMP] = product;
    }

    $scope.openMinutagem = function (url , name){

        var minutagenWindows = window.open(url, "_blank");

        minutagemWindows.document.write("<html><head><title>"+name+"</title></head><body style='margin: 0px; background: #0e0e0e;'><title>"+name+"</title><img style='-webkit-user-select: none;' src="+url+"width='855' height='410'></body></html>");
    }

    $scope.getTechnicalDescriptionINTERNET = function (Technical_Description__c){
        return $scope.getJSONFromString(Technical_Description__c);
    }

    $scope.getJSONFromString = function (Technical_Description__c){
        return Technical_Description__c;
    }

    $scope.getTechnicalDescriptionTV = function (Technical_Description__c, node){
        return Technical_Description__c[node];
    }

    $scope.isObject = function (data) {
        return typeof data === 'object';
    }

    $scope.getprices = function(product) {
        var result = [];
        var found;

        console.log("product: ", procuct);
        console.log("prices: ", procuct.prices);
        //prices es un array
        if(product.prices.length > 0){
            if($scope.bpTree.response.StepValidacaoDadosCliente.BlockSelecioneTipoServiço.CEC_ASClienteRBServicios == 'COMBOMULTI'){
                found = product.prices.find(function(element) {
                    if(element.Duration__c > 0){
                        return element;
                    }
                });
            }else{
                found = product.prices.find(function(element) {
                    if(element.Duration__c == 0){
                        return element;
                    }
                });
            }
        }else{
            found = product.prices;
        }

        if (found) {
            result.push(
                {
                    Name: "Single",
                    Value: found.Single__c,
                    Sequencia: 1
                }
            );
            if ( product.Family != 'Movel' )
            {
                result.push(
                    {
                        Name: "Double",
                        Value: found.Double__c,
                        Sequencia: 2
                    }
                );

                result.push(
                    {
                        Name: "Triple",
                        Value: found.Triple__c,
                        Sequencia: 3
                    }
                );

                result.push(
                    {
                        Name: "Combo Multi",
                        Value: found.Combo_Multi__c,
                        Sequencia: 4
                    }
                );
            }
        }

        return result;
    }

    $scope.isDisabledToAddToCart = function(scp, product) {
        var result = false;
        if (scp.bpTree.response.vlcPersistentComponent.vlcCart && scp.bpTree.response.vlcPersistentComponent.vlcCart.totalSize > 0) {
            scp.bpTree.response.vlcPersistentComponent.vlcCart.records.forEach(function(orderItem, index){
                if (orderItem.PricebookEntry.Product2.Family === product.Family) {
                    result = true;
                }
            });
        }
        return result;
    }

    $scope.callBackFunctionFetchExcludeRulesAsync = function(response) {
        $scope.bpTree.response.ExcludeRules = response.ExcludeRules;
        $scope.isAsyncCallRunning = false;
    }

    $scope.fetchExcludeRulesAsync = function() {
        $scope.excludeActionElement = $scope.getElement('IPA_CEC0029')[0].control;
        if ($scope.excludeActionElement){
            $scope.isAsyncCallRunning = true;
            $scope.buttonClick($scope.bpTree.response, $scope.excludeActionElement, $scope, null, 'typeAheadSearch', null, $scope.callBackFunctionFetchExcludeRulesAsync);
        }
    }

    $scope.createExcludeMap = function() {
        var groupRules = $scope.bpTree.response.ExcludeRules;
        $scope.excludeMap = {};
        $scope.recommendsMap = {};
        if(groupRules) {
            for (var i = 0; i < groupRules.length; i++) {
                if(groupRules[i]['Type'] == "Excludes"){
                    if (!$scope.excludeMap[groupRules[i]['ProductId']]) {
                        $scope.excludeMap[groupRules[i]['ProductId']] = [];
                    }
                    $scope.excludeMap[groupRules[i]['ProductId']].push(groupRules[i]['RelatedProductId']);
                } else if (groupRules[i]['Type'] == "Recommends"){
                    if (!$scope.recommendsMap[groupRules[i]['ProductId']]) {
                        $scope.recommendsMap[groupRules[i]['ProductId']] = [];
                    }
                    $scope.recommendsMap[groupRules[i]['ProductId']].push(groupRules[i]['RelatedProductId']);
                }

            }
        }
        $scope.bpTree.response.excludeMap = $scope.excludeMap;
        $scope.bpTree.response.recommendsMap = $scope.recommendsMap;
    };

    $scope.initConfPlanER = function(plan) {
        /*if (!$scope.bpTree.response.ExcludeRules) {
            $scope.fetchExcludeRulesAsync();
        }*/

        if($scope.bpTree.response.vlcPersistentComponent && $scope.bpTree.response.vlcPersistentComponent.vlcCart && $scope.bpTree.response.vlcPersistentComponent.vlcCart.totalSize == 0){
            $scope.bpTree.response.FamilyAddedControl = {};
        }
    }

    $scope.$watch('bpTree.response.ExcludeRules', function(newValue, oldValue) {
        $scope.createExcludeMap();
    });

}]);


/*FILTER TO PRODUCT NAME*/
angular.module('vlocity-oui-common').filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});