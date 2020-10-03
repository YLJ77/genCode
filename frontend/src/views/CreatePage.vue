<template>
  <div>
    <app-form
        :field-cfg-list="searchFieldList"
        mode="searchBar"
        @search="getList"
    />
    <app-table style="margin-top:20px;"
               :top-btns="table.topBtns"
               :cfg="table.cfg"></app-table>
    <a-modal
        v-model:visible="addModal.visible"
        :title="addModal.title"
        :footer="null"
        :width="800"
    >
      <a-collapse v-model:activeKey="addModal.activePanel">
        <a-collapse-panel v-for="(entry,section) in addModal.fieldList" :forceRender="true" :key="`${section}Param`" :header="`${section}Param`">
          <app-form
              :ref="`${section}Form`"
              :field-cfg-list="addModal.fieldList[section]"
              :form-cfg="addModal.formCfg"
              :footer-visible="false"/>
        </a-collapse-panel>
      </a-collapse>
      <div class="app-hc-vc" style="margin-top: 20px;">
        <a-button @click="addModal.visible=false">取消</a-button>
        <a-button style="margin-left: 20px;" @click="save" type="primary" :loading="addModal.saveBtnLoading">保存</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import AppForm from "@/components/AppForm";
import AppTable from "@/components/AppTable";
import {mapActions} from 'vuex'
import {upCase0} from "@/utils/appFunc";

