'use strict';
const os = require('os');

// 验证所需正则表达式
const REGEXP = {
    EMAIL: /^[0-9A-z]+@([0-9A-z]+\.)+[0-9A-z]+$/,
    SHA256: /^[0-9a-z]{64}$/
};

// koa-session 的配置
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

// 服务器监听的本地端口
const PORT = 8002;

// 各种文件的存储路径
const PATH = {
    SERVER_FILES_PATH: `${os.homedir()}/servers/yunpan`,    // 项目文件存储位置
    PATH_BASE: `${os.homedir()}/panStorage`,    // 云盘文件存储位置
    UPLOAD_TEMP_PATH: `${os.homedir()}/panStorage/uploadTemp`   // 上传文件所需临时空间地址
};

// 杂项，用于 Supervisor 重启进程
const NAME = {
    SUPERVISOR: 'pan'   // 你的 Supervisor 进程配置文件当中指定的进程名字
};

// 常用的回复语句
const RESPONSE_MSG = {
    INTERNAL_SERVER_ERROR: '服务器错误',
    PERMISSION_DENIED: '你没有执行此操作的权限',
    INVALID_SESSION: '身份认证失效，请重新登录'
};

// Git WebHook 用密码
const GIT_WEBHOOK_PASSWORD = '16009d64cd88b840c4cc1fbd8cde6f4109bdf439a5cfd4050a61fb1438ca137b';

// 数据库配置
const DATABASE = {
    HOST: '140.82.23.140',
    DATABASE_NAME: 'user',
    USERNAME: 'postgres',
    PASSWORD: 'Soulike@PostgreSQL',
    DATABASE_DIALECT: 'postgres'
};

// 服务器响应格式
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
    PATH,
    NAME,
    RESPONSE_MSG,
    DATABASE,
    GIT_WEBHOOK_PASSWORD,
    response
};