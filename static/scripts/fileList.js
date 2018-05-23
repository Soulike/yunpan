/* 离线下载模块
 * 前端发送信息:
 * {
 *     link: 'balabala',
 *     isPublic: true
 * }
 * 路由：/server/offlineDownload/downloadLink
 *
 * */
$(() =>
{
    const $offlineDownloadLink = $('#offlineDownloadLink');
    const $offlineDownloadIsPublicCheckbox = $('#offlineDownloadIsPublicCheckbox');
    const $offlineDownloadModalBtn = $('#offlineDownloadModalBtn');
    const $offlineDownloadModal = $('#offlineDownloadModal');

    $offlineDownloadModalBtn.click((e) =>
    {
        e.preventDefault();
        const link = $offlineDownloadLink.val();
        const isPublic = $offlineDownloadIsPublicCheckbox.prop('checked');

        if (!REGEXP.URL.test(link))
        {
            setElementClass($offlineDownloadLink, 'is-invalid');
            showAlert('输入链接无效');
        }
        else
        {
            AJAX('/offlineDownload/downloadLink', {
                link: link,
                isPublic: isPublic
            }, (res) =>
            {
                const {status, msg, data} = res;
                showAlert(msg, status);
                if (status)
                {
                    $offlineDownloadLink.val('');
                    hideModal($offlineDownloadModal);
                }
            }, (err) =>
            {
                showAlert(MSG.ERROR);
                console.log(err);
            });
        }
    });

});


/*文件列表获取模块*/

/*访问服务器，获取最新文件列表。返回值
 * [
 *       {id,fileName,fileSize,createAt},
 *       {id,fileName,fileSize,createAt},
 *       {id,fileName,fileSize,createAt}
 * ]
 * 如果请求发生错误，返回null
 * */

function refreshFileList()
{
    const getFileList = () =>
    {
        AJAX('/user/getFileList', {},
            (res) =>
            {
                const {status, msg, data} = res;
                if (!status)
                {
                    showAlert(msg);
                    return null;
                }
                else
                {
                    console.log(data);
                    return data.fileList;
                }
            },
            (err) =>
            {
                showAlert(MSG.ERROR);
                console.log(err);
                return null;
            });
    };
    const getFileRow = (fileId, fileName, fileSize, createdAt) =>
    {
        return $(`<tr>
                    <td><input type="radio" data-fileID="${fileId}"></td>
                    <td>${fileName}</td>
                    <td>${(fileSize / 1024 / 1024).toFixed(2)} M</td>
                    <td>${parseTimeString(createdAt)}</td>
                </tr>`);
    };

    const fileList = getFileList();
    if (!Object.is(fileList, null))
    {
        const $fileListBody = $('#fileListBody');
        $fileListBody.html('');
        for (const file of fileList)
        {
            $fileListBody.append(getFileRow(file.id, file.fileName, file.fileSize, file.createAt));
        }
    }
}

/*网页加载请求文件列表*/
$(() =>
{
    refreshFileList();
});

/*刷新按钮*/
$(() =>
{
    const $refreshFileListBtn = $('#refreshFileListBtn');
    $refreshFileListBtn.click((e) =>
    {
        e.preventDefault();
        refreshFileList();
    });
});