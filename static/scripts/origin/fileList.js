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

/*网页加载请求文件列表与邮箱*/
$(() =>
{
    getFileList();
    getLoginEmail();
});

/*刷新按钮*/
$(() =>
{
    const $refreshFileListBtn = $('#refreshFileListBtn');
    $refreshFileListBtn.click((e) =>
    {
        e.preventDefault();
        getFileList();
    });
});

/*文件上传*/
$(() =>
{
    const $uploadControl = $('#uploadControl');
    const $uploadProgressBar = $('#uploadProgressBar');
    const $uploadIsPublicCheckbox = $('#uploadIsPublicCheckbox');
    const $uploadModalBtn = $('#uploadModalBtn');

    $uploadModalBtn.click((e) =>
    {
        e.preventDefault();
        $uploadControl.prop('disabled', true);//上传期间，表单关闭
        let formData = new FormData;
        for (let i = 0; i < $uploadControl[0].files.length; i++)
        {
            formData.append(`file`, $uploadControl[0].files[i]);
        }
        formData.append('isPublic', $uploadIsPublicCheckbox.prop('checked'));
        $.ajax(
            {
                xhrFields: {
                    withCredentials: true
                },
                url: `https://${DOMAIN}/server/upload`,
                method: 'post',
                data: formData,
                processData: false,
                contentType: false,
                async: false,
                success: (res) =>
                {
                    const {status, msg} = res;
                    showAlert(msg, status);
                    $uploadControl.prop('disabled', false);
                    getFileList();
                },
                error: (err) =>
                {
                    showAlert(MSG.ERROR);
                    $uploadControl.prop('disabled', false);
                    console.log(err);
                },
                xhr: function ()
                {
                    //获取ajaxSettings中的xhr对象，为它的upload属性绑定progress事件的处理函数
                    let myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload)
                    { //检查upload属性是否存在
                        myXhr.upload.addEventListener('progress', function (event)//绑定progress事件的回调函数
                        {
                            if (event.lengthComputable)
                            {
                                let percent = event.loaded / event.total * 100;
                                $uploadProgressBar.css('width', percent + '%');
                                $uploadControl.change(() =>
                                {
                                    $uploadProgressBar.css('width', '0' + '%');
                                });
                            }
                        }, false);
                    }
                    return myXhr; //xhr对象返回给jQuery使用
                }
            });
    });
});

/*Modal隐藏时reset所有表单*/
$(() =>
{
    const $modal = $('.modal');
    const $uploadProgressBar = $('#uploadProgressBar');
    $modal.on('hidden.bs.modal', (e) =>
    {
        if (!Object.is($(e.target).find('form')[0], undefined))
        {
            $(e.target).find('form')[0].reset();
            $uploadProgressBar.css('width', '0' + '%');
        }
    });
});

/*下载文件*/
$(() =>
{
    const $downloadBtn = $('#downloadBtn');

    $downloadBtn.click((e) =>
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
            AJAX('/download/getDownloadLink', {fileId: fileId},
                (res) =>
                {
                    const {status, msg, data} = res;
                    showAlert(msg, status);
                    download(data.downloadLink);
                },
                (err) =>
                {
                    showAlert(MSG.ERROR);
                    console.log(err);
                });
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

    $deleteModalBtn.click((e) =>
    {
        e.preventDefault();
        const fileId = $selected.attr('data-fileid');
        AJAX('/delete', {fileId: fileId},
            (res) =>
            {
                const {status, msg, data} = res;
                showAlert(msg, status);
                $deleteModal.modal('hide');
                getFileList();
            },
            (err) =>
            {
                showAlert(MSG.ERROR);
                console.log(err);
            });
    });
});