const chalk = require('chalk');

module.exports.debugLog = ({info, color='red'}) => {
    const isObj = typeof info === 'object';
    if (isObj) info = JSON.stringify(info);
    console.log(chalk.yellow('=========debug info========'));
    console.log(chalk[color](info));
    console.log(chalk.yellow('=========debug info========'));
}
module.exports.formatOutput = ({data = {},  msg, code = 0} = {}) => {
    msg = msg || 'success';
    if (code === 1) msg = '服务器内部错误';
    return {
        data,
        msg: msg || 'success',
        code
    }
};