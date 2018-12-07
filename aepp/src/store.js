// TODO: store is currently unused, but added for future convenience
import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    images: []
  },
  getters: {},
  mutations: {
    addImage (state, image) {
      state.images.push(image)
    }
  },
  actions: {
    async loadImages (state) {
      for (let i = 0; i < 100; i++) {
        state.commit(`addImage`, {
          src: `https://picsum.photos/200/300/?random`,
          position: { x: Math.random() * 100, y: Math.random() * 100 }
        })
      }
    }
  }
})

export default store
