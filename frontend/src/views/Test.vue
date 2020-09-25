<template>
  <a-form
      ref="ruleForm"
      :model="form"
      :rules="rules"
  >
    <a-form-item ref="name" label="Activity name" name="name">
      <a-input v-model:value="form.name" />
    </a-form-item>
  </a-form>
</template>
<script>
export default {
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      other: '',
      form: {
        name: '',
      },
      rules: {
        name: [
          { required: true, message: 'Please input Activity name'},
        ],
      },
    };
  },
  methods: {
    onSubmit() {
      this.$refs.ruleForm
          .validate()
          .then(() => {
            console.log('values', this.form);
          })
          .catch(error => {
            console.log('error', error);
          });
    },
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },
  },
};
</script>
