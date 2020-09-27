<template>
  <div>
<!--
    <a-page-header
        style="border: 1px solid rgb(235, 237, 240)"
        title="page header"></a-page-header>
-->
    <div style="display: flex;height:88vh;">
      <a-menu
          style="width: 256px"
          mode="inline"
          @click="handleClick"
          theme="dark"
          :default-selected-keys="defaultSelectedKeys"
      >
        <a-menu-item v-for="menu in menuList" :key="menu.key">
          <home-outlined/>
          <span>{{menu.key}}</span>
        </a-menu-item>
      </a-menu>
      <main style="padding: 20px;width:100%;"><router-view/></main>
    </div>
  </div>
</template>

<script>
import { HomeOutlined, } from '@ant-design/icons-vue';
import {reactive, toRefs} from 'vue'

export default {
  setup() {
    const data = reactive({
      defaultSelectedKeys: ['create-page'],
      menuList: [
        { key: 'user' },
        { key: 'create-page' },
      ]
    });
    return {...toRefs(data)};
  },
  methods: {
    handleClick(item) {
      this.$router.push(`/home/${item.key}`);
    }
},
components: {
    HomeOutlined
  }
}
</script>