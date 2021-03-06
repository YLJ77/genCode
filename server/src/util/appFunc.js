const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const chineseToPinyin = require('chinese-to-pinyin');
const translate = require('../genCode/page/translate.json');
const noop = () => {}

function toPinyin(chinese) {
    return chineseToPinyin(chinese, {keepRest: true,removeTone: true}).split(/\s/)
        .reduce((acc, str) => {
            acc += upCase0(str);
            return acc;
        }, '');
}
function outputFile ({
    outputPath = path.join(__dirname, '../../public/genFile/output'),
    fileName,
    data
                             }) {
    return new Promise((resolve,reject) => {
        function wf() {
            fs.writeFile(`${outputPath}/${fileName}`, data, err => {
                if (err) reject(err);
                resolve();
            })
        }
        if (fs.existsSync(outputPath)) {
            wf();
        } else {
            fs.mkdir(outputPath,{recursive: true}, err => {
                if (err) reject(err);
                wf();
            })
        }
    })
}

function zipFile({
                              onClose = noop,
                              onEnd = noop,
                              onWarning = noop,
                              onError = noop,
                              outputPath,
                              archiveDir
                          }) {
// create a file to stream archive data to.
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    // listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
        debugLog({info: `${archive.pointer()}  total bytes
archiver has been finalized and the output file descriptor has closed.
        `});
        onClose();
    });

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => {
        debugLog({info:'Data has been drained'});
        onEnd();
    });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
        debugLog({info:err});
        onWarning(err);
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

// good practice to catch this error explicitly
    archive.on('error', (err) => {
        debugLog({info:err});
        onError(err);
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(archiveDir, false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
}

/**
 * 将列表字符串转换为key-value对象数组
 * @param list 列表字符串
 * @returns {*[]}
 */
function listToObj(list) {
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

function upCase0(str) {
    return str[0].toUpperCase() + str.slice(1)
}

function downCase0(str) {
    return str[0].toLowerCase() + str.slice(1)
}

/**
 * 删除指定路径下的文件，不删除目录
  * @param path 要删除文件的路劲
 */
function delDirFiles(path) {
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
        if (!fs.statSync(path).isDirectory())fs.rmdirSync(path);
    }
}

function capitalToUnderscore(str) {
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
function debugLog({info, color='red'}) {
    const isObj = typeof info === 'object';
    if (isObj) info = JSON.stringify(info);
    console.log(chalk.yellow('=========debug info========'));
    console.log(chalk[color](info));
    console.log(chalk.yellow('=========debug info========'));
}

function formatOutput({data = {},  msg, code = 0, err} = {}) {
    msg = msg || 'success';
    if (code === 1) msg = '服务器内部错误';
    return {
        data,
        msg: msg || 'success',
        code,
        err
    }
}

function genFormItem({info}) {
    let {label,id,type,required,afterNode} = info;
    type = upCase0(type);
    const placeholder = ['Select','Date'].includes(type) ? 'pleaseSelect': 'pleaseEnter';
    const afterNodeInfo = {key: '',text: ''};
    if (afterNode !== '0' && afterNode !== undefined) {  // 等于1时执行
        [afterNodeInfo.text,afterNodeInfo.key] = afterNode.split('-');
    }
    return `
            {
                type: '${upCase0(type)}',
                controlItemParam: {
                    id: '${id}',
                    label: translate('${id}'),  // ${label}
                    placeholder: translate('${placeholder}'), // ${translate[placeholder]}
                    rules: [${required === '1' ? '{required:true}' : ''}],
                    ${type === 'Select' ? 'data: [],' : ''}
                    ${(afterNode === '0' || afterNode === undefined) ? '' : `afterNode:<YxButton onClick={()=>{}} text={translate('${afterNodeInfo.key}')} /> // ${afterNodeInfo.text}`} 
                }
            },`;
}

module.exports = {
    toPinyin,
    outputFile,
    zipFile,
    listToObj,
    upCase0,
    downCase0,
    delDirFiles,
    capitalToUnderscore,
    debugLog,
    formatOutput,
    genFormItem
}