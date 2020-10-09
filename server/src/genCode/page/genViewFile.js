const translate = require('./translate.json');
const {capitalToUnderscore, upCase0, listToObj,outputFile} = require('../../util/appFunc');

module.exports.genViewFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel,table,request} = cfg;
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
                    rules: [${required === '1' ? '{required:true}' : ''}],
                    ${type === 'Select' ? 'data: []' : ''}
                }
            },
            `;
            if (idx === arr.length - 1) acc += ']';
            return acc;
        }, '[');

        let columnsAttr = listToObj(table.columns);
        table.isColumnNumber = columnsAttr.some(entry => entry.title === '序号');
        table.isNowrap = table.options.includes('isNowrap');
        table.isRowSelection = table.options.includes('isRowSelection');
        const columns = table.columns === '' ? '[]' : columnsAttr.filter(entry => entry.title !== '序号')
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
        let data = `import React, {Component} from "react";
import {YxListPage} from 'yx-widget'
import {Form${global.tabList && ',Tabs'}} from 'antd'
import {observer,inject} from 'mobx-react'
import {withRouter} from "react-router-dom";
import {get} from "lodash";
import CubeI8N from "utils/cubeI8N";
import './${fileName}Less.less'
import Serv from './${fileName}Serv'
${global.tabList && 'const {TabPane} = Tabs'}
${
    // 导入导出配置函数的引入
    table.batchBtns === '' ? '' : listToObj(table.batchBtns)
        .filter(entry => ['import','export'].includes(entry.key))
        .reduce((acc,entry,idx,arr) => {
            if (idx === 0) acc += 'import { ';
            acc += `gen${upCase0(entry.key)}Cfg,`
            if (idx === arr.length - 1) acc += ' } from "utils/apppFunc"'
            return acc;
    }, '')           
}
// 注入全局Store
@inject("AppStore")
// 在视图注入module层数据
@inject("${fileName}Mod")
// 在组件中可通过this.props.history.push跳转路由
@withRouter
// 将组件设置为响应式组件，成为观察者，以便响应被观察数据的变化
@observer
class ${fileName}View extends Component {
  constructor(props, context) {
    super(props, context);
    this.appStore = this.props.AppStore;
    this.store = this.props.${fileName}Mod;
    this.translate = () => '';
    this.state = {
        version: 0,
        dict: {list: [],emum:[]},
        queryParams: {},
        table: {
            selectedRows: [],
            selectedRowKeys: [],
            dataSource: []
        }
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
    this.translate = (new CubeI8N(data)).getString;
    // 获取字典
    this.appStore.getEnum('more','').then((res)=>{
    this.setState({dict:res})});
    this.forceUpdate();
  }
  updateView(cb = () =>{}) {  // 更新页面视图
    this.setState({...this.state},cb);
  }
  panelParam() {
      const {translate} = this;
      return {
          containerParam: {
            ${panel.panelTitle ? `header: translate("panelTitle"), // ${panel.panelTitle}` : ''}  
          },
          resetParam: {
              beforeClick: () => {}
          },
          items: ${panelList}
      }
  }
  batchBtns() {
      const {translate} = this;
      return ${
            table.batchBtns === '' ? '[]' : listToObj(table.batchBtns).reduce((acc, entry,idx,arr) => {
                const {actionType, type, text, key,url} = entry;
                if (key === 'import') {
                    acc += `{
                        text: translate('${key}'),   // ${text}
                        loading: this.state.importLoading,
                        url: ${url}
                    },
                    `
                } else if (key === 'export') {
                    acc += `{
                        text: translate('${key}'),   // ${text}
                        loading: this.state.exportLoading,
                        url: ${url},
                        cb: loading => this.setState({exportLoading: loading}),
                        getParams: () => {
                            return {
                                ...this.state.queryParams
                            }
                        }
                    },
                    `
                } else {
                    acc += `{
                    actionType: '${actionType}',
                    type: '${type}',
                    check: false,
                    text: translate('${key}'),   // ${text}
                    onClick: () => {}
                },
                `
                }
                if (idx === arr.length - 1) acc += `]
                `
                return acc;
            }, `[
            `)
        }
  }
  
  tableParam() {
      const {translate} = this;
      let columns = ${columns};
      return {
          columns,
          rowKey: '${table.rowKey}',
          isNowrap: ${table.isNowrap ? 'true' : 'false'},  // 是否换行
          isRowSelection: ${table.isRowSelection ? 'true' : 'false'},  // 是否显示复选框
          isColumnNumber: ${table.isColumnNumber ? 'true' : 'false'},  // 是否开启序号
          ${
            table.isRowSelection ? `onCheckbox: (keys,rows) => {  // 复选框点击时触发的函数
                this.state.table.selectedRows = rows;
                this.state.table.selectedRowKeys = keys;
                this.updateView();
              },
            ` : '' 
        }
        batchBtns: this.batchBtns()   
      }
  }
  requestParam() {
      return {
          method: 'post',
          url: '${request.url}',
          headers: { 'Content-type': 'application/json' },
          beforeRequest: data => {
            this.state.queryParams = data;
            return data;
          },
          afterRequest: res => {
            return res;
          }
      }
  }
  ${
     global.tabList && `onTabChange(val) {}`           
   }
  render() {
    const {translate} = this;
    const params = {
      version: this.state.version,
      panelParam: this.panelParam(),
      tableParam: this.tableParam(),
      requestParam: this.requestParam(),
      load: ({form}) => {},
      formChange: (ids, changeValue, values) => {},
    }
    return <div id="${pageId}">
      ${
            // tabList-begin
            global.tabList && listToObj(global.tabList).reduce((acc,entry,idx,arr) => {
                const {tab,key} = entry
                if (idx === 0) {
                    acc += `<Tabs defaultActiveKey="${key}" onChange={(val) => this.onTabChange(val)}>
`;
                }
                acc += `{/* ${tab} */}
<TabPane tab={translate('${key}')} key="${key}"/>
`;
                if (idx === arr.length - 1) {
                    acc += '</Tabs>';
                }
                return acc;
            }, '')
            
            // tabList-end
        }
      <YxListPage {...params}/>
    </div>
  }
}

export default Form.create()(${fileName}View)
    `;
        const err = await outputFile({fileName: `${fileName}View.js`, data});
        resolve({err,data});
    })
}
