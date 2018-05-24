'use strict';
const db = require('../database');
const fs = require('fs');
const request = require('request');

/*通过id来返回数据库当中的对应用户*/
async function getUserAsync(id)
{
    if (id === undefined)
    {
        return null;
    }
    else
    {
        const {User} = db;
        return await User.findById(id);
    }
}

//fs.mkdir的Promise版本
async function mkdirAsync(path)
{
    return new Promise(((resolve, reject) =>
    {
        fs.mkdir(path, (err) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    }));
}

//fs.access的Promise版本，目前只用于探测目录是否存在
async function isExistAsync(path)
{
    return new Promise(((resolve) =>
    {
        fs.access(path, (err) =>
        {
            resolve(!err);
        });
    }));
}

//创建路径。注意，该函数仅兼容Unix系，不兼容Windows（因为采用/作为目录分隔符），且仅支持绝对路径
async function createFolder(path)
{
    if (path[path.length - 1] === '/')// 删除最后一个/
    {
        path = path.slice(0, -1);
    }
    if (path[0] === '/')// 删除第一个/
    {
        path = path.slice(1);
    }
    const pathLevels = path.split('/');
    let absolutePath = '/';
    return new Promise((async (resolve, reject) =>
    {
        for (const folder of pathLevels)
        {
            absolutePath = `${absolutePath}${folder}/`;
            if (!(await isExistAsync(absolutePath)))//如果这个目录不存在，则创建它
            {
                await mkdirAsync(absolutePath)
                    .catch((err) =>
                    {
                        reject(err);
                    });
            }
        }
        resolve();
    }));

}

// request.head 的异步版本
async function headAsync(link)
{
    return new Promise(((resolve, reject) =>
    {
        request.head(link, (err, res, body) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve({
                    res,
                    body
                });
            }
        });
    }));
}

// fs.rename 的异步版本，用于异步剪切文件
async function renameAsync(oldPath, newPath)
{
    return new Promise(((resolve, reject) =>
    {
        fs.rename(oldPath, newPath, (err) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    }));
}

async function rmdirAsync(path)
{
    return new Promise(((resolve, reject) =>
    {
        fs.rmdir(path, (err) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    }));
}

async function unlinkAsync(path)
{
    return new Promise(((resolve, reject) =>
    {
        fs.unlink(path, (err) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    }));
}

// fs.readdir的异步版本，读取文件夹下的所有文件名
async function readDirAsync(path)
{
    return new Promise(((resolve, reject) =>
    {
        fs.readdir(path, (err, files) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(files);
            }
        });
    }));
}

// 删除指定文件夹，不管是否为空
async function removeFolderAsync(path)
{
    if (path[path.length - 1] === '/')//删除末尾的/
    {
        path = path.slice(0, -1);
    }
    return new Promise((async (resolve, reject) =>
    {
        const folderFilesArr = await readDirAsync(path)
            .catch((err) =>
            {
                reject(err);
            });
        for (const fileName of folderFilesArr)
        {
            await unlinkAsync(`${path}/${fileName}`)
                .catch((err) =>
                {
                    reject(err);
                });
        }
        await rmdirAsync(path)
            .catch((err) =>
            {
                reject(err);
            });
        resolve();
    }));
}

module.exports = {
    getUserAsync,
    createFolder,
    isExistAsync,
    headAsync,
    renameAsync,
    unlinkAsync,
    removeFolderAsync
};