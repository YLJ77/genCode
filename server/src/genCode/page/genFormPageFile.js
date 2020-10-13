const translate = require('./translate.json');
const {capitalToUnderscore, genFormItem, upCase0, downCase0, listToObj,outputFile} = require('../../util/appFunc');

module.exports.genFormPageFile = ({cfg}) => {
    return new Promise(async (resolve, reject) => {
        cfg = JSON.parse(cfg.pageCfg);
        const {global,panel,modal} = cfg;
        let {fileName} = global;
        fileName = upCase0(fileName);  // 首字母大写
        const pageId = capitalToUnderscore(fileName[0].toLowerCase() + fileName.slice(1));  // 大写字母用下划线连接
        const fieldList = listToObj(panel.fieldList);
        const formInfo = listToObj(panel.panelTitle).reduce((acc,entry) => {
            const {key:section,title,col} = entry;
            acc.push({
                section: section,
                col,
                title: title,
                fieldList: fieldList.filter(field => field.section === section)
            });
            return acc;
        }, []);

        let data = `import React, {Component} from "react";
import {YxDynamicForm} from 'yx-widget'
import {Form${global.tabList && ',Tabs'}${modal.title && ',Modal'}${formInfo.length > 1  && ',PageHeader'}} from 'antd'
import {observer,inject} from 'mobx-react'
import {useStrict} from 'mobx'
import {withRouter} from "react-router-dom";
import CubeI8N from "utils/cubeI8N";
import './${fileName}Less.less'
import Serv from './${fileName}Serv'
${global.tabList && 'const {TabPane} = Tabs'}
useStrict(false)
// 注入全局Store
@inject("AppStore")
// 在视图注入module层数据
@inject("${modal.title ? modal.parentFileName : fileName}Mod")
// 在组件中可通过this.props.history.push跳转路由
@withRouter
// 将组件设置为响应式组件，成为观察者，以便响应被观察数据的变化
@observer
class ${fileName}View extends Component {
  constructor(props, context) {
    super(props, context);
    this.appStore = this.props.AppStore;
    this.store = this.props.${modal.title ? modal.parentFileName : fileName}Mod;
    this.translate = () => '';
    this.state = {
        dict: {list: [],emum:[]},
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
  ${
        global.tabList && `onTabChange(val) {}`
    }
  formParam() {
      const {translate} = this;
      return ${
            formInfo.reduce((acc,form,idx,arr) => {
                const {section,col,title,fieldList} = form;
                let rowInfo = '';
                if (col === 'col') {
                    rowInfo = `{
                        rowParam: {},
                        col: [
                            {
                                colParam: {},
                                controlList: [${
                                        fieldList.reduce((acc, field) => {
                                            acc += genFormItem({info: field});
                                            return acc;
                                        }, '')
                                    }
                                ]
                            }
                        ]
                    }`
                } else if (typeof +col === 'number') {
                    rowInfo = fieldList.reduce((acc,field,idx,arr) => {
                        if (idx % 3 !== 0) return acc;
                        const list = [];
                        for (let i=0;i<col; i++) {
                            if (arr[idx + i]) list.push(arr[idx + i]);
                        }
                        acc += `{
                            rowParam: {},
                            col: [
                                    {
                                        colParam: {},
                                        controlList: [${
                                        list.reduce((acc, field) => {
                                            acc += genFormItem({info: field});
                                            return acc;
                                        }, '')
                                    }
                                ]
                            }
                        ]
                        },\n`;
                        return acc;
                    },'');
                }
                acc += `{
                    section: '${section}',
                    title: translate('${section}'), // ${title}
                    param: {
                        form: [
                            {
                            row: [
                                ${rowInfo}
                            ]
                            }
                        ]
                    }
                },\n`;
                if (idx === arr.length - 1) acc += ']'
                return acc;
            }, '[\n')
        }
  }
  render() {
    const {translate} = this;
    const formParam = this.formParam();
    return <div id="${pageId}">
      ${
            // modal-begin
            modal.title && `<Modal title={translate('${downCase0(fileName)}')/*${modal.title}*/}
            width={1000}
            onCancel={() => this.store.${downCase0(fileName)}.visible = false}
            visible={this.store.${downCase0(fileName)}.visible}>`
            // modal-end
        }
      ${
            // tabList-begin
            global.tabList && listToObj(global.tabList).reduce((acc,entry,idx,arr) => {
                const {tab,key} = entry
                if (idx === 0) {
                    acc += `<Tabs defaultActiveKey="${key}" onChange={(val) => this.onTabChange(val)}>\n`;
                }
                acc += `{/* ${tab} */}
                <TabPane tab={translate('${key}')} key="${key}"/>\n`;
                if (idx === arr.length - 1) {
                    acc += '</Tabs>';
                }
                return acc;
            }, '')
            // tabList-end
        }
        ${
            `{
                formParam.map((form,idx,arr) => {
                    if (formParam.length > 1) {
                        return <PageHeader 
                                style={{borderBottom: idx !== arr.length - 1 ? '1px solid rgb(235, 237, 240)': 'none'}}
                                title={translate(form.section)}>
                          <YxDynamicForm form={this.props.form} formParam={form.param}/>
                        </PageHeader>
                    } else {
                        return <YxDynamicForm form={this.props.form} formParam={form.param}/>
                    }
                })
            }`
        }
      ${modal.title && '</Modal>'}
    </div>
  }
}

export default Form.create()(${fileName}View)
    `;
        const err = await outputFile({fileName: `${fileName}View.js`, data});
        resolve({err,data});
    })
}