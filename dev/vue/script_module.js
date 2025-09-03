import { createApp, ref } from 'vue'

var mt = {
  init: function() {
    createApp({
      setup() {
        const message = ref('Hello Vue!')
        return {
          message
        }
      }
    }).mount('#app')
  },
};

export default mt;