const {genServeFile,genViewFile,genLessFile,genTranslateFile,genModFile} = require("./index");
const {delDirFiles, zipFile, upCase0} = require('../../util/appFunc');
const path = require('path');

module.exports.genPageFile = ({cfg}) => {
    return new Promise(async resolve => {
        const archivePath = path.join(__dirname, '../../../public/genFile/output');
        const outputPath = path.join(__dirname, '../../../public/genFile');
        const config = JSON.parse(cfg.pageCfg);
        const {global} = config;
        let {fileName} = global;
        fileName = upCase0(fileName);  // 首字母大写
        delDirFiles(outputPath);
        const translateErr = await genTranslateFile({cfg});
        const serveErr = await genServeFile({cfg});
        const lessErr = await genLessFile({cfg});
        const viewErr = await genViewFile({cfg});
        const modErr = await genModFile({cfg});
        zipFile({
            onClose: () => resolve(translateErr || serveErr || lessErr || viewErr || modErr),
            outputPath: outputPath + `/${fileName}.zip`,
            archiveDir: archivePath
        })
    })
}