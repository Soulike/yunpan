'use strict';
$(() =>
{
    const $loginForm = $('#loginForm');
    const $email = $('#email');
    const $password = $('#password');

    $loginForm.submit(async (e) =>
    {
        e.preventDefault();
        const email = $email.val();
        const password = $password.val();

        let status = inputIsValid($email, REGEXP.EMAIL.test(email)) && inputIsValid($password);
        if (!status)
        {
            return false;
        }
        else
        {
            const pass1 = new jsSHA('SHA-256', 'TEXT');
            const pass2 = new jsSHA('SHA-256', 'TEXT');
            pass1.update(email);
            pass2.update(password);

            /*
             const data = {
             email: email,
             pass1: pass1.getHash('HEX'),
             pass2: pass2.getHash('HEX')
             };
             AJAX('/user/login', data,
             (res) =>
             {
             const {status, msg, data} = res;
             showAlert(msg, status);
             if (status)
             {
             location.href = 'fileList.html';
             }
             },
             (err) =>
             {
             showAlert(MSG.ERROR);
             console.log(err);
             });*/

            try
            {
                const res = await postAsync('/user/login', {
                    email: email,
                    pass1: pass1.getHash('HEX'),
                    pass2: pass2.getHash('HEX')
                });
                const {status, msg, data} = res;
                showAlert(msg, status);
                if (status)
                {
                    location.href = 'fileList.html';
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