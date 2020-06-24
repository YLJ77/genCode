module.exports.formatOutput = ({data,  type = 'success', msgVisible = false}) => {
    return {
        data,
        code: msgVisible ? 1 : 0
    }
};