'use strict';
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const asyncFunctions = require('../../functions/asyncFunctions');
const send = require('koa-send');
const {response} = config;

const prefix = (router) =>
{
    return `/server/download${router}`;
};

module.exports = (router) =>
{
    /* 向前端返回下载地址
     * 前端提交信息
     * {
     *     fileId:dawda
     * }
     * 回复信息
     * {
     *     downloadLink: https://pan.soulike.tech/download/${id}/${uploadDate}/${fileName}
     * }
     * */
    router.post(prefix('/getDownloadLink'), async (ctx, next) =>
    {
        try
        {
            const id = ctx.session.id;
            const user = await asyncFunctions.getUserAsync(id);
            if (Object.is(user, null))//如果用户不存在或cookie失效
            {
                ctx.body = new response(false, config.RESPONSE_MSG.INVALID_SESSION);
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
                    ctx.body = new response(true, '开始下载，稍安勿躁', {downloadLink: `https://pan.soulike.tech${prefix('/downloadFile')}?fileId=${fileId}`});
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

    /*发送伪下载链接
     * 格式: /download?fileId=xxx
     * 返回文件本身
     * */
    router.get(prefix('/downloadFile'), async (ctx, next) =>
    {
        try
        {
            const {fileId} = ctx.request.query;
            const id = ctx.session.id;
            const user = await asyncFunctions.getUserAsync(id);
            if (Object.is(user, null))//如果用户不存在或cookie失效
            {
                ctx.body = config.RESPONSE_MSG.INVALID_SESSION;
            }
            else if (Object.is(fileId, undefined))
            {
                ctx.body = '下载参数错误';
            }
            else
            {
                const file = await db.File.findById(fileId);
                if (Object.is(fileId, null))
                {
                    ctx.body = '文件不存在';
                }
                else
                {
                    const {file_name: fileName, upload_date: dayString, owner_id: ownerId} = file;
                    ctx.response.set('Content-Disposition', `attachment; filename=${encodeURI(fileName)}`);
                    await send(ctx, `${ownerId}/${dayString}/${fileName}`, {root: `${config.PATH_BASE}/`});
                }
            }
        }
        catch (e)
        {
            log(`Error when returning download link.\n${e.toString()}`);
            ctx.body = config.RESPONSE_MSG.INTERNAL_SERVER_ERROR;
        }
        finally
        {
            await next();
        }

    });

};