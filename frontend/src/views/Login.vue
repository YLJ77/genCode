<template>
  <div class="app-hc-vc">
    <AppForm
        style="width: 300px;margin-top:50px;"
        :field-cfg-list="fieldCfgList"
        :footer-visible="false"
        :form="form"
        :rules="rules"
    >
      <template v-slot:footer="{props:{getForm}}">
        <div class="app-hc-vc" style="margin-top:20px;">
          <a-button @click="toLogin({getForm})" type="primary" :loading="form.loading">登录</a-button>
        </div>
      </template>
    </AppForm>
  </div>
</template>

<script>

import AppForm from "@/components/AppForm";
import {mapActions} from 'vuex'
import {genFormAndRules} from "../utils/appFunc";

export default {
  name: 'Home',
  data() {
    const fieldCfgList = [
      {
        type: 'input',
        label: '账号',
        decorator: ['email', {
          initialValue: 'foo',
          rules: [
            {required: true, message: '请输入账号', trigger: 'change' }
          ]
        }]
      },
      {
        type: 'input',
        label: '密码',
        inputType: 'password',
        decorator: ['password', {
          rules: [
            {required: true, message: '请输入密码'}
          ]
        }]
      }
    ];
    const {form, rules} = genFormAndRules(fieldCfgList);
    console.warn(form,rules);
    return {
      form,
      rules,
      fieldCfgList
    }
  },
  methods: {
    ...mapActions('login',['login']),
    toLogin({getForm}) {
      getForm().validate().then(fieldsValue => {
        this.login({
          cb: loading => this.form.loading = loading,
          params: fieldsValue
        }).then(() => {
          this.$message.success('登录成功');
          this.$router.push('/home');
        })
      })
    }
  },
  components: {
    AppForm
  }
}
</script>
