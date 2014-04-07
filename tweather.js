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
    isWeather: false,
    tweetPool: [],
    isEnded: false,
    weather: {
        api: 'ea440feaab5a84e7',
        state: 'NY',
        city: 'New_York'
    },
    readMsg: 'tweet #tweather read <hashtag>',
    sayMsg: 'tweet #tweather say <your message>',
    defaultMsg: 'TweatherBoard -- Tweet: #tweather say <your message> -- #tweather read <hashtag>'
};

tweather.init = function() {
    util.log('INIT APP');
    this.queryTweet('happy');
    this.getWeather();
    toBoard('Tweather is ready');
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
        var receivedData;
        receivedData += data;
        if (receivedData.indexOf('#') >= 0 && receivedData.indexOf('@') >= 0) {
            var msg = receivedData.substring(receivedData.indexOf('@') + 1, receivedData.indexOf('#'));
            if (msg == '^') {
                // ending
                tweather.isEnded = true;
                if (tweather.isWeather) {
                    tweather.isWeather = !tweather.isWeather;
                    toBoard(tweather.weather.time + ', ' + tweather.weather.condition + ', ' + tweather.weather.temp_c + "'C / " + tweather.sayMsg);
                } else if (tweather.isSaying) {
                    tweather.isSaying = !tweather.isSaying;
                    toBoard(tweather.sayMsg);
                } else {
                    // show tweet
                    if (~~(Math.random() * 100) >= 10) {
                        toBoard(tweather.tweetPool[~~(Math.random() * tweather.tweetPool.length - 1)]);
                    } else if (~~(Math.random() * 100) < 10) {
                        toBoard('TweatherBoard -- Tweet: #tweather say <your message> -- #tweather read <hashtag>');
                    } else {
                        toBoard(tweather.sayMsg);
                    }
                }
            } else if (msg == 'w') {
                util.log('weather call received');
                tweather.getWeather();
                tweather.isWeather = true;
            }
        }
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
                if (d.toLowerCase().contains('#tweather say ')) {
                    // console.log(data);
                    tweather.sayMsg = '@' + data.user.screen_name + ' ' + d.substring(d.indexOf('#tweather say ') + 14, d.length);
                    tweather.isSaying = true;
                    util.log('SAY: ' + tweather.sayMsg);
                } else if (d.toLowerCase().contains('#tweather read ')) {
                    // read
                    tweather.readMsg = d.substring(d.indexOf('#tweather read ') + 15, d.length);
                    util.log('READ: ' + tweather.read);
                } else {
                    if (tweather.tweetPool.length < 20) {
                        tweather.tweetPool.push(d);
                    } else {
                        tweather.tweetPool.shift();
                        tweather.tweetPool.push(d);
                    }
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
            tweather.weather.time = moment.unix(data.current_observation.local_epoch).format('ddd MMM D, hh:mm a');
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

function toBoard(msg) {
    // if ended
    if (tweather.isEnded) {
        arduino.write(signal(msg), function() {
            tweather.isEnded = !tweather.isEnded;
            util.log('WRITING "' + signal(msg) + '" TO ARDUINO');
        });
    } else {
        util.log('FAILED WRITING "' + signal(msg) + '" TO ARDUINO');
    }
}

function signal(msg) {
    return '|/ ' + msg + ' /`';
}

if (!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return -1 !== String.prototype.indexOf.call(this, str, startIndex);
    };
}