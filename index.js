'use strict';
const Koa = require('koa');
const app = new Koa();

const session = require('koa-session');


const helmet = require("koa-helmet");
const bodyParser = require('koa-bodyparser');
const router = require('./router/router');
const config = require('./config');

app.use(helmet());
app.use(bodyParser());
app.keys = ['85c4a23991ab0f0dcdc2a674e7d4876a80985eff1e304414eda564cf1e5cba53'];
app.use(session(config.SESSION_CONFIG, app));



app
    .use(router.routes())
    .use(router.allowedMethods());