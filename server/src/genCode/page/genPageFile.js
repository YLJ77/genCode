const {genServeFile,genFormPageFile,genListPageFile,genLessFile,genTranslateFile,genModFile} = require("./index");
const {delDirFiles, zipFile, upCase0} = require('../../util/appFunc');
const path = require('path');

module.exports.genPageFile = ({cfg}) => {
    return new Promise(async resolve => {
        const archivePath = path.join(__dirname, '../../../public/genFile/output');
        const outputPath = path.join(__dirname, '../../../public/genFile');
        const config = JSON.parse(cfg.pageCfg);
        const {global} = config;
        let {fileName, pageType = 'listPage'} = global;
        const pageTypeMapAction = {
            listPage: genListPageFile,
            formPage: genFormPageFile
        };
        fileName = upCase0(fileName);  // 首字母大写
        delDirFiles(outputPath);
        const {data:translate, err: translateErr} = await genTranslateFile({cfg});
        const {data:serv, err: serveErr} = await genServeFile({cfg});
        const {data:less, err: lessErr} = await genLessFile({cfg});
        const {data:view, err: viewErr} = await pageTypeMapAction[pageType]({cfg});
        const {data:mod, err: modErr} = await genModFile({cfg});
        const err = translateErr || serveErr || lessErr || viewErr || modErr;
        const data = {translate,serv,less,view,mod, err};
        zipFile({
            onClose: () => resolve(data),
            outputPath: outputPath + `/${fileName}.zip`,
            archiveDir: archivePath
        })
    })
}