node-usb-detection
------------------

###A simple interface for attaching callbacks to usb plug and unplug events.

## Installation

	npm install node-usb-detection --save

## Usage

	var monitor = require('node-usb-detection');


	console.log("Usb Devices:\n", monitor.list());

	monitor.add(function(device) {
	    console.log("added device:\n", device);
	});

	monitor.remove(function(device) {
	    console.log("removed device:\n", device);
	});

	monitor.change(function(device) {
	    console.log("device changed:\n", device);
	});


License
=======

MIT

Note that the compiled Node extension includes Libusb, and is thus subject to the LGPL.
