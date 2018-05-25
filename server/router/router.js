'use strict';
/*
* 统一信息返回格式
* {
*   status: true,
*   msg: 'balabala',
*   data: balabala
* }
* */
const Router = require('koa-router');
const router = new Router();

require('./modules/user')(router);
require('./modules/offlineDownload')(router);
require('./modules/upload')(router);
require('./modules/download')(router);
require('./modules/delete')(router);
require('./modules/git')(router);

module.exports = router;