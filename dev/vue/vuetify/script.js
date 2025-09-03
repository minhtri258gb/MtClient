import MyComponent from './mtcomponent.js'

const vuetify = Vuetify.createVuetify()

const app = Vue.createApp({
  data() {
    return {
      tab: null,
      items: [
        'anime', 'game', 'videos', 'images', 'news',
      ],
    };
  },
  components: {
    MyComponent
  }
})
app.use(vuetify).mount('#app')
