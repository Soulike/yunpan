'use strict';
const db = require('../../database');
const config = require('../../config');
const asyncFunctions = require('../../functions/asyncFunctions');
const {log} = require('../../functions/log');
const {response} = config;

const prefix = (path) =>
{
    return `/server/offlineDownload${path}`;
};


module.exports = (router) =>
{
    /*
     * 接收离线下载的链接
     * 先发送head请求验证链接有效性，如果有效就返回信息并下载。下载完成之后再将文件记录加入数据库。如果下载失败则输出日志
     * 前端发送信息:
     * {
     *     link: 'balabala',
     *     isPublic: true
     * }
     * */
    router.post(prefix('/downloadLink'), async (ctx, next) =>
    {
        try
        {
            const {link, isPublic} = ctx.request.body;
            const user = await asyncFunctions.getUserAsync(ctx.session.id);
            if (Object.is(user, null))//如果用户不存在或cookie失效
            {
                ctx.body = new response(false, config.RESPONSE_MSG.INVALID_SESSION);
            }
            else if (parseInt(id) === 0)
            {
                ctx.body = new response(false, config.RESPONSE_MSG.PERMISSION_DENIED);
            }
            else//用户身份确认，发送head请求试探目标链接是否有效
            {
                const {res, body} = await asyncFunctions.headAsync(link)
                    .catch((err) =>
                    {
                        ctx.body = new response(false, '文件链接无效');
                    });

                if (res.statusCode !== 200)
                {
                    ctx.body = new response(false, '文件链接无效');
                }
                else
                {
                    const id = user.id;
                    const date = new Date();
                    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                    const dayString = `${year}.${month}.${day}`;

                    asyncFunctions.downloadAsync(link, `${config.PATH.PATH_BASE}/${id}/${dayString}/`)
                        .then(async (fileName) =>
                        {
                            const fileSize =
                                await asyncFunctions.getFileSizeAsync(`${config.PATH.PATH_BASE}/${id}/${dayString}/${fileName}`);
                            await db.File.create({
                                file_name: fileName,
                                upload_date: dayString,
                                file_size: parseInt(fileSize),
                                is_public: !!isPublic,
                                owner_id: parseInt(id)
                            });
                        });
                    ctx.body = new response(true, '文件已开始下载，请稍后再查看');
                }
            }
        }
        catch (e)
        {
            log(`Error when downloading file.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }
    });
};