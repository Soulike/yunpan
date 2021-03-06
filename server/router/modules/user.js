'use strict';
const JsSHA = require('jssha');
const db = require('../../database');
const config = require('../../config');
const {getUserAsync} = require('../../functions/asyncFunctions');
const {log} = require('../../functions/log');
const {response} = config;

const prefix = (router) =>
{
    return `/server/user${router}`;
};

module.exports = (router) =>
{
    router.post(prefix('/register'), async (ctx, next) =>
    {

    });

    /*前端对邮箱和密码分别进行SHA256运算，数据库存储的是对邮箱SHA256+密码SHA256再进行SHA256后的数据*/
    /*前端传送数据：
     * {
     *   email: 111111111@qq.com,
     *   pass1: balabala……,  // email的sha256
     *   pass2: balabala……   // password的sha256
     * }
     * 使用user的id识别不同用户，使用session实现
     * */
    router.post(prefix('/login'), async (ctx, next) =>
    {
        try
        {
            const {email, pass1, pass2} = ctx.request.body;
            const {REGEXP: {EMAIL, SHA256}} = config;
            const {User} = db;
            if (!(EMAIL.test(email) && SHA256.test(pass1) && SHA256.test(pass2)))
            {
                ctx.body = new response(false, '数据有误，请重新发送');
            }
            else
            {
                const user = await User.find({where: {email: email}});
                if (Object.is(user, null))
                {
                    ctx.body = new response(false, '用户不存在');
                }
                else
                {
                    let shaObj = new JsSHA('SHA-256', 'TEXT');
                    shaObj.update(pass1);
                    shaObj.update(pass2);
                    const password = shaObj.getHash('HEX');
                    if (user.password !== password)
                    {
                        log(`${email} login failed. Wrong password`);
                        ctx.body = new response(false, '密码错误');
                    }
                    else
                    {
                        ctx.session.id = user.id;
                        log(`${email} login succeeded`);
                        ctx.body = new response(true, '登陆成功');
                    }
                }
            }
        }
        catch (e)
        {
            log(`Error when user login.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }

    });

    /*游客登陆，标记id为0*/
    router.get(prefix('/visitorLogin'), async (ctx, next) =>
    {
        ctx.session.id = 0;
        ctx.redirect('/fileList.html', '/');
        await next();
    });

    /*获取用户的文件列表
     * 前端不需要发送任何数据
     * 后端发送数据格式
     * {
     *     fileList:
     *     [
     *         {id,fileName,fileSize,createAt},
     *         {id,fileName,fileSize,createAt},
     *         {id,fileName,fileSize,createAt}
     *     ]
     * }
     * */
    router.get(prefix('/getFileList'), async (ctx, next) =>
    {
        try
        {
            const id = ctx.session.id;
            const user = await getUserAsync(id);
            if (Object.is(user, null))
            {
                ctx.body = new response(false, config.RESPONSE_MSG.INVALID_SESSION);
            }
            else
            {
                const files = await db.File.findAll({
                    where: {
                        [db.Op.or]: {
                            owner_id: id,
                            is_public: true
                        }
                    },
                    order: [['createdAt', 'DESC']]
                });
                let data = {fileList: []};
                for (const file of files)
                {
                    data.fileList.push({
                        id: file.id,
                        fileName: file.file_name,
                        fileSize: file.file_size,
                        createdAt: file.createdAt
                    });
                }
                ctx.body = new response(true, '文件列表获取成功', data);
            }
        }
        catch (e)
        {
            log(`Error when getting file list.\n${e.toString()}`);
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }
    });

    /*获取登陆用户的 Email
     * 返回值
     * {
     *     email: xxxx@xx.com
     * }
     * */
    router.get(prefix('/getLoginEmail'), async (ctx, next) =>
    {
        try
        {
            const id = ctx.session.id;
            const user = await getUserAsync(id);
            if (Object.is(user, null))
            {
                ctx.body = new response(false, config.RESPONSE_MSG.INVALID_SESSION);
            }
            else
            {
                ctx.body = new response(true, '邮箱获取成功', {email: user.email});
            }
        }
        catch (e)
        {
            ctx.body = new response(false, config.RESPONSE_MSG.INTERNAL_SERVER_ERROR);
        }
        finally
        {
            await next();
        }
    });
};