export default {
  data() {
    return {
      searchFieldList: [
        {
          type: 'input',
          decorator: ['email'],
          formItem: {
            label: '邮箱',
          },
          field: {
            placeholder: '请输入'
          }
        },
      ],
      addModal: {
        visible: true,
        activePanel: [/*'globalParam','panelParam','tableParam',*/ 'servParam'],
        title: '创建页面',
        batchBtns: [],
        importUrl: 'url',
        exportUrl: 'url',
        fieldList: {
          global: [
            {
              type: 'input',
              decorator: ['fileName', {
                initialValue: 'fooTest',
                rules: [
                  {required: true,message: '请输入文件名'}
                ]
              }],
              formItem: {
                label: '文件名'
              },
            },
            {
              type: 'input',
              decorator: ['moduleName', {
                initialValue: 'ClaimMgmt',
                rules: [
                  {required: true,message: '请输入模块名'}
                ]
              }],
              formItem: {
                label: '模块名'
              },
            },
            {
              type: 'input',
              decorator: ['router', {
                initialValue: 'AuthorizationMgmt/VinBlock',
                rules: [
                  {required: true,message: '请输入路径名'}
                ]
              }],
              formItem: {
                label: '语言包路径'
              },
            }
          ],
          serv: [
            {
              type: 'textarea',
              decorator: ['servList',{
                // initialValue:'POST\n' + '/v1/vinBlock/add\n' + '新增vinBlock\n' + 'POST\n' + '/v1/vinBlock/export\n' + 'vinBlock导出\n'
                initialValue:''
              }],
              formItem: {
                label: '接口列表'
              },
              field: {
                allowClear: true,
                autoSize: { minRows: 4 },
                placeholder: '请求接口列表'
              }
            },
            {
              type: 'btn',
              text: '解析',
              action: ({fieldsValue}) => {
                this.addModal.batchBtns = [];
               fieldsValue.servList = fieldsValue.servList.split('\n').reduce((acc,entry,idx,arr) => {
                  if (idx % 3 === 0) {
                    const method = arr[idx];
                    const url = arr[idx + 1];
                    const comment = arr[idx + 2];
                    acc.push({method,url,comment});
                  }
                  return acc;
                }, []).reduce((acc,entry,idx,arr) => {
                  const {method, url, comment} = entry
                  acc += `method:${method.toUpperCase()}\n|url:${url}\n|name:${this.genMethodName({method,url})}\n|comment:${comment}\n|type:__${this.genMethodType({url})}__`;
                  if (idx !== arr.length - 1) acc += ',\n\n'
                  return acc;
                }, '')
              }
            },
          ],
          panel: [
            {
              type: 'input',
              decorator: ['panelTitle'],
              formItem: {
                label: '标题'
              },
            },
            {
              type: 'textarea',
              decorator: ['fieldList',{
                // initialValue:'提醒创建时间：提醒创建时间：是否OEM监控监控有效时间：监控规则：监控原因'
                initialValue:''
              }],
              formItem: {
                label: '表单列表'
              },
              field: {
                allowClear: true,
                autoSize: { minRows: 4 },
                placeholder: '分隔符：\n1、中文冒号：\n2、英文冒号:'
              }
            },
            {
              type: 'btn',
              text: '解析',
              action: ({fieldsValue}) => {
                this.analyse({fieldsValue});
              }
            },
          ],
          table: [
            {
              type: 'textarea',
              decorator: ['columns',{
                // initialValue:'序号:是否OEM监控:监控原因:监控规则:监控有效时间:备注:提醒创建人:提醒创建时间:操作'
                initialValue:''
              }],
              formItem: {
                label: '表格列名'
              },
              field: {
                allowClear: true,
                autoSize: { minRows: 4 },
                placeholder: '分隔符：\n1、中文冒号：\n2、英文冒号:\nemum:\n0-否/1-是'
              }
            },
            {
              type: 'btn',
              text: '解析',
              action: ({fieldsValue}) => {
                fieldsValue.columns = this.formatVal({
                  fieldValue: fieldsValue.columns,
                  accCtrl: ({entry:title,idx}) => {
                    let attrs = `title:${title}\n|dataIndex:__tableIdx${idx}__\n|emum:0\n|render:0`
                    if (title === '操作') {
                      attrs += `\n|actionBtns:action-编辑-edit/action-删除-delete`;
                      attrs = attrs.replace(`tableIdx${idx}`,'action');
                    }
                    return attrs;
                  }
                })
              }
            },
            {
              type: 'input',
              decorator: ['rowKey', {initialValue: 'id'}],
              formItem: {
                label: 'rowKey'
              },
            },
            {
              type: 'checkbox',
              decorator: ['options',{initialValue: []}],
              formItem: {
                label: '表格属性'
              },
              field: {
                options: [
                  {label: '是否换行',value: 'isNowrap'},
                  {label: '是否显示复选框',value: 'isRowSelection'}
                ]
              }
            },
            {
              type: 'textarea',
              decorator: ['batchBtns',{
                // initialValue:'新增:导入:导出'
                initialValue:''
              }],
              formItem: {
                label: '表格按钮'
              },
              field: {
                allowClear: true,
                autoSize: { minRows: 4 },
                placeholder: '分隔符：\n1、中文冒号：\n2、英文冒号:'
              }
            },
            {
              type: 'btn',
              text: '解析',
              action: ({fieldsValue}) => {
                fieldsValue.batchBtns = this.formatVal({
                  fieldValue: fieldsValue.batchBtns,
                  accCtrl: ({entry:text,idx}) => {
                    let attrs = `text:${text}\n|key:__batchBtn${idx}__\n|actionType:action\n|type:primary`;
                    const txtMapKey = {
                      '新增': 'add',
                      '导入': 'import',
                      '导出': 'export',
                    }
                    if (['新增','导入','导出'].includes(text)) {
                      if (['导入','导出'].includes(text)) {
                        attrs += `\n|url:__${this.addModal[txtMapKey[text] + 'Url']}__`;
                        attrs = attrs.replace('primary','secondary')
                            .replace('|actionType:action\n','');
                      }
                      attrs = attrs.replace(`batchBtn${idx}`,txtMapKey[text]);
                    }
                    return attrs;
                  }
                })
              }
            },
          ],
          request: [
            {
              type: 'input',
              decorator: ['url', {initialValue: ''}],
              formItem: {
                label: 'url'
              },
            },
          ],
        },
        saveBtnLoading: false,
        formCfg: {
          labelCol: { span: 4 },
          wrapperCol: { span: 17 },
          // layout: 'vertical'
          layout: 'horizontal'
        }
      },
      table: {
        cfg: {
          rowKey: '_id',
          loading: false,
          dataSource: [],
          columns: [
            {
              dataIndex: '_id',
              title: 'id',
            },
          ]
        },
        topBtns: [
          {
            text: '新增',
            type: 'primary',
            action: () => {
              this.addModal.visible = true;
            }
          },
        ]
      }
    }
  },
  methods: {
    ...mapActions('createPage', [
      'addPage'
    ]),
    genMethodName({method,url}) {
      const urlInfoList = url.split('/');
      const len = urlInfoList.length;
      let last1,last2,name;
      if (len > 2) {
        last1 = urlInfoList[len - 1];
        last2 = urlInfoList[len - 2];
      } else if (len === 2) {
        [last2,last1] = urlInfoList;
      }
      method = method.toUpperCase();
      if (method === 'POST') {
        name = last1 + upCase0(last2);
        name = name.replace('queryByCondition', 'query')
        .replace('modify','edit')
      } else if (method === 'GET') {
        name = 'get' + upCase0(last2);
      } else if (method === 'DELETE') {
        name = 'delete' + upCase0(last2);
      } else {
        name = 'methodName'
      }
      return name;
    },
    genMethodType({url}) {
      const matches = url.match(/add|export|import|modify|queryByCondition$/ig);
      const {batchBtns} = this.addModal;
      let type = 'type';
      const map = {
        add: 'add',
        export: 'export',
        import: 'import',
        modify: 'edit',
        queryByCondition: 'query'
      }
      const batchBtnKeys = ['add','export','import'];
      const typeMapTxt = {
        add: '新增',
        export: '导出',
        import: '导入'
      }
      if (matches) {
        type = map[matches[0]];
        if (type === 'query') {
          this.$refs.requestForm.form.url = url;
        }
        if (type === 'import') this.addModal.importUrl = url;
        if (type === 'export') this.addModal.exportUrl = url;
        if (batchBtnKeys.includes(type)) {
          batchBtns.push(typeMapTxt[type]);
        }
      }
      if (batchBtns.length) this.$refs.tableForm.form.batchBtns = batchBtns.join(':');
      return type;
    },
    formatVal({fieldValue, accCtrl, lines = 2 }) {
      return fieldValue.split(/:|：/).reduce((acc,entry,idx,arr) => {
        acc += accCtrl({acc,entry,idx,arr});
        if (idx !== arr.length - 1) {
          acc += ',';
          acc += '\n'.repeat(lines);
        }
        return acc;
      }, '');
    },
    analyse({fieldsValue}) {
      fieldsValue.fieldList = this.formatVal({
        fieldValue: fieldsValue.fieldList,
        accCtrl: ({entry: label,idx}) => {
          return `label:${label}\n|id:__panelId${idx}__\n|type:__String__\n|required:0`;
        }
      });
    },
    save() {
      const {addModal: {fieldList}} = this;
      const pormises = Object.keys(fieldList).reduce((acc, key) => {
        const form = this.$refs[`${key}Form`].$refs.ruleForm;
        const promise = new Promise(resolve => {
          form.validate().then(fieldsValue => resolve({[key]:fieldsValue}));
        })
        acc.push(promise);
        return acc;
      }, []);
      Promise.all(pormises).then(values => {
        const fieldsValue = values.reduce((acc, value) => {
          return {...acc,...value};
        }, {})
        this.addPage({
          cb: loading => this.addModal.saveBtnLoading = loading,
          params: {
            pageCfg: JSON.stringify(fieldsValue)
          }
        }).then(res => {
          this.$message.success('保存成功');
        })
      })
    },
    getList({fieldsValue = {}} = {}) {

    },
  },
  created() {
    this.getList();
  },
  components: {
    AppForm,
    AppTable
  }
}
</script>
