'use strict';
const Koa = require('koa');
const app = new Koa();

const session = require('koa-session');

const helmet = require('koa-helmet');
const bodyParser = require('koa-bodyparser');
const router = require('./server/router/router');
const config = require('./server/config');
const {log} = require('./server/functions/log');
const {userDb} = require('./server/database');

app.use(helmet());
app.use(bodyParser());
app.keys = ['85c4a23991ab0f0dcdc2a674e7d4876a80985eff1e304414eda564cf1e5cba53'];
app.use(session(config.SESSION_CONFIG, app));
userDb
    .sync()
    .then((result) =>
    {
        log(`Database sync succeed.`);
    })
    .catch((err) =>
    {
        log(`Database sync failed，log:\n${err}`);
    });

app
    .use(router.routes())
    .use(router.allowedMethods());

log(`Server is running on port ${config.PORT}.`);
app.listen(config.PORT);