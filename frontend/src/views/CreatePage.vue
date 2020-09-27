<template>
  <div>
    <app-form
        :field-cfg-list="fieldCfgList"
        mode="searchBar"
        :form-cfg="formCfg"
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
        <a-collapse-panel key="panelParam" header="panelParam">
          <app-form
              ref="panelForm"
              :field-cfg-list="addModal.fieldCfgList"
              :form-cfg="addModal.formCfg"
              :footer-visible="false"
              v-model:visible="addModal.visible"
              v-model:saveBtnLoading="addModal.saveBtnLoading"
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
import {genFormAndRules} from "@/utils/appFunc";
import {mapActions} from 'vuex'

export default {
  data() {
    const fieldCfgList = [
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
    ];
    const formCfg = genFormAndRules(fieldCfgList);
    const addModalFormCfg = [
      {
        type: 'input',
        decorator: ['headerTitle'],
        formItem: {
          label: 'headerTitle'
        },
      },
    ]
    const modalFormCfg = genFormAndRules(addModalFormCfg);
    return {
      fieldCfgList,
      formCfg,
      addModal: {
        visible: false,
        activePanel: ['panelParam'],
        title: '创建页面',
        fieldCfgList: addModalFormCfg,
        saveBtnLoading: false,
        formCfg: {
          ...modalFormCfg,
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
      const panelForm = this.$refs.panelForm.$refs.ruleForm;
      panelForm.validate().then((fieldsValue) => {
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
