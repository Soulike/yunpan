# 云盘

简单云盘实现，可用于存储文件与离线下载文件。目前部署于 [https://pan.soulike.tech/](https://pan.soulike.tech/)

---

## 已完成功能

* 用户登录，支持以游客身份登陆
* 文件下载
  * 不暴露静态链接
  * 目前仅支持单线程下载
  * 目前仅支持下载单个文件
* 文件上传

  * 上传进度条显示
  * 文件权限选择

  * 目前仅支持单个文件上传

  * 目前不支持断点续传

* 离线下载

  * 前端
    * 输入其他下载链接并下载到服务器上
    * 文件权限选择
  * 后端
    * 链接可用性检测
      * 依据 Head 方式请求的状态码实现
    * 异步下载

* 删除文件
  * 目前仅支持单个文件删除
* 文件权限划分
  * 公共文件
    * 所有人都可见与下载
    * 仅上传者可删除
  * 非公共文件
    * 仅上传者可见与下载
    * 仅上传者可删除
* 用户权限划分
  * 游客
    * 只能看到公共文件
    * 不允许上传或删除文件
    * 只能下载公共文件
  * 注册用户
    * 可看到公共文件和自己上传的文件
    * 上传文件时可选择是否成为公共文件
    * 可删除自己上传的文件
    * 可下载公共文件与自己上传的非公共文件

## 部署方法

#### 1. 安装依赖

本项目仅能运行于 Linux 上，Windows 不兼容。

本项目依赖 NodeJS，Nginx，也使用了 Supervisor 来进行进程管理。安装方法请参考对应文档。

项目还需要数据库，根据需要修改配置文件中数据库的设置。详细信息可查阅 Sequelize 的文档。

#### 2. 将整个代码仓库克隆到你想要的位置。在代码文件夹下，执行以下命令安装模块

```
npm install
```

#### 3. 根据个人需要，修改以下几个配置文件中的内容。这里我挑出需要根据个人需求修改的片段

##### /server/config.js

```js
// koa-session 的配置
const SESSION_CONFIG = {
    key: 'sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 3600 * 1000,
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

// 服务器监听的本地端口
const PORT = 8002;

// 各种文件的存储路径
const PATH = {
    SERVER_FILES_PATH: `${os.homedir()}/servers/yunpan`,    // 项目文件存储位置
    PATH_BASE: `${os.homedir()}/panStorage`,    // 云盘文件存储位置
    UPLOAD_TEMP_PATH: `${os.homedir()}/panStorage/uploadTemp`   // 上传文件所需临时空间地址
};

// 杂项，用于 Supervisor 重启进程，如果不使用 Supervisor 可以删除
const NAME = {
    SUPERVISOR: 'pan'    // 你的 Supervisor 进程配置文件当中指定的进程名字
};

// Git WebHook 用密码，不用可删除
const GIT_WEBHOOK_PASSWORD = 'your_wenhook_password';

// 数据库配置
const DATABASE = {
    HOST: '1.1.1.1',                // 你的数据库服务器 IP
    DATABASE_NAME: 'user',          // 你的数据库名字
    USERNAME: 'your_username',      // 你的数据库用户名
    PASSWORD: 'your_password',      // 你的数据库密码
    DATABASE_DIALECT: 'postgres'    // 你的数据库方言
};
```

##### server/router/modules/git.js

这个路由用于利用 GitHub 的 WebHook 自动更新文件并重启服务器。如果没有此需求可以无视该文件。

POST 到路由 [http://your\_domain/server/git/update](http://your_domain/server/git/update)

```js
router.post(prefix('/update'), async (ctx, next) =>
    {
        try
        {
            const {password} = ctx.request.body;    // WebHook 的密码
            if (password !== config.GIT_WEBHOOK_PASSWORD)    // 如果密码不一致，则是非法请求，忽略
            {
                ctx.body = 'Invalid password.';
            }
            else
            {
                ctx.body = 'Update message received';
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
                            log(`Error when installing server modules.\n${npmStderr}`);
                        }


                        // 使用 Supervisor 重启进程的部分，不使用 Supervisor 可以删除或修改为你需要的命令

                        log(`Restarting server daemon.`);
                        const {stderr: execStderr} = await asyncFunctions.execAsync(`supervisorctl restart ${config.NAME.SUPERVISOR}`);
                        if (execStderr)
                        {
                            log(`Error when restarting server daemon.\n${execStderr}`);
                        }


                        // 使用 Supervisor 重启进程的部分到这里结束



                    });
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
```

##### static/scripts/origin/config.js

```js
const DOMAIN = 'your_domain';    // 你的所有请求要送到的域名
```

#### 4. Nginx 配置文件

静态网页交给 Nginx 来负责，Nginx 也负责转发所有需要 Node 处理的请求（如果处理请求的域名和静态网页的域名不同，那么可不配置转发）。

在 /etc/nginx/conf.d 下添加一个文件，例如这里为 pan.conf，内容为

```
server {
    server_name  your_domain;    # 你的静态文件域名

    charset utf-8;
    #access_log  /var/log/nginx/log/host.access.log  main;

    location / {
        root    your_path_of_files/static/;    # root 指向你的项目文件夹下 static 文件夹
        index   index.html index.htm;
    }

    # 所有 /server 路由下的请求转发到 Node 监听的端口（这里以 3000 为例），连带 URI 与查询字符串
    location /server {
        proxy_http_version 1.1;
        proxy_pass http://127.0.0.1:3000$uri?$args;
    }
}
```

#### 5. （可选）配置 Supervisor

Supervisor 如何添加一个进程可以参考官方文档。这里唯一需要注意的一点是，如果在配置文件中`[program:pan]`这一行你将 pan 修改为其他的名字，那么一定要对应修改 /server/config.js 文件里的 NAME 字段。

#### 6. 启动服务器

##### 执行以下命令启动静态服务器

```bash
sudo nginx -s reload
```

##### （可选）如果使用 Supervisor 且进程名没有更改（仍然为 pan），执行

```bash
supervisorctl start pan
```

如果改变了进程名，将 pan 替换为对应的名字即可。

如果使用了其他的进程管理软件，参考其对应用法来进行管理。

