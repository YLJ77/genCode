const fs = require('fs');
const path = require('path');

module.exports.genPage = ({cfg}) => {
    cfg = JSON.parse(cfg.pageCfg);
    let data = `
    ${cfg.headerTitle}
    `;
    fs.writeFile(path.join(__dirname, 'output.txt'), data, err => {
        console.log(err);
    })
}
