'use strict';
const asyncFunction = require('./asyncFunctions');
const request = require('request');
const fs = require('fs');
const {URL} = require('url');
const path = require('path');

//异步的下载文件到localFolder中。在下载前先创建目录，返回文件名
async function downloadAsync(fileUrl, localFolder)
{
    return new Promise(async (resolve, reject) =>
    {
        const urlObj = new URL(fileUrl);
        const filePath = urlObj.pathname;
        let fileName = path.basename(filePath);//获取文件名
        await asyncFunction.createFolder(localFolder)
            .catch((err) =>
            {
                reject(err);
            });
        if (await asyncFunction.isExistAsync(`${localFolder}/${fileName}`))//如果文件已经存在，则从(2)开始尝试
        {
            const {ext,name} = path.parse(fileName);
            for (let i = 2; ; i++)
            {
                if (!(await asyncFunction.isExistAsync(`${localFolder}/${name}(${i})${ext}`)))
                {
                    fileName = `${name}(${i})${ext}`;
                    break;
                }
            }
        }
        const writeStream = fs.createWriteStream(`${localFolder}/${fileName}`);//创建管道准备接收文件
        request({
            uri: fileUrl,
            method: 'GET',
            timeout: 20000
        })
            .pipe(writeStream)
            .on('close', () =>
            {
                resolve(fileName);
            })
            .on('error', (err) =>
            {
                reject(err);
            });
    });
}

// 查看文件的大小
async function getFileSizeAsync(filePath)
{
    return new Promise(((resolve, reject) =>
    {
        fs.stat(filePath, (err, stats) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(stats.size);
            }
        });
    }));
}


module.exports = {
    downloadAsync,
    getFileSizeAsync
};