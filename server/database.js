'use strict';
const {log} = require('./functions/log');
const Sequelize = require('sequelize');
const userDb = new Sequelize('user', 'postgres', 'Soulike@PostgreSQL', {
    host: '140.82.23.140',
    dialect: 'postgres',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    logging: log
});

const User = userDb.define('account',
    {
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        password: {type: Sequelize.STRING}
    });

const File = userDb.define('file',
    {
        //文件名，包括扩展名
        file_name: {
            type: Sequelize.STRING,
            notNull: true
        },

        // 文件的上传日期，格式为2018.1.2，用于查找下载路径
        upload_date: {
            type: Sequelize.STRING,
            notNull: true
        },

        // 文件的大小，单位是字节
        file_size: {
            type: Sequelize.BIGINT,
            notNull: true
        },

        //这个文件是否是所有人可见的
        is_public: {
            type: Sequelize.BOOLEAN,
            notNull: true,
            defaultValue: false
        },
        //文件所有者的ID，是User表中id的映射
        owner_id: {
            type: Sequelize.INTEGER,
            references: {
                // 这是引用另一个模型
                model: User,
                // 这是引用模型的列名称
                key: 'id',
                // 这声明什么时候检查外键约束。 仅限PostgreSQL。
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        }
    }
);

User.hasMany(File, {
    foreignKey: 'owner_id',
    sourceKey: 'id'
});

module.exports = {
    userDb,
    User,
    File,
    Op: Sequelize.Op
};