const {genServPage,genViewPage,genLessPage} = require("./index");

module.exports.genPage = ({cfg}) => {
    return new Promise(async resolve => {
        await genViewPage({cfg});
        await genServPage({cfg});
        await genLessPage({cfg});
        resolve();
    })
}