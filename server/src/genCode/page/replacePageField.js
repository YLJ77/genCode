const {listToObj,outputFile,toPinyin} = require('../../util/appFunc');
const fs = require('fs');
const path = require('path');

module.exports.replacePageField = ({cfg,files}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {panel,table} = cfg;
        const panelList = panel.fieldList === '' ? [] : listToObj(panel.fieldList).map(entry => {
            let {label, id} = entry;
            return {replaceStr:id, originStr: `panelId${toPinyin(label)}`};
        });
        const columns = table.columns === '' ? [] : listToObj(table.columns).map(entry => {
            let {title,dataIndex} = entry;
            return {replaceStr:dataIndex, originStr: `tableIdx${toPinyin(title)}`};
        });
        const fieldList = [...panelList,...columns].filter(entry => entry.replaceStr !== entry.originStr);
        files.forEach(file => {
            const {filename:fileName,originalname:originalName} = file;
            let data = fs.readFileSync(path.join(__dirname, `../../../public/upload/${fileName}`));
            data = data.toString();
            data = fieldList.reduce((acc,field) => {
                const {originStr,replaceStr} = field;
                acc = acc.replace(originStr,replaceStr);
                return acc;
            }, data);
            fs.writeFileSync(path.join(__dirname, `../../../public/genFile/output/${originalName}`),data);
        })
        resolve();
    })
}
