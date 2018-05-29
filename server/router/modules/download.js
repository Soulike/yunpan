'use strict';
const md5 = require('blueimp-md5');

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
    /* 向前端返回下载地址，检查下载权限
     * 在发送链接时生成一个TOKEN，有效期为1小时，存入redis，对应fileID，在一小时内任何人都可以用这个token下载这个文件。
     * TOKEN 计划格式为MD5(fileId+时间戳)
     * 前端提交信息
     * {
     *     fileId:dawda
     * }
     * 回复信息
     * {
     *     downloadLink: https://pan.soulike.tech/server/download/downloadFile?fileId=xxx&token=xxx
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
                else if (parseInt(file.owner_id) !== parseInt(id) && file.is_public !== true)//这个文件并不属于这个用户且这个文件不是公开的
                {
                    ctx.body = new response(false, '你没有权限下载这个文件');
                }
                else
                {
                    const token = md5(`${fileId}${Date.now()}`);
                    await asyncFunctions.redisSetAsync(token, fileId, 3600);
                    ctx.body = new response(true, '开始下载，稍安勿躁', {downloadLink: `https://pan.soulike.tech${prefix('/downloadFile')}?fileId=${fileId}&token=${token}`});
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
     * 格式: /download?fileId=xxx&token=1111
     * 从 Redis 中读取 token 对应的文件，如果与 fileID 对应则允许下载
     * 返回文件本身
     * */
    router.get(prefix('/downloadFile'), async (ctx, next) =>
    {
        try
        {
            const {fileId, token} = ctx.request.query;
            if (Object.is(fileId, undefined) || Object.is(token, undefined))
            {
                ctx.body = '下载参数错误';
            }
            else
            {
                const file = await db.File.findById(fileId);
                const fileIdOfToken = await asyncFunctions.redisGetAsync(token);// 从token得到的文件id
                if (Object.is(fileId, null))
                {
                    ctx.body = '文件不存在';
                }
                else if (fileIdOfToken !== fileId)
                {
                    ctx.body = '下载链接已过期';
                }
                else
                {
                    const {file_name: fileName, upload_date: dayString, owner_id: ownerId} = file;
                    ctx.response.set('Content-Disposition', `attachment; filename=${encodeURI(fileName)}`);
                    await send(ctx, `${ownerId}/${dayString}/${fileName}`, {root: `${config.PATH.PATH_BASE}/`});
                }
            }
        }
        catch (e)
        {
            log(`Error when returning download link.\n${e.toString()}`);
            ctx.response.set('Content-Disposition', `inline`);
            ctx.body = config.RESPONSE_MSG.INTERNAL_SERVER_ERROR;
        }
        finally
        {
            await next();
        }

    });

};