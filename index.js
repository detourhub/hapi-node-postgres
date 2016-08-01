'use strict';

const Hoek = require('hoek');
const Promise = require('bluebird');
let Pg = require('pg');


const DEFAULTS = {
    connectionString: undefined,
    native: false,
    attach: 'onPreHandler',
    detach: 'tail'
};


exports.register = function (server, options, next) {

    const config = Hoek.applyToDefaults(DEFAULTS, options);

    if (config.native) {
        Pg = require('pg').native;
    }

    server.ext(config.attach, (request, reply) => {

        Pg.connect(config.connectionString, (err, client, done) => {

            if (err) {
                reply(err);
                return;
            }

            request.pg = {
                client: Promise.promisifyAll(client),
                done: done,
                kill: false
            };

            reply.continue();
        });
    });


    server.on(config.detach, (request, err) => {

        if (request.pg) {
            request.pg.done(request.pg.kill);
        }
    });


    next();
};


exports.register.attributes = {
    pkg: require('./package.json')
};
