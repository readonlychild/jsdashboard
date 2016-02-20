'use strict';

var Dashboard = {};
Dashboard.grid = null;
Dashboard.activeScreen = 's1';
Dashboard.widgets = [];
Dashboard.initialize = function (settings) {
    $('body').append(this.modalMarkup);
    var gridoptions = {
        width:12,
        handle:'.widget-header'
    };
    $(settings.container).gridstack(gridoptions);
    $(settings.container).before(this.uiOptions);
    this.grid = $(settings.container).data('gridstack');
    this.getScreens();
    this.getWidgets();
    this.loadScreen();
    
    // EVENT HANDLERS
    var self = this;
    
    /*
    Load a screen. ".action-loadScreen"
    The element that triggers must have a data-screenid
    */
    $(document).on("click", ".action-loadScreen", function () {
        var $this = $(this);
        var screenId = $this.data("dash-screenid");
        self.activeScreen = screenId;
        console.debug('activeScreen', self.activeScreen, screenId);
        self.loadScreen();
    });
    
    /*
    Show widget options. ".action-showOptions"
    The element that triggers must have a data-widget-id
    */
    $(document).on("click", ".action-showOptions", function () {
        var wid = $(this).parent().data("widget-id");
        Dashboard.showOptions(wid);
    });
    
    /*
    Save widget options. ".action-saveOptions"
    The element that triggers must have a data-widget-id
    */
    $(document).on("click", ".action-saveOptions", function () {
        var wid = $(this).parent().data("widget-id");
        Dashboard.saveOptions(wid);
    });
    
    /*
    Remove a widget. ".action-removeWidget"
    The element that triggers must have a data-widget-id
    */
    $(document).on("click", ".action-removeWidget", function () {
        var wid = $(this).parent().data("widget-id");
        Dashboard.removeWidget(wid);
    });
    
    /*
    Save the current state. ".action-saveDashboardState"
    */
    $(document).on("click", ".action-saveDashboardState", function () {
        Dashboard.save();
    });
    
    /*
    Add a widget. ".action-addWidget"
    The element that triggers must have a data-widget-type
    */
    $(document).on("click", ".action-addWidget", function () {
        var wid = Dashboard.getNewId();
        var type = $(this).data("widget-type");
        Dashboard.addWidget(type, wid);
    });
    
};
Dashboard.render = function (id) {
    if (id) {
        var w = this.getWidgetById(id);
        if (w) {
            $('#' + w.id).html(w.render());
            //w.refresh();
        }
    } else {
        for (var i = 0; i < this.widgets.length; i++) {
            var w = this.widgets[i];
            $('#' + w.id).html(w.render());
            //w.refresh();
        }
    }
};
Dashboard.refresh = function () {};
Dashboard.getWidgetById = function (id) {
    for (var i = 0; i < this.widgets.length; i++) {
        if (this.widgets[i].id === id) {
            return this.widgets[i];
        }
    }
    return null;
};
Dashboard.showOptions = function (wid) {
    var widget = this.getWidgetById(wid);
    var optionTpl = '<div class="input-group"><span class="input-group-addon"><label>#label#</label></span><input class="form-control" id="#name#" value="#value#" data-label="#label#" /></div><br/>';
    var optionListTpl = '<div class="input-group"><span class="input-group-addon"><label>#label#</label></span><select class="form-control" id="#name#" value="#value#">#options#</select></div><br/>';
    var markup = '<div id="dash-option-set" data-widget-id="#id#">';
    
    _.map(widget.options, function (option) {
        var st = optionTpl.replace(/#label#/g, option.label || option.key)
                          .replace(/#name#/g, option.key)
                          .replace(/#value#/g, option.value);
        markup += st;
    });
    
    markup += '</div>';
    markup = markup.replace(/#id#/g, wid);
    
    this.showModal("Options", markup, [{caption:'Save',cssClass:'primary action-saveOptions'}]);
};
Dashboard.saveOptions = function () {
    var options = [];
    var wid = $("#dash-option-set").data("widget-id");
    _.map($("#dash-option-set :input"), function (input) {
        var $input = $(input);
        var option = {};
        option.key = $input.attr('id');
        option.value = $input.val();
        option.label = $input.data('label');
        options.push(option);
    });
    console.debug('saveOptions', options);
    DataLayer.setWidgetOptions(wid, options);
    $('#dashModal').modal('hide');
    this.render(wid);
};

Dashboard.showModal = function (title, content, buttons) {
    $("#dashModal-title").html(title);
    $("#dashModal-content").html(content);
    var btnTpl = '<button type="button" class="btn btn-#cssClass#">#caption#</button>';
    var bb = '';
    _.map(buttons, function (btn) {
        bb += btnTpl.replace(/#caption#/g, btn.caption).replace(/#cssClass#/g, btn.cssClass);
        console.log(buttons);
    });
    $("#dashModal-buttons").html(bb);
    $("#dashModal").modal();
};
/*
Dashboard.Widget = function (settings) {
    this.settings = settings || {};
    this.title = settings.title || 'Vanilla Widget';
    this.iconUrl = settings.iconUrl || '';
    this.canToggle = settings.canToggle || false;
    this.canRefresh = settings.canRefresh || false;
    this.canFullscreen = settings.canFullscreen || false;
    this.hasOptions = settings.hasOptions || false;
    this.id = settings.id || new Date().getTime().toString();
    this.type = settings.type || 'unknown';
    this.render = function () {};
    this.refresh = function () {};
    this.showOptions = function () {};
};
*/
Dashboard.loadScreen = function () {
    this.getScreen(this.activeScreen);
    this.render();
};

Dashboard.addWidget = function (type, id) {
    var construct = this.stringToConstructor(type);
    var widget = new construct({id:id});
    this.widgets.push(widget);
    var markup = this.getWidgetChrome(widget, id, type);
    this.grid.add_widget(markup, 0, 0, 2, 2, true);
    widget.render();
};

Dashboard.removeWidget = function (id) {
    //remove from widgets
    var widget = this.getWidgetById(id);
    var activeWidgets = [];
    _.map(this.widgets, function (wdgt) {
        if (wdgt.id !== id) activeWidgets.push(wdgt);
    });
    this.widgets = activeWidgets;
    //remove from grid
    var $el = $("#wc"+id);
    this.grid.remove_widget($el);
};


Dashboard.widgetChrome = [
    '<div class="grid-stack-item" id="wc#id#" data-dash-id="#id#" data-dash-type="#type#">',
    ' <div class="grid-stack-item-content">',
    '  <div class="widget-header">',
    '   <span class="widget-icon">#icon#</span> <span class="widget-title">#title#</span>',
    '   <div class="pull-right options" data-widget-id="#id#">',
    '    #options#',
    '   </div>',
    '  </div>',
    '  <div class="widget-content" id="#id#">',
    '#content#',
    '  </div>',
    ' </div>',
    '</div>'
].join('');

Dashboard.modalMarkup = [
    '<div class="modal fade" id="dashModal">',
    '  <div class="modal-dialog">',
    '    <div class="modal-content">',
    '    <div class="modal-header">',
    '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
    '        <h4 class="modal-title" id="dashModal-title">Title</h4>',
    '    </div>',
    '    <div class="modal-body" id="dashModal-content">',
    '        Content',
    '    </div>',
    '    <div class="modal-footer">',
    '        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
    '        <span id="dashModal-buttons">buttons here</span>',
    '    </div>',
    '    </div>',
    '  </div>',
    '</div>'
].join('');

Dashboard.uiOptions = [
    '<div class="dash-options">',
    ' <div class="content">',
    '  <span class="dropdown">',
    '   <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">My Screens <span class="caret"></span></button>',
    '   <ul class="dropdown-menu dash-screen-list"></ul>',
    '  </span>',
    '  <span class="dropdown">',
    '   <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Widgets <span class="caret"></span></button>',
    '   <ul class="dropdown-menu dash-widget-list"></ul>',
    '  </span>',
    '  <button type="button" class="btn btn-default action-saveDashboardState">Save State</button>',
    ' </div>',
    '</div>'
].join('');

/**  persistence layer  **/

Dashboard.getNewId = function () {
    return "w" + new Date().getTime();
};

Dashboard.save = function () {
    var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
        el = $(el);
        var node = el.data('_gridstack_node');
        console.log(el, node);
        return {
            id: el.data('dash-id'),
            type: el.data('dash-type'),
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
        }
    });
    console.debug('saved', JSON.stringify(res));
    localStorage.setItem(this.activeScreen, JSON.stringify(res));
};

Dashboard.getScreens = function () {
    var list = [
        { id:'s1', title:'My First Screen' },
        { id:'s2', title:'My Second Screen' },
        { id:'s3', title:'My Third Screen' }
    ];
    var markup = '';
    _.each(list, function (screen) {
        markup += '<li><a href="#" class="action-loadScreen" data-dash-screenid="'+screen.id+'">'+screen.title+'</a></li>';
    });
    //markup += '<li class="divider"></li>';
    //markup += '<li><a href="#" class="action-newScreen">New Screen</a></li>';
    $(".dash-screen-list").html(markup);
};
Dashboard.getWidgets = function () {
    var list = [
        { type: 'WeatherWidget', title: 'Weather' },
        { type: 'ClockWidget', title: 'Clock' }
    ];
    var markup = '';
    _.each(list, function (wgt) {
        markup += '<li><a href="#" class="action-addWidget" data-widget-type="'+wgt.type+'">'+wgt.title+'</a></li>';
    });
    $(".dash-widget-list").html(markup);
};
Dashboard.getScreen = function (id) {
    var self = this;
    var d = localStorage.getItem(id);
    console.log('d', d, id);
    if (!d || d === "null") {
        d = [
            { id: "abc", type:'ClockWidget', x:1, y:0, width:2, height:1 },
            { id: "xyz", type:'ClockWidget', x:2, y:0, width:3, height:1 }
        ];
        console.debug('initd d');
    } else {
        d = JSON.parse(d);
    }
    console.debug('d', d);
    d = GridStackUI.Utils.sort(d);
    self.grid.remove_all();
    self.widgets = [];
    _.each(d, function (node) {
        var construct = self.stringToConstructor(node.type);
        var widget = new construct({ id:node.id });
        self.widgets.push(widget);
        var markup = self.getWidgetChrome(widget, node.id, node.type);
        self.grid.add_widget(markup, node.x, node.y, node.width, node.height, true);
        
    });
};

Dashboard.getWidgetChrome = function (widget, id, type) {
    var icn = '';
    if (widget.iconUrl && widget.iconUrl.length > 0) {
        icn = '<img src="' + widget.iconUrl + '" /> ';
    }
    var options = '<i class="fa fa-remove action-removeWidget"></i>';
    //if (widget.canToggle) options += ' <i class="fa fa-toggle-on"></i>';
    if (widget.canRefresh) options += ' <i class="fa fa-refresh"></i>';
    if (widget.hasOptions) options += ' <i class="fa fa-cog action-showOptions"></i>';
    var markup = Dashboard.widgetChrome
        .replace(/#id#/g, id)
        .replace(/#type#/g, type)
        .replace(/#title#/g, widget.title)
        .replace(/#content#/g, '<div id="'+id+'"></div>')
        .replace(/#icon#/g, icn)
        .replace(/#options#/g, options)
        ;
    return markup;
};

Dashboard.stringToConstructor = function (type) {
    var arr = type.split('.');
    var fx = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fx = fx[arr[i]];
    }
    if (typeof fx !== "function") {
        throw new Error("function not found: " + type);
    }
    return fx;
};




Dashboard._getOptions = function (widget) {
    widget.options = DataLayer.getWidgetOptions(widget.id);
    if (widget._optionDef) {
        _.map(widget._optionDef, function (def) {
            var v = Dashboard._getOption(widget.options, def.key, '----');
            if (v === '----') widget.options.push({ key:def.key, label:def.label, value:def.value });
        });
    }
};

Dashboard._getOption = function (options, key, defaultValue) {
    var v = defaultValue;
    _.map(options, function (o) {
        if (o.key === key) v = o.value;
    });
    return v;
};