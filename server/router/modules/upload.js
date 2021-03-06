'use strict';
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const asyncFunctions = require('../../functions/asyncFunctions');
const {response} = config;
const multer = require('koa-multer');

const upload = multer({
    dest: config.PATH.UPLOAD_TEMP_PATH
});
const path = require('path');

const prefix = (router) =>
{
    return `/server${router}`;
};

module.exports = (router) =>
{
    router.post(prefix('/upload'), upload.single('file'), async (ctx, next) =>
    {
        try
        {
            const id = ctx.session.id;
            const user = await asyncFunctions.getUserAsync(id);
            if (Object.is(user, null))
            {
                ctx.body = new response(false, config.RESPONSE_MSG.INVALID_SESSION);
            }
            else if (parseInt(id) === 0)
            {
                ctx.body = new response(false, config.RESPONSE_MSG.PERMISSION_DENIED);
            }
            else
            {
                const fileInfo = ctx.req.file;
                const {isPublic} = ctx.req.body;
                const date = new Date();
                const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                const dayString = `${year}.${month}.${day}`;

                let fileName = fileInfo.originalname;
                await asyncFunctions.createFolder(config.PATH.UPLOAD_TEMP_PATH);//创建上传临时目录
                await asyncFunctions.createFolder(`${config.PATH.PATH_BASE}/${id}/${dayString}/`);
                if (await asyncFunctions.isExistAsync(`${config.PATH.PATH_BASE}/${id}/${dayString}/${fileName}`))//如果文件已经存在，则从(2)开始尝试
                {
                    const {ext, name} = path.parse(fileName);
                    for (let i = 2; ; i++)
                    {
                        if (!(await asyncFunctions.isExistAsync(`${config.PATH.PATH_BASE}/${id}/${dayString}/${name}(${i})${ext}`)))
                        {
                            fileName = `${name}(${i})${ext}`;
                            break;
                        }
                    }
                }

                await db.File.create({
                    file_name: fileName,
                    upload_date: dayString,
                    file_size: fileInfo.size,
                    is_public: isPublic === 'true',
                    owner_id: parseInt(id)
                });
                ctx.body = new response(true, '上传成功');

                await asyncFunctions.renameAsync(`${config.PATH.UPLOAD_TEMP_PATH}/${fileInfo.filename}`, `${config.PATH.PATH_BASE}/${id}/${dayString}/${fileName}`);
                await asyncFunctions.removeFilesInFolderAsync(config.PATH.UPLOAD_TEMP_PATH);//清空上传临时文件夹
            }
        }
        catch (e)
        {
            log(`Error when uploading.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }

    });
};
