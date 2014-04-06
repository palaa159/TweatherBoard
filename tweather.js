var util = require('util'),
    moment = require('moment'),
    $ = require('jquery'),
    serialPort = require("serialport").SerialPort,
    arduino = new serialPort("/dev/ttyUSB0", {
        baudrate: 115200
    }, false),
    twitter = require('ntwitter'),
    twit = new twitter({
        consumer_key: 'gagZjEZdXYV6zhSQSlPz4A',
        consumer_secret: 'HLRm7d1FsT55x94Oy9sQE00EXMFvRDcyOfh1i98sA',
        access_token_key: '898894117-LkF81Lq3OXy23Uf7qabS81gw0HkbhxWwHh3kpPcB',
        access_token_secret: 'YcT7VrVdglZbnUWCfOYQNOViO6cKChaKs8GkUCFgkbUH3'
    });

var tweather = {
    defaultMsg: 'TweatherBoard v1.0 -- Tweet #tweather say <your message> -- #tweather read <hashtag>'
};

tweather.init = function() {

};

tweather.init();