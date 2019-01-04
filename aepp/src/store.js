// TODO: store is currently unused, but added for future convenience
import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'
import transform from './drone.js'
import { getGoodImageDimensions } from './helper.js'
import Jimp from 'jimp/es'

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
      height: 0,
      progress: -1
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
    canvas: {
      url: 'https://ae-art-server.piwo.app/rendered/latest.png',
      width: 3300,
      height: 5000,
      meterToPixel: 100, // Meter * meterToPixel = Pixel,
    }
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
    },
    modifyProgress (state, progress) {
      state.transformedImage.progress = progress
    }
  },
  actions: {
    uploadImage ({ commit }, file) {

      const fReader = new FileReader()

      fReader.onload = async () => {
        try {
          const image = await Jimp.read(fReader.result)
          if (image.bitmap.height > 1000 || image.bitmap.width > 1000) image.scaleToFit(1000, 1000)
          //TODO UPSCALE IF TOO SMALL
          const imageSource = await image.getBase64Async(file.type)
          console.log(file)

          commit(`modifyOriginalImage`, {
            src: imageSource,
            file: file
          })
          commit(`modifyPosition`, {
            x: Math.random() * 1000,
            y: Math.random() * 1000
          })
        } catch (e) {
          console.error(e)
        }
      }

      fReader.readAsDataURL(file)
    },
    async transformImage ({ commit, state }) {

      let image = {}
      // const cleanDataString = state.originalImage.src.split(',')[1]
      // const fakeFile = new File([window.atob(cleanDataString)], 'image.png', { type: 'image/png' })
      //
      // console.log(fakeFile)
      //
      // const reader = new FileReader()
      //
      // reader.onload = function (e) {
      //   console.log(e.target.result)
      // }
      // // Read in the image file as a data URL.
      // reader.readAsDataURL(fakeFile)

      const dronePaint = await transform(state.originalImage.file, (p) => {
        console.log(`${p}%`)
        commit(`modifyProgress`, p)
      })

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

      commit(`modifyTransformedImage`, Object.assign({}, state.transformedImage, image))
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
