import MtTabAnime from './anime.js';

const vuetify = Vuetify.createVuetify();

const app = Vue.createApp({
  data() {
    return {
      tab: null,
      listTabShow: ['manager'],
      mapIcons: { // #Add
        'manager': 'mdi-table-of-contents',
        'anime': 'mdi-movie-open',
        'game': 'mdi-controller-classic',
        'movie': 'mdi-movie-roll',
        'film': 'mdi-film',
        'manga': 'mdi-book-open-page-variant',
        'account': 'mdi-account',
      },
    };
  },
  methods: {
    addTab (tabname) {
      this.listTabShow.push(tabname);
    },
  },
  components: {
    'mt-tab-anime': MtTabAnime,
  }
})
app.use(vuetify).mount('#app');
