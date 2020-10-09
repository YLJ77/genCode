<template>
  <a-upload v-on="cfg.upload.evt || {}"
            v-bind="cfg.upload.attr || {}"
            class="ml20"
            v-model:fileList="cfg.upload.fileList"
            name="file"
            :multiple="true"
            :headers="headers"
  >
    <a-button v-on="cfg.evt || {}" v-bind="cfg.attr || {}"
    ><upload-outlined />{{cfg.text || '上传'}}</a-button>
  </a-upload>
</template>

<script>
import {UploadOutlined} from '@ant-design/icons-vue'

export default {
  props: {
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