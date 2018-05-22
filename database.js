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
    }
});

const User = userDb.define('account',
    {
        email: {
            type: Sequelize.STRING,
            unique: true
        },
        password: {type: Sequelize.STRING}
    });


module.exports = {
    userDb,
    User
};