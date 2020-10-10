const commonTranslate = require('./translate.json');
const {upCase0, listToObj,outputFile} = require('../../util/appFunc');

module.exports.genTranslateFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel,table,modal} = cfg;
        let {fileName} = global;
        fileName = upCase0(fileName);  // 首字母大写
        const panelListT = listToObj(panel.fieldList).reduce((acc, entry) => {
            const {label,id} = entry;
            acc[id] = label;
            return acc;
        }, {});
        const columnsT = listToObj(table.columns)
            .filter(entry => entry.title !== '序号')
            .reduce((acc, entry) => {
                const {title,dataIndex,actionBtns} = entry;
                acc[dataIndex] = title;
                if (title === '操作') {
                    actionBtns.split('/').forEach(entry => {
                        const [,text,key] = entry.split('-');
                        acc[key] = text;
                    })
                }
                return acc;
            }, {});
        const batchBtnsT = listToObj(table.batchBtns).reduce((acc,entry) => {
            const {text,key} = entry;
            acc[key] = text;
            return acc;
        },{});
        const tabListT = listToObj(global.tabList).reduce((acc,entry) => {
            const {tab,key} = entry
            acc[key] = tab;
            return acc;
        },{})
        const translate = {};
        ({
            panelTitle: translate.panelTitle,
        } = panel);
        if (modal.title) translate[fileName] = modal.title;
        let data = {
            "resultCode": 0,
            "resultMsg": "",
            "data": {
                ...(modal.title ? {} : commonTranslate),
                ...panelListT,
                ...columnsT,
                ...batchBtnsT,
                ...tabListT,
                ...translate
            }
        }
        data = JSON.stringify(data);
        const err = await outputFile({fileName: `${fileName}.json`, data});
        resolve({err,data});
    })
}
