'use strict';
const Koa = require('koa');
const app = new Koa();
const helmet = require("koa-helmet");
const bodyParser = require('koa-bodyparser');
const router = require('./router/router');
app.use(helmet());
app.use(bodyParser());



app
    .use(router.routes())
    .use(router.allowedMethods());