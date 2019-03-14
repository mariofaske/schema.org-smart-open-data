const MongoClient = require('mongodb').MongoClient;

var state = {
    db: null
}

exports.connect = function (url, done) {
    if (state.db) return done();

    MongoClient.connect(url, function (err, db) {
        if (err) return done(err);
        state.db = db;
        done();
    })
}

exports.get = function () {
    return state.db;
}

exports.collection = function (collection) {
    return state.db.collection(collection);
}

exports.close = function (done) {
    done = done || function () { };
    if (state.db) {
        state.db.close(function (err, result) {
            state.db = null;
            state.mode = null;
            done(err);
        })
    }
}