var app = angular.module('oscilloscope',[]);
var serialPort = require("serialport");
var gui = require('nw.gui');
var win = gui.Window.get();

var port = new serialPort.SerialPort('COM4', {
        baudrate: 9600,
        dataBits: 8,      // defaults for Arduino serial communication
        parity: 'none', 
        stopBits: 1, 
        flowControl: false,
        parser: serialPort.parsers.readline("\n")
    },false);

var liveData = 0;
var snapshotFlag = 0;
var snapshotData = [];
var snapshotInterval;


app.controller('FilterControl',function ($scope,$compile, $timeout) {
    
    
    $scope.allChannels = ["Channel 1","Channel 2","Channel 3",
                       "Channel 4","Channel 5","Channel 6",
                       "Channel 7","Channel 8","Channel 9",
                       "Channel 10","Channel 11","Channel 12",
                       "Channel 13","Channel 14"                     
                     ];
    $scope.filters = ["FFT","Band Pass Filter","Low Pass Filter","High Pass Filter"];    
    $scope.elementsInFilter = [];
    $scope.filterElementcount = 0;

    
  $scope.AddFilter = function(onlyShowElements) {
       
     if(!onlyShowElements)
     {
        $scope.elementsInFilter.push($scope.filterElementcount);
         var str ='<select ng-model=filterChannel'+$scope.filterElementcount+'>'+
                  '<option ng-repeat ="x in allChannels">'+'{{x}}'+'</option>'+
                  '</select>&nbsp&nbsp';
         var channelMenu = $compile(str)($scope);  
         str = '<select ng-model=filterFilterName'+$scope.filterElementcount+'>'+
               '<option ng-repeat ="x in filters">'+'{{x}}'+'</option>'+
               '</select>&nbsp&nbsp';
         var filterMenu = $compile(str)($scope);
         str ='<button class="btn btn-info" ng-click=RemoveFilter('+$scope.filterElementcount+')>X</button></br></br>';
         var removeButton = $compile(str)($scope);
         $scope.elementsInFilter.push(channelMenu);
         $scope.elementsInFilter.push(filterMenu);
         $scope.elementsInFilter.push(removeButton);
      }
      $("#filterMenu").html("");
     for(i=0;i<$scope.elementsInFilter.length;i++)
     {
         if(i%4 !== 0)
         {
             $("#filterMenu").append($scope.elementsInFilter[i]);
         }
    }
     $scope.filterElementcount++;
  };
  
  
  $scope.RemoveFilter = function(x)
  {
 
    for(i=0;i<$scope.elementsInFilter.length;i++)
    {
       if(x==$scope.elementsInFilter[i])
       {
            $scope.elementsInFilter.splice(i,4);   
            $scope["filterChannel"+x]="";
            $scope["filterFilterName"+x]="";
       }
        
    }
     $scope.AddFilter(1);
  };
  
  $scope.FilterData = function() {
    var filterArray = [];
    for(i=0;i<$scope.filterElementcount;i++)
    {
        var Freqobj = {};
        if($scope['filterChannel'+i] !== ""&&$scope['filterChannel'+i])
        {
            Freqobj.channelName = $scope["filterChannel"+i];
            Freqobj.FilterName = $scope["filterFilterName"+i];
            filterArray.push(Freqobj);
        }
    }
    return filterArray;
  };
    
    
    var reportError = function (error) {
        alert(error);
    };
    
    
    
    
    
    var plotSnapshot = function () {
        console.log('plot graph');
        //find the domain range
        var temp = selectedChannel.indexOf(1);
        //change the graph's domain value
        x.domain([0, snapshotData[temp].length]);
        svg.select('.x.axis.grid')
                        .transition().duration(1).ease("sin-in-out")
                        .call(xaxis);
        //enable zooming
        zoom
            .x(x)
            .y(y)
            .scaleExtent([1, 10])
            .on("zoom", function () {
                if (x.domain()[0] < 0) {
                    var xzoom = zoom.translate()[0] - x(0) + x.range()[0];
                    zoom.translate([xzoom, 0]);
                } else if (x.domain()[1] > snapshotData[temp].length) {
                    var xzoom = zoom.translate()[0] - x(snapshotData[temp].length) + x.range()[1];
                    zoom.translate([xzoom, 0]);
                }
                if (y.domain()[0] < 0) {
                    var yzoom = zoom.translate()[0] - y(0) + y.range()[0];
                    zoom.translate([yzoom, 0]);
                } else if (y.domain()[1] > 5) {
                    var yzoom = zoom.translate()[0] - y(5) + y.range()[1];
                    zoom.translate([yzoom, 0]);
                }
                svg.select(".x.axis.grid").call(xaxis);
                svg.select(".y.axis.grid").call(yaxis);   
                svg.selectAll('path.line').attr('d', line);
            });
        path.data(snapshotData);
        svg.selectAll('path.line').attr('d', line);
        d3.select("body").select(".graphContainer").select("#graph").select("svg").call(zoom);
    };
    
    
    $scope.startSnapshot = function () {
        if (liveData === 1 && snapshotFlag === 0) {
            snapshotData = data;
            snapshotFlag = 1;
            snapshotInterval = $timeout(function () {
                $scope.stopSnapshot();
            }, 15000);
        } else {
            reportError ('No data to snapshot. Start the graph');
        }
    };
    
    $scope.stopSnapshot = function () {
        console.log('stop snapshot');
        if (snapshotFlag === 1) {
            $timeout.cancel(snapshotInterval);
            snapshotInterval = null;
            stopLiveData();
            plotSnapshot();
            snapshotFlag = 0;
            
        } else {
            reportError('Snapshot is not in progress');
        }
    };
    
    
     
    
});
//END OF CONTROLLER



    var data= new Array();
    var selectedChannel = [];
    var focusLength = [];
    var focusLengthFlag = [];
    var resetDataArray = function () {
        for(var i=0;i<14;i++) {
            data[i] = new Array();
            focusLength[i] = 0;
            focusLengthFlag[i] = 0;
        }
    };
    resetDataArray();
    var resetSnapshotArray = function () {
        for(var i=0;i<14;i++) {
            snapshotData[i] = new Array();
        }
    };
    resetSnapshotArray();
    for(var i=0;i<14;i++) {
        selectedChannel[i] = 0;
    }
    var colors = [
        'steelblue',
        'green',
        'red',
        'purple'
    ];
   
    //var path = [];
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
    var zoom = d3.behavior.zoom().on ('zoom', null);
    var svg = d3.select("body").select(".graphContainer").select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.call(zoom).on('dblclick.zoom', function () {
            console.log('triggering');
        });
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    var xaxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
        .tickSize(-height, 0, 2)
        .tickFormat("");
    svg.append("g")
        .attr("class", "x axis grid")
        .attr("transform", "translate(0," + y(y.domain()[0]) + ")")
        .call(xaxis);
    var yaxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width, 0, 2)
        .tickFormat("");
    svg.append("g")
        .attr("class", "y axis grid")
        .call(yaxis);
    var path = svg.append("g")
        .attr("class", "lines")
        .attr("clip-path", "url(#clip)")
        .selectAll('.line')
        .data(data)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("id", function(d, index){
            return "line"+index;
        })
        .attr('stroke', function(d,i){ 		
            return colors[i%colors.length];
        })
        .attr("d", line);


    port.open();
    port.on('open',function(){
       console.log("Port Opened!!"); 
    });
    var cnt = 0;var pinData = [];

    var initialValue, val;
    
    var sentDataCount=0;


    var getSnapshotData = function (index, value) {
        if (snapshotFlag === 1) {
            snapshotData[index].push(value);
        }
    };


    var resetDomain = function () {
        x.domain([0, 1000]);
        svg.select('.x.axis.grid')
            .transition().duration(1).ease("sin-in-out")
            .call(xaxis);
    };
    
    
    var resetZoom = function () {
        zoom.on ('zoom', null);
        d3.select("body").select(".graphContainer").select("#graph").select("svg").call(zoom);
    };


    port.on('data', function(tempData) {
        var strData = tempData.toString();
        strData = strData.substring(0,3)
        var key="ack";
        
        if(strData === "ack" && sentDataCount) {
           sendPortState();    
           console.log('Acknowledgement received!!!!');
           return;
        }
    
        pinData = tempData.split(','); 
        pinData[0] = parseInt(pinData[0]);
        
        if(pinData[0] < 8) {
            data[pinData[0]].push(parseInt(pinData[1]));
            getSnapshotData(pinData[0], parseInt(pinData[1]));
            if(focusLength[pinData[0]] < 1000){
                focusLength[pinData[0]]++;
            }
            else if(focusLengthFlag[pinData[0]] === 0){
                focusLengthFlag[pinData[0]] = 1;
            }
        } else {
            pinData[0] = pinData[0]-6;
            initialValue = parseFloat(pinData[1]);
            val = (initialValue/1023)*5; 
            getSnapshotData(pinData[0], val);
            data[pinData[0]].push(val);

            if(focusLength[pinData[0]] < 1000){
                focusLength[pinData[0]]++;
            }
            else if(focusLengthFlag[pinData[0]] === 0){
                focusLengthFlag[pinData[0]] = 1;
            }
    }
    
    if(focusLengthFlag[pinData[0]] === 0) {           d3.select("body").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line);
        
    } else { d3.select("body").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line)
            .attr("transform", null)
            .transition()
                .ease("linear")
                .duration(1)
                .attr("transform", "translate(" + x(0) + ",0)");
        data[pinData[0]].shift();
    }
});

    var valChange = function (id) {
        selectedChannel[id] = selectedChannel[id] ? 0 : 1;
    };
        
        
    var sendPortState = function () {
        //check if any channel is selected
        if (selectedChannel.indexOf(1) !== -1) {
            if(selectedChannel[sentDataCount] === 0||sentDataCount === 14) {
               if(sentDataCount !== 14) {
                    sentDataCount++;   
                    sendPortState();
                } else {
                    port.write((15).toString());   
                    sentDataCount = 0;
                }
            } else {
                port.write(sentDataCount.toString());
                if(sentDataCount !== 14) {
                    sentDataCount++;
                } else {
                    port.write((15).toString());
                    sentDataCount = 0;
                }
            }
        } else {
            alert ('Select a channel');
        }
    };

    //start live data
    var sendChannelState = function () {
        //sends the port/pin to arduino
        sendPortState();
        //reset the 'data' array
        resetDataArray();
        path.data(data);
        
        
        //reset domain and zoom for graph
        resetDomain();
        resetZoom();
        
        
        liveData = 1;
    };

    //stop live data flow
    var stopLiveData = function () {
        //check if the live data is on
        if (liveData === 1) {
            port.write("16");
            liveData = 0;
        } else {
            reportError('Start graph');
        }
    };


    win.on('close', function() {
      this.hide(); // Pretend to be closed already
        console.log("Resetting");
        port.write("16", function() {
            port.drain(function(){
                console.log("port closed!!");
                port.flush();
                port.close();
            });
        }); 
      this.close(true);
    });