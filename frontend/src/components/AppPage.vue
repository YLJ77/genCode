<template>
  <div>
    <app-form
        :field-cfg-list="searchFieldList"
        mode="searchBar"
        @search="getSearchList"
    />
    <app-table style="margin:20px 0;"
               :cfg="tableCfg">
    </app-table>
    <a-pagination v-model:current="pagination.curPage" :total="pagination.total" @change="onPageChange"></a-pagination>
    <a-modal
        v-model:visible="formModal.visible"
        :title="formModal.title"
        v-bind="formModal.attr || {}"
        :footer="null"
    >
      <app-form
          ref="modalForm"
          :field-cfg-list="formModal.fieldCfgList"
          :form-cfg="formModal.formCfg"
          @cancel="formModal.visible = false"
          v-model:visible="formModal.visible"
          v-model:saveBtnLoading="formModal.saveBtnLoading"
          @ok="onModalSave"
      />
    </a-modal>
  </div>
</template>

<script>
import {requestList} from "@/interface/AppPage";
import {initMiddleware} from "@/utils/appFunc";
const middleware = initMiddleware();
const { listEntry, addEntry, deleteEntry, editEntry, infoEntry } = middleware;

export default {
  props: {
    searchFieldList: {
      type: Array,
      default: () => []
    },
    tableCfg: {
      type: Object,
      default: () => ({})
    },
    requestList: {
      type: Object,
      default: () => requestList
    },
    modalCfg: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const {modalCfg: { attr = {},fieldCfgList = [], formCfg = {} }} = this;
    return {
      searchFieldsValue: {},
      pagination: {
        curPage: 1,
        pageSize: 10,
        total: 0
      },
      formModal: {
        visible: false,
        type: 'add', // add | edit
        selectedRow: null,
        saveBtnLoading: false,
        attr,
        fieldCfgList,
        formCfg
      }
    }
  },
  methods: {
    getMiddleware() {
      return middleware;
    },
    onPageChange(curPage,pageSize) {
      this.pagination.curPage = curPage;
      this.pagination.pageSize = pageSize;
      this.getSearchList({fieldsValue: this.searchFieldsValue});
    },
    onModalSave({fieldsValue}) {
      const {formModal: {type, selectedRow}} = this;
      if (type === 'edit') fieldsValue.id = selectedRow.id;
      const params = {
        cb: loading => this.formModal.saveBtnLoading = loading,
        params: fieldsValue
      }
      const modalMiddleware = middleware[`${type}Entry`];
      modalMiddleware.appendParams(params)
      modalMiddleware.go(() => {
        this.requestList[`${type}Item`](modalMiddleware.params).then(() => {
          this.$message.success('新增成功');
          this.formModal.visible = false;
          this.getSearchList({fieldsValue: this.searchFieldsValue});
        })
      })
    },
    initCfg() {
        this.initTableHeaderBtn();
        this.initActionColumnCfg();
    },
    // 表头添加按钮
    initTableHeaderBtn() {
        const { headerBtns = [] } = this.tableCfg;
        const addBtn = {
          text: '新增',
          attr: {
            type: 'primary',
          },
          evt: {
            click: () => {
              this.formModal.type = 'add';
              this.formModal.visible = true;
            }
          }
        }
        const defaultBtns = [];
        if (this.requestList.addItem) {
          defaultBtns.push(addBtn);
        }
        this.tableCfg.headerBtns = [...headerBtns,...defaultBtns];
    },
    // 操作列添加默认按钮
    initActionColumnCfg() {
      let actionColumn = this.tableCfg.columns.find(column => column?.slots?.customRender === 'action');
      const { deleteItem,editItem } = this.requestList;
      const defaultBtns = [];
      const actionColumnVisible = deleteItem || deleteItem;
      const deleteBtn = {
        text: '删除',
        loadingKey: 'delete',
        confirmCfg: {
          evt: {
            confirm: ({record}) => {
              const params = {
                cb: loading => record.deleteLoading = loading,
                params: {id: record.id}
              }
              deleteEntry.appendParams(params);
              deleteEntry.go(() => {
                this.requestList.deleteItem(deleteEntry.params).then(() => {
                  this.$message.success('删除成功');
                  this.getSearchList({fieldsValue: this.searchFieldsValue});
                })
              })
            }
          }
        }
      }
      const editBtn = {
        text: '编辑',
        loadingKey: 'edit',
        evt: {
          click: ({record}) => {
            this.formModal.type = 'edit';
            this.formModal.selectedRow = record;
            const params = {
              cb: loading => record.editLoading = loading,
              params: {id: record.id}
            }
            infoEntry.appendParams(params);
            infoEntry.go(() => {
              this.requestList.infoItem(infoEntry.params).then(res => {
                this.formModal.visible = true;
                this.$nextTick(() => {
                  const {form} = this.$refs.modalForm;
                  this.setModalFormFieldsValue({data: res.data,form})
                })
              })
            })
          }
        }
      }
      // 删除接口有传入
      if (this.requestList.deleteItem) {
        defaultBtns.push(deleteBtn);
      }
      // 获取item信息接口有传入
      if (this.requestList.infoItem) {
        defaultBtns.push(editBtn);
      }
      if (actionColumn) { // 有操作列
        const {btns = []} = actionColumn;
        actionColumn.btns = [...btns,...defaultBtns];  // 防止btns为undefined
      } else if (!actionColumn && actionColumnVisible) { // 无操作列
        this.tableCfg.columns.push({
          dataIndex: 'action',
          title: '操作',
          fixed: 'right',
          slots: { customRender: 'action' },
          btns: defaultBtns
        })
      }
    },
    getFormModalDecoratorIds() {
      return this.modalCfg.fieldCfgList.filter(fieldCfg => fieldCfg.decorator)
      .map(fieldCfg => fieldCfg.decorator[0])
    },
    setModalFormFieldsValue({data,form}) {
      this.getFormModalDecoratorIds().forEach(id => {
        form[id] = data[id];
      })
    },
    // 更新表格列表
    getSearchList({fieldsValue}) {
      this.searchFieldsValue = fieldsValue;
      this.fetchList({fieldsValue});
    },
    // 获取表格列表
    fetchList({fieldsValue = {}} = {}) {
        const {requestList: {listItem},pagination:{curPage,pageSize}} = this;
        if (listItem) {
          const params = {
            cb: loading => this.tableCfg.loading = loading,
            params: {
              ...fieldsValue,
              curPage,
              pageSize
            }
          }
          listEntry.appendParams(params);
          listEntry.go(() => {
            listItem(listEntry.params).then(res => {
              const {data} = res;
              this.tableCfg.dataSource = data.list;
              this.pagination.total = data.total;
            })
          })
        }
    }
  },
  mounted() {
    this.initCfg();
  }
}
</script>