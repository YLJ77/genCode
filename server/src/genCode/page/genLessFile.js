const fs = require('fs');
const path = require('path');
const {capitalToUnderscore,outputFile} = require('../../util/appFunc');

module.exports.genLessFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel} = cfg;
        let {fileName} = global;
        fileName = fileName[0].toUpperCase() + fileName.slice(1);  // 首字母大写
        const pageId = capitalToUnderscore(fileName[0].toLowerCase() + fileName.slice(1));
        let data = `#${pageId} {
        }`;
        const err = await outputFile({fileName: `${fileName}Less.less`, data});
        resolve(err);
    })
}
