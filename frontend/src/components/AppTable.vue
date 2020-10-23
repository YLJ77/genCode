<template>
  <div id="app-table">
    <div class="top-btns app-he">
      <template v-for="btn in topBtns">
        <a-button v-if="(btn.type || 'btn') === 'btn'"
            v-on="btn.evt || {}"
            v-bind="btn.attr || {}"
            class="ml20">{{btn.text}}</a-button>
        <app-upload v-else-if="btn.type === 'upload'"
                    :cfg="btn"
        ></app-upload>
      </template>
    </div>
    <a-table v-bind="cfg" :scroll="{x:true}">
      <template v-for="slot in slots" v-slot:[slot]="{ text, index, record }">
        <slot :name="slot" :props="{text,index,record}"></slot>
      </template>
    </a-table>
  </div>
</template>
<style lang="scss" scoped>
#app-table {
  width: 80vw;
  .top-btns {
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
    topBtns: {
      type: Array,
      default: () => []
    },
    cfg: {
      type: Object,
      required: true
    }
  },
  computed: {
    slots() {
      return this.cfg.columns.filter(column => column.slots)
      .map(column => column.slots.customRender)
    }
  },
  components: {
    AppUpload
  }
}
</script>