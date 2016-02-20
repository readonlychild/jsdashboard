'use strict'
function WeatherWidget (settings) {
    var self = this;
    self.settings = settings || {};
    self.title = 'Weather Widget';
    self.iconUrl = 'http://www.dustball.com/icons/icons/weather_cloudy.png';
    self.canToggle = true;
    self.canRefresh = true;
    self.canFullscreen = false;
    self.hasOptions = true;
    self.id = self.settings.id || Dashboard.getNewId();
    self.type = 'WeatherWidget';
    
    self._optionDef = [
        { key:'title', value:'Weather Widget' },
        { key:'location', value:'Elgin IL' }
    ];
    
    
    self.render = function () {
        Dashboard._getOptions(self);
        var markup = '';
        markup += '<style>#'+self.id+' .clock {font-size:10pt;}</style>';
        markup += '<div class="weather">loading...</div>';
        $('#'+self.id).html(markup);
        self.refresh();
        self.tick();
    };
    self.refresh = function () {
        $.ajax({
            url: 'http://playground-9.apphb.com/api/miscapis/weather/?id=' + Dashboard._getOption(self.options, 'location'),
            type: 'GET',
            dataType: 'json'
        })
        .done(function (data) {
            var markup = '';
            markup += '<img src="'+data.Icon+'" style="float:right; width:100px;" />';
            markup += '<div style="font-size:12pt; font-weight:bold;">'+data.Location.City+' <small>'+data.Location.State+'</small></div>';
            markup += '<b>' + data.Fahrenheit + '</b> &deg;F<br/>';
            markup += 'Feels Like: ' + data.FeelsLikeF + ' <br/>';
            markup += 'Humidity: ' + data.Humidity + '%<br/>';
            markup += 'Wind Speed: ' + data.Wind + ' mph';
            $('#'+self.id+' .weather').html(markup);
            $('#wc'+self.id+' .widget-title').html(Dashboard._getOption(self.options, 'title'));
        })
        .fail(function (err) {
            console.warn('weather ajax fail.', err);
            $('#'+self.id+' .weather').html('Error Contacting source.');
        });
        
    };

    self.tick = function () {
        setTimeout(function () {
            self.refresh();
            self.tick();
            console.debug('weather ticked');
        }, 60000);
    };
    
    return self;
};