<template>
<v-app>
  <v-navigation-drawer app></v-navigation-drawer>
  <v-toolbar app>
    <v-btn depressed color="error" @click.prevent="closeWindow">終了</v-btn>
    <v-text-field label="Email" placeholder="mail@example.com" v-model="email"/>
    <v-text-field label="Password" type="password" v-model="password"/>
    <v-btn depressed color="submit" @click.prevent="login">ログイン</v-btn>
  </v-toolbar>
  <v-content>
    <v-container fluid>
      <v-text-field label="エピソードID" placeholder="mg12345" v-model="ep_id"/>
      <v-btn depressed color="submit" @click.prevent="downloadEpisode">ダウンロード</v-btn>
      <ul v-for="favorite in favorites">
        <li>{{ favorite.id }}｜{{ favorite.title }}</li>
      </ul>
    </v-container>
  </v-content>
  <v-footer app></v-footer>
</v-app>
</template>

<script>
export default {
  data: () => ({
    email: '',
    password: '',
    favorites: [],
    ep_id: '',
  }),
  methods: {
    closeWindow() {
      window.close();
      eel.exit_system() // pythonで定義した exit_system 関数を実行
    },
    login() {
      eel.nico_login(this.email, this.password);
      this.favorites = eel.nico_get_favorites()
      console.log(this.favorites);
    },
    downloadEpisode() {
      console.log(this.ep_id, 'Downloading...');
      eel.nico_download_episode(this.ep_id, './downloads')
    }
  }
}
</script>