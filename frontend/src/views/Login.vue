<template>
  <div class="app-hc-vc">
    <AppForm
        style="width: 300px;margin-top:50px;"
        :field-cfg-list="fieldCfgList"
        :footer-visible="false"
    >
      <template v-slot:footer="{props:{getForm}}">
        <div class="app-hc-vc" style="margin-top:20px;">
          <a-button @click="toLogin({getForm})" type="primary" :loading="loginBtnLoading">登录</a-button>
        </div>
      </template>
    </AppForm>
  </div>
</template>

<script>

import AppForm from "@/components/AppForm";
import {mapActions} from 'vuex'

export default {
  name: 'Home',
  data() {
    const fieldCfgList = [
      {
        type: 'input',
        formItem: {
          label: '账号',
        },
        decorator: ['email', {
          rules: [
            {required: true, message: '请输入账号', trigger: 'change' }
          ]
        }]
      },
      {
        type: 'input',
        formItem: {
          label: '密码',
        },
        inputType: 'password',
        decorator: ['password', {
          rules: [
            {required: true, message: '请输入密码'}
          ]
        }]
      }
    ];
    return {
      fieldCfgList,
      loginBtnLoading: false
    }
  },
  methods: {
    ...mapActions('login',['login']),
    toLogin({getForm}) {
      getForm().validate().then(fieldsValue => {
        this.login({
          cb: loading => this.loginBtnLoading = loading,
          params: fieldsValue
        }).then((res) => {
          localStorage.setItem('token', res.data.token);
          window.opener.postMessage(res.data.token, 'https://www.lagou.com')
          this.$message.success('登录成功');
          this.$router.push('/home/create-page');
        })
      })
    }
  },
  components: {
    AppForm
  }
}
</script>
