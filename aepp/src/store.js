// TODO: store is currently unused, but added for future convenience
import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'
import transform from './drone.js'
import { getGoodImageDimensions } from './helper.js'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'ae-drone',
  storage: window.localStorage
})

const store = new Vuex.Store({
  state: {
    originalImage: {
      src: null,
      width: 0,
      height: 0,
      type: null,
      file: null
    },
    transformedImage: {
      src: null,
      width: 0,
      height: 0
    },
    settings: {
      scaleFactor: 1,
      scaledHeight: 0,
      scaledWidth: 0
    },
    position: {
      x: 0,
      y: 0
    },

    imageSettings: {
      max: { width: 10, height: 10 },
      min: { width: 4, height: 3 }
    },
    meterToPixel: 10 // Meter * meterToPixel = Pixel
  },
  //plugins: [vuexPersist.plugin],
  getters: {},
  mutations: {
    modifyOriginalImage (state, originalImage) {
      state.originalImage = originalImage
    },
    modifyTransformedImage (state, transformedImage) {
      state.transformedImage = transformedImage
    },
    modifySettings (state, settings) {
      state.settings = settings
    },
    modifyPosition (state, position) {
      state.position = position
    }
  },
  actions: {
    uploadImage ({ commit, state }, file) {

      const fReader = new FileReader()

      fReader.onload = () => {
        commit(`modifyOriginalImage`, {
          src: fReader.result,
          file: file
        })
        commit(`modifyPosition`, {
          x: Math.random() * 1000,
          y: Math.random() * 1000
        })
      }

      fReader.readAsDataURL(file)
    },
    async transformImage ({ commit, state }) {

      let image = {}
      console.log('transforming')
      const dronePaint = await transform(state.originalImage.file, (p) => console.log(`${p}%`))
      image.src = `data:image/svg+xml;base64,${btoa(dronePaint.svg)}`

      console.log('image dimensions')
      const { width, height } = getGoodImageDimensions(
        state.originalImage.width,
        state.originalImage.height,
        200 * state.settings.scaleFactor,
        200 * state.settings.scaleFactor
      )

      image.height = height
      image.width = width

      console.log(image)

      commit(`modifyTransformedImage`,  Object.assign({}, state.transformedImage, image))
    },
    updateOriginalImage ({ commit, state }, update) {
      commit(`modifyOriginalImage`, Object.assign({}, state.originalImage, update))
    },
    updateTransformedImage ({ commit, state }, update) {
      commit(`modifyTransformedImage`, Object.assign({}, state.transformedImage, update))
    },
    updateSettings ({ commit, state }, update) {
      commit(`modifySettings`, Object.assign({}, state.settings, update))
    },
    updatePosition ({ commit, state }, update) {
      commit(`modifyPosition`, Object.assign({}, state.position, update))
    },
  }
})

export default store
