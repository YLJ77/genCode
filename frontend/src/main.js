import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Button, Form, Input, message, Alert, Menu, PageHeader, Table } from 'ant-design-vue';
import '@/assets/common.scss'

const app = createApp(App);
app.config.globalProperties.$message = message;
app.use(Button);
app.use(Form);
app.use(Input);
app.use(Alert);
app.use(Menu);
app.use(PageHeader);
app.use(Table);

app.use(store).use(router).mount('#app')
