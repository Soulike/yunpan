'use strict';
const db = require('../database');

/*通过id来返回数据库当中的对应用户*/
async function getUser(id)
{
    const {User} = db;
    return await User.findById(id);
}

