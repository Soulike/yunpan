'use strict';
const REGEXP = {
    EMAIL: /^[0-9A-z]+@([0-9A-z]+\.)+[0-9A-z]+$/,
    URL: /^https?:\/\/([A-z0-9\-]+\.)*[A-z0-9\-]+\.[A-z0-9]+(\/.+)+$/
};

const DOMAIN = 'pan.soulike.tech';

const MSG = {
    ERROR: '网络异常，请重试'
};