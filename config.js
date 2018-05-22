const FILE_STORAGE_PATH = '/home/soulike/static/';

const REGEXP = {
    EMAIL: /^[0-9A-z]+@([0-9A-z]+\.)+[0-9A-z]+$/,
    SHA256: /^[0-9a-z]{64}$/
};

const SESSION_CONFIG = {
    key: 'sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 3600,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: true, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

const PORT = 8002;

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
    FILE_STORAGE_PATH,
    REGEXP,
    SESSION_CONFIG,
    PORT,
    response
};