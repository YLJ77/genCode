const commonTranslate = require('./translate.json');
const {upCase0,downCase0, listToObj,outputFile} = require('../../util/appFunc');
const Page = require('../../db/models/page');

async function getRefPages(cfg) {
    const {global:{router,fileName}} = cfg;
    return await Page.find({
        pageCfg: {
            $regex: new RegExp(`"router":"${router}"`, 'gim'), // 相同的语言包路径
            $not: {
                $regex: new RegExp(`"fileName":"${fileName}"`,'gim')  // 非当前文件
            }
        }
    })
}

function getTranslate({data,key = 'key',txtKey}) {
    return listToObj(data).reduce((acc, entry) => {
        acc[entry[key]] = entry[txtKey];
        return acc;
    }, {});
}

module.exports.genTranslateFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel,table,modal = {}} = cfg;
        let {fileName} = global;
        const refPages = await getRefPages(cfg);
        const refPageT = refPages.reduce((acc, page) => {
            const translate = JSON.parse(page.translate);
            acc = {...translate.data,...acc};
            return acc;
        }, {});
        fileName = upCase0(fileName);  // 首字母大写
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
        const paneTitleT = getTranslate({data: panel.panelTitle,txtKey: 'title'});
        const panelListT = getTranslate({data: panel.fieldList,key:'id',txtKey: 'label'});
        const batchBtnsT = getTranslate({data: table.batchBtns,txtKey: 'text'});
        const tabListT = getTranslate({data: global.tabList,txtKey: 'tab'});
        const translate = {};
        if (modal.title) translate[downCase0(fileName)] = modal.title;
        let data = {
            "resultCode": 0,
            "resultMsg": "",
            "data": {
                ...(modal.title ? {} : commonTranslate),
                ...panelListT,
                ...paneTitleT,
                ...columnsT,
                ...batchBtnsT,
                ...tabListT,
                ...translate,
                ...refPageT
            }
        }
        data = JSON.stringify(data);
        const err = await outputFile({fileName: `${fileName}.json`, data});
        resolve({err,data});
    })
}
