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

    $offlineDownloadModalBtn.click(async (e) =>
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
            try
            {
                const res = await postAsync('/offlineDownload/downloadLink', {
                    link: link,
                    isPublic: isPublic
                });
                const {status, msg} = res;
                showAlert(msg, status);
                if (status)
                {
                    $offlineDownloadLink.val('');
                    hideModal($offlineDownloadModal);
                }
            }
            catch (e)
            {
                showAlert(MSG.ERROR);
                console.log(e);
            }
        }
    });

});

/*网页加载请求文件列表与邮箱*/
$(async () =>
{
    try
    {
        await Promise.all([getFileListAsync(), getLoginEmailAsync()]);
    }
    catch (e)
    {
        console.log(e);
    }
});

/*刷新按钮*/
$(() =>
{
    const $refreshFileListBtn = $('#refreshFileListBtn');
    $refreshFileListBtn.click(async (e) =>
    {
        e.preventDefault();
        await getFileListAsync();
    });
});

/*文件上传*/
$(() =>
{
    const $uploadControl = $('#uploadControl');
    const $uploadProgressBar = $('#uploadProgressBar');
    const $uploadIsPublicCheckbox = $('#uploadIsPublicCheckbox');
    const $uploadModalBtn = $('#uploadModalBtn');

    $uploadModalBtn.click(async (e) =>
    {
        e.preventDefault();
        $uploadControl.prop('disabled', true);//上传期间，表单关闭
        let formData = new FormData;
        for (let i = 0; i < $uploadControl[0].files.length; i++)
        {
            formData.append(`file`, $uploadControl[0].files[i]);
        }
        formData.append('isPublic', $uploadIsPublicCheckbox.prop('checked'));
        try
        {
            const res = await postAsync('/upload', formData, {
                onUploadProgress: event =>
                {
                    if (event.lengthComputable)
                    {
                        let percent = event.loaded / event.total * 100;
                        $uploadProgressBar.css('width', percent + '%');
                    }
                }
            });

            const {status, msg} = res;
            showAlert(msg, status);
            await getFileListAsync();
        }
        catch (e)
        {
            showAlert(MSG.ERROR);
            console.log(e);
        }
        finally
        {
            $uploadControl.prop('disabled', false);
        }
    });
});

/*Modal隐藏时reset所有表单*/
$(() =>
{
    const $modal = $('.modal');
    const $uploadControl = $('#uploadControl');
    const $uploadProgressBar = $('#uploadProgressBar');
    $modal.on('hidden.bs.modal', (e) =>
    {
        if (!Object.is($(e.target).find('form')[0], undefined))
        {
            $(e.target).find('form')[0].reset();
            $uploadProgressBar.css('width', '0' + '%');
        }
    });
    // 在表单改变时清空进度条
    $uploadControl.change(() =>
    {
        $uploadProgressBar.css('width', '0' + '%');
    });
});

/*下载文件*/
$(() =>
{
    const $downloadBtn = $('#downloadBtn');

    $downloadBtn.click(async (e) =>
    {
        e.preventDefault();
        const $selected = $('input[type=radio]:checked');
        if ($selected.length === 0)
        {
            showAlert('请选择要下载的文件');
        }
        else if ($selected.length > 1)
        {
            showAlert('你怎么选中多个文件的，作弊了吧');
        }
        else
        {
            const fileId = $selected.attr('data-fileid');
            try
            {
                const res = await getAsync('/download/getDownloadLink', {fileId: fileId});
                const {status, msg, data} = res;
                showAlert(msg, status);
                if (status)
                {
                    download(data.downloadLink);
                }
            }
            catch (e)
            {
                showAlert(MSG.ERROR);
                console.log(e);
            }
        }
    });
});

/*删除文件*/
$(() =>
{
    const $deleteBtn = $('#deleteBtn');
    const $deleteModal = $('#deleteModal');
    const $deleteModalBtn = $('#deleteModalBtn');
    const $deleteFileName = $('#deleteFileName');
    let $selected = null;

    $deleteBtn.click((e) =>
    {
        e.preventDefault();
        $selected = $('input[type=radio]:checked');
        if ($selected.length === 0)
        {
            showAlert('请选择要删除的文件');
        }
        else if ($selected.length > 1)
        {
            showAlert('你怎么选中多个文件的，作弊了吧');
        }
        else
        {
            const $fileName = $selected.parent().siblings('.fileName');
            $deleteFileName.text($fileName.text());
            $deleteModal.modal('show');
        }
    });

    $deleteModalBtn.click(async (e) =>
    {
        e.preventDefault();
        const fileId = $selected.attr('data-fileid');
        try
        {
            const res = await postAsync('/delete', {fileId: fileId});
            const {status, msg} = res;
            showAlert(msg, status);
            $deleteModal.modal('hide');
            await getFileListAsync();
        }
        catch (e)
        {
            showAlert(MSG.ERROR);
            console.log(e);
        }
    });
});