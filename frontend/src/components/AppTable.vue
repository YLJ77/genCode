<template>
  <div>
    <div class="top-btns app-he">
      <a-button v-for="btn in topBtns"
                @click="btn.action"
                :type="btn.type || 'default'"
                style="margin-left: 20px;">{{btn.text}}</a-button>
    </div>
    <a-table v-bind="cfg"></a-table>
  </div>
</template>
<style lang="scss" scoped>
.top-btns {
  margin-bottom: 20px;
}
</style>
<script>
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
  }
}
</script>