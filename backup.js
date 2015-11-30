var app = angular.module('oscilloscope',[]);
var serialPort = require("serialport");
var filterData;
var port;
/*function to find the port name of arduino dynamically*/

/*controller for filter menu*/
app.controller('FilterControl',function($scope,$compile){
  /*list of all channels*/
  $scope.allChannels = ["Channel 1","Channel 2","Channel 3",
                       "Channel 4","Channel 5","Channel 6",
                       "Channel 7","Channel 8","Channel 9",
                       "Channel 10","Channel 11","Channel 12",
                       "Channel 13","Channel 14"                     
                     ];
  /*And filters that can be applied*/
  $scope.filters = ["Low Pass Filter","High Pass Filter"];    
  /*Array to store all input elements that are to be dynamically added and removed*/
  $scope.elementsInFilter = [];
  /*count of all elements added*/  
  $scope.filterElementcount = 0;
  /*function to add channel selection menu*/    
  $scope.AddFilter = function(onlyShowElements)
  {
     /*if remove function has called add to just display elements and not add*/  
     if(!onlyShowElements)
     {
         /*add count for reference while deleting*/
         $scope.elementsInFilter.push($scope.filterElementcount);
         /*create channel selection drop down menu*/
         /*bind to dynamically assigned model name*/
         var str ='<select ng-model=filterChannel'+$scope.filterElementcount+'>'+
                  '<option ng-repeat ="x in allChannels">'+'{{x}}'+'</option>'+
                  '</select>&nbsp&nbsp'
         /*compile all angular functions added eg:- databing,ng-repeat*/
         var channelMenu = $compile(str)($scope); 
         /*create all other input elements similarly*/
         str = '<select ng-model=filterFilterName'+$scope.filterElementcount+'>'+
               '<option ng-repeat ="x in filters">'+'{{x}}'+'</option>'+
               '</select>&nbsp&nbsp';
         var filterMenu = $compile(str)($scope);
         var str='<input type="text" size="4" ng-model="thresholdValue'+$scope.filterElementcount+'">&nbsp&nbsp'
         var thresholdInput = $compile(str)($scope);
         var str ='<button class="btn btn-info" ng-click=RemoveFilter('+$scope.filterElementcount+')>X</button></br></br>'
         var removeButton = $compile(str)($scope);
         /*push element array*/
         $scope.elementsInFilter.push(channelMenu);
         $scope.elementsInFilter.push(filterMenu);
         $scope.elementsInFilter.push(thresholdInput);
         $scope.elementsInFilter.push(removeButton);
     }
      /*clear filter menu*/
      $("#filterMenu").html("");
      /*loop through input element array and populate in Filter Menu*/
      for(i=0;i<$scope.elementsInFilter.length;i++)
      {
         
         if(i%5!=0)
         {
             $("#filterMenu").append($scope.elementsInFilter[i]);
         }
      }
      /*update count*/
     $scope.filterElementcount++;
  }
  $scope.RemoveFilter = function(x)
  {
    /*while removing a filter just splice all input elements of that filter from the array*/   
    for(i=0;i<$scope.elementsInFilter.length;i++)
    {
       if(x==$scope.elementsInFilter[i])
       {
            $scope.elementsInFilter.splice(i,5);   
            /*reset all dynamically created models*/
            $scope["filterChannel"+x]="";
            $scope["filterFilterName"+x]="";
       }
        
    }
     $scope.AddFilter(1);
  }
 /*function to get data about the filter assigned to each channel*/
  $scope.GetFilterData = function()
  {
    /*output object that will contain all filter data*/
    var filterArray = [];
    /*loop through all dynamically created input models to get the filter data*/
    for(i=0;i<$scope.filterElementcount;i++)
    {
        var Freqobj = {};//object to store current filter data
        /*check and see if model is reset or not*/
        if($scope['filterChannel'+i]!=""&&$scope['filterChannel'+i])
        {
            /*if not add to object*/
            Freqobj.channelName = $scope["filterChannel"+i];
            Freqobj.FilterName = $scope["filterFilterName"+i];
            /*if threshold value is not notify the user*/
            if(!$scope["thresholdValue"+i])
            {
                alert('Threshold Value not set for '+$scope["filterChannel"+i]);   
                return -1;
            }
            /*else add to object*/
            Freqobj.thresholdValue = $scope["thresholdValue"+i];
            /*push to array*/
            filterArray.push(Freqobj);
        }
    }
    
      return filterArray;//return the array
  }
    
});
/*d3 code comments to be added*/
var data= new Array();
var selectedChannel = [];
for(i=0;i<14;i++)
{
    selectedChannel[i] = 0;
}
var path = [];
var  flag = 1;
var dataPerSecond = 194;
var focusDataLength = dataPerSecond * 5;
var margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
var x = d3.scale.linear()
    .domain([0, 1000])
    .range([0, width]);
