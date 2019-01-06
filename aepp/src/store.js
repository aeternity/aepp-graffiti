// TODO: store is currently unused, but added for future convenience
import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'
import Jimp from 'jimp/es'
import DroneTracer from '../node_modules/dronetracer/src/DroneTracer/main.js'

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
      progress: -1,
      dronetime: -1
    },
    settings: {
      scaleFactor: 1,
      scaledHeight: 0,
      scaledWidth: 0,
      MAX_SCALING: 2.5,
      threshold: 0.1,
      color: 0
    },
    position: {
      x: 0,
      y: 0
    },

    // HARDCODED SETTINGS
    imageSettings: {
      max: { width: 1000, height: 1000 },
      min: { width: 400, height: 300 }
    },
    canvas: {
      url: 'https://ae-art-server.piwo.app/rendered/latest.png',
      width: 3300,
      height: 5000,
      meterToPixel: 100, // Meter * meterToPixel = Pixel
    },
    droneSettings: {
      wallId: 1,
      gpsLocation: [-99.134982, 19.413494],
      dimensions: [33, 50],
      colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
      droneResolution: 0.1 // default 0.2
    },
    blockchainSettings: {
      contractAddress: 'ct_xZX75A1E5JWbuLi4cnn6eKqd3ZGnKF3vM9c656bFVS8ZaPYVp'
    },
    droneObject: null
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
    },
    modifyDroneObject (state, newDroneObject) {
      state.droneObject = newDroneObject
    }

  },
  actions: {
    uploadImage ({ state, commit }, file) {

      const fReader = new FileReader()

      fReader.onload = async () => {
        try {
          const image = await Jimp.read(fReader.result)

          image.scaleToFit(state.imageSettings.min.width, state.imageSettings.min.height)

          const imageSource = await image.getBase64Async(file.type)

          commit(`modifyOriginalImage`, {
            src: imageSource,
            file: file
          })
          commit(`modifyPosition`, {
            x: Math.round(Math.random() * 1000),
            y: Math.round(Math.random() * 1000)
          })
        } catch (e) {
          console.error(e)
        }
      }

      fReader.readAsDataURL(file)
    },
    async transformImage ({ commit, state, dispatch }) {

      commit(`modifyTransformedImage`, Object.assign({}, state.transformedImage, {
        src: null,
        width: 0,
        height: 0,
        progress: -1
      }))

      const tracer = new DroneTracer(state.droneSettings)
      const dronePaint = await tracer.transform(state.originalImage.file, (p) => {
        commit(`modifyProgress`, p)
      }, {
        size: [5, 8], // graffiti size in meters | default 4mx3m
        color: state.settings.color, // default 0. Color id from the paintingConfig color list
        threshold: state.settings.threshold
      })

      commit(`modifyDroneObject`, dronePaint)
      dispatch(`applyPostRenderingChanges`)

    },
    applyPostRenderingChanges ({ commit, state }) {

      state.droneObject.setPaintingScale(state.scaleFactor)
      state.droneObject.setPaintingPosition(state.position.x / state.canvas.meterToPixel, state.position.y / state.canvas.meterToPixel)

      let image = {}

      image.src = `data:image/svg+xml;base64,${btoa(state.droneObject.svg)}`

      image.height = state.originalImage.height * state.settings.scaleFactor
      image.width = state.originalImage.width * state.settings.scaleFactor
      image.dronetime = state.droneObject.estimatedTime;

      commit(`modifyTransformedImage`, Object.assign({}, state.transformedImage, image))
      commit(`modifyDroneObject`, state.droneObject)
    },
    updateOriginalImage ({ commit, state }, update) {
      commit(`modifyOriginalImage`, Object.assign({}, state.originalImage, update))
    },
    updateTransformedImage ({ commit, state }, update) {
      commit(`modifyTransformedImage`, Object.assign({}, state.transformedImage, update))
    },
    updateSettings ({ commit, state, dispatch }, update) {

      // CHECK IF ADDITIONAL ACTIONS ARE REQUIRED
      console.log("applying changes");
      const updatedKeys = Object.keys(update)
      const changedKeys = updatedKeys.filter(key => {
        return state.settings[key] !== update[key]
      })

      // UPDATE SETTINGS ANYWAYS
      commit(`modifySettings`, Object.assign({}, state.settings, update))

      console.log(changedKeys)

      if (changedKeys.includes('color') ||
        changedKeys.includes('threshold')) {
        dispatch(`transformImage`)
      }

      if (changedKeys.includes('scaleFactor')) {
        dispatch(`applyPostRenderingChanges`)
      }

    },
    updatePosition ({ commit, state }, update) {
      commit(`modifyPosition`, Object.assign({}, state.position, update))
    }
  }
})

export default store
