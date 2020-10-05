<template>
  <div>
    <div class="top-btns app-he">
      <template v-for="btn in topBtns">
        <a-button v-if="(btn.type || 'btn') === 'btn'"
            v-on="btn.evt || {}"
            v-bind="btn.attr || {}"
            class="ml20">{{btn.text}}</a-button>
        <a-upload v-else-if="btn.type === 'upload'"
            v-on="btn.upload.evt || {}"
            v-bind="btn.upload.attr || {}"
            class="ml20"
            v-model:fileList="btn.upload.fileList"
            name="file"
            :multiple="true"
            :headers="headers"
        >
          <a-button v-on="btn.evt || {}" v-bind="btn.attr || {}"
          ><upload-outlined />{{btn.text || '上传'}}</a-button>
        </a-upload>
      </template>
    </div>
    <a-table v-bind="cfg"></a-table>
  </div>
</template>
<style lang="scss" scoped>
.top-btns {
  margin-bottom: 20px;
}
.ml20 {
  margin-left: 20px;
}
</style>
<script>
import {UploadOutlined} from '@ant-design/icons-vue'
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
  data() {
    return {
      headers: {
        authorization: localStorage.getItem('token')
      }
    }
  },
  components: {
    UploadOutlined
  }
}
</script>