const {genServeFile,genViewFile,genLessFile,genTranslateFile} = require("./index");
const {delDirFiles} = require('../../util/appFunc');
const path = require('path');

module.exports.genPageFile = ({cfg}) => {
    return new Promise(async resolve => {
        delDirFiles(path.join(__dirname, '../output'));
        await genViewFile({cfg});
        // await genServeFile({cfg});
        await genLessFile({cfg});
        await genTranslateFile({cfg});
        resolve();
    })
}