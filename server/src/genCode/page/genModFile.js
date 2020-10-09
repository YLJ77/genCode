const {outputFile} = require('../../util/appFunc');

module.exports.genModFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global} = cfg;
        let {fileName} = global;
        fileName = fileName[0].toUpperCase() + fileName.slice(1) + 'Mod';  // 首字母大写
        let data = `import { observable } from 'mobx';

class ${fileName} {
  @observable state = {
  }
}

const mod = new ${fileName}();
export default mod;
        `;
        const err = await outputFile({fileName: `${fileName}.js`, data});
        resolve({err,data});
    })
}
