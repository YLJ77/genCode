const {genServeFile} = require('./genServFile');
const {genListPageFile} = require('./genListPageFile');
const {genLessFile} = require('./genLessFile');
const {genTranslateFile} = require('./genTranslateFile');
const {genModFile} = require('./genModFile');
const {genFormPageFile} = require('./genFormPageFile');
const {replacePageField} = require('./replacePageField');

module.exports = {
    genListPageFile,
    genServeFile,
    genLessFile,
    genTranslateFile,
    genModFile,
    replacePageField,
    genFormPageFile
}
