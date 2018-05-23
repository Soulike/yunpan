'use strict';
const db = require('../../database');
const config = require('../../config');
const {log} = require('../../functions/log');
const {response} = config;

const prefix = (router) =>
{
    return `/server/download${router}`;
};