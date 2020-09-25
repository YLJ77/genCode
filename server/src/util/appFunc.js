module.exports.formatOutput = ({data,  msg}) => {
    return {
        data,
        msg,
        code: data ? 1 : 0
    }
};