import Vuex from 'vuex'
import Vue from 'vue'
import VuexPersist from 'vuex-persist'
import Jimp from 'jimp/es'
import DroneTracer from '../node_modules/dronetracer/src/DroneTracer/main.js'
import config from '~/config'

Vue.use(Vuex)

// eslint-disable-next-line no-undef
BigInt.prototype.toJSON = function() { return Number(this); }

const vuexPersist = new VuexPersist({
  key: 'ae-drone-v0',
  storage: window.sessionStorage
})

function initialState () {
  return {
    firstTimeOpened: true,
    firstTimeRender: true,
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
      scaleFactor: 2,
      MAX_SCALING: 4,
      threshold: 50,
      color: '#f7296e',
      hysteresisHighThreshold: 50,
      centerline: false,
      blurKernel: 3,
      binaryThreshold: 45,
      dilationRadius: 6,
      strokeWidth: 100
    },
    position: {
      x: 0,
      y: 0
    },
    droneObject: null,
    bid: {
      slotId: null,
      slotObject: {},
      amount: null
    },
    progressCallback: () => {}
  }
}

const store = new Vuex.Store({
  state: initialState,
  plugins: [vuexPersist.plugin],
  getters: {},
  mutations: {
    modifyFirstTimeOpenedFalse (state) {
      state.firstTimeOpened = false
    },
    modifyFirstTimeRender (state) {
      state.firstTimeRender = false
    },
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
    modifyBidding (state, bid) {
      state.bid = bid
    },

    resetState (state) {
      // acquire initial state

      const conserve = {
        firstTimeOpened: state.firstTimeOpened
      }

      const s = initialState()
      Object.keys(s).forEach(key => {
        state[key] = s[key]
      })

      Object.keys(conserve).forEach(key => {
        state[key] = conserve[key]
      })
    }
  },
  actions: {

    uploadImage ({ commit }, file) {

      const fReader = new FileReader()

      fReader.onload = async () => {
        const image = await Jimp.read(fReader.result)

        image.scaleToFit(config.imageSettings.min.width, config.imageSettings.min.height)

        const imageSource = await image.getBase64Async(file.type)

        commit('modifyOriginalImage', {
          src: imageSource,
          type: file.type
        })
      }

      fReader.onerror = (e) => {
        throw Error(e.message)
      }

      fReader.readAsDataURL(file)
    },
    resetImage ({ commit }) {
      commit('modifyOriginalImage', {})
    },
    setFirstTimeOpenedFalse ({ commit }) {
      commit('modifyFirstTimeOpenedFalse')
    },
    setFirstTimeRenderFalse ({ commit }) {
      commit('modifyFirstTimeRender')
    },
    async transformImage ({ commit, state, dispatch }) {

      commit('modifyTransformedImage', Object.assign({}, state.transformedImage, {
        src: null,
        width: 0,
        height: 0,
        progress: -1,
        dronetime: 0
      }))

      const tracer = new DroneTracer(config.droneSettings)

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

      if (state.droneObject === null) {
        try {
          await dispatch('updatePosition', {
            x: Math.round(Math.random() * (config.canvas.realWidth - ((dronePaint.paintingWidth * state.settings.scaleFactor) / 10))),
            y: Math.round(Math.random() * (config.canvas.realHeight - ((dronePaint.paintingHeight * state.settings.scaleFactor) / 10)))
          })
        } catch (e) {
          await dispatch('updatePosition', {
            x: 0,
            y: 0
          })
        }

      }

      try {
        await dispatch('applyPostRenderingChanges')
      } catch (e) {
        // Checks for too big scaling (usually due to rounding error)
        if (e.message.includes('Scale out of bound')) {
          await dispatch('updateScaleFactor', {
            scaleFactor: Math.max(state.settings.scaleFactor - 1, 1) // 1 as fallback
          })
        } else if (e.message.includes('Position out of bound')) {
          await dispatch('updatePosition', {
            x: Math.max(state.settings.scaleFactor - 100, 0),
            y: Math.max(state.settings.scaleFactor - 100, 0) // 0 as fallback
          })
        } else {
          console.error(e)
        }
      }
    },
    async applyPostRenderingChanges ({ commit, state, dispatch }) {

      //TODO rerender image on error

      if(
        typeof state.droneObject.setPaintingPosition !== 'function'
        || typeof state.droneObject.setPaintingScale !== 'function'
        || typeof state.droneObject.setPaintingColor !== 'function'
        || typeof state.droneObject.setStrokeWidth !== 'function'
      ) {
        return dispatch('transformImage')
      }

      let result = state.droneObject.setPaintingPosition(state.position.x * config.canvas.pixelToMM, state.position.y * config.canvas.pixelToMM)
      if (!result) {
        throw Error('Position out of bound')
      }

      result = state.droneObject.setPaintingScale(state.settings.scaleFactor)
      if (!result) {
        throw Error('Scale out of bound')
      }

      state.droneObject.setPaintingColor(state.settings.color)
      state.droneObject.setStrokeWidth(state.settings.strokeWidth)

      let image = {}

      image.src = `data:image/svg+xml;base64,${btoa(state.droneObject.svgFile)}`

      image.height = Math.ceil(state.droneObject.paintingHeight / 10)
      image.width = Math.ceil(state.droneObject.paintingWidth / 10)
      image.dronetime = Math.round(state.droneObject.estimatedTime / 1000 / 60)
      if(image.dronetime > 40) {
        throw Error('Image too big')
      }

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
      const updatedKeys = Object.keys(update)
      const changedKeys = updatedKeys.filter(key => {
        return state.settings[key] !== update[key]
      })

      const originalValues = {}
      changedKeys.map(key => originalValues[key] = state.settings[key])

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
        changedKeys.includes('color') ||
        changedKeys.includes('strokeWidth')) {
        try {
          await dispatch('applyPostRenderingChanges')
        } catch (e) {
          console.error(e.message)
          commit('modifySettings', Object.assign({}, state.settings, originalValues))
        }
      }

    },
    async updateScaleFactor ({ commit, state, dispatch }, update) {
      const oldScale = { scaleFactor: state.settings.scaleFactor }
      commit('modifySettings', Object.assign({}, state.settings, update))
      try {
        await dispatch('applyPostRenderingChanges')
      } catch (e) {
        console.error(e.message)
        commit('modifySettings', Object.assign({}, state.settings, oldScale))
      }
    },

    async updatePosition ({ commit, state, dispatch }, update) {
      const oldPosition = state.position
      commit('modifyPosition', Object.assign({}, state.position, update))
      try {
        await dispatch('applyPostRenderingChanges')
      } catch (e) {
        console.error(e.message)
        commit('modifyPosition', Object.assign({}, state.position, oldPosition))
      }
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
    updateBidding ({ commit, state }, bid) {
      commit('modifyBidding', Object.assign({}, state.bid, bid))
    }
  }
})

export default store
