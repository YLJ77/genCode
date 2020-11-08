<template>
  <div id="app-table">
    <div class="header-btns app-he">
      <template v-for="btn in (cfg.headerBtns || [])">
        <a-button v-if="(btn.type || 'btn') === 'btn'"
            v-on="btn.evt || {}"
            v-bind="btn.attr || {}"
            class="ml20">{{btn.text}}</a-button>
        <app-upload v-else-if="btn.type === 'upload'"
                    :cfg="btn"
        ></app-upload>
      </template>
    </div>
    <a-table v-bind="cfg" :pagination="false" :scroll="{x:true}">
      <template v-for="column in slotColumns" v-slot:[column.slots.customRender]="{ text, index, record }">
        <div v-if="column.slots.customRender === 'action'">
            <template v-for="btn in column.btns">
              <a-popconfirm v-if="btn.confirmCfg"
                  v-bind="btn.confirmCfg?.attr || {}"
                  :title="getPopConfirmTitle(btn)"
                  :ok-text="btn.confirmCfg?.attr?.okText || '确定'"
                  :cancel-text="btn.confirmCfg?.attr?.cancelText || '取消'"
                  @confirm="btn.confirmCfg?.evt?.confirm({record,text,index}) || (() => {})"
              >
                <a-button v-bind="btn.attr || {}" v-on="btn.evt || {}" :loading="record[`${btn.loadingKey}Loading`]" type="link">{{btn.text}}</a-button>
              </a-popconfirm>
              <a-button v-else v-bind="btn.attr || {}" @click="btn?.evt?.click({record,text,index}) || (() => {})" :loading="record[`${btn.loadingKey}Loading`]" type="link">{{btn.text}}</a-button>
            </template>
        </div>
        <slot v-else :name="slot" :props="{text,index,record}"></slot>
      </template>
    </a-table>
  </div>
</template>
<style lang="scss" scoped>
#app-table {
  width: 80vw;
  .header-btns {
    margin-bottom: 20px;
  }
  .ml20 {
    margin-left: 20px;
  }
  ::v-deep(td) {
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 200px;
      overflow: hidden;
  }
}
</style>
<script>
import AppUpload from "@/components/AppUpload";

export default {
  props: {
    cfg: {
      type: Object,
      required: true
    }
  },
  methods: {
    getPopConfirmTitle(btnCfg) {
      const {confirmCfg} = btnCfg;
      if (confirmCfg.title) {
        return confirmCfg.title;
      } else if (btnCfg.text === '删除') {
        return '确定删除？';
      } else {
        return `确定${btnCfg.text}`;
      }
    }
  },
  computed: {
    slotColumns() {
      return this.cfg.columns.filter(column => column.slots)
    }
  },
  components: {
    AppUpload
  }
}
</script>