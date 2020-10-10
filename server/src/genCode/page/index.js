const {genServeFile} = require('./genServFile');
const {genViewFile} = require('./genViewFile');
const {genLessFile} = require('./genLessFile');
const {genTranslateFile} = require('./genTranslateFile');
const {genModFile} = require('./genModFile');
const {replacePageField} = require('./replacePageField');

module.exports = {
    genViewFile,
    genServeFile,
    genLessFile,
    genTranslateFile,
    genModFile,
    replacePageField
}
