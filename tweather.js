var util = require('util'),
    moment = require('moment'),
    $ = require('jquery'),
    serialPort = require("serialport").SerialPort,
    arduino = new serialPort("/dev/ttyUSB0", {
        baudrate: 115200
    }),
    twitter = require('ntwitter'),
    twit = new twitter({
        consumer_key: 'gagZjEZdXYV6zhSQSlPz4A',
        consumer_secret: 'HLRm7d1FsT55x94Oy9sQE00EXMFvRDcyOfh1i98sA',
        access_token_key: '898894117-LkF81Lq3OXy23Uf7qabS81gw0HkbhxWwHh3kpPcB',
        access_token_secret: 'YcT7VrVdglZbnUWCfOYQNOViO6cKChaKs8GkUCFgkbUH3'
    });

var tweather = {
    weather: {
        api: 'ea440feaab5a84e7',
        state: 'NY',
        city: 'New_York'
    },
    readMsg: 'yolo',
    sayMsg: null,
    defaultMsg: 'TweatherBoard v1.0 -- Tweet #tweather say <your message> -- #tweather read <hashtag>'
};

tweather.init = function() {
    util.log('INIT APP');
    this.queryTweet(this.readMsg);
    this.getWeather();
    toTweather(tweather.defaultMsg);
};

// Arduino
arduino
    .on('open', function() {
        util.log('CONNECTED TO ARDUINO');
        tweather.init();
    })
    .on('error', function(err) {
        util.log('error: ' + err);
    })
    .on('data', function(data) {
        // util.log(data);
    })
    .on('close', function() {
        util.log('CONNETION CLOSED');
    });

// Twitter QueryTweet
tweather.queryTweet = function(string) {
    var hash = ['tweather', string];
    twit.stream('statuses/filter', {
        'track': [hash]
    }, function(stream) {
        stream.on('data', function(data) {
            var d = data.text;
            if (d.length < 60 && data.lang == 'en' && !d.contains('http') && !d.contains('@')) {
                // if say
                if (d.contains('#tweather say ')) {
                    tweather.sayMsg = d.substring(d.indexOf('#tweather say ') + 14, d.length);
                    util.log('SAY: ' + tweather.sayMsg);
                } else if (d.contains('#tweather read ')) {
                    // read
                    tweather.read = d.substring(d.indexOf('#tweather read ') + 15, d.length);
                    util.log('READ: ' + tweather.read);
                } else {
                    util.log('Tweet: ' + d);
                }
            }
        });
    });
};

tweather.getWeather = function() {
    $.ajax({
        dataType: 'jsonp',
        url: 'http://api.wunderground.com/api/' + tweather.weather.api + '/conditions/q/' + tweather.weather.state + '/' + tweather.weather.city + '.json',
        success: function(data) {
            util.log('WEATHER: ' + moment.unix(data.current_observation.local_epoch).format('ddd MMM D, hh:mm a'));
            tweather.weather.time = data.current_observation.local_epoch;
            tweather.weather.condition = data.current_observation.weather;
            tweather.weather.temp_c = data.current_observation.feelslike_c;
            tweather.weather.temp_f = data.current_observation.feelslike_f;
        },
        error: function() {
            return false;
        }
    });
};


// helpers

function toTweather(msg) {
    util.log('WRITING "' + msg + '" TO ARDUINO');
    arduino.write('|' + msg + '`');
}

if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return -1 !== String.prototype.indexOf.call(this, str, startIndex);
    };
}