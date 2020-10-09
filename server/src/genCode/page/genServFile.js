const {listToObj,outputFile} = require('../../util/appFunc');

module.exports.genServeFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,serv} = cfg;
        global.fileName = global.fileName[0].toUpperCase() + global.fileName.slice(1);  // 首字母大写
        const {servList} = serv;
        let data = `import request from 'utils/request';

export default class {
    ${
       servList === '' ? '' : listToObj(servList).reduce((acc,entry,idx,arr) => {
           const {method,url,comment,name} = entry;
           acc += `// ${comment}
           static ${name}(params) {
             return request({
               url: '${url}',
               method: '${method}',
               ${method === 'POST' ? 'data: params' : ''}
             })
           }
           `;
           return acc;
       }, '')     
    }
}
    `;
        const err = await outputFile({fileName: `${global.fileName}Serv.js`, data});
        resolve({err,data});
    })
}
