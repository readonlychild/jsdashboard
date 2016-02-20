'use strict'

var DataLayer = {};
DataLayer.getItem = function (key, defaultValue) {
    var d = localStorage.getItem(key);
    if (!d || d === "null") {
        d = defaultValue;
    } else {
        d = JSON.parse(d);
    }
    return d;
};
DataLayer.setItem = function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    console.debug('saving', key, JSON.stringify(value));
};

DataLayer.getWidgetOptions = function (wid) {
    var options = this.getItem(wid + '.options', []);
    return options;
};
DataLayer.setWidgetOptions = function (wid, options) {
    this.setItem(wid + '.options', options);
};

