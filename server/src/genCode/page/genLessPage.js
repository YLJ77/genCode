const fs = require('fs');
const path = require('path');

module.exports.genLessPage = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        cfg.fileName = cfg.fileName[0].toUpperCase() + cfg.fileName.slice(1);  // 首字母大写
        let data = ``;
        await fs.writeFile(path.join(__dirname, `../output/${cfg.fileName}Less.less`), data, err => {
            reject(err);
        })
        resolve();
    })
}
