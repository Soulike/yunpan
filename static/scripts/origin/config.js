'use strict';
const REGEXP = {
    EMAIL: /^[0-9A-z]+@([0-9A-z]+\.)+[0-9A-z]+$/,
    URL: /^https?:\/\/([A-z0-9\-]+\.)*[A-z0-9\-]+\.[A-z0-9]+(\/.+)+$/
};

const [DOMAIN, PORT] = ['pan.soulike.tech', 80];

const MSG = {
    ERROR: '网络异常，请重试'
};