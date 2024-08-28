<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <main_View></main_View> <!-- 确保使用 main_View 组件 -->
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import main_View from './components/main_View.vue' // 确保导入 main_View 组件

export default {
  name: 'App',
  components: {
    HelloWorld,
    main_View // 确保注册 main_View 组件
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
