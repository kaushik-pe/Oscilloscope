angular.module('rightPanelControllers', ['panelServices'])
    .controller("rightPanelController",['$scope', 'panelService', '$timeout', function($scope, panelService, $timeout, $interval){
        $scope.channelArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
        $scope.adjustGraphVal = 0;
        $scope.adjustChannelNo = "Channel 1";
        $scope.isGraphPlaying = 0;
        $scope.isGraphRecording = 0;
                var port, plotted;
        var data = new Array();
        var start,end;
        var sentDataCount = 0; 
        var sampleCount = 0;
        var focusLength = [];
        var focusLengthFlag = [];
        var resetDataArray = function () {
            for(var i=0;i<15;i++) {
                data[i] = new Array();
                focusLength[i] = 0;
                focusLengthFlag[i] = 0;
            }
        };
     $scope.adjustGraph = function()
        {
          for(i=0;i<panelService.adjustGraph.length;i++)
          {
              panelService.adjustGraphPrev[i] = panelService.adjustGraph[i];
          }
          if($scope.adjustGraphChannelNo!=undefined)
            {
                var channelDat = $scope.adjustGraphChannelNo.split(" ");
                panelService.adjustGraph[parseInt(channelDat[1])-1] = parseInt($scope.adjustGraphVal);
                panelService.adjustGraphFlag[parseInt(channelDat[1])-1] = 1;
            }
            console.log("present = "+panelService.adjustGraph);
            console.log("past = "+panelService.adjustGraphPrev);
        }

    
        resetDataArray();
    
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
        var svg = d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        svg.call(zoom);
    
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
            .attr("id", function(d, i){
                return "line"+i;
            })
            .attr('stroke', function(d,i){ 	
                return panelService.colors[i];
            })
            .attr("d", line);
    
        var liveData = 0;
        var snapshotFlag = 0;
        var snapshotData = [];
        var count;
        var resetSnapshotArray = function () {
            for(var i=0;i<14;i++) {
                snapshotData[i] = new Array();
            }
        };
        resetSnapshotArray();
    
        var snapshotInterval;
        var firstTimePlotting = 1;

        var populateData = function(pinData, val){
            if(panelService.finalFiltersName[pinData] != ""){ 
                if(panelService.finalFiltersName[pinData] == "Low Pass Filter"){
                    if(panelService.textBox1[pinData] != ""){
                        if(val < parseFloat(panelService.textBox1[pinData])){
                            data[pinData].push(val);
                            getSnapshotData(pinData, val);
                            plotted = 1;
                        }
                    }
                   
                }
                else if(panelService.finalFiltersName[pinData] == "High Pass Filter"){
                    if(panelService.textBox1[pinData] != ""){
                        if(val > parseFloat(panelService.textBox1[pinData])){
                            data[pinData].push(val);
                            getSnapshotData(pinData, val);
                            plotted = 1;
                        }
                    }
                }
            }
            else{
                data[pinData].push(val);
                getSnapshotData(pinData, val);
                plotted = 1;
            }
        }

        initializeArduino = function(){
            console.log("intialiseArduino!!");
            serialPort.list(function (err, ports) { 
                for(i=0;i<ports.length;i++){
                    if(ports[i].manufacturer.search("Arduino")!=-1){
                        console.log("Arduino board found!");
                        panelService.portDefined = 1;
                        port = new serialPort.SerialPort(ports[i].comName, {
                            baudrate: 9600,
                            dataBits: 8,
                            parity: 'none', 
                            stopBits: 1, 
                            flowControl: false,
                            parser: serialPort.parsers.readline("\n")
                        },false);
                        port.open();
                        port.on('open',function(){
                            console.log("Port Opened!!"); 
                        });
                        port.on('data', function(tempData){
                            if(sampleCount==0)
                            {
                                start = new Date().getTime();
                            }
                                end = new Date().getTime();
                                sampleCount++;
                            if(end-start>1000)    
                            {
                                console.log("Samples per second = "+sampleCount);
                                start = new Date().getTime();
                                sampleCount = 0;
                            }
                            if(tempData.search("ack") != -1){
                            
                            }
                            else{
                                var pinData = tempData.split(',');
                                if(pinData[0]=='s')
                                {
                                    pinData[0] = 19;
                                }
                            
                                if(pinData[0]>8){
                                    pinData[0] = pinData[0]-6;   
                                    pinData[1] = parseFloat(pinData[1]);         
//                                  pinData[1] = parseFloat(pinData[1]);
                                    if (pinData[0] === 13) {
                                        var val = (pinData[1]+1)/2*5;
                                    }
                                    else{
                                        var val = (pinData[1]/1023)*5;
                                        if(panelService.adjustGraph[parseInt(pinData[0])]!=0||panelService.adjustGraphPrev[parseInt(pinData[0])]!=0)
                                        {
                                           
                                            val += panelService.adjustGraph[parseInt(pinData[0])];
                                            if(panelService.adjustGraphFlag[parseInt(pinData[0])]==1)
                                            {
                                                var offset = panelService.adjustGraph[parseInt(pinData[0])] -
                                                                 panelService.adjustGraphPrev[parseInt(pinData[0])];

                                                for(i=0;i<data[parseInt(pinData[0])].length;i++)
                                                {
                                                     data[parseInt(pinData[0])][i] += offset;  
                                                }
                                                panelService.adjustGraphFlag[parseInt(pinData[0])] = 0;
                                            }
                                        }
                                    }
                                    plotted = 0;
                                    populateData(pinData[0], val);

                                }
                                else{
                                    var val = parseInt(pinData[1]);
                                    plotted = 0;
                                    if(panelService.adjustGraph[parseInt(pinData[0])]!=0||panelService.adjustGraphPrev[parseInt(pinData[0])]!=0)
                                    {
                                        val += panelService.adjustGraph[parseInt(pinData[0])];
                                        if(panelService.adjustGraphFlag[parseInt(pinData[0])]==1)
                                          {
                                              var offset = panelService.adjustGraph[parseInt(pinData[0])] -
                                                                 panelService.adjustGraphPrev[parseInt(pinData[0])];
//                                              console.log(offset);
                                               for(i=0;i<data[parseInt(pinData[0])].length;i++)
                                               {
                                                    
                                                    data[parseInt(pinData[0])][i] += offset;   
                                               }
                                                panelService.adjustGraphFlag[parseInt(pinData[0])] = 0;
                                         }
                                    }
                                    populateData(pinData[0], val);
                                    
                                }
                                if(focusLength[pinData[0]] < 1000 && plotted){
                                    focusLength[pinData[0]]++;
                                }
                                else if(focusLength[pinData[0]] == 1000 && focusLengthFlag[pinData[0]] == 0){
                                    focusLengthFlag[pinData[0]] = 1;
                                }
                                if(focusLengthFlag[pinData[0]] == 0 && plotted){
                                     d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line);

                                }

                                else if(plotted){
                                     d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line)
                                        .attr("transform", null)
                                        .transition()
                                            .ease("linear")
                                            .duration(1)
                                            .attr("transform", "translate(" + x(0) + ",0)");
                                    data[pinData[0]].shift();
                                }
                            }
                        });
                     
                    }
                }
//                if(panelService.portDefined != 1){
//                    initializeArduino();
//                }
             
              
            });
        };
        initializeArduino();
        $scope.changeButtonColor = function(no) {   
            var id = "channel"+no;
            panelService.channelSelected[no] = !panelService.channelSelected[no]?1:0;
            if(panelService.channelSelected[no])
                document.getElementById(id).style.backgroundColor = panelService.colors[no];
            else
                document.getElementById(id).style.backgroundColor = "black";
        };
        /*sending all selected channel no to arduino*/
    
    var channelSelectionDone = 0;
        $scope.generateSineWave = function() {
            port.write(('S').toString());
        };
        
        
        $scope.sendPortState = function() {
            console.log(panelService.finalFilters);
            var pinState="";
            for(i=0;i<panelService.finalFilters.length-1;i++)
            {
                if(panelService.finalFilters[i]==1)
                {
                    pinState+="1"   
                }
                else
                {
                    pinState+="0"
                }
            }
            pinState += "X";
            console.log("Sent State ="+pinState);
            port.write(pinState);
            for(i=0;i<panelService.finalFilters.length;i++)
            {
                if(panelService.finalFilters[i]==1)
                {
                    channelSelectionDone =1;
                    $scope.isGraphPlaying = 1;
                    break;
                }
            }
            if(channelSelectionDone){
                firstTimePlotting = 0;
                liveData = 1;
                channelSelectionDone = 0;
                console.log("send data");
                //port.write((15).toString());
            }
            else{
                    reportError("No channel selected!!!");
                }
            
        }
        
        //starts the live plotting
        $scope.startLiveGraph = function(){
            if(panelService.portDefined){
                if(firstTimePlotting != 1){
                    //reset the 'data' array
                    resetDataArray();
                    path.data(data);


                    //reset domain and zoom for graph
                    resetDomain();
                    resetZoom();
                }
                for(i=0;i<panelService.finalFiltersName.length;i++)
                {
                    if(panelService.finalFiltersName[i]!="")   
                    {
                        if(panelService.finalFiltersName[i]!="Band Pass Filter")
                        {
                            if(panelService.textBox1[i]=="")
                            {
                               alert("Please enter the thereshold value for "+parseInt(i+1));
                               return;
                            }
                        }
                        else
                        {
                            if(panelService.textBox1[i]==""||panelService.textBox2[i]=="")
                            {
                               alert("Please enter the thereshold value for "+parseInt(i+1));
                               return;
                            }
                        }
                            
                    }
                }
                $scope.sendPortState();
            }
            else{
                reportError("Replug the arduino and try again ");
            }
        }
        

        $scope.stopCommunication = function(){
            $scope.isGraphPlaying = 0;
            liveData = 0;
            zoom
                .x(x)
                .y(y)
                .scaleExtent([1, 10])
                .on("zoom", function () {
                    svg.select(".x.axis.grid").call(xaxis);
                    svg.select(".y.axis.grid").call(yaxis);   
                    svg.selectAll('path.line').attr('d', line);
                });
d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").select("svg").call(zoom);
            if($scope.isGraphRecording){
                $scope.stopSnapshot();
            }
            port.write("E");
        }
        
        var plotSnapshot = function () {
            console.log('plot graph');
            var maxLength = 0;
            for(var i = 0; i < 15; i++){
                if(panelService.finalFitlers[i] == 1)
                    if(snapshotData[i].length > maxLength){
                        maxLength = snapshotData[i].length;
                    }
            }
            //find the domain range
            var temp = panelService.finalFilters.indexOf(1);
            //change the graph's domain value
            x.domain([0, maxLength]);
            svg.select('.x.axis.grid')
                            .transition().duration(1).ease("sin-in-out")
                            .call(xaxis);
            //enable zooming
            zoom
                .x(x)
                .y(y)
                .scaleExtent([1, 10])
                .on("zoom", function () {
                    svg.select(".x.axis.grid").call(xaxis);
                    svg.select(".y.axis.grid").call(yaxis);   
                    svg.selectAll('path.line').attr('d', line);
                });
            path.data(snapshotData);
            svg.selectAll('path.line').attr('d', line);
            d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").select("svg").call(zoom);
        };
    
    
    $scope.startSnapshot = function () {
        if (liveData === 1 && snapshotFlag === 0) {
            $scope.isGraphRecording = 1;
            snapshotData = data;
            snapshotFlag = 1;
            snapshotInterval = $timeout(function () {
                alert("Maximum Time for Snapshot Reached!!");
                $scope.stopSnapshot();
            }, 15000);
        } else {
            reportError ('No data to snapshot. Start the graph');
        }
    };
    
    $scope.stopSnapshot = function () {
        console.log('stop snapshot');
        if (snapshotFlag === 1) {
            $scope.isGraphRecording = 0;
            $timeout.cancel(snapshotInterval);
            snapshotInterval = null;
            if(liveData)
                $scope.stopCommunication();
            plotSnapshot();
            snapshotFlag = 0;
            
        } else {
            reportError('Snapshot is not in progress');
        }
    };
    
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
        d3.select("body").select(".mainPanel").select(".rightPanel").select(".graphContainer").select("#graph").select("svg").call(zoom);
    };
    
     var reportError = function (error) {
        alert(error);
    };
        win.on('close', function() {
            alert("Resetting : "+panelService.portDefined)
            if(panelService.portDefined)
                port.write("E");
            this.close(true);
        });

    }]);