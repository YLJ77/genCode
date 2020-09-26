module.exports.formatOutput = ({data = {},  msg, code = 0} = {}) => {
    msg = msg || 'success';
    if (code === 1) msg = '服务器内部错误';
    return {
        data,
        msg: msg || 'success',
        code
    }
};