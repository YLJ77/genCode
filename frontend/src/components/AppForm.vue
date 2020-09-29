<template>
  <div>
    <a-form ref="ruleForm" v-bind="formCfg" :model="form" :rules="rules" :layout="formCfg.layout || 'inline'">
      <div :class="{'search-bar': isSearchBar}">
        <a-form-item v-for="(cfg, idx) in fieldCfgList" v-bind="cfg.formItem" :name="cfg.decorator[0]" :key="idx">
          <a-input v-if="cfg.type === 'input'"
             :type="cfg.inputType || 'text'"
             v-model:value="form[getDecoratorId(cfg)]"
             v-bind="cfg.field || {}"
          />
        </a-form-item>
        <div v-if="isSearchBar">
          <a-button type="primary" @click="search">搜索</a-button>
          <a-button style="margin-left: 10px;" @click="reset">重置</a-button>
        </div>
      </div>
    </a-form>
    <div v-if="footerVisible && !isSearchBar" class="app-hc-vc" style="margin-top: 20px;">
      <a-button @click="cancel">取消</a-button>
      <a-button style="margin-left: 20px;" @click="ok" type="primary" :loading="saveBtnLoading">保存</a-button>
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
import {reactive,toRefs,computed} from 'vue'
import {genFormAndRules} from "@/utils/appFunc";

export default {
  props: {
    saveBtnLoading: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'form' // form | searchBar
    },
    footerVisible: {
      type: Boolean,
      default: true
    },
    formCfg: {
      type: Object,
      default: () => ({})
    },
    fieldCfgList: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const data = reactive({
      isSearchBar: computed(() => {
        return props.mode === 'searchBar'
      })
    });
    return {
      ...toRefs(data),
    }
  },
  data() {
    const {model:form, rules} = genFormAndRules(this.fieldCfgList);
    return {
      form,
      rules
    }
  },
  methods: {
    search() {
      const fieldsValue = this.$refs.ruleForm.getFieldsValue();
      this.$emit('search', {fieldsValue});
    },
    reset() {
      this.$refs.ruleForm.resetFields();
      this.search();
    },
    getDecoratorId(cfg) {
      return cfg.decorator[0]
    },
    ok() {
      this.$refs.ruleForm.validate().then( fieldsValue => {
            this.$emit('ok',{form:this.form,fieldsValue});
            this.$emit('saveBtnLoading',true);
          }
      )
    },
    cancel() {
      this.$refs.ruleForm.resetFields();
      this.$emit('update:visible', false);
    }
  }
}
</script>