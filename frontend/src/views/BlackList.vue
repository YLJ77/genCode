<template>
  <div>
<!--    <app-page></app-page>-->
    <h1>black list</h1>
  </div>
</template>

<script>
import {Middleware} from "@/utils/appFunc";

export default {
  created() {
    const args = {foo: 'a'};
    const app = new Middleware();
    app.use((next, params) => {
          console.warn(params);
          params.a = 'a';
          setTimeout(() => {
            console.warn('first')
            next();
          }, 100)
        }
    )
    app.use((next, params) => {
          params.b = 'b';
          setTimeout(() => {
            console.warn('second')
            next();
          }, 0)
        }
    )
app.appendParams(args)
    app.go(() => {
      console.log(app.params);
      console.log('last')
    }, args)
  }
}
</script>