import Vue from 'vue';
import App from './App'
import Vuetify from 'vuetify';
import Router from 'vue-router';

// vuetifyのスタイルシートload
import 'vuetify/dist/vuetify.min.css';
// material-design-iconsをload
import 'material-design-icons-iconfont/dist/material-design-icons.css';
// fontawesome
import '@fortawesome/fontawesome-free/css/all.css';
// IE11/Safari9用のpolyfill
import 'babel-polyfill';

// Homeコンポーネント
const Home = {
  template: '<v-alert :value="true" type="success">Hello, World!</v-alert>'
};

Vue.use(Vuetify); // Vuetifyのコンポーネントを使用可能に

// ルーター設定
Vue.use(Router);
const router = new Router({
  mode: 'history',
  routes: [
    {path: '/index.html', component: Home},
  ]
});

new Vue({
  el: "#app",
  router,
  components: {App},
  template: '<App/>'
});