const chalk = require('chalk');
const fs = require('fs');

/**
 * 将列表字符串转换为key-value对象数组
 * @param list 列表字符串
 * @returns {*[]}
 */
module.exports.listToObj = list => {
    return list.replace(/_|\n/g,'').split(',').reduce((acc,entry,idx,arr) => {
        const item = entry.split('|').reduce((attrs,entry) => {
            const [key,val] = entry.split(':');
            attrs[key] = val;
            return attrs;
        }, {});
        acc.push(item);
        return acc;
    }, []);
}

module.exports.upCase0 = str => str[0].toUpperCase() + str.slice(1)

module.exports.delDirFiles = function delDirFiles(path) {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDirFiles(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        // fs.rmdirSync(path);
    }
}

module.exports.capitalToUnderscore = str => {
    str = str.split('').reduce((acc,letter,index) => {
        if (/^[A-Z]$/.test(letter) && index !== 0) {
            acc += '_' + letter;
        } else {
            acc += letter;
        }
        return acc;
    }, '');
    return str.toLowerCase();
}
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