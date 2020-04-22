vlocity.cardframework.registerModule.controller('labsxdVlcPromotionsController', ['$scope', '$rootScope', 'bpService', function($scope, $rootScope, bpService) {

    $scope.getFamilyIcon = function (scp, control, orderItem) {
        var result;

        var familyIconsList = control.propSetMap['familyIcons'];
        if (familyIconsList) {
            familyIconsList.forEach(function(element, index){
                if (orderItem.PricebookEntry.Product2.Family.toLowerCase() === element.familyName.toLowerCase()) {
                    result = element.familyIcon;
                }
            });
        }

        return result;

    };

    $scope.getIsPromotion = function (i, sva) {
        var result = false;
        $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.forEach(function (oi){
            if (oi.ReliesOnReferenceId__c.value == i.vlocity_cmt__AssetReferenceId__c.value && oi.Id.value == sva.Id) {
                result = (oi.DescricaoPromocao__c.value) ? true : false;
            }
        });
        return result;

    };

    $scope.setPromotion = function(orderItem, promotion) {
        var OrderItemToUpsert = {};
        OrderItemToUpsert.Id = orderItem.Id.value || orderItem.Id;
        OrderItemToUpsert.Promotion = promotion;
        //OrderItemToUpsert.Promotion.Price__c = parseFloat(OrderItemToUpsert.Promotion.Price__c.replace(',','.'));
        if (promotion.isPromotion)
            OrderItemToUpsert.DescricaoPromocao__c = promotion.Promotion__c;

        $scope.bpTree.response['OrderItemToUpsert'] = OrderItemToUpsert;

        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionNames[0])[0].control, $scope, null, 'typeAheadSearch', null, $scope.promotionCallBack);


    };

    $scope.promotionCallBack = function (response) {
        console.log('promotionCallBack', response);
        // Run the getCartsItems VIP asynchronously if response 200
        $rootScope.$broadcast('refreshCart');
    }

    $scope.getListPromotions = function (promotions) {
        return $scope.getUnique(promotions, 'Id');
    };

    $scope.getUnique = function (arr, comp) {
        var result = (arr) ? arr.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => arr[e]).map(e => arr[e]) : [];
        return result;
    };

    $scope.isPromotionAvailable = function (promotionsList, promotion) {
        var result = false;

        promotionsList.forEach(function(element, index) {
            // if (element.Id != promotion.Id && element.isPromotion ) result = true;
            if (element.Id != promotion.Id && element.isPromotion  && promotion.Type__c == 'Override' ) result = true;
        });

        return result;

    };

    $scope.executeGetPromotion = function () {
        console.log('executeGetPromotion');
        $scope.isAsyncCallRunning25 = true;
        $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionNames[1])[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionExcuteGetPromotion);

    }

    $scope.callbackFunctionExcuteGetPromotion = function (response) {
        console.log('callbackFunctionExcuteGetPromotion', response);
        $scope.bpTree.response.PromotionsByOrderItems = response.PromotionsByOrderItems;
        $scope.isAsyncCallRunning25 = false;

    }


    $scope.hasPromotions = function (i, promotions) {
        var result = false;
        if (promotions) {
            promotions.forEach(function(element){
                if ((element.Id === i.Id.value && element.Promotions && element.Promotions.length > 0) ||
                    (element.ReliesOnReferenceId === i.vlocity_cmt__AssetReferenceId__c.value && element.ReliesOnReferenceId != element.AssetReferenceId && element.Promotions && element.Promotions.length > 0)) result = true;
            });
        }

        return result;
    };

}]);