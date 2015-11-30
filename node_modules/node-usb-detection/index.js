var usb = require('usb');

module.exports = {
    /**
     *  Returns a list of all known usb devices
     *
     * @return {array} deviceList
     */
    list : function() {
        return usb.getDeviceList();
    },

    /**
     * Add callback to usb device plug-in or "attach" event
     *
     * @param  {function} callback
     *
     */
    add : function(callback) {
        usb.on('attach', function(device) {
            callback(device);
        });
    },

    /**
     * Add callback to usb device unplug or "detach" event
     *
     * @param  {function} callback
     *
     */
    remove : function(callback) {
        usb.on('detach', function(device) {
            callback(device);
        });
    },

    /**
     * Add callback to usb device plug-in or unplug aka "change" event
     *
     * @param  {function} callback
     *
     */
    change : function(callback) {
        usb.on('attach', function(device){
            callback(device);
        });
        usb.on('detach', function(device){
            callback(device);
        });
    }
};