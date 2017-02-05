# Botkit Storage Couchdb
A Couchdb storage module for botkit

## Installation
```bash
$ npm install botkit-storage-couchdb --save
```

## Usage
Require `botkit-storage-couchdb` and pass your config options. Then pass the returned storage when creating your Botkit controller. Botkit will do the rest!


```js
const Botkit = require('botkit'),
    couchDbStorage = require('botkit-storage-couchdb')("localhost:5984/botkit"),
    controller = Botkit.slackbot({
        storage: couchDbStorage
    });
    
// then you can use the Botkit storage api, make sure you have an id property
var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};

controller.storage.teams.save(beans);

controller.storage.teams.get('cool', (error, team) => {
    console.log(team);
});
```

### Options
You can pass any options that are allowed by [nano](https://github.com/dscape/nano#configuration).

The url you pass should contain your database.

```js
couchDbStorage = require('botkit-storage-couchdb')("localhost:5984/botkit")
```

To specify further configuration options you can pass an object literal instead:

```js
// The url is parsed and knows this is a database
couchDbStorage = require('botkit-storage-couchdb')({ 
    "url": "http://localhost:5984/botkit", 
    "requestDefaults" : { "proxy" : "http://someproxy" },
    "log": function (id, args) {
        console.log(id, args);
    }
});
```
