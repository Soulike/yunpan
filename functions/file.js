'use strict';
const asyncFunction = require('./asyncFunctions');
const request = require('request');
const fs = require('fs');
const {URL} = require('url');
const path = require('path');
const FILE_PATH = '../../static';
const DOWNLOAD_PATH = 'https://static.soulike.tech';

//异步的下载文件。在下载完成之后将会返回文件的文件名以及下载地址
async function download(fileUrl)
{
    return new Promise((resolve, reject) =>
    {
        const urlObj = new URL(fileUrl);
        const filePath = urlObj.pathname;
        const fileName = path.basename(filePath);//获取文件名
        const writeStream = fs.createWriteStream(`${FILE_PATH}/${fileName}`);//创建管道准备接收文件
        request({
            uri: fileUrl,
            method: 'GET',
            timeout: 20000
        })
            .pipe(writeStream)
            .on('close', () =>
            {
                resolve({
                    name: fileName,
                    url: `${DOWNLOAD_PATH}/${fileName}`
                });
            })
            .on('error', (err) =>
            {
                reject(err);
            });
    });
}


module.exports = {download};