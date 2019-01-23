import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'
import Jimp from 'jimp/es'
import DroneTracer from '../node_modules/dronetracer/src/DroneTracer/main.js'

Vue.use(Vuex)

const API_URL = 'https://ae-art-server.piwo.app'
// const API_URL = 'http://localhost:3000';
// const API_URL = 'http://192.168.43.131:3000';
const vuexPersist = new VuexPersist({
  key: 'ae-drone',
  storage: window.localStorage
})

function initialState () {
  return {
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
      scaleFactor: 4,
      MAX_SCALING: 4,
      threshold: 50,
      color: 0,
      hysteresisHighThreshold: 50,
      centerline: false,
      blurKernel: 3,
      binaryThreshold: 45,
      dilationRadius: 6
    },
    position: {
      x: 0,
      y: 0
    },
    droneObject: null,
    biddingSlotId: null,
    progressCallback: () => {},

    // HARDCODED SETTINGS
    imageSettings: {
      max: { width: 1000, height: 1000 },
      min: { width: 400, height: 300 }
    },
    canvas: {
      url: API_URL + '/rendered/latest.png',
      width: 3300,
      height: 5000,
      pixelToMM: 10, // Pixel * pixelToMM = mm
    },
    droneSettings: {
      wallId: 'MX19-001',
      gpsLocation: [0, 0],
      wallSize: [30000, 20000],   // in mm
      canvasSize: [20000, 20000], // mm
      canvasPosition: [0, 0], // mm (origin = [bottom left])
      colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
      droneResolution: 200,       // min distance drone can move, in mm
      dronePrecisionError: 150,   // error margin, mm
      droneFlyingSpeed: 0.3,  // average drone flying speed [m/s],
      minimumImageSize: [10, 10]
    },
    blockchainSettings: {
      contractAddress: 'ct_2U9MkZK9JXTUemAURfCd8BDQZcXK4Gk8Hwfqxf1ASSYNrQnhjz'
    },
    apiUrl: API_URL
  }
}

const store = new Vuex.Store({
  state: initialState,
  plugins: [vuexPersist.plugin],
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
    },
    modifyProgressCallback (state, progressCallback) {
      state.progressCallback = progressCallback
    },
    modifyBiddingSlotId (state, slotId) {
      state.biddingSlotId = slotId
    },

    resetState (state) {
      // acquire initial state
      const s = initialState()
      Object.keys(s).forEach(key => {
        state[key] = s[key]
      })
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

          commit('modifyOriginalImage', {
            src: imageSource,
            type: file.type
          })
          commit('modifyPosition', {
            x: Math.round(Math.random() * 1000),
            y: Math.round(Math.random() * 1000)
          })
        } catch (e) {
          console.error(e)
        }
      }

      fReader.readAsDataURL(file)
    },
    resetImage ({ commit }) {
      commit('modifyOriginalImage', {})
    },
    async transformImage ({ commit, state, dispatch }) {

      commit('modifyTransformedImage', Object.assign({}, state.transformedImage, {
        src: null,
        width: 0,
        height: 0,
        progress: -1,
        dronetime: 0
      }))

      const tracer = new DroneTracer(state.droneSettings)

      const dronePaint = await tracer.transform(state.originalImage.src, (p) => {
          state.progressCallback(p)
        },
        {
          hysteresisHighThreshold: state.settings.hysteresisHighThreshold,
          centerline: state.settings.centerline,
          blurKernel: state.settings.blurKernel,
          binaryThreshold: state.settings.binaryThreshold,
          dilationRadius: state.settings.dilationRadius
        })
      commit('modifyDroneObject', dronePaint)
      dispatch('applyPostRenderingChanges')

    },
    async applyPostRenderingChanges ({ commit, state }) {

      //TODO rerender image on error
      try {
        console.log(state.settings.scaleFactor)
        state.droneObject.setPaintingScale(state.settings.scaleFactor)
        state.droneObject.setPaintingPosition(state.position.x * state.canvas.pixelToMM, state.position.y * state.canvas.pixelToMM)
        state.droneObject.setPaintingColor(state.droneSettings.colors[state.settings.color])
      } catch (e) {
        console.error(e)
      }

      let image = {}

      image.src = `data:image/svg+xml;base64,${btoa(state.droneObject.svgFile)}`

      image.height = state.droneObject.paintingHeight / 10
      image.width = state.droneObject.paintingWidth / 10
      image.dronetime = Math.round(state.droneObject.estimatedTime / 1000 / 60)

      commit('modifyTransformedImage', Object.assign({}, state.transformedImage, image))
      commit('modifyDroneObject', state.droneObject)
    },
    updateOriginalImage ({ commit, state }, update) {
      commit('modifyOriginalImage', Object.assign({}, state.originalImage, update))
    },
    updateTransformedImage ({ commit, state }, update) {
      commit('modifyTransformedImage', Object.assign({}, state.transformedImage, update))
    },
    async updateSettings ({ commit, state, dispatch }, update) {

      // CHECK IF ADDITIONAL ACTIONS ARE REQUIRED
      console.log('applying changes')
      const updatedKeys = Object.keys(update)
      const changedKeys = updatedKeys.filter(key => {
        return state.settings[key] !== update[key]
      })

      console.log(changedKeys)

      // UPDATE SETTINGS ANYWAYS
      commit('modifySettings', Object.assign({}, state.settings, update))

      const keys = [
        'hysteresisHighThreshold',
        'centerline',
        'blurKernel',
        'binaryThreshold',
        'dilationRadius'
      ]

      if (keys.filter(key => changedKeys.indexOf(key) !== -1).length > 0) {
        await dispatch('transformImage')
      }

      if (changedKeys.includes('scaleFactor') ||
        changedKeys.includes('color')) {
        await dispatch('applyPostRenderingChanges')
      }

    },
    updatePosition ({ commit, state, dispatch }, update) {
      commit('modifyPosition', Object.assign({}, state.position, update))
      dispatch('applyPostRenderingChanges')
    },
    resetState ({ commit }) {
      commit('resetState')
    },
    registerProgressCallback ({ commit }, cb) {
      commit('modifyProgressCallback', cb)
    },
    removeProgressCallback ({ commit }) {
      commit('modifyProgressCallback', () => {
      })
    },
    updateBiddingSlotId ({ commit }, slotId) {
      commit('modifyBiddingSlotId', slotId)
    }
  }
})

export default store
