'use strict';

function setElementClass(selector, className)
{
    const $element = $(selector);
    $element.addClass(className);
}

function removeElementClass(selector, className)
{
    const $element = $(selector);
    $element.removeClass(className);
}

function inputIsValid(inputSelector, isValid = true)
{
    if (!isValid)
    {
        removeElementClass(inputSelector, 'is-valid');
        setElementClass(inputSelector, 'is-invalid');
    }
    else
    {
        removeElementClass(inputSelector, 'is-invalid');
        setElementClass(inputSelector, 'is-valid');
    }
    return isValid;
}

function showAlert(content, isSuccess = false)
{
    const $body = $('body');
    const alertStyle = `
	display: none;
	text-align: center;
    width: 50%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 999999999;`;

    const alertType = isSuccess === true ? 'alert-success' : 'alert-danger';
    const $alert = $(`<div class="alert ${alertType}" role="alert" style="${alertStyle}">
    ${content}
</div>`);

    $body.append($alert);
    $alert.fadeIn(150);
    setTimeout(() =>
    {
        $alert.fadeOut(150, () =>
        {
            $alert.remove();
        });
    }, 1000);
}

function hideModal(selector)
{
    $(selector).modal('hide');
}

function parseTimeString(rawTimeString)
{
    const date = new Date(rawTimeString);
    return `${date.getFullYear()}-${prependZero(date.getMonth() + 1)}-${prependZero(date.getDate())} ${prependZero(date.getHours())}:${prependZero(date.getMinutes())}:${prependZero(date.getSeconds())}`;
}

//当数小于10时，自动补充0
function prependZero(num)
{
    num = parseInt(num);
    return num < 10 ? '0' + num.toString() : num.toString();
}

//创建一个隐形表单下载文件
function download(fileUrl)
{
    const $a = $(`<a><span></span></a>`);
    const $span = $a.children('span');
    const $body = $('body');
    $a.css('display', 'none');
    $a.attr('href', fileUrl);
    $body.append($a);
    $span.click();
    $a.remove();
}


/*访问服务器，获取最新文件列表。返回值
 * [
 *       {id,fileName,fileSize,createAt},
 *       {id,fileName,fileSize,createAt},
 *       {id,fileName,fileSize,createAt}
 * ]
 * 如果请求发生错误，返回null
 * */

async function getFileListAsync()
{
    const getFileRow = (fileId, fileName, fileSize, createdAt) =>
    {
        return $(`<tr class="fileListRow">
                    <td><input type="radio" data-fileID="${fileId}"></td>
                    <td class="fileName">${fileName}</td>
                    <td>${(fileSize / 1024 / 1024).toFixed(2)} M</td>
                    <td>${parseTimeString(createdAt)}</td>
                </tr>`);
    };

    return new Promise((async (resolve, reject) =>
    {
        try
        {
            const res = await getAsync('/user/getFileList');
            const {status, msg, data} = res;
            if (!status)
            {
                showAlert(msg);
            }
            else
            {
                const fileList = data.fileList;
                if (!Object.is(fileList, null))
                {
                    const $fileListBody = $('#fileListBody');
                    $fileListBody.html('');
                    for (const file of fileList)
                    {
                        $fileListBody.append(getFileRow(file.id, file.fileName, file.fileSize, file.createdAt));
                    }
                    enableRatios();
                }
            }
            resolve();
        }
        catch (e)
        {
            showAlert(MSG.ERROR);
            reject(e);
        }
    }));
}

async function getLoginEmailAsync()
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const $loginEmail = $('#loginEmail');
            const res = await getAsync('/user/getLoginEmail');
            const {status, msg, data} = res;
            if (!status)
            {
                showAlert(msg);
            }
            else
            {
                const {email} = data;
                $loginEmail.text(email);
            }
            resolve();
        }
        catch (e)
        {
            showAlert(MSG.ERROR);
            reject(e);
        }

    });
}

/*在点击行时，可以选中对应行的radio*/
function enableRatios()
{
    const $fileListRow = $('.fileListRow');
    $fileListRow.click((e) =>
    {
        $fileListRow.find('input[type=radio]').prop('checked', false);//清除所有其他radio
        $(e.target).parent().find('input[type=radio]').prop('checked', true);//把当前行radio选中
    });
}

async function getAsync(suffix, paramsObj = {}, config = {})
{
    return new Promise(((resolve, reject) =>
    {
        axios
            .get(`/server/${suffix}`, {params: paramsObj}, config)
            .then((res) =>
            {
                resolve(res.data);
            })
            .catch((err) =>
            {
                reject(err);
            });
    }));
}

async function postAsync(suffix, dataObj = {}, config = {})
{
    return new Promise(((resolve, reject) =>
    {
        axios
            .post(`/server/${suffix}`, dataObj, config)
            .then((res) =>
            {
                resolve(res.data);
            })
            .catch((err) =>
            {
                reject(err);
            });
    }));
}