var serialPort = require("serialport");

var port = new serialPort.SerialPort('COM4', {
        baudrate: 9600,
        dataBits: 8,      // defaults for Arduino serial communication
        parity: 'none', 
        stopBits: 1, 
        flowControl: false,
        parser: serialPort.parsers.readline("\n")
    },false);
var data = new Array(), flag = 1;
var dataPerSecond = 194;
var focusDataLength = dataPerSecond * 5;
var colors = [
	'steelblue',
	'green',
	'red',
	'purple'
];

for(var i = 0; i < 14; i++){
    data[i] = new Array();
}

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
var path = svg.append("g")
    .attr("class", "lines")
	.attr("clip-path", "url(#clip)")
    .selectAll('.line')
	.data(data)
	.enter()
	.append("path")
    .attr("class", "line")
    .attr("id", function(d, i){
        console.log('calling');
        console.log(i);
        return "line"+i;
    })
    .attr('stroke', function(d,i){ 		
        return colors[i%colors.length];
    })
    .attr("d", line);


port.open();
port.on('open',function(){
   console.log("Port Opened!!"); 
});
var pinData = new Array();
var initialValue, val;
var focusLength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var focusLengthFlag = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
console.log(focusLength);
var cnt = 0;
port.on('data',function(tempData){
//    console.log(cnt++);
    pinData = tempData.split(',');
    if(pinData[0]<8){
        data[pinData[0]].push(parseInt(pinData[1]));
        
        if(focusLength[pinData[0]] < 1000){
            focusLength[pinData[0]]++;
        }
        else if(focusLengthFlag[pinData[0]] == 0){
            focusLengthFlag[pinData[0]] = 1;
        }
    }
    else{
        pinData[0] = pinData[0]-6;
        initialValue = parseFloat(pinData[1]);
        val = (initialValue/1023)*5; 
        data[pinData[0]].push(val);
        
        if(focusLength[pinData[0]] < 1000){
            focusLength[pinData[0]]++;
        }
        else if(focusLengthFlag[pinData[0]] == 0){
            focusLengthFlag[pinData[0]] = 1;
        }
    }
    
    if(focusLengthFlag[pinData[0]] == 0){                                                          var values = d3.select("body").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line);
                                         console.log(values);
    }
    
    else{ d3.select("body").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+pinData[0]).attr("d", line)
            .attr("transform", null)
            .transition()
                .ease("linear")
                .duration(1)
                .attr("transform", "translate(" + x(0) + ",0)");
        data[pinData[0]].shift();
    }
    
    
    
    if(flag == 1){
//        d3.select("body").select(".graphContainer").select("#graph").select("svg").select("g").select(".lines").select("#line"+12).attr("d", line);
//        d3.select("#line"+12).attr("d", line);
        path.attr("d", line);
        if(data.length >= 1000){
            flag = 0;
        }
    }
    else{
        path
            .attr("d", line)
            .attr("transform", null)
            .transition()
                .ease("linear")
                .duration(1)
                .attr("transform", "translate(" + x(0) + ",0)");
        data.shift();
    }
});
var selectedChannel = [];
function valChange(id) {
    selectedChannel[id] = selectedChannel[id] ? 0 : 1;
    port.write(id);
}

var delay=1000;
function sendChannelState(){
    port.write("15");
}
