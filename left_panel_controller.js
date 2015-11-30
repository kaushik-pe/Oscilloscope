angular.module('leftPanelControllers', ['panelServices'])
    .controller("leftPanelController", function($scope, panelService){
        $scope.filterPanelActive = 1;
    });