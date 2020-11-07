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
    const app = new Middleware();
/*
    app.use(next => {
          setTimeout(() => {
            console.warn('first')
            next();
          }, 2000)
        }
    )
    app.use(next => {
          setTimeout(() => {
            console.warn('second')
            next();
          }, 0)
        }
    )
*/
    app.go(() => console.log('last'));
  }
}
</script>