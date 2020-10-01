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
        <a-collapse-panel :forceRender="true" key="globalParam" header="globalParam">
          <app-form
              ref="globalForm"
              :field-cfg-list="addModal.fieldList.global"
              :form-cfg="addModal.formCfg"
              :footer-visible="false"/>
        </a-collapse-panel>
        <a-collapse-panel :forceRender="true" key="panelParam" header="panelParam">
          <app-form
              ref="panelForm"
              :field-cfg-list="addModal.fieldList.panel"
              :form-cfg="addModal.formCfg"
              :footer-visible="false">
            <template v-slot:analyse="{props:{fieldsValue,getForm,cfg}}">
              <div class="slot-btn">
                <a-button @click="analyse({fieldsValue,getForm,cfg})">解析</a-button>
              </div>
            </template>
          </app-form>
        </a-collapse-panel>
        <a-collapse-panel :forceRender="true" key="tableParam" header="tableParam">
          <app-form
              ref="tableForm"
              :field-cfg-list="addModal.fieldList.table"
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
        activePanel: [/*'globalParam','panelParam',*/'tableParam'],
        title: '创建页面',
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
              type: 'slot',
              slot: 'analyse'
            }
          ],
          table: [
            {
              type: 'textarea',
              decorator: ['columns',{initialValue:'序号:是否OEM监控:监控原因:监控规则:监控有效时间:备注:提醒创建人:提醒创建时间:操作'}],
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
            }
          ]
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
          console.log(res);
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
