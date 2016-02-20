'use strict'
function ClockWidget (settings) {
    var self = this;
    self.settings = settings || {};
    self.title = 'Clock Widget';
    self.iconUrl = 'http://www.dustball.com/icons/icons/clock.png';
    self.canToggle = false;
    self.canRefresh = false;
    self.canFullscreen = false;
    self.hasOptions = true;
    self.id = self.settings.id || Dashboard.getNewId();
    self.type = 'ClockWidget';
    
    self._optionDef = [
        { key:'title', value:'Clock Widget' },
        { key:'fontSize', value:'16pt' },
        { key:'fontColor', value:'#f00' },
        { key:'timezone', label:'Timezone (hr)',  value:'0' }
    ];

    self.render = function () {
        Dashboard._getOptions(self);
        var markup = '';
        markup += '<style>';
        markup += '#'+self.id+' .clock {font-size:'+Dashboard._getOption(self.options, 'fontSize')+';color:'+Dashboard._getOption(self.options, 'fontColor')+';}</style>';
        markup += '<div class="clock"></div>';
        $('#'+self.id).html(markup);
        $('#wc'+self.id+' .widget-title').html(Dashboard._getOption(self.options, 'title'));
        self.tick();
    };
    self.refresh = function () {
        var utc = moment().utc();
        var tz = parseInt(Dashboard._getOption(self.options, 'timezone'));
        $('#'+self.id+' .clock').html(
            //moment().format('HH:mm:ss')+'<br/>'+  //local time
            //utc.format('HH:mm:ss')+'<br/>'+       //utc time
            utc.utcOffset(tz).format('HH:mm:ss')    //utc time plus timezone setting
        );
    };

    self.tick = function () {
        setTimeout(function () {
            self.refresh();
            self.tick();
        }, 1000);
    };

    return self;
};