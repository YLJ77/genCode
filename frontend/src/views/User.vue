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
    >
      <app-form
          :field-cfg-list="addModal.fieldCfgList"
          :form-cfg="addModal.formCfg"
          @cancel="addModal.visible = false"
          v-model:visible="addModal.visible"
          v-model:saveBtnLoading="addModal.saveBtnLoading"
          @ok="saveUser"
      />
    </a-modal>
  </div>
</template>

<script>
import AppForm from "@/components/AppForm";
import AppTable from "@/components/AppTable";
import {genFormAndRules} from "@/utils/appFunc";
import {reactive, toRefs} from 'vue'
import {mapActions} from 'vuex'

export default {
  setup() {
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
        decorator: ['email', {
          rules: [
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' }
          ]
        }],
        formItem: {
          label: '邮箱',
          style: 'width: 100%'
        },
        field: {
          placeholder: '请输入'
        }
      },
      {
        type: 'input',
        decorator: ['password', {
          rules: [
            { required: true, message: '请输入密码' }
          ]
        }],
        formItem: {
          label: '密码',
          style: 'width: 100%'
        },
        field: {
          placeholder: '请输入',
          type: 'password'
        }
      },
    ]
    const modalFormCfg = genFormAndRules(addModalFormCfg);
    const data = reactive({
      fieldCfgList,
      formCfg,
      addModal: {
        visible: false,
        title: '添加用户',
        fieldCfgList: addModalFormCfg,
        saveBtnLoading: false,
        formCfg: {
          ...modalFormCfg,
          labelCol: { span: 4 },
          wrapperCol: { span: 17 },
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
            {
              dataIndex: 'email',
              title: '邮箱',
            },
            {
              dataIndex: 'age',
              title: '年龄',
            },
            {
              dataIndex: 'createdAt',
              title: '创建时间',
            },
            {
              dataIndex: 'updatedAt',
              title: '更新时间',
            },
          ]
        },
        topBtns: [
          {
            text: '新增',
            type: 'primary',
            action: () => {
              data.addModal.visible = true;
            }
          },
        ]
      }
    });
    return {
      ...toRefs(data),
    };
  },
  methods: {
    ...mapActions('user', [
      'getUserList',
      'getUserInfo',
      'updateUser',
      'deleteUser',
        'addUser'
    ]),
    saveUser({fieldsValue}) {
      this.addUser({
        cb: loading => this.addModal.saveBtnLoading = loading,
        params: fieldsValue
      }).then(() => {
        this.$message.success('添加成功');
        this.addModal.visible = false;
        this.getList();
      })
    },
    getList({fieldsValue = {}} = {}) {
      this.getUserList({
        cb: loading => this.table.cfg.loading = loading,
        params: fieldsValue
      }).then(res => {
        this.table.cfg.dataSource = res.data.list
      })
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
