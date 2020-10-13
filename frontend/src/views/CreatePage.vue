<template>
  <div>
    <app-form
        :field-cfg-list="searchFieldList"
        mode="searchBar"
        @search="getList"
    />
    <app-table style="margin-top:20px;"
               :top-btns="table.topBtns"
               :cfg="table.cfg">
      <template v-slot:action="{props:{text,index,record}}">
        <a-button :loading="table[`btnLoading${index}`]" @click="visiblePageInfo({text,index,record})" type="link">编辑</a-button>
      </template>
    </app-table>
    <a-modal
        v-model:visible="addModal.visible"
        :destroyOnClose="true"
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
        <a-dropdown class="ml20">
          <template v-slot:overlay>
            <a-menu>
              <a-menu-item>
                  <a-button @click="save" type="link" :loading="addModal.genBtnLoading">保存</a-button>
              </a-menu-item>
              <a-menu-item>
                <app-upload :cfg="{
                  text: '字段替换',
                  attr: {type: 'link',},
                  upload: addModal.replaceFieldCfg
                }"></app-upload>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>操作<DownOutlined /></a-button>
        </a-dropdown>
        <a-dropdown class="ml20">
          <template v-slot:overlay>
            <a-menu>
              <a-menu-item v-for="extension in ['View.js','Serv.js','Less.less','Mod.js','.json','.zip']" :key="extension">
                <a v-if="extension === '.zip'" :href="`http://127.0.0.1:3000/genFile/${$refs?.globalForm?.form?.fileName + extension}`" target="_blank">{{$refs?.globalForm?.form?.fileName + extension}}</a>
                <a v-else :href="`http://127.0.0.1:3000/genFile/output/${$refs?.globalForm?.form?.fileName + extension}`" target="_blank">{{$refs?.globalForm?.form?.fileName + extension}}</a>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>查看文件<DownOutlined /></a-button>
        </a-dropdown>
      </div>
    </a-modal>
  </div>
</template>

<style lang="scss" scoped>
.ml20 {
  margin-left: 20px;
}
</style>

<script>
import AppForm from "@/components/AppForm";
import AppTable from "@/components/AppTable";
import AppUpload from "@/components/AppUpload";
import {mapActions} from 'vuex'
import {upCase0, toPinyin,listToObj} from "@/utils/appFunc";
import {DownOutlined} from '@ant-design/icons-vue'

