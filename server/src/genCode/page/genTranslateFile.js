const fs = require('fs');
const path = require('path');

module.exports.genTranslateFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel} = cfg;
        let {fileName} = global;
        fileName = fileName[0].toUpperCase() + fileName.slice(1);  // 首字母大写
        const translate = {};
        ({headerTitle: translate.headerTitle} = panel);
        let data = {
            "resultCode": 0,
            "resultMsg": "",
            "data": {
                ...translate
            }
        }
        data = JSON.stringify(data);
        await fs.writeFile(path.join(__dirname, `../output/${fileName}.json`), data, err => {
            reject(err);
        })
        resolve();
    })
}
