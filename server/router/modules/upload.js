'use strict';
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const asyncFunctions = require('../../functions/asyncFunctions');
const {response} = config;
const multer = require('koa-multer');

const upload = multer({
    dest: config.UPLOAD_TEMP_PATH
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
        const id = ctx.session.id;
        const user = await asyncFunctions.getUserAsync(id);
        if (Object.is(user, null))
        {
            ctx.body = new response(false, '身份认证失效，请重新登录');
        }
        else
        {
            const fileInfo = ctx.req.file;
            const {isPublic} = ctx.req.body;
            console.log(ctx.req.body.isPublic);
            const date = new Date();
            const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
            const dayString = `${year}.${month}.${day}`;

            let fileName = fileInfo.originalname;

            await asyncFunctions.createFolder(`${config.UPLOAD_TEMP_PATH}/`)//创建上传临时目录
                .catch((err) =>
                {
                    log(`Error when uploading.\n${err.toString()}`);
                });

            await asyncFunctions.createFolder(`${config.PATH_BASE}/${id}/${dayString}/`)
                .catch((err) =>
                {
                    log(`Error when uploading.\n${err.toString()}`);
                });

            if (await asyncFunctions.isExistAsync(`${config.PATH_BASE}/${id}/${dayString}/${fileName}`))//如果文件已经存在，则从(2)开始尝试
            {
                const {ext, name} = path.parse(fileName);
                for (let i = 2; ; i++)
                {
                    if (!(await asyncFunctions.isExistAsync(`${config.PATH_BASE}/${id}/${dayString}/${name}(${i})${ext}`)))
                    {
                        fileName = `${name}(${i})${ext}`;
                        break;
                    }
                }
            }

            await asyncFunctions.renameAsync(`${config.UPLOAD_TEMP_PATH}/${fileInfo.filename}`, `${config.PATH_BASE}/${id}/${dayString}/${fileName}`)
                .catch((err) =>
                {
                    log(`Error when uploading.\n${err.toString()}`);
                });

            await asyncFunctions.rmdirAsync(`${config.UPLOAD_TEMP_PATH}/`)
                .catch((err) =>
                {
                    log(`Error when deleting temp folder.\n${err.toString()}`);
                });

            ctx.body = new response(true, '上传成功');

            await db.File.create({
                file_name: fileName,
                upload_date: dayString,
                file_size: fileInfo.size,
                is_public: !!isPublic,
                owner_id: parseInt(id)
            });

        }
        await next();
    });
};
