'use strict';

function log(message)
{
    const date = new Date();
    console.log(`${date.getFullYear()}-${prependZero(date.getMonth() + 1)}-${prependZero(date.getDate())} ${prependZero(date.getHours())}:${prependZero(date.getMinutes())} ${message}`);
}

/*当num小于10的时候加前缀并返回,否则原样返回*/
function prependZero(num)
{
    num = parseInt(num);
    if (num < 10)
    {
        return `0${num}`;
    }
    else
    {
        return num;
    }
}

module.exports = {log};