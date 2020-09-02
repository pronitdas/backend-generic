const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const auth = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const mongoose = require('./mongoose');

const app = express(feathers());
const CustomVerifier = require('./services/auth/verifier')
    // Load app configuration




app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());

app.use(compress());
app.use(express.json({
    limit: '100mb'
}));
app.use(express.urlencoded({
    extended: true
}));
app.configure(express.rest());
app.use(express.static(path.join(__dirname, '../uploads')));

app.configure(socketio());
const authConfig = Object.assign({}, app.get('authentication'), {
    Verifier: CustomVerifier
});
app.configure(auth(authConfig));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));



// Host the public folder

app.configure(local(authConfig));


app.configure(jwt());
// .configure(jwt(authConfig));
app.use('/', express.static(app.get('public')));
app.service('authentication').hooks({
    before: {
        create: [auth.hooks.authenticate(['local', 'jwt']), ]
    }
});

// app.configure(local(authConfig))
// Set up Plugins and providers



app.configure(mongoose);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({
    logger
}));

app.hooks(appHooks);

module.exports = app;