var gui = require('nw.gui');
var win = gui.Window.get();
var serialPort = require("serialport");
//var monitor = require('node-usb-detection');
var usb  = require('usb');
var initializeArduino;
usb.on("detach",function() {
    var flag = 0;
    serialPort.list(function (err, ports) {
            ports.forEach(function(locport) {
                if(locport.manufacturer.search("Arduino")!=-1)
                {
                    flag =1;   
                }
            });
         if(flag==0)
        {
            alert("Arduino board disconnected!!");
        }
    });
});
usb.on("attach",function(){
    var flag = 0;
    serialPort.list(function (err, ports) {
            ports.forEach(function(locport) {
                if(locport.manufacturer.search("Arduino")!=-1)
                {
                    flag =1;   
                }
            });
        if(flag==1)
        {
            alert("Arduino board connected!!");
            initializeArduino();
        }    
    });
});

//monitor.add(function() {
//    /*var flag = 0
//    serialPort.list(function (err, ports) {
//            ports.forEach(function(locport) {
//                if(locport.manufacturer.search("Arduino")!=-1)
//                {
//                    flag =1;   
//                }
//            });
//        if(flag==1)
//        {
//            initializeArduino();
//        }
//    });*/
//    //initializeArduino();
//    alert("Device added!!");
//});
var app = angular.module('mainApp', ['mainControllers', 'rightPanelControllers', 'panelServices']);

