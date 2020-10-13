<template>
  <div>
    <a-form ref="ruleForm" v-bind="formCfg" :model="form" :rules="rules" :layout="formCfg.layout || 'inline'">
      <div :class="{'search-bar': isSearchBar}">
        <template v-for="(cfg, idx) in fieldCfgList">
          <a-form-item v-if="cfg.decorator" v-bind="cfg.formItem || {}" :name="cfg?.decorator?.[0] || ''" :key="idx">
            <a-input v-if="cfg.type === 'input'"
                     :type="cfg.inputType || 'text'"
                     v-model:value="form[getDecoratorId(cfg)]"
                     v-bind="cfg.field || {}"
            >
              <template v-slot:addonAfter>
                <slot :name="cfg.decorator[0] + 'AddonAfter'" :props="{form,cfg}"></slot>
              </template>
              <template v-slot:addonBefore>
                <slot :name="cfg.decorator[0] + 'AddonBefore'" :props="{form,cfg}"></slot>
              </template>
            </a-input>
            <div class="textarea-wrap" v-else-if="cfg.type === 'textarea'">
              <a-textarea v-model:value="form[getDecoratorId(cfg)]"
                        v-bind="cfg.field || {}"
                          :allowClear="cfg?.field?.allowClear === undefined ? true: cfg.field.allowClear"
                          :autoSize="cfg?.field?.autoSize === undefined ? {minRows:4,maxRows:6}: cfg.field.autoSize"
              />
              <template v-if="cfg.btns">
                <a-button v-for="(btn, idx) in cfg.btns"
                          class="area-btn"
                          :style="{top: `${idx * 45}px`}"
                          v-on="btn"
                          @click="btn.action({fieldsValue:form,getForm,cfg})">{{btn.text}}</a-button>
              </template>
            </div>
            <a-checkbox-group v-else-if="cfg.type === 'checkbox'"
                              v-model:value="form[getDecoratorId(cfg)]"
                              v-bind="cfg.field || {}"/>
            <a-select v-else-if="cfg.type === 'select'"
                v-model:value="form[getDecoratorId(cfg)]"
                v-bind="cfg.field || {}"
                v-on="cfg?.field?.evt || {}"/>
          </a-form-item>
          <div v-else-if="cfg.type === 'btn'" class="slot-btn">
            <a-button @click="cfg.action({fieldsValue:form,getForm,cfg})">{{cfg.text}}</a-button>
          </div>
        </template>
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
    <slot name="footer" :props="{getForm}"/>
  </div>
</template>
<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.slot-btn {
  position: relative;

  button {
    position: absolute;
    top: -130px;
    right: 0;
  }
}
.textarea-wrap {
  position: relative;
  .area-btn {
    position: absolute;
    top: 0;
    right: -80px;
  }
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
    getForm () {
      return this.$refs.ruleForm;
    },
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