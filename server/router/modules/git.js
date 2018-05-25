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
            const {stdout: gitStdout, stderr: gitStderr} = await asyncFunctions.gitUpdateAsync(config.PATH.SERVER_FILES_PATH);
            log(`Server files update detected.\n${gitStdout}`);
            if (gitStderr)
            {
                log(`Error when updating through git.\n${gitStderr}`);
            }
            log(`Restarting server daemon.`);
            const {stderr: execStderr} = await asyncFunctions.execAsync(`supervisorctl restart ${config.NAME.SUPERVISOR}`);
            if (execStderr)
            {
                log(`Error when restarting server daemon.\n${execStderr}`);
            }
        }
        catch (e)
        {
            log(`Error when updating through git.\n${e}`);
        }
        finally
        {
            await next();
        }
    });
};
