This repo started from a clone of https://github.com/atom/electron-quick-start.

# JS Dashboard FX

A dashboard+widget base.

Will run using an [Electron](http://electron.atom.io/docs/latest) chrome.
Can also be ran as a webapp with a modification to the line that loads jquery as a script.


## To Use

```bash
# Install dependencies and run the app
npm install && npm start
```


## Dependencies/Used Libraries

- CSS+JS [jQueryUI](https://jqueryui.com/)
- CSS+JS [Bootstrap v3](https://github.com/twbs/bootstrap)
- CSS [Font-Awesome](https://github.com/FortAwesome/Font-Awesome)
- JS [Sweet Alert](https://github.com/t4t5/sweetalert)
- JS [underscore](https://github.com/jashkenas/underscore)
- JS [moment](https://github.com/moment/moment/)
- JS [gridstack](https://github.com/troolee/gridstack.js)


# Quick 101

When Dashboard initializes, it needs a div target where it will place itself.

```
Dashboard.initialize(
    { container: '.grid-stack' }
);
```

This will take 




## Widget interface
Expected fucntions and properties

| member type | name               | type     | info   |
| ---- | ---- | ---- | ---- |
| property    | id                 | string   | you can use `Dashboard.getNewId()` to assign a default value |
| property    | type               | string   | a string that matches the widtet constructor name |
| property    | title              | string   |   |
| property    | iconUrl (optional) | string   | a 16x16 image to usin at the beginning of a widget header |
| property    | canRefresh         | bool     |   |
| property    | hasOptions         | bool     |   |
| function    | render()           | void     | `Dashboard` will supply a div with your widget's` id`, render should create markup for your widget at this time.  |
| function    | refresh()          | void     | `Dashboard` may call this when it needs to update its UI. |  


## Dashboard interface

### Dashboard.initialize(settings);


### Dashbaord.save()


## DataLayer interface
DataLayer.localStorage.js - this file implements the current 4 functions by using the browser's localStorage API.

### getItem (key, defualtValue)

returns an object

### setItem (key, value)

returns void

### getWidgetOptions (widgetId)

returns an array of option items.

Option Item: ` { key:'', value:'', label:'' } `

### setWidgetOptions (widgetId, options)

returns void

options is an array of option items.


----


This license came from the original repo.

#### License [CC0 (Public Domain)](LICENSE.md)
