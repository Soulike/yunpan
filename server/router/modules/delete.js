'use strict';
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const asyncFunctions = require('../../functions/asyncFunctions');
const {response} = config;

const prefix = (router) =>
{
    return `/server${router}`;
};

/*删除文件
 * 前端提交信息
 * {
 *     fileId:dadwa
 * }
 */
module.exports = (router) =>
{
    router.post(prefix('/delete'), async (ctx, next) =>
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
                    await asyncFunctions.unlinkAsync(`${config.PATH_BASE}/${id}/${dayString}/${fileName}`);
                    await file.destroy();
                    ctx.body = new response(true, `文件 ${fileName} 删除成功`);
                    const folderFileArr = await asyncFunctions.readDirAsync(`${config.PATH_BASE}/${id}/${dayString}/`);
                    if (folderFileArr.length === 0)
                    {
                        await asyncFunctions.removeFolderAsync(`${config.PATH_BASE}/${id}/${dayString}/`);
                    }
                }
            }
        }
        catch (e)
        {
            log(`Error when deleting file.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }
    });
};