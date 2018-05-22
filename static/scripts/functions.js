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
    transform: translate(-50%,-50%);`;

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

function AJAX(suffix, data, successFunction, errorFunction, async = true)
{
    $.ajax(
        {
            xhrFields: {
                withCredentials: true
            },
            contentType: 'application/json',
            timeout: 2000,
            async: async,
            dataType: 'json',
            url: `https://${DOMAIN}/server${suffix}`,
            method: 'post',
            data: JSON.stringify(data),
            success: successFunction,
            error: errorFunction
        });
}