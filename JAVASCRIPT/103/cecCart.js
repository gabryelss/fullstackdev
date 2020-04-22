vlocity.cardframework.registerModule.controller('labsxdVlcCecCart', ['$scope', '$rootScope', 'bpService', '$q', function($scope, $rootScope, bpService, $q) {
    /*
 ** GROUPBY METHOD SUBPRODUCTS TV
 */

    $scope.bpTree.response.showSpinnerCartLoading = false;
    $scope.indexedGroup = [];

    $scope.groupsToFilter = function() {
        $scope.indexedGroup = [];
        if ($scope.bpTree.response.vlcPersistentComponent && $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]] && $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records']) {
            return $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'];
        }

    }

    $scope.filterGroup = function(group) {
        var GroupIsNew = $scope.indexedGroup.indexOf(group.Product2.vlocity_cmt__Type__c) == -1;
        if (GroupIsNew) {
            $scope.indexedGroup.push(group.Product2.vlocity_cmt__Type__c);
        }
        return GroupIsNew;
    }

    /*
    ** FAMILY METHOD
    */

    $scope.isFamily = function(family) {
        var result = [];
        if ($scope.bpTree.response.vlcPersistentComponent && $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]] && $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records']) {
            var vlcCart = $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'];
            result =  vlcCart.filter(function(product) {
                return product.PricebookEntry.Product2.Family == family;
            });
        }
        return (result.length>0) ? true : false;
    }

    /*
    ** IS SHOW MODAL
    */

    $scope.isShowModal = function () {
        var result = false;

        for (var key in $scope.bpTree.response) {

            if (key.indexOf("_showModal") > -1 && typeof $scope.bpTree.response[key] == 'boolean' && $scope.bpTree.response[key]) {
                result = true;
            }
        }

        return result;
    }


    /*
    ** DELETE METHOD
    */

    $scope.deleteOptionalItemsFromCart = function(item, productTop, indexDependentSelected) {
        console.log("CEC_DEBUG | deleteOptionalItemsFromCart");
        var payload = {};
        var OrderItemsIds = [];
        $scope.items = [];
        OrderItemsIds.push(item.Id.value);
        $scope.items.push(item);
        //if delete a product and the recommend product is added has to be deleted
        if($scope.bpTree.response.recommendsMap && $scope.bpTree.response.recommendsMap[item.PricebookEntry.Product2.Id]){
            $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'].forEach(function(product){
                for (var j = 0; j < $scope.bpTree.response.recommendsMap[item.PricebookEntry.Product2.Id].length; j++) {
                    if($scope.bpTree.response.recommendsMap[item.PricebookEntry.Product2.Id][j] == product.Product2.Id){
                        $scope.items.push(item);
                        OrderItemsIds.push(product.Id.value);
                    }
                }
            });
        }

        payload.OrderItemsIds = OrderItemsIds;
        payload.OrderId = $scope.bpTree.response['OrderId'];
        $scope.planName = productTop.PricebookEntry.Product2.Name || productTop.Product2.Name;
        $scope.planType = productTop.PricebookEntry.Product2.vlocity_cmt__Type__c || productTop.Product2.vlocity_cmt__Type__c;
        $scope.planTypeChild = item.PricebookEntry.Product2.vlocity_cmt__Type__c || item.Product2.vlocity_cmt__Type__c;
        $scope.indexDependentSelected = indexDependentSelected;
        console.log("CEC_DEBUG | $scope",$scope.planName,$scope.planType,$scope.indexDependentSelected);
        $scope.remoteCallInvoke(payload, null, false, null, $scope, null, 'typeAheadSearch', null, null, null, 0, $scope.callbackDeleteOptionalItems);

    }

    $scope.deleteItemsFromCart = function(productTop,indexDependentSelected,deleteAll) {
        console.log("CEC_DEBUG | deleteItemsFromCart");
        $scope.productTop = productTop.Id.value;

        var payload = $scope.getProductsIdToDelete(productTop);
        if( deleteAll ) {
            payload = $scope.getProductsIdToDeleteAll();
            $scope.planName = "Empty Cart";
        } else {
            $scope.planName = productTop.PricebookEntry.Product2.Name || productTop.Product2.Name;
            $scope.planFamilyName = productTop.PricebookEntry.Product2.Family || productTop.Product2.Family;
            $scope.planType = productTop.PricebookEntry.Product2.vlocity_cmt__Type__c || productTop.Product2.vlocity_cmt__Type__c;
            $scope.indexDependentSelected = indexDependentSelected;
        }

        var movelProducts = $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.filter(function(orderItem){
            return orderItem.PricebookEntry.Product2.vlocity_cmt__Type__c == 'Plano' && orderItem.PricebookEntry.Product2.Family == 'Movel';
        });

        var residentialProducts = $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.filter(function(orderItem){
            return orderItem.PricebookEntry.Product2.vlocity_cmt__Type__c == 'Plano' && orderItem.PricebookEntry.Product2.Family != 'Movel';
        });


        if (movelProducts && residentialProducts && movelProducts.length == 1 && residentialProducts.length == 1) {
            if (residentialProducts[0].Id.value == $scope.productTop) {
                var dependentProducts = $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.filter(function(orderItem){
                    return orderItem.PricebookEntry.Product2.vlocity_cmt__Type__c == 'Dependente';
                });

                if (dependentProducts && dependentProducts.length > 0) {
                    $scope.planNameDependente = movelProducts[0].PricebookEntry.Product2.Name;
                    $scope.changedFlow = true;
                }

                dependentProducts.forEach(function(dependeP){
                    payload.OrderItemsIds.push(dependeP.Id.value);
                });
            }
        }

        payloadString = JSON.stringify( payload );
        console.log( "CEC_DEBUG | returnPayload: " + payloadString );
        $scope.remoteCallInvoke(payload, null, false, null, $scope, null, 'typeAheadSearch', null, null, null, 0, $scope.callbackDeleteItems);

    }

    $scope.callbackDeleteItems = function (result) {
        console.log('CEC_DEBUG | callbackDeleteItems', result);
        console.log('CEC_DEBUG | $scope.planName', $scope.planName);
        console.log('CEC_DEBUG | $scope.planFamilyName', $scope.planFamilyName);
        if(result && result.vlcPersistentComponent && result.vlcPersistentComponent[0] && result.vlcPersistentComponent[0].success == true){

            // Returns control to add product only on callbackDelete, to avoid concurrency
            //$scope.bpTree.response.FamilyAddedControl[$scope.planFamilyName] = false;
            //CLEAR JSON NODES TO CONFIGURATION STEP
            if ($scope.bpTree.response.controlList) delete $scope.bpTree.response.controlList[$scope.planName];
            if ($scope.bpTree.response.SelectedProductsForAddToCart) delete $scope.bpTree.response.SelectedProductsForAddToCart[$scope.planName];
            if ($scope.bpTree.response.PlanAddons) delete $scope.bpTree.response.PlanAddons[$scope.planName];
            if ($scope.bpTree.response.PlanAddonsQtd) delete $scope.bpTree.response.PlanAddonsQtd[$scope.planName];
            if ($scope.bpTree.response.AddedItems) delete $scope.bpTree.response.AddedItems;
            if ($scope.bpTree.response[$scope.planName]) delete $scope.bpTree.response[$scope.planName];
            if ($scope.bpTree.response.SelectedProductsForAddToCartRequest) $scope.bpTree.response.SelectedProductsForAddToCartRequest = {};
            if ($scope.bpTree.response.controlListId){
                var index = $scope.bpTree.response.controlListId.map(function (item) {
                    return item.id;
                }).indexOf($scope.productTop);

                if (index !== undefined && index !== null && index >=0){
                    $scope.bpTree.response.controlListId.splice(index, 1);
                }
            }
            if ($scope.bpTree.response.recordsInstallments){
                var indexf = $scope.bpTree.response.recordsInstallments.map(function (item) {
                    return item.OrderItemID;
                }).indexOf($scope.productTop);

                if (indexf !== undefined && indexf !== null && indexf >=0){
                    $scope.bpTree.response.recordsInstallments.splice(indexf, 1);
                }
            }


            //CLEAR NODES DEPENDENTES
            if ($scope.planType == 'Plano') {
                if ($scope.bpTree.response.DependentesByOrderItems && $scope.bpTree.response.DependentesByOrderItems[$scope.planName]) delete $scope.bpTree.response.DependentesByOrderItems[$scope.planName];
                if ($scope.changedFlow) {
                    if ($scope.bpTree.response.DependentesByOrderItems && $scope.bpTree.response.DependentesByOrderItems[$scope.planNameDependente]) delete $scope.bpTree.response.DependentesByOrderItems[$scope.planNameDependente];
                    delete $scope.changedFlow;
                }
            }

            // IN CASE OF EMPTY CART BUTTON, CALLBACK ALL!
            if( $scope.planName == "Empty Cart" ){
                delete $scope.bpTree.response.controlList;
                delete $scope.bpTree.response.SelectedProductsForAddToCart;
                delete $scope.bpTree.response.PlanAddons;
                delete $scope.bpTree.response.PlanAddonsQtd;
                delete $scope.bpTree.response.AddedItems;
                //delete $scope.bpTree.response[$scope.planName];
                $scope.bpTree.response.SelectedProductsForAddToCartRequest = {};
                /*if( ! $scope.bpTree.response.controlListId === undefined ){
                    $scope.bpTree.response.controlListId.splice(index, 1);
                }*/
                //$scope.bpTree.response.controlListId = {}
                //[$scope.planName]; //[$scope.planNameDependente];
                delete $scope.planName;
                // Returns control to add products only on callbackDelete, to avoid concurrency
                //$scope.bpTree.response.FamilyAddedControl = {};
                $scope.bpTree.response.DependentesByOrderItems = {};
            }

            $scope.invokeActionAsyc("IPA_CEC0012", $scope.callbackDelete);

        }
    }

    $scope.callbackDeleteOptionalItems = function (result) {
        console.log('CEC_DEBUG | callbackDeleteOptionalItems', result);

        if(result && result.vlcPersistentComponent && result.vlcPersistentComponent[0] && result.vlcPersistentComponent[0].success == true){

            for (var q = 0; q < $scope.items.length; q++) {
                //CLEAR JSON NODES TO CONFIGURATION STEP
                if ($scope.bpTree.response.controlList && $scope.bpTree.response.controlList[$scope.planName]){
                    $scope.bpTree.response.controlList[$scope.planName].splice($scope.bpTree.response.controlList[$scope.planName].indexOf($scope.items[q].PricebookEntry.Product2.Id), 1);
                }
                if ($scope.bpTree.response.PlanAddonsQtd && $scope.bpTree.response.PlanAddonsQtd[$scope.planName]){
                    for (var i = 0; i < $scope.bpTree.response.PlanAddonsQtd[$scope.planName].length; i++) {
                        if($scope.bpTree.response.PlanAddonsQtd[$scope.planName][i].productId == $scope.items[q].PricebookEntry.Product2.Id){
                            $scope.bpTree.response.PlanAddonsQtd[$scope.planName].splice(i, 1);
                            break;
                        }
                    }

                }
                if ($scope.bpTree.response.SelectedProductsForAddToCart && $scope.bpTree.response.SelectedProductsForAddToCart[$scope.planName]){
                    if($scope.items[q].TemplateDefaultQty__c.value == "0" || $scope.items[q].TemplateDefaultQty__c.value == 0){
                        $scope.bpTree.response.SelectedProductsForAddToCart[$scope.planName].splice($scope.bpTree.response.SelectedProductsForAddToCart[$scope.planName].indexOf($scope.items[q].PricebookEntry.Product2.Id), 1);
                    }
                }

            }

            //CLEAR NODES DEPENDENTES
            if ($scope.planTypeChild == 'Dependente') {
                if ($scope.bpTree.response.DependentesByOrderItems && $scope.bpTree.response.DependentesByOrderItems[$scope.planName]) $scope.bpTree.response.DependentesByOrderItems[$scope.planName]['selected'].splice($scope.indexDependentSelected,1);
            }


            $scope.invokeActionAsyc("IPA_CEC0012", $scope.callbackDelete);

        }
    }

    $scope.callbackDelete = function (response) {
        console.log('CEC_DEBUG | callbackDelete', response);
        console.log("CEC_DEBUG | CurrentStep: " + $scope.bpTree.response.CurrentStep );
        $scope.isAsyncCallRunning = false;
        $scope.bpTree.response.showSpinnerCartLoading = false;
        if (response && response.vlcCart.totalSize <= 0) {
            $scope.sidebarNav($scope.getStep('StepPlano'));
        }

        $scope.previousIsResidencial = ($scope.bpTree.response.vlcPersistentComponent.vlcCart_Top[0]) ?
            $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top[0].residencialItem.isResidential: $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top.residencialItem.isResidential;

        $scope.bpTree.response.vlcPersistentComponent.vlcCart = response.vlcCart;
        $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top = response.vlcCart_Top;

        $scope.actualIsResidencial = ($scope.bpTree.response.vlcPersistentComponent.vlcCart_Top[0]) ?
            $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top[0].residencialItem.isResidential: $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top.residencialItem.isResidential;

        //block step when COMBO MULTI and ILIMITADO MUNDO TOTAL and ILIMITADO BRASIL
        //////////////////////// REMEMBER DELETE THIS CODE
        var stepPlano = $scope.getStep("StepPlano");
        if (stepPlano && stepPlano.bAccordionActive && stepPlano.bAccordionOpen) {
            $scope.validateAndBlockStepPlano();
        }
        //////////////////////// REMEMBER DELETE THIS CODE

        //////////VALIDATE DEPENDENTES
        if( $scope.bpTree.response.CurrentStep != "StepPlano" ){
            $scope.existDependentes();
        }
        //////////VALIDATE DEPENDENTES

        //////////FIDELIDADE RESIDENTIAL
        if( $scope.bpTree.response.CurrentStep != "StepPlano" ){
            $scope.executeGetInstallments();
        }
        //////////FIDELIDADE RESIDENTIAL

        /*if(!$scope.bpTree.response.setPromotionsByOrderItemsValue){
            $scope.executeGetPromotion();
        }*/

        // Returns control to shop, enabling it to re-add products to cart
        if( $scope.planFamilyName === undefined ){
            $scope.bpTree.response.FamilyAddedControl = {};
        } else {
            $scope.bpTree.response.FamilyAddedControl[$scope.planFamilyName] = false;
        }

    }

    $scope.getProductsIdToDelete = function(productTop) {
        var payload = {};
        var OrderItemsIds = [];

        $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'].forEach(function(product){
            if (product.Id.value === productTop.Id.value || (product.ReliesOnReferenceId__c.value !== product.vlocity_cmt__AssetReferenceId__c.value && product.ReliesOnReferenceId__c.value === productTop.vlocity_cmt__AssetReferenceId__c.value)) {
                OrderItemsIds.push(product.Id.value);
            }
            //if delete a product and the recommend product is added has to be deleted
            if($scope.bpTree.response.recommendsMap && $scope.bpTree.response.recommendsMap[productTop]){

                for (var j = 0; j < $scope.bpTree.response.recommendsMap[productTop].length; j++) {
                    if($scope.bpTree.response.recommendsMap[productTop][j] == product.Id.value){
                        OrderItemsIds.push(product.Id.value);
                    }
                }

            }
        });

        payload.OrderItemsIds = OrderItemsIds;
        payload.OrderId = $scope.bpTree.response['OrderId'];

        return payload;
    }

    $scope.getProductsIdToDeleteAll = function() {
        var payload = {};
        var OrderItemsIds = [];

        $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'].forEach(function(product){
            OrderItemsIds.push(product.Id.value);
        });

        payload.OrderItemsIds = OrderItemsIds;
        payload.OrderId = $scope.bpTree.response['OrderId'];

        return payload;
    }

    /*$scope.executeGetPromotion = function () {
        console.log('executeGetPromotion');
        $scope.isAsyncCallRunning25 = true;
        $scope.buttonClick($scope.bpTree.response, $scope.getElement('IPA_CEC0025')[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionExcuteGetPromotion);

    }*/

    $scope.callbackFunctionExcuteGetPromotion = function (response) {
        console.log('CEC_DEBUG | callbackFunctionExcuteGetPromotion', response);
        $scope.bpTree.response.PromotionsByOrderItems = response.PromotionsByOrderItems;
        $scope.isAsyncCallRunning25 = false;

        if ($scope.bpTree.response.PromotionsByOrderItems) {
            $scope.bpTree.response.PromotionsByOrderItems.forEach(function(element){
                if (element.Promotions && element.Promotions.length > 0)
                {
                    $scope.bpTree.response.setPromotionsByOrderItemsValue=true;
                    return;
                }
            });
        }  else {
            $scope.bpTree.response.setPromotionsByOrderItemsValue=false;
        }

    }

    /*
    ** AJUSTMENT METHOD
    */
    // Get Price Adjustment Lines for a price element
    // Invoke this: <div ng-init="getPriceAdjustmentDetails(lineItem[i])"
    $scope.getPriceAdjustmentDetails = function(product) {
        $scope.isAsyncCallRunning = true;
        if (product.vlocity_cmt__RecurringCharge__c && product.vlocity_cmt__RecurringCharge__c.actions.pricedetail) {
            var className = 'CpqAppHandler';
            var methodName = 'getPriceDetail';
            var inputMap = product.vlocity_cmt__RecurringCharge__c.actions.pricedetail.remote.params;
            var optionsMap = {};
            var Id = product.Id.value;
            $scope.apexCall(className, methodName, inputMap, optionsMap).then(function(response){

                try {
                    console.log('CEC_DEBUG | getPriceAdjustmentDetails response', response);
                    $scope.isAsyncCallRunning = false;
                    $scope.bpTree.response.vlcPersistentComponent[$scope.bpTree.pcId[$scope.vlcPC.pcIndex]]['records'].forEach(function(product){
                        if (product.Id.value === Id) {
                            product.priceAdjustmentLines = response.records[0][inputMap["fields"]].pricedetail;
                            //product.priceAdjustmentLines = response.records[0].vlocity_cmt__RecurringCharge__c.pricedetail;
                        }
                    });
                } catch (error) {
                    console.log('CEC_DEBUG | getPriceAdjustmentDetails error', error);
                }

                // Display Price Details in the UI. The path to the Adjustment lines are at: response.records[0].vlocity_cmt__RecurringCharge__c.pricedetail
                // <div ng-repeat="priceLine in product.priceAdjustmentLines" ng-if="priceLine.DetailType === 'ADJUSTMENT'">
                //      <span>{{ priceLine.Description }}</span>
                //      <span>{{ priceLine.AdjustmentValue }}</span>
                // </div>
            }, function(error){
                console.log('CEC_DEBUG | getPriceAdjustmentDetails error', error);
            });
        }

    };

    // Generic Apex Remote Call
    $scope.apexCall = function(className, methodName, inputMap, optionsMap) {
        var deferred = $q.defer();
        bpService.GenericInvoke(className, methodName, angular.toJson(inputMap), angular.toJson(optionsMap)).then(
            function(response) {
                deferred.resolve(angular.fromJson(response));
            }, function(error) {
                deferred.reject(error);
            });
        return deferred.promise;
    };

    // Invokes any action in the OS
    $scope.invokeActionAsyc = function(actionName, callback) {
        $scope.bpTree.response.showSpinnerCartLoading = true;
        var actionElement = $scope.getElement(actionName)[0].control;
        if (actionElement) {
            $scope.isAsyncCallRunning = true;
            $scope.buttonClick($scope.bpTree.response, actionElement, $scope, null, 'typeAheadSearch', null, callback);
        }
    };

    $scope.invokeBGActionAsyc = function(actionName, callback) {
        var actionElement = $scope.getElement(actionName)[0].control;
        if (actionElement) {
            $scope.isAsyncCallRunning = true;
            $scope.buttonClick($scope.bpTree.response, actionElement, $scope, null, 'typeAheadSearch', null, callback);
        }
    };

    // Get Carts Items Callback
    $scope.getCallBackFunctionRefreshCart = function(response) {
        if(response.errorCode === undefined || response.errorCode === "INVOKE-200"){
            console.log('CEC_DEBUG | getCallBackFunctionRefreshCart', response);
            console.log("CEC_DEBUG | CurrentStep: " + $scope.bpTree.response.CurrentStep );
            // Callback code with VIP response
            $scope.isAsyncCallRunning = false;
            // Run Cart Setup Code here
            $scope.bpTree.response.vlcPersistentComponent.vlcCart = response.vlcCart;
            $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top = response.vlcCart_Top;

            //block step when COMBO MULTI and ILIMITADO MUNDO TOTAL and ILIMITADO BRASIL
            //////////////////////// REMEMBER DELETE THIS CODE
            var stepPlano = $scope.getStep("StepPlano");
            if (stepPlano && stepPlano.bAccordionActive && stepPlano.bAccordionOpen) {
                $scope.validateAndBlockStepPlano();
            }
            //////////////////////// REMEMBER DELETE THIS CODE

            //////////VALIDATE DEPENDENTES
            if( $scope.bpTree.response.CurrentStep != "StepPlano" ){
                $scope.existDependentes();
            }
            //////////VALIDATE DEPENDENTES


            //////////FIDELIDADE RESIDENTIAL
            if( $scope.bpTree.response.CurrentStep != "StepPlano" ){
                $scope.executeGetInstallments();
            }
            //////////FIDELIDADE RESIDENTIAL

            console.log('CEC_DEBUG | Broadcasting cartRefreshed');
            $rootScope.$broadcast('cartRefreshed');
            $scope.bpTree.response.showSpinnerCartLoading = false;
        }
    };

    $scope.getCallBackFunctionRefreshCartNoPrice = function(response) {
        if(response.errorCode === undefined || response.errorCode === "INVOKE-200"){
            console.log('CEC_DEBUG | getCallBackFunctionRefreshCart', response);
            console.log("CEC_DEBUG | CurrentStep: " + $scope.bpTree.response.CurrentStep );
            // Callback code with VIP response
            // Run Cart Setup Code here
            $scope.bpTree.response.vlcPersistentComponent.vlcCart = response.vlcCart;
            $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top = response.vlcCart_Top;
        }
    };

    $scope.existDependentes = function () {
        console.log('CEC_DEBUG | existDependentes');
        $scope.callbackFunctionGetDependentes = function (response) {
            $scope.bpTree.response.ShowStepDependente = (response && response.Dependentes) ? true: false;
            var stepDependente = $scope.getStep("StepDependente");
            if (stepDependente && stepDependente.bAccordionActive && stepDependente.bAccordionOpen && $scope.bpTree.response.ShowStepDependente == false) {
                $scope.previous($scope, stepDependente);
            } else if ($scope.previousIsResidencial != $scope.actualIsResidencial && $scope.bpTree.children[$scope.bpTree.asIndex].nextIndex >= stepDependente.nextIndex && $scope.bpTree.response.ShowStepDependente) {
                if ($scope.bpTree.response.DependentesByOrderItems) {
                    delete $scope.bpTree.response.DependentesByOrderItems;
                    delete $scope.previousIsResidencial;
                    delete $scope.actualIsResidencial;
                }
                $scope.sidebarNav(stepDependente);
            }
        };
        $scope.invokeActionAsyc("IPACEC_0039", $scope.callbackFunctionGetDependentes);
        //$scope.buttonClick($scope.bpTree.response, $scope.getElement('IPACEC_0039')[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionGetDependentes);
    };

    $scope.validateAndBlockStepPlano = function () {
        var exist = false;
        if ($scope.bpTree.response.vlcPersistentComponent.vlcCart && $scope.bpTree.response.vlcPersistentComponent.vlcCart.totalSize > 0) {
            var topProducts = $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.filter(function(orderItem){
                return orderItem.PricebookEntry.Product2.vlocity_cmt__Type__c == 'Plano';
            });


            if (topProducts && topProducts.length === 4) {
                topProducts.forEach(function(orderItem, index){
                    var productName = orderItem.PricebookEntry.Product2.Name || orderItem.Product2.Name;
                    if (productName.toUpperCase() == 'ILIMITADO MUNDO TOTAL' || productName.toUpperCase() == 'ILIMITADO BRASIL') {
                        exist = true;
                    }
                });
            }

            if($scope.bpTree.response['StepValidacaoDadosCliente']['BlockSelecioneTipoServiço']['CEC_ASClienteRBServicios'] == 'COMBOMULTI'){
                if (topProducts && topProducts.length === 1 && topProducts[0].PricebookEntry.Product2.Family == 'Movel') {
                    exist = true;
                }
            }


        }
        $scope.bpTree.response['blockStepPlanoTemporal'] = exist;
    }

    $scope.getDependentesByParent=function ( product ) {
        console.log("CEC_DEBUG | getDependentesByParent product", product);
        product.sort((a,b) => (a.CreatedDate.value > b.CreatedDate.value) ? 1 : ((b.CreatedDate.value > a.CreatedDate.value) ? -1 : 0));

        return product;
    };

    // Watcher to disable spinner during async call
    $scope.$watch('$root.loading', function(newValue, oldValue) {
        if (($rootScope.loading && $scope.isAsyncCallRunning) || ($rootScope.loading && $scope.isAsyncCallRunning25) || ($rootScope.loading && $scope.isAsyncCallRunning23) ) {
            $rootScope.loading = false;
        }
    });

    $scope.$on('refreshCartNoPrice', function(event, data) {
        if(!$scope.bpTree.response.showSpinnerCartLoading){
            $scope.invokeActionAsyc("IPA_CEC0046", $scope.getCallBackFunctionRefreshCart);
        }
    });

    $scope.$on('refreshCart', function(event, data) {
        if(!$scope.bpTree.response.showSpinnerCartLoading){
            $scope.invokeActionAsyc("IPA_CEC0046", $scope.getCallBackFunctionRefreshCartNoPrice);
            $scope.invokeBGActionAsyc("IPA_CEC0012", $scope.getCallBackFunctionRefreshCart);
        }
    });

    $scope.$on('deleteDependentes', function(event, data) {
        $scope.deleteOptionalItemsFromCart(data.child, data.top);
    });

    /* FIDELIDADE */
    $scope.executeGetInstallments = function () {
        console.log('CEC_DEBUG | executeGetInstallments');
        $scope.isAsyncCallRunningInstallments = true;
        $scope.buttonClick($scope.bpTree.response, $scope.getElement('IPA_CEC0033')[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionExcuteGetInstallments);

    };

    $scope.callbackFunctionExcuteGetInstallments = function (response) {
        console.log('CEC_DEBUG | callbackFunctionExcuteGetInstallments', response);
        $scope.bpTree.response.recordsInstallments = response.recordsInstallments;

        if( $scope.bpTree.response.recordsInstallments != undefined ){
            $scope.bpTree.response.recordsInstallments.forEach(function(element, index) {
                $scope.loadConfigurationData(index);
            });
        }
        $scope.isAsyncCallRunningInstallments = false;

    };

    $scope.loadConfigurationData = function(index) {
        var array = $scope.bpTree.response.recordsInstallments[index].installments.split(";");
        $scope.bpTree.response.recordsInstallments[index].options = [];
        if(array.length > 0){
            angular.forEach(array, function(value, key){
                var obj = {
                    label: value +'X',
                    value: value
                }
                $scope.bpTree.response.recordsInstallments[index].options.push(obj);
            });
        }

        $scope.bpTree.response.recordsInstallments.forEach(function(p){
            p.showRadioOptions = {
                yes: $scope.showRadioButtonByDuration(p,12),
                no: $scope.showRadioButtonByDuration(p,0)
            };
        });

        $scope.getConfigurationFidelity($scope.bpTree.response.recordsInstallments[index], index);

    };

    $scope.getConfigurationFidelity = function(plan, index) {

        if (!$scope.elementVIP)
            $scope.elementVIP = $scope.getElement('IPA_CEC0043')[0].control;


        $scope.elementVIP.propSetMap.extraPayload.modalidade = $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top.records[0].details.records[0].Cart_State__c;
        $scope.elementVIP.propSetMap.extraPayload.group = plan.grupo;
        $scope.elementVIP.propSetMap.extraPayload.productId = plan.sourceProd.Id;
        $scope.elementVIP.propSetMap.extraPayload.orderItemId = plan.OrderItemID;
        $scope.elementVIP = angular.copy($scope.elementVIP);
        $scope.buttonClick($scope.bpTree.response, $scope.elementVIP, $scope, null, 'typeAheadSearch', null, $scope.getConfigurationFidelityCallback);
    };

    $scope.getConfigurationFidelityCallback = function (response) {
        console.log('CEC_DEBUG | getConfigurationFidelityCallback');

        $scope.bpTree.response.recordsInstallments.forEach(function(p){
            if (p.OrderItemID == response.OrderItemId) {
                p.durations = response.Products;
                p.showRadioOptions = {
                    yes: $scope.showRadioButtonByDuration(p,12),
                    no: $scope.showRadioButtonByDuration(p,0)
                };
            }
        });



        $scope.planId = undefined;
    };

    $scope.showRadioButtonByDuration = function (plan, duration) {
        var result = false;
        if (plan.durations) {
            plan.durations.forEach(function(p){
                if (p.Duration__c === duration) result = true;
            });
        }

        return result;
    };

    $scope.remoteCallInvoke = function(payload, element, bBtn, fromIndex, scp, selectedItem, operation, customizer, lastIndex, stage, pcIndex, callback)
    {
        var input = payload;
        var sClassName;
        var sMethodName;
        var iTimeout;
        var option;

        if (element && !["Remote Action", "Integration Procedure Action"].includes(element.type)){
            $rootScope.loading = true;
        }

        if(!stage && bBtn)
        {
            $scope.remoteCallRepeater(element, scp, input, stage, selectedItem, operation, customizer, pcIndex, callback);
            return;
        }

        if(element)
        {
            sClassName = element.propSetMap.remoteClass;
            sMethodName = element.propSetMap.remoteMethod;
            iTimeout = element.propSetMap.remoteTimeout;
            option = element.propSetMap.remoteOptions;

            if(!bBtn && element.type !== 'Step')
                element.ui.preTransform = false;

            if(!(element.propSetMap.preTransformBundle || element.propSetMap.transformBundle) )
                input = $scope.getSendResponseJSON(input, element.propSetMap.sendJSONPath, element.propSetMap.sendJSONNode);

            if (element.type === 'Integration Procedure Action') {
                sClassName = bpService.sNSC + 'IntegrationProcedureService';
                sMethodName = element.propSetMap.integrationProcedureKey;

                if (option == null) {
                    option = {};
                }

                option.useContinuation = element.propSetMap.useContinuation;
            }
        }
        // global persistent component (cart)
        else if($scope.bpTree.propSetMap.persistentComponent && pcIndex !== undefined && pcIndex !== null)
        {
            sClassName = $scope.bpTree.propSetMap.persistentComponent[pcIndex].remoteClass;
            sMethodName = $scope.bpTree.propSetMap.persistentComponent[pcIndex].remoteMethod;
            iTimeout = $scope.bpTree.propSetMap.persistentComponent[pcIndex].remoteTimeout;
            //input = payload.response;
            option = $scope.bpTree.propSetMap.persistentComponent[pcIndex].remoteOptions;
            if(!$scope.bpTree.propSetMap.persistentComponent[pcIndex].preTransformBundle)
                input = $scope.getSendResponseJSON(input, $scope.bpTree.propSetMap.persistentComponent[pcIndex].sendJSONPath, $scope.bpTree.propSetMap.persistentComponent[pcIndex].sendJSONNode);
        }

        if(option === undefined || option === null)
            option = {};

        if(element)
        {
            if(bpService.placeholderEleTypeList.indexOf(element.type) >= 0)
            {
                option.vlcJSONNode = element.name;
                if(element.JSONPath)
                    option.jsonPath = element.JSONPath;
            }
            if(element.type === 'Filter Block')
                option.vlcFilters = element.vlcJSONPath;
        }

        if(selectedItem && element){
            if(element.type === 'Selectable Items')
                option.vlcSelectedItem = selectedItem;
            if(element.type === 'Input Block')
                option.vlcInputBlock = selectedItem;
        } else if(selectedItem)
            option.vlcSelectedItem = selectedItem;

        if(operation)
            option.vlcOperation = operation;

        if(!bBtn && element && element.type !== 'Step')
        {
            element.ui.show = true;
            element.ui.error = false;
            element.ui.errorMessage = '';
        }

        // to support Continuation
        option.vlcClass = sClassName;

        var restOptions;
        if(element && (element.propSetMap.type === 'Named Credential' || element.propSetMap.type === 'SOAP/XML')) {
            restOptions = (option.restOptions === undefined)?null:(angular.copy(option.restOptions));

            delete option.restOptions;
        }
        var optionString = angular.toJson(option);
        if(scp && scp.control && scp.control.blockIndex !== undefined && scp.control.blockIndex !== null)
            optionString = $scope.handleMergeField(optionString, false, null, (bBtn)?element:null, null, scp.control.blockIndex, true);
        else
            optionString = $scope.handleMergeField(optionString, false, null, (bBtn)?element:null, null, scp?scp.editBlockIndex:null, true);
        option = angular.fromJson(optionString);
        if(restOptions && element && (element.propSetMap.type === 'Named Credential' || element.propSetMap.type === 'SOAP/XML')) {
            option.restOptions = restOptions;
        }
        if($scope.bpTree.filesMap)
            option.vlcFilesMap = VOUINS.getFilesMap($scope.bpTree.filesMap, $rootScope.isSforce, $rootScope.sforce);

        // v16, additional payload
        if(element && element.propSetMap.extraPayload && Object.getOwnPropertyNames(element.propSetMap.extraPayload).length > 0) {
            input = $scope.handleExtraPayload(element.propSetMap.extraPayload, input, bBtn, element, scp);
        }

        //remote calls when made from persistent component
        var dLabel = (pcIndex !== null) && (pcIndex >= 0) && $scope.bpTree.propSetMap.persistentComponent && $scope.bpTree.propSetMap.persistentComponent[pcIndex].id;

        var configObj = {sClassName:sClassName,sMethodName:sMethodName,input:angular.toJson(input),
            options:angular.toJson(option),iTimeout:iTimeout,label:{label:(element && element.name) || dLabel}};

        bpServiceFunction(configObj);

        function bpServiceFunction(configObj) {
            bpService.OmniRemoteInvoke(configObj, scp, element, $scope).then(function(result) {
                    var remoteResp = angular.fromJson(result);

                    if(checkRemoteCallError(remoteResp))
                    {
                        if(customizer && customizer.constructor === Function)
                        {
                            customizer(operation, selectedItem, false, element, pcIndex, scp);
                        }

                        $scope.handleRemoteCallError(element, remoteResp.error, bBtn, false, operation, callback);
                    }
                    else
                    {
                        if(element && (element.propSetMap.type === 'Named Credential' || element.propSetMap.type === 'SOAP/XML')) {
                            remoteResp = remoteResp.NCCallresp;

                            try {
                                if(remoteResp)
                                    remoteResp = angular.fromJson(remoteResp);
                            } catch (e) {
                                $scope.handleRemoteCallError(element, customLabels.OmniDesInvalidJson, bBtn, false);
                                return;
                            }

                            if(element.propSetMap.type === 'SOAP/XML')
                                delete element.propSetMap.postTransformBundle;
                        }

                        if (element && element.type === 'Integration Procedure Action' && remoteResp.IPResult) {
                            remoteResp = remoteResp.IPResult;

                            if (remoteResp.hasOwnProperty('vlcIPData')
                                && remoteResp.hasOwnProperty('vlcStatus')
                                && remoteResp.vlcStatus === 'InProgress') {

                                $rootScope.loading = true;
                                // overwriting as object in order to use same prop, but also have different display conditions
                                $rootScope.loadingMessage = {actionMessage: remoteResp.vlcMessage};

                                configObj.options = angular.toJson(remoteResp);
                                configObj.input = '{}';

                                if (remoteResp.hasOwnProperty('vlcAsync'))
                                {
                                    setTimeout(function()
                                    {
                                        return bpServiceFunction(configObj);
                                    }, 5000);
                                }
                                else
                                {
                                    return bpServiceFunction(configObj);
                                }
                            }
                        }

                        // if there is no post transform bundle defined, then this action is done, apply the Resp
                        if(element && !element.propSetMap.postTransformBundle){
                            remoteResp = $scope.getSendResponseJSON(remoteResp, element.propSetMap.responseJSONPath, element.propSetMap.responseJSONNode);
                        }
                        if(!element && $scope.bpTree.propSetMap.persistentComponent && pcIndex !== undefined && pcIndex !== null && !$scope.bpTree.propSetMap.persistentComponent[pcIndex].postTransformBundle){
                            remoteResp = $scope.getSendResponseJSON(remoteResp, $scope.bpTree.propSetMap.persistentComponent[pcIndex].responseJSONPath, $scope.bpTree.propSetMap.persistentComponent[pcIndex].responseJSONNode);
                        }
                        if(remoteResp && ((element && !element.propSetMap.postTransformBundle) || (!element && $scope.bpTree.propSetMap.persistentComponent && pcIndex !== undefined && pcIndex !== null && !$scope.bpTree.propSetMap.persistentComponent[pcIndex].postTransformBundle)))
                        {
                            if(angular.equals(operation,'typeAheadSearch') && angular.isFunction(callback)){
                                $rootScope.loading = false;
                                callback(remoteResp);
                                return;
                            }

                            if(angular.equals(operation,'emailAction') && angular.isFunction(callback)){
                                callback(remoteResp);
                            }

                            var validationResp = remoteResp.vlcValidationErrors;
                            var bValidationError = (validationResp && validationResp.constructor === Object && Object.getOwnPropertyNames(validationResp).length > 0)?(true):(false);

                            if(customizer && customizer.constructor === Function)
                            {
                                if(bValidationError)
                                    customizer(operation, selectedItem, false, element, pcIndex, scp);
                                else
                                    customizer(operation, selectedItem, true, element, pcIndex, scp);
                            }
                            var bContinue = $scope.applyCallRespMain(angular.copy(remoteResp), element, null, scp);
                            if(bValidationError && !bContinue)
                                return;
                        }

                        $scope.handleRemoteCallSuccess(element, remoteResp, bBtn, true, fromIndex, lastIndex, scp, selectedItem, operation, customizer, pcIndex, callback);
                    }
                },
                function(error)
                {
                    if(customizer && customizer.constructor === Function)
                    {
                        customizer(operation, selectedItem, false, element, pcIndex, scp);
                    }

                    $scope.handleRemoteCallError(element, error, bBtn, false, operation, callback);
                }
            );
        }
    };
    function checkRemoteCallError(remoteResp) {
        if(remoteResp && remoteResp.error !== undefined && remoteResp.error !== 'OK')
            return true;
        else if(remoteResp && remoteResp.error === undefined && !remoteResp.records && angular.isArray(remoteResp.messages) && remoteResp.messages.length > 0) {
            remoteResp.error = [];
            for(var i=0; i<remoteResp.messages.length; i++){
                if(angular.equals(remoteResp.messages[i].severity,'ERROR'))
                    remoteResp.error.push(remoteResp.messages[i]);
            }
            if(remoteResp.error.length > 0)
                return true;
        }
        return false;
    }
}]);