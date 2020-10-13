const {capitalToUnderscore,outputFile} = require('../../util/appFunc');

module.exports.genLessFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global} = cfg;
        let {fileName} = global;
        fileName = fileName[0].toUpperCase() + fileName.slice(1);  // 首字母大写
        const pageId = capitalToUnderscore(fileName[0].toLowerCase() + fileName.slice(1));
        let data = `#${pageId} {
        }
        :global {
            #__yx_widget .yx_YxDynamicFormNoneGrid .yx_yxInput_width_datesm {
                width: 224px;
            }
        }`;
        const err = await outputFile({fileName: `${fileName}Less.less`, data});
        resolve({err,data});
    })
}