var y = d3.scale.linear()
    .domain([0, 5])
    .range([height, 0]);
var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });
var svg = d3.select("body").select(".graphContainer").select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);
var xaxis = svg.append("g")
    .attr("class", "x axis grid")
    .attr("transform", "translate(0," + y(y.domain()[0]) + ")")
    .call(d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(-height, 0, 2).tickFormat(""));
    
var yaxis = svg.append("g")
    .attr("class", "y axis grid")
    .call(d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(-width, 0, 2).tickFormat(""));

var cnt = 0;var pinData = [];
for(i=0;i<14;i++)
{
    data[i] = new Array();  
}
var sentDataCount=0;
/*when a channel is selected upadte channel state array*/
function valChange(id) {
    selectedChannel[id] = selectedChannel[id] ? 0 : 1;/*toggle the value stored in the array*/
//    alert(id+" "+selectedChannel[id]);
    /*if (selectedChannel[id] === 1) {
        path[id] = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .attr('stroke', d3.rgb(id*100, id*100, id*100))
        .datum(data[id])
        .attr("class", "line")
        .attr("d", line);
    }
    //port.write(id);
    */
}
/*sending all selected channel no to arduino*/
function sendPortState()
{
  /*loop through the selected channel array */
  if(selectedChannel[sentDataCount]==0||sentDataCount==14)
   {
       //alert(sentDataCount+" "+selectedChannel[sentDataCount]);  
       if(sentDataCount!=14)
        {
            sentDataCount++;   
            sendPortState();
        }
       else
       {
            /*send 15 to arduino to begin data transfer*/
            /*channel input data will sent from arduino after 15 is received*/
            port.write((15).toString());   
            sentDataCount = 0;
            //setChart();
       }
       
   }
   else
   {
//       alert(sentDataCount+" "+selectedChannel[sentDataCount]);  
       port.write(sentDataCount.toString());
       //port.drain(function(){
            if(sentDataCount!=14)
            {
                sentDataCount++;
            }
            else
            {
                port.write((15).toString());
                sentDataCount = 0;
                //setChart();
            }
                    
        //});
   }
  
    
}

function setChart() { 
console.log("setting the chart variables");
//        selectedChannel[id] = selectedChannel[id] ? 0 : 1;
        console.log("selec:"+selectedChannel);
        if (selectedChannel[id] === 1) {
            path[id] = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .attr('stroke', d3.rgb(id*100, id*100, id*100))
            .datum(data[id])
            .attr("class", "line")
            .attr("d", line);
        }

    }

function sendChannelState()
{
    //get filter data from angular and save it in a variable here 
    filterData = angular.element(document.getElementById('filterSidebar')).scope().GetFilterData();
     if(filterData == -1)
     {
        alert('Please enter the specified Values!!');
         return;
     }
    console.log(filterData); 
    /*sending all port data to that function*/
    sendPortState();
}