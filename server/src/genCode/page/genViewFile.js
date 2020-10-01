const fs = require('fs');
const path = require('path');
const translate = require('./translate.json');
const {capitalToUnderscore, upCase0, listToObj} = require('../../util/appFunc');

module.exports.genViewFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel,table} = cfg;
        let {fileName} = global;
        fileName = upCase0(fileName);  // 首字母大写
        const pageId = capitalToUnderscore(fileName[0].toLowerCase() + fileName.slice(1));  // 大写字母用下划线连接
        const panelList = panel.fieldList === '' ? '[]' : listToObj(panel.fieldList).reduce((acc, entry,idx,arr) => {
            let {label,id,type,required} = entry
            type = upCase0(type);
            const placeholder = ['Select','Date'].includes(type) ? 'pleaseSelect': 'pleaseEnter';
            acc += `
            {
                type: '${upCase0(type)}',
                controlItemParam: {
                    id: '${id}',
                    label: translate('${id}'),  // ${label}
                    placeholder: translate('${placeholder}'), // ${translate[placeholder]}
                    rules: [ ${required === '1' ? '{required:true}' : ''} ]
                }
            },
            `;
            if (idx === arr.length - 1) acc += ']';
            return acc;
        }, '[');
        let columnsAttr = listToObj(table.columns);
        const columns = columnsAttr.filter(entry => entry.title !== '序号')
            .reduce((colAcc,entry,idx,arr) => {
            let {title,dataIndex,emum,render,actionBtns} = entry;
            colAcc += `
            {
                title: translate('${dataIndex}'),  // ${title}
                dataIndex: '${dataIndex}',`;
            if (title === '操作') {
                actionBtns = actionBtns.split('/').reduce((acc,entry,idx,arr) => {
                    const [type,text,key] = entry.split('-');
                    acc += `{
                        type: '${type}',
                        text: translate('${key}'),  // ${text}
                        onClick: row => {}
                    },\n`
                    if (idx === arr.length - 1) acc += '],'
                    return acc;
                }, '[\n')
                colAcc += `
                type: 'action',
                fixed: 'right',
                width: 100,
                actionBtns: ${actionBtns}
                `
            }
            // emum begin
            if (emum !== '0') {
                emum = emum.split('/').reduce((emumAcc,entry,idx,arr) => {
                    const [val,label] = entry.split('-');
                    emumAcc += `${val}: '${label}',`
                    if (idx === arr.length - 1) {
                        emumAcc += `}`;
                    }
                    return emumAcc;
                }, '{');
                colAcc += `\nemum: ${emum},`
            }
            // emum end
            // render begin
            if (render !== '0') {
                colAcc += `\nrender: (text,record) => {
                    return text;
                },`
            }
            // render end
            colAcc += `\n},`;
            if (idx === arr.length - 1) colAcc += '\n]';
            return colAcc;
        }, '[')
        let data = `
import React, {Component} from "react";
import {YxListPage} from 'yx-widget'
import {observer,inject} from 'mobx-react'
import {withRouter} from "react-router-dom";
import {get} from "lodash";
import CubeI8N from "utils/cubeI8N";
import './${fileName}Less.less'
import Serv from './${fileName}Serv'
// 注入全局Store
@inject("AppStore")
// 在组件中可通过this.props.history.push跳转路由789
@withRouter
// 将组件设置为响应式组件，成为观察者，以便响应被观察数据的变化
@observer
class ${fileName}View extends Component {
  constructor(props, context) {
    super(props, context);
    this.translate = () => '';
    this.state = {
    }
  }
  async componentDidMount () {
    //得到语言信息
    let data = await CubeI8N.getLanguageData({
      //模块名，意味着我将要从某个模块中取
      moduleName:"${global.moduleName}",
      //我需要的语言包在模块中的路径
      router:"${global.router || (`${global.moduleName}/${fileName}`)}",
    });
    //将函数实例化，并且保存这state中，为什么这样做
    //因为这是一个异步函数， 我们可能要在render中使用
    this.translate = (new CubeI8N(data)).getString;
    this.forceUpdate();
  }
  updateView(cb = () =>{}) {  // 更新页面视图
    this.setState({...this.state},cb);
  }
  panelParam() {
      const {translate} = this;
      return {
          containerParam: {
            header: translate("panelTitle"), // ${panel.panelTitle}
          },
          resetParam: {
              beforeClick: () => {}
          },
          items: ${panelList}
      }
  }
  tableParam() {
      const {translate} = this;
      let columns = ${columns};
      return {
          
      }
  }
  requestParam() {}
  render() {
    const params = {
      panelParam: this.panelParam(),
      tableParam: this.tableParam(),
      requestParam: this.requestParam(),
      load: ({form}) => {},
      formChange: (ids, changeValue, values) => {},
    }
    return <div id="${pageId}">
      <YxListPage {...params}/>
    </div>
  }
}

    `;
        await fs.writeFile(path.join(__dirname, `../output/${fileName}View.js`), data, err => {
            reject(err);
        })
        resolve();
    })
}
