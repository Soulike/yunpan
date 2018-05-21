const router = require('../router');
const db = require('../../database');
const config = require('../../config');
const {response} = config;

const prefix = (router) =>
{
    return `/user${router}`;
};

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
 * */
router.post(prefix('/login'), async (ctx, next) =>
{
    const {email, pass1, pass2} = ctx.request;
    const {REG: {EMAIL, SHA256}} = config;
    const {User} = db;
    if (!(EMAIL.test(email) && SHA256.test(pass1) && SHA256.test(pass2)))
    {
        ctx.body = new response(false, '数据有误，请重新发送');
    }
    else
    {
        const user = await User.find({where: {email: email}});
        if (user.count() !== 1)
        {
            ctx.body = new response(false, '用户不存在');
        }
        else
        {

        }
    }
});