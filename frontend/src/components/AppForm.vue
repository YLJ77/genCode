<template>
  <div>
    <a-form ref="ruleForm" :model="form" :rules="rules" :layout="layout">
      <div :class="{'search-bar': isSearchBar}">
        <a-form-item v-for="(cfg, idx) in fieldCfgList" :name="cfg.decorator[0]" :label="cfg.label" :key="idx">
          <a-input v-if="cfg.type === 'input'"
              :type="cfg.inputType || 'text'"
              v-model:value="form[getDecoratorId(cfg)]"
          />
        </a-form-item>
        <div v-if="isSearchBar">
          <a-button type="primary">搜索</a-button>
          <a-button style="margin-left: 10px;">重置</a-button>
        </div>
      </div>
    </a-form>
    <div v-if="footerVisible && !isSearchBar" class="app-hc-vc" style="margin-top: 20px;">
      <a-button>取消</a-button>
      <a-button style="margin-left: 20px;" @click="save" type="primary">保存</a-button>
    </div>
    <slot name="footer" :props="{getForm: () => this.$refs.ruleForm}"/>
  </div>
</template>
<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
<script>
export default {
  props: {
    form: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'form' // form | searchBar
    },
    footerVisible: {
      type: Boolean,
      default: true
    },
    layout: {
      type: String,
      default: 'inline'
    },
    fieldCfgList: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      testRules: {
        account: [
          {required: true, message: '请输入账号', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    isSearchBar() {
      return this.mode === 'searchBar'
    }
  },
  methods: {
    getDecoratorId(cfg) {
      return cfg.decorator[0]
    },
    save() {
      this.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (!err) {
          this.$emit('save',{form:this.form,fieldsValue});
        }
      })
    }
  }
}
</script>