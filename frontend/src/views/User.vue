<template>
  <div>
    <app-page
        :search-field-list="fieldCfgList"
        :table-cfg="table.cfg"
        :request-list="{
          listItem: getUserList,
          deleteItem: deleteUser,
          addItem: addUser,
          infoItem: getUserInfo,
          editItem: updateUser
        }"
        :modal-cfg="{
          attr: {
          title: '添加用户',
          width: 320,
          },
          fieldCfgList: addModal.fieldCfgList
        }"
    ></app-page>
  </div>
</template>

<script>
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
        type: 'password',
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
    const data = reactive({
      fieldCfgList,
      addModal: {
        fieldCfgList: addModalFormCfg,
      },
      table: {
        cfg: {
          rowKey: 'id',
          loading: false,
          dataSource: [],
          columns: [
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
  },
}
</script>
