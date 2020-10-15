const {outputFile} = require('../../util/appFunc');

module.exports.genModFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global} = cfg;
        let {fileName} = global;
        fileName = fileName[0].toUpperCase() + fileName.slice(1) + 'Mod';  // 首字母大写
        let data = `import { observable } from 'mobx';

function getDict() {
  const dict = {
      trueFalse: [
          {label: '是', val: '1'},
          {label: '否', val: '0'},
      ]
  }
  return Object.keys(dict).reduce((acc,key)=>{
      acc[key] = {list: dict[key]}
      acc[key].emum = dict[key].reduce((acc,entry) => {
          acc[entry.val] = entry.label
          return acc;
      }, {})
      return acc;
  },{});
}

class ${fileName} {
  @observable state = {
  }
  dict = getDict()
}

const mod = new ${fileName}();
export default mod;
        `;
        const err = await outputFile({fileName: `${fileName}.js`, data});
        resolve({err,data});
    })
}
