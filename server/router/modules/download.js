'use strict';
const send = require('koa-send');
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const asyncFunctions = require('../../functions/asyncFunctions');
const {response} = config;

const prefix = (router) =>
{
    return `/server${router}`;
};

module.exports = (router) =>
{
    /*向前端返回真实下载地址
     * 前端提交信息
     * {
     *     fileId:dawda
     * }
     * 回复一个文件
     * */
    router.post(prefix('/download'), async (ctx, next) =>
    {
        try
        {
            const id = ctx.session.id;
            const user = await asyncFunctions.getUserAsync(id);
            if (Object.is(user, null))//如果用户不存在或cookie失效
            {
                ctx.body = new response(false, '身份认证失效，请重新登录');
            }
            else
            {
                const {fileId} = ctx.request.body;
                const file = await db.File.findById(fileId);
                if (Object.is(file, null))
                {
                    ctx.body = new response(false, '文件不存在');
                }
                else
                {
                    const {file_name: fileName, upload_date: dayString} = file;
                    ctx.response.set('Content-Type','application/octet-stream');
                    await send(ctx, `${id}/${dayString}/${fileName}`, {root: `${config.PATH_BASE}/`});
                }
            }
        }
        catch (e)
        {
            log(`Error when responding download link.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }
    });
};