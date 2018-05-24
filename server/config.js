'use strict';
const os = require('os');

const REGEXP = {
    EMAIL: /^[0-9A-z]+@([0-9A-z]+\.)+[0-9A-z]+$/,
    SHA256: /^[0-9a-z]{64}$/
};

const SESSION_CONFIG = {
    key: 'sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 3600 * 1000,
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

const PORT = 8002;

const PATH_BASE = `${os.homedir()}/panStorage`;
const UPLOAD_TEMP_PATH = PATH_BASE;

const RESPONSE_MSG = {
    INTERNAL_SERVER_ERROR: '服务器错误',
    PERMISSION_DENIED: '你没有执行此操作的权限',
    INVALID_SESSION: '身份认证失效，请重新登录'
};

class response
{
    constructor(status, msg, data = {})
    {
        this.status = status;
        this.msg = msg;
        this.data = data;
    }
}

module.exports = {
    REGEXP,
    SESSION_CONFIG,
    PORT,
    PATH_BASE,
    UPLOAD_TEMP_PATH,
    RESPONSE_MSG,
    response
};