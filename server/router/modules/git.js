const asyncFunctions = require('../../functions/asyncFunctions');
const config = require('../../config');
const {log} = require('../../functions/log');

const prefix = (router) =>
{
    return `/server/git${router}`;
};

module.exports = (router) =>
{
    router.post(prefix('/update'), async (ctx, next) =>
    {
        try
        {
            asyncFunctions.gitUpdateAsync(config.PATH.SERVER_FILES_PATH)
                .then(async (std) =>
                {
                    const {stdout, stderr} = std;
                    log(`Server files update detected.\n${stdout}`);
                    if (stderr)
                    {
                        log(`Error when updating through git.\n${stderr}`);
                    }

                    const {stdout: npmStdout, stderr: npmStderr} = await asyncFunctions.execAsync('npm install', {cwd: config.PATH.SERVER_FILES_PATH});
                    log(`Server modules installing.\n${npmStdout}`);
                    if (npmStderr)
                    {
                        log(`Error when installing server modules.\n${stderr}`);
                    }

                    log(`Restarting server daemon.`);
                    const {stderr: execStderr} = await asyncFunctions.execAsync(`supervisorctl restart ${config.NAME.SUPERVISOR}`);
                    if (execStderr)
                    {
                        log(`Error when restarting server daemon.\n${execStderr}`);
                    }
                });
        }
        catch (e)
        {
            log(`Error when updating through git.\n${e}`);
        }
        finally
        {
            ctx.body = 'Update message received';
            await next();
        }
    });
};
