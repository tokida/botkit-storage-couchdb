"use strict"

const Cloudant = require('cloudant');
const namespaces = [
    "users",
    "channels",
    "teams"
];

// define design and views
const designDocs = namespaces
    .map(namespace => {
        return {
            namespace,
            doc: {
                "views": {
                    "all": {
                        "map": `function (doc) { if (doc.type === "${namespace}") emit(doc._id, doc) }`
                    }
                }
            }
        };
    });

function getStorage (db, namespace) {
    return {
        save: (doc, cb) => {
            doc.type = namespace;
            doc._id = `${namespace}/${doc.id}`;
            console.log('save:' + doc._id);
            db.get(doc._id, function(err, data) {
                if (err) {
                    db.insert(doc, cb);
                } else {
                    doc._rev = data._rev;
                    db.insert(doc, cb);
                }
            });
        },
        get: (id, cb) => {
            //console.log(cb);
            db.get(`${namespace}/${id}`, (err, doc) => {
                if (err) {
                    return cb(err);
                }
                //console.log(doc);
                cb(null, doc);
            });
        },
        delete: (id, cb) => {
            db.get(id, (err, doc) => {
                if (err) {
                    return cb(err);
                }
                db.destroy(doc._id, doc._rev, cb);
            });
        },
        all: cb => {
            db.view(namespace, "all", (err, result) => {
                if (err) {
                    return cb(err);
                }

                cb(null, result.rows.map(row => row.value));
            });
        }
    }
}

// config
module.exports = config => {
    console.log(config);

    const url = 'https://' + config.username + ':' + config.password + '@' + config.host;
    const cloudant = Cloudant({
        url: url
    });
    const dbname = config.dbname;
    let storage = {};
    let db = cloudant.db.use(dbname);

    for (const design of designDocs) {
        db.insert(design.doc, `_design/${design.namespace}`, function(err) {
            let isDatabaseNotFound = (err.statusCode === 404);
            if (isDatabaseNotFound) {
                console.log('database not found');
                throw err;
            } else {
                console.log('create view :' + design.namespace);
            }
        });
    }

    for (let namespace of namespaces) {
        storage[namespace] = getStorage(db, namespace);
    }
    return storage;
};