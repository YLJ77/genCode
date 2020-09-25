<template>
  <div>
    <app-form
        :field-cfg-list="fieldCfgList"
        mode="searchBar"
        :form="form"
        :rules="rules"
    />
  </div>
</template>

<script>
import AppForm from "@/components/AppForm";
import {genFormAndRules} from "../../../vue3/src/utils/appFunc";

export default {
  data() {
    const fieldCfgList = [
      {
        type: 'input',
        label: 'id',
        decorator: ['id']
      },
      {
        type: 'input',
        label: 'id',
        decorator: ['id1']
      },
      {
        type: 'input',
        label: 'id',
        decorator: ['id2']
      },
      {
        type: 'input',
        label: 'id',
        decorator: ['id3']
      },
      {
        type: 'input',
        label: 'id',
        decorator: ['id4']
      },
    ];
    const {form, rules} = genFormAndRules(fieldCfgList);
    return {
      fieldCfgList,
      form,
      rules
    }
  },
  components: {
    AppForm
  }
}
</script>
