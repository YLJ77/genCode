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
              :footer-visible="false"
          />
        </a-collapse-panel>
        <a-collapse-panel :forceRender="true" key="panelParam" header="panelParam">
          <app-form
              ref="panelForm"
              :field-cfg-list="addModal.fieldList.panel"
              :form-cfg="addModal.formCfg"
              :footer-visible="false"
          />
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
        visible: false,
        activePanel: ['globalParam'],
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
            }
          ],
          panel: [
            {
              type: 'input',
              decorator: ['headerTitle'],
              formItem: {
                label: '标题'
              },
            },
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
    save() {
/*
      const panelForm = this.$refs.panelForm.$refs.ruleForm;
      panelForm.validate().then((fieldsValue) => {
      })
*/
      const {addModal: {fieldList}} = this;
      const pormises = Object.keys(fieldList).reduce((acc, key) => {
        const form = this.$refs[`${key}Form`].$refs.ruleForm;
        const promise = new Promise(resolve => {
          form.validate().then(fieldsValue => resolve(fieldsValue));
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
