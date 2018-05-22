const db = require('../database');

async function getUser(id)
{
    const {User} = db;
    return new Promise(async (resolve, reject) =>
    {
        const user = await User.findById(id);
        if (user.count() === 0)
        {
            reject(false);
        }
        else
        {
            resolve(user);
        }
    });
}

