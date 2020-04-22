(function() { try {
    vlocity.cardframework.registerModule.controller('labsxdVlcFidelidadeController', ['$scope', '$rootScope', 'bpService', function($scope, $rootScope, bpService) {
        console.log("::cec_selectableItemForFidelidade.js version 1::");

        $scope.isArray = angular.isArray;
        $scope.isObject = angular.isObject;

        $scope.getFamilyIcon = function (scp, control, orderItem) {
            var result;
            var familyIconsList = control.propSetMap['familyIcons'];
            if (familyIconsList) {
                familyIconsList.forEach(function(element, index){
                    if (orderItem.sourceProd.Family.toLowerCase() === element.familyName.toLowerCase()) {
                        result = element.familyIcon;
                    }
                });
            }

            return result;

        };

        $scope.getFamilySequence = function (plan) {
            var result;
            var familySList = $scope.getElement('SelectableItemsFidelidadeResidential')[0].control.propSetMap['familyIcons'];
            if (familySList) {
                familySList.forEach(function(element, index){
                    if (plan.sourceProd.Family.toLowerCase() === element.familyName.toLowerCase()) {
                        result = element.familySequence;
                    }
                });
            }

            return result;

        };

        $scope.callBackFunctionSaveFidelidade = function() {
            $rootScope.$broadcast('refreshCart');
        };

        $scope.executeGetInstallments = function () {
            console.log('executeGetInstallments');
            $scope.isAsyncCallRunningInstallments = true;
            $scope.buttonClick($scope.bpTree.response, $scope.getElement($scope.control.propSetMap.actionNames[0])[0].control, $scope, null,'typeAheadSearch', null, $scope.callbackFunctionExcuteGetInstallments);

        }

        $scope.callbackFunctionExcuteGetInstallments = function (response) {
            console.log('callbackFunctionExcuteGetInstallments', response);
            $scope.bpTree.response.recordsInstallments = response.recordsInstallments;
            $scope.isAsyncCallRunningInstallments = false;

            $scope.bpTree.response.recordsInstallments.forEach(function(element, index) {
                $scope.loadConfigurationData(index);
            });

        }

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


            $scope.bpTree.response.vlcPersistentComponent.vlcCart.records.forEach(function(orderItem){
                if (orderItem.Id.value === $scope.bpTree.response.recordsInstallments[index].OrderItemID) {
                    $scope.bpTree.response.recordsInstallments[index].grupo = orderItem.Grupo__c.value;
                    $scope.bpTree.response.recordsInstallments[index].isFedelity = orderItem.Fidelidade__c.value;
                    $scope.getConfigurationFidelity($scope.bpTree.response.recordsInstallments[index], index);
                }
            });


        }

        $scope.saveConfigurationFidelidade = function(plan) {
            if (!$scope.configurationDataElementF) {
                $scope.configurationDataElementF = $scope.getElement('IPA_CEC0034')[0].control;
            }

            if ($scope.configurationDataElementF){
                var obj = {
                    id: plan.OrderItemID,
                    NumeroParcelas__c: plan.installmentSelected.value
                }
                $scope.configurationDataElementF.propSetMap.extraPayload.OrderItemToUpsert = obj;
                $scope.configurationDataElementFCopy = angular.copy($scope.configurationDataElementF);
                $scope.buttonClick($scope.bpTree.response, $scope.configurationDataElementFCopy, $scope, null, 'typeAheadSearch', null, $scope.callBackFunctionSaveFidelidade);
            }

        };

        $scope.getConfigurationFidelity = function(plan, index) {
            $scope.planId = plan.OrderItemID;
            $scope.planIdIndex = index;
            if (!$scope.elementVIP)
                $scope.elementVIP = $scope.getElement('IPA_CEC0043')[0].control;


            $scope.elementVIP.propSetMap.extraPayload.modalidade = $scope.bpTree.response.vlcPersistentComponent.vlcCart_Top.records[0].details.records[0].Cart_State__c;
            $scope.elementVIP.propSetMap.extraPayload.group = plan.grupo;
            $scope.elementVIP.propSetMap.extraPayload.productId = plan.sourceProd.Id;
            $scope.elementVIP = angular.copy($scope.elementVIP);
            $scope.buttonClick($scope.bpTree.response, $scope.elementVIP, $scope, null, 'typeAheadSearch', null, $scope.getConfigurationFidelityCallback);
        };

        $scope.getConfigurationFidelityCallback = function (response) {
            console.log('getConfigurationFidelityCallback');

            if ($scope.planId){
                $scope.bpTree.response.recordsInstallments[$scope.planIdIndex].durations = response.Products;
                $scope.bpTree.response.recordsInstallments[$scope.planIdIndex].showRadioOptions = {
                    yes: $scope.showRadioButtonByDuration($scope.bpTree.response.recordsInstallments[$scope.planIdIndex],12),
                    no: $scope.showRadioButtonByDuration($scope.bpTree.response.recordsInstallments[$scope.planIdIndex],0)
                };

                /*$scope.bpTree.response.recordsInstallments[$scope.planIdIndex].forEach(function(p){
                    if (p.OrderItemID == $scope.planId) {
                        p.durations = response.Products;
                        p.showRadioOptions = {
                            yes: $scope.showRadioButtonByDuration(p,12),
                            no: $scope.showRadioButtonByDuration(p,0)
                        };
                    }
                });*/
            }



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

        $scope.updateFidelidade = function (plan) {
            if (!$scope.configurationDataElementF) {
                $scope.configurationDataElementF = $scope.getElement('IPA_CEC0034')[0].control;
            }

            if ($scope.configurationDataElementF){
                var obj = {
                    id: plan.OrderItemID,
                    Fidelidade__c: plan.isFedelity
                };
                if (plan.isFedelity) obj.NumeroParcelas__c = 0;

                $scope.configurationDataElementF.propSetMap.extraPayload.OrderItemToUpsert = obj;
                $scope.configurationDataElementFCopy = angular.copy($scope.configurationDataElementF);
                $scope.buttonClick($scope.bpTree.response, $scope.configurationDataElementFCopy, $scope, null, 'typeAheadSearch', null, $scope.callBackFunctionSaveFidelidade);
            }
        };

        $scope.getDependentesByParent=function ( product ) {
            console.log("getDependentesByParent product", product);
            product.sort((a,b) => (a.CreatedDate.value > b.CreatedDate.value) ? 1 : ((b.CreatedDate.value > a.CreatedDate.value) ? -1 : 0));

            return product;
        };


        $scope.$watch('bpTree.response', function(newValue, oldValue) {
            console.log('bpTree::::::::', $scope.bpTree.response);
        }, true);


    }]);
} catch(e) { console.error('error in cec_selectableItemForFidelidade.js ',e); } })();