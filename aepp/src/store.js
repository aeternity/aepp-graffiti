// TODO: store is currently unused, but added for future convenience
import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'ae-drone',
  storage: window.localStorage
})

const store = new Vuex.Store({
  state: {
    images: [],
    uploadedImage: {},
    transformedImage: null,
    transformationSettings: {}
  },
  plugins: [vuexPersist.plugin],
  getters: {},
  mutations: {
    addImage (state, image) {
      state.images.push(image)
    },
    addUploadedImage (state, image) {
      state.uploadedImage = image
    },
    addTransformedImage (state, image) {
      state.transformedImage = image
    },
    saveUpdatedSettings (state, settings) {
      state.transformationSettings = settings
    },
    clearCachedImages (state) {
      state.images = []
    }
  },
  actions: {
    async loadImages ({ state, commit }) {
      commit(`clearCachedImages`)
      for (let i = 0; i < 100; i++) {
        commit(`addImage`, {
          src: `https://picsum.photos/200/300/?random`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 }
        })
      }
    },
    uploadImage (context, file) {
      const fReader = new FileReader()
      fReader.onload = () => {
        context.commit(`addUploadedImage`, {
          originalName: file.name,
          fileName: file.name,
          url: fReader.result
        })
      }
      fReader.readAsDataURL(file)
    },
    transformImage ({ commit, state }) {
      // TODO DO SOME STUFF, CALL SDK ETC
      console.log(JSON.stringify(state.uploadedImage))
      commit(`addTransformedImage`, state.uploadedImage)
    },
    async updateSettings ({ commit, state }, update) {
      commit(`saveUpdatedSettings`, Object.assign(state.transformationSettings, update))
    }
  }
})

export default store
