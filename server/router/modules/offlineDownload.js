'use strict';
const request = require('request');
const db = require('../../database');
const config = require('../../config');
const {downloadAsync, getFileSizeAsync} = require('../../functions/file');
const {getUserAsync,isExistAsync} = require('../../functions/asyncFunctions');
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
        const {link, isPublic} = ctx.request.body;
        const user = await getUserAsync(ctx.session.id);
        if (Object.is(user, null))//如果用户不存在或cookie失效
        {
            ctx.body = new response(false, '身份认证失效，请重新登录');
        }
        else//用户身份确认，发送head请求试探目标链接是否有效
        {
            request.head(link, async (err, res, body) =>
            {
                if (err || res.statusCode !== 200)
                {
                    ctx.body = new response(false, '文件链接无效');
                }
                else
                {
                    const id = user.id;
                    const date = new Date();
                    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                    const dayString = `${year}.${month}.${day}`;
                    downloadAsync(link, `${config.PATH_BASE}/${id}/${dayString}/`)
                        .then(async (fileName) =>
                        {
                            const fileSize =
                                await getFileSizeAsync(`${config.PATH_BASE}/${id}/${dayString}/${fileName}`);
                            await db.File.create({
                                file_name: fileName,
                                upload_date: dayString,
                                file_size: parseInt(fileSize),
                                is_public: !!isPublic,
                                owner_id: parseInt(id)
                            });
                        })
                        .catch((err) =>
                        {
                            log(`Error when downloading file.\n${err.toString()}`);
                        });
                    ctx.body = new response(true, '文件已开始下载，请稍后再查看');
                    console.log(ctx.body);
                }
            });
        }
        await next();
    });
};