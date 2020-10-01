const fs = require('fs');
const path = require('path');
const commonTranslate = require('./translate.json');
const {upCase0, listToObj} = require('../../util/appFunc');

module.exports.genTranslateFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel} = cfg;
        let {fileName} = global;
        fileName = upCase0(fileName);  // 首字母大写
        const panelListT = listToObj(panel.fieldList).reduce((acc, entry) => {
            const {label,id} = entry;
            acc[id] = label;
            return acc;
        }, {});
        const translate = {};
        ({
            panelTitle: translate.panelTitle,
        } = panel);
        let data = {
            "resultCode": 0,
            "resultMsg": "",
            "data": {
                ...commonTranslate,
                ...panelListT,
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