export default {
  data() {
    return {
      fileList: [],
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
        visible: false,
        replaceFieldCfg: this.genUploadCfg({
              requestMethod: 'replacePageField',
              cb: loading => this.addModal.uploadBtnLoading = loading,
              msg: '替换',
              appendFormData: async formData => {
                const fieldsValue = await this.getFieldsValue();
                formData.append('pageCfg',JSON.stringify(fieldsValue));
              }
            }),
        record: null,  // 编辑行数据
        type: 'add', // add | edit
        activePanel: ['globalParam', 'modalParam'/*,'panelParam','tableParam', 'servParam'*/],
        title: '创建页面',
        batchBtns: [],
        importUrl: 'url',
        exportUrl: 'url',
        genBtnLoading: false,
        uploadBtnLoading: false,
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
                initialValue: '',
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
                initialValue: '',
                rules: [
                  {required: true,message: '请输入路径名'}
                ]
              }],
              formItem: {
                label: '语言包路径'
              },
            },
            {
              type: 'select',
              decorator: ['pageType', {
                initialValue: 'listPage',
                rules: [
                  {required: true,message: '请选择页面类型'}
                ]
              }],
              formItem: {
                label: '页面类型'
              },
              field: {
                options: [
                  {value: 'listPage', label: '列表页面',key: 1/*key属性用来防止大量antd console输出*/},
                  {value: 'formPage', label: '表单页面',key: 2},
                ]
              },
            },
            {
              type: 'textarea',
              decorator: ['tabList',{
                initialValue:''
              }],
              formItem: {
                label: 'tab列表'
              },
              field: {
                allowClear: true,
                autoSize: { minRows: 4 },
                placeholder: 'tab列表'
              }
            },
            {
              type: 'btn',
              text: '解析',
              action: ({fieldsValue}) => {
                fieldsValue.tabList = this.splitColonToVal({
                  fieldValue: fieldsValue.tabList,
                  accCtrl: ({entry: tab}) => {
                    const tabPinyin = toPinyin(tab);
                    return `tab:${tab}\n|key:__tabKey_${tabPinyin}__`;
                  }
                });
              }
            },
          ],
          modal: [
            {
              type: 'input',
              decorator: ['parentFileName', {initialValue: '',}],
              formItem: {
                label: '父文件名'
              },
            },
            {
              type: 'input',
              decorator: ['title', {initialValue: '',}],
              formItem: {
                label: '标题'
              },
            },
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
              type: 'textarea',
              decorator: ['initialPanelTitle',{initialValue: ''}],
              formItem: {
                label: '标题'
              },
              btns: [
                {
                  text: '解析',
                  action: ({fieldsValue}) => {
                    fieldsValue.panelTitle = this.splitColonToVal({
                      fieldValue: fieldsValue.initialPanelTitle,
                      accCtrl: ({entry: title}) => {
                        const labelPinyin = toPinyin(title);
                        return `title:${title}\n|key:__panelTitle_${labelPinyin}\n|col:col`;
                      }
                    });
                  }
                }
              ],
              field: {
                placeholder: '分隔符：\n1、中文冒号：\n2、英文冒号:'
              }
            },
            {
              type: 'textarea',
              decorator: ['panelTitle',{initialValue: ''}],
              formItem: {
                label: '格式化标题'
              },
            },
            {
              type: 'textarea',
              decorator: ['initialFieldList',{initialValue:''}],
              formItem: {
                label: '起始表单列表'
              },
              btns: [
                {
                  text: '解析第一步',
                  action: ({fieldsValue}) => {
                    const {panelTitle,initialFieldList} = fieldsValue;
                    let fieldListInfo = initialFieldList ? listToObj(initialFieldList) : [];
                    if (panelTitle) {
                      fieldsValue.initialFieldList = listToObj(panelTitle).reduce((acc,entry,idx,arr) => {
                        const {key:section,col} = entry;
                        let fieldList = `__fieldList${idx}__`;
                        if (fieldListInfo.length) fieldList = fieldListInfo[idx].fieldList;
                        acc += `section:${section}\n|col:${col}\n|fieldList:${fieldList}`;
                        if (idx !== arr.length - 1) acc += ',\n\n';
                        return acc;
                      }, '')
                    }
                  }
                },
              ]
            },
            {
              type: 'textarea',
              decorator: ['fieldList',{initialValue: ''}],
              formItem: {
                label: '格式化表单列表'
              },
              btns: [
                {
                  text: '解析第二步',
                  action: ({fieldsValue}) => {
                    const {initialFieldList} = fieldsValue;
                    fieldsValue.fieldList = listToObj(initialFieldList).reduce((acc,field,idx,arr) => {
                      const {section,fieldList,col} = field;
                      acc += fieldList.split(/:|：/).reduce((fieldAcc,label,fieldIdx,fieldArr) => {
                        const labelPinyin = toPinyin(label);
                        fieldAcc += `section:${section}\n|col:${col}\n|label:${label}\n|id:__panelId_${labelPinyin}__\n|type:__String__\n|required:0`;
                        if (fieldIdx !== fieldArr.length - 1) fieldAcc += ',\n\n';
                        return fieldAcc;
                      }, '');
                      if (idx !== arr.length - 1) acc += ',\n\n';
                      return acc;
                    }, '')
                  }
                }
              ]
            }
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
                fieldsValue.columns = this.splitColonToVal({
                  fieldValue: fieldsValue.columns,
                  accCtrl: ({entry:title}) => {
                    const titlePinyin = toPinyin(title);
                    let attrs = `title:${title}\n|dataIndex:__tableIdx_${titlePinyin}__\n|emum:0\n|render:0`
                    if (title === '操作') {
                      attrs += `\n|actionBtns:action-编辑-edit/action-删除-delete`;
                      attrs = attrs.replace(`tableIdx${titlePinyin}`,'action');
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
                fieldsValue.batchBtns = this.splitColonToVal({
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
              dataIndex: 'fileName',
              title: '文件名',
            },
            {
              dataIndex: 'moduleName',
              title: '模块名',
            },
            {
              dataIndex: 'router',
              title: '语言包路径',
            },
            {
              dataIndex: 'view',
              title: 'view',
            },
            {
              dataIndex: 'serv',
              title: 'serv',
            },
            {
              dataIndex: 'translate',
              title: 'translate',
            },
            {
              dataIndex: 'less',
              title: 'less',
            },
            {
              dataIndex: 'mod',
              title: 'mod',
            },
            {
              dataIndex: 'action',
              title: '操作',
              fixed: 'right',
              slots: { customRender: 'action' },
            }
          ]
        },
        topBtns: [
          {
            text: '新增',
            evt: {
              click: () => {
                this.addModal.type = 'add';
                this.addModal.visible = true;
              }
            },
            attr: {
              type: 'primary',
            }
          },
          {
            type: 'upload',
            fileList: [],
            attr: {
              type: 'dashed',
              loading: false,
            },
            upload: this.genUploadCfg({
              cb: loading => this.table.topBtns[1].attr.loading = loading
            }),
          },
        ]
      }
    }
  },
  methods: {
    ...mapActions('createPage', [
      'addPage',
      'editPage',
      'getPageList',
      'getPageInfo',
      'uploadFile',
      'replacePageField'
    ]),
    genUploadCfg({
                   fieldName = 'file',
                   cb = () =>{},
                   msg = '上传',
                   appendFormData,
                   requestMethod = 'uploadFile'
    } = {}) {
      let counter = 0;
      return {
        attr: {
          // action: 'http://127.0.0.1:3000/page/upload'
          showUploadList: false,
          beforeUpload: (file,fileList) => {  // 上传多少个文件就会被调用多少次，返回true则请求接口上传，只在第一次调用的时候请求接口上传
            counter += 1;
            if (counter === 1) {
              this.fileList = fileList;
              if (counter === fileList.length)  counter = 0;
              return true;
            }
            if (counter === fileList.length)  counter = 0;
            return false;
          },
          customRequest: async () => {
            const formData = new FormData();
            this.fileList.forEach(file => {
              formData.append(fieldName,file);
            });
            if (appendFormData) await appendFormData(formData);
            await this[requestMethod]({
              cb,
              params: formData,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            this.$message.success(`${msg}成功`);
          },
        }
      }
    },
    visiblePageInfo({record,index}) {
      this.getPageInfo({
        cb: loading => this.table[`btnLoading${index}`] = loading,
        params: {
          id: record.id
        }
      }).then(res => {
        const cfg = JSON.parse(res.data.pageCfg);
        this.addModal.visible = true;
        this.addModal.type = 'edit';
        this.addModal.record = record;
        this.$nextTick(() => {
          this.setFormsValue({cfg});
        });
      });
    },
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
      const {batchBtns,importUrl,exportUrl} = this.addModal;
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
      const {} = addModal;
      if (matches) {
        type = map[matches[0]];
        const {requestForm} = this.$refs;
        if (type === 'query' && !requestForm.form.url) {
          this.$refs.requestForm.form.url = url;
        }
        if (type === 'import' && !importUrl) this.addModal.importUrl = url;
        if (type === 'export' && !exportUrl) this.addModal.exportUrl = url;
        if (batchBtnKeys.includes(type)) {
          batchBtns.push(typeMapTxt[type]);
        }
      }
      const {tableForm} = this.$refs;
      if (batchBtns.length && !tableForm.form.batchBtns) this.$refs.tableForm.form.batchBtns = batchBtns.join(':');
      return type;
    },
    splitColonToVal({fieldValue, accCtrl, lines = 2}) {
      return fieldValue.split(/:|：/).reduce((acc,entry,idx,arr) => {
        acc += accCtrl({acc,entry,idx,arr});
        if (idx !== arr.length - 1) {
          acc += ',';
          acc += '\n'.repeat(lines);
        }
        return acc;
      }, '');
    },
    setFieldsValue({fieldsValue,form}) {
      fieldsValue && Object.keys(fieldsValue).forEach(key => form[key] = fieldsValue[key]);
    },
    setFormsValue({cfg}) {
      const {addModal: {fieldList}} = this;
      Object.keys(fieldList).forEach(key => {
        const form = this.$refs[`${key}Form`].form;
        this.setFieldsValue({fieldsValue: cfg[key],form});
      });
    },
    getFieldsValue() {
      return new Promise(resolve => {
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
                return {...acc, ...value};
              }, {});
              resolve(fieldsValue);
            });
      })
    },
    async save() {
      const {addModal: {type, record}} = this;
      const fieldsValue = await this.getFieldsValue();
      const params = {
        pageCfg: JSON.stringify(fieldsValue)
      }
      if (type === 'edit') params.id = record.id;
      this[`${type}Page`]({
        cb: loading => this.addModal.genBtnLoading = loading,
        params
      }).then(() => {
        this.$message.success('保存成功');
        this.getList();
      })
    },
    getList({fieldsValue = {}} = {}) {
      const {table: {cfg}} = this;
      this.getPageList({
        cb: loading => cfg.loading = loading,
        params: {
          curPage: 1,
          pageSize: 10
        }
      }).then(res => {
        res.data.list = res.data.list.map(entry => {
          const {fileName,moduleName,router} = (JSON.parse(entry.pageCfg)).global;
          entry.fileName = fileName;
          entry.moduleName = moduleName;
          entry.router = router;
          return entry;
        });
        cfg.dataSource = res.data.list;
      });
    },
  },
  created() {
    this.getList();
  },
  components: {
    AppForm,
    AppTable,
    AppUpload,
    DownOutlined
  }
}
</script>
