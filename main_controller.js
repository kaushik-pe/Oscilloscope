angular.module('mainControllers', ['panelServices'])
    .controller('mainController', function($scope, $compile, panelService){
        $scope.filterPanelActive = 1;
        var filterCreated = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        var previousFilterIndex = -1;
        $scope.filterTypes = ["", "Low Pass Filter", "High Pass Filter", "Band Pass Filter"];
        $scope.selectedFilter = ["","","","","","","","","","","","","",""];
        $scope.textBox1 = ["","","","","","","","","","","","","",""];
        $scope.textBox2 = ["","","","","","","","","","","","","",""];
        $scope.channelSelected = panelService.channelSelected;
        $scope.filterSelected = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        $scope.populateFilter = function(no){
            var filterId = "filter:"+no;
            var filterControlsId = 'filterControls:'+no;
            if(panelService.channelSelected[no] == 1 && filterCreated[no] == 0){
                filterCreated[no] = 1;
                panelService.finalFilters[no] = 1;
                
                $scope.channelSelected = panelService.channelSelected;
                var element = $compile(angular.element("<div class = 'filter' id = '"+filterId+"' ng-click = 'toggleFilterControls("+no+")' ng-show = 'channelSelected["+no+"]'>Channel "+(no+1)+"</div>"))($scope);
                angular.element(document.getElementsByClassName('filterPanel')).append(element);     //compiles elements to make use of ng-click dynamically
                document.getElementById(filterId).style.backgroundColor = panelService.colors[no];

                element = $compile(angular.element("<div class = 'filterControls' id = '"+filterControlsId+"' ng-show = 'filterSelected["+no+"]'><select class = 'filterControlsDropDown' id = 'filterControlsDropDown:"+no+"' ng-model = 'selectedFilter["+no+"]' ng-options =  'filterType for filterType in  filterTypes' ng-change = 'createTextBox("+no+")'></select></div>"))($scope);
                angular.element(document.getElementsByClassName('filterPanel')).append(element);
                panelService.finalFiltersName = $scope.selectedFilter;                
            }
            else if(panelService.channelSelected[no] == 1 && filterCreated[no] != 0){
                $scope.channelSelected = panelService.channelSelected;
                panelService.finalFilters[no] = 1;
            }
            else{
                $scope.channelSelected = panelService.channelSelected;
                $scope.filterSelected[no] = 0;
                panelService.finalFilters[no] = 0;
            }
        };
    
        $scope.toggleFilterControls = function(no){
            var filterControlsId = 'filterControls:'+no;
            if(previousFilterIndex == -1){
                $scope.filterSelected[no] = 1;
            }
            else if(previousFilterIndex == no){
                    $scope.filterSelected[no] = +!$scope.filterSelected[no];
            }
            else{
                var previousFilterId = 'filterControls:'+previousFilterIndex;
                $scope.filterSelected[previousFilterIndex] = 0;
                $scope.filterSelected[no] = 1;
            }
            console.log($scope.filterSelected);
            previousFilterIndex = no;
        };
    
        $scope.createTextBox = function(no){
            var filterControlsId = 'filterControls:'+no;
            var element;
            //clear text box values on new selection of dropdown menu
            if(document.getElementById('filterControlsDropDown:'+no).classList.contains('ng-dirty')){
                $scope.textBox1[no] = "";
                $scope.textBox2[no] = "";
                document.getElementById('textBoxId:'+no).remove();
            }
            if($scope.selectedFilter[no] == "Band Pass Filter"){
                element = $compile(angular.element("<div id = 'textBoxId:"+no+"'><input type = 'text' placeholder = 'Min Amp' id = 'filterText1:"+no+"' class = 'filterTextBox' ng-model = 'textBox1["+no+"]' ng-change = 'updateTextBoxData()'/><input type = 'text' placeholder = 'Max Amp' id = 'filterText2:"+no+"' class = 'filterTextBox' ng-model = 'textBox2["+no+"]' ng-change = 'updateTextBoxData()'/></div>"))($scope);
                angular.element(document.getElementById(filterControlsId)).append(element);
            }
            else if($scope.selectedFilter[no] != ""){
                element = $compile(angular.element("<div id = 'textBoxId:"+no+"'><input type = 'text' placeholder = 'Amplitude' id = 'filterText1:"+no+"' class = 'filterTextBox' ng-model = 'textBox1["+no+"]' ng-change = 'updateTextBoxData()'/></div>"))($scope);
                angular.element(document.getElementById(filterControlsId)).append(element);
            }
        };
    
        $scope.updateTextBoxData = function(){
            panelService.textBox1 = $scope.textBox1;
            panelService.textBox2 = $scope.textBox2;
        }
    });

