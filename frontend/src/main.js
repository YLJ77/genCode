import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Button, Form, Input,Select, Checkbox, Dropdown, Upload, message, Alert, Menu, PageHeader, Table, Modal, Collapse } from 'ant-design-vue';
import '@/assets/common.scss'

const app = createApp(App);
window.vm = app;
app.config.globalProperties.$message = message;
app.use(Button);
app.use(Form);
app.use(Input);
app.use(Alert);
app.use(Menu);
app.use(PageHeader);
app.use(Table);
app.use(Modal);
app.use(Collapse);
app.use(Checkbox);
app.use(Dropdown);
app.use(Upload);
app.use(Select);

app.use(store).use(router).mount('#app');
