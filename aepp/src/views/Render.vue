<template>
  <div>
    <WhiteHeader title="Refine Your Artwork" :back="back">
      <h2>Rendering</h2>
      <p class="p-4 pb-0">
        The rendering step shows a SVG version of the image you uploaded in the previous step. Below the preview there
        are several options to adapt the SVG to your liking.
      </p>
      <p class="p-4 pb-0">
        <!-- TODO Describe what the options do-->
      </p>
    </WhiteHeader>

    <!-- IMAGE -->
    <div class="w-full p-8 ae-preview-wrap relative h-full">
      <div class="absolute inset-0">
        <div v-show="isLoading" class="flex justify-center items-center bg-half-transparent h-full">
          <BiggerLoader></BiggerLoader>
        </div>
      </div>
      <div class="h-full">
        <div v-if="transformedImage.width > 0" class="w-full h-full ae-image-preview flex justify-center items-center">
          <img ref="previewImage" :src="transformedImage.src" alt="Rendered Image"/>
        </div>
        <div v-if="!transformedImage.width && oldImage" class="w-full h-full ae-image-preview flex justify-center items-center">
          <img ref="previewImage" :src="oldImage" alt="Rendered Image"/>
        </div>
        <div v-if="!isLoading && !transformedImage.width">
          <h1 class="text-red-600 font-mono text-center">Sorry!
          </h1>
          <p class="text-red-600 mt-2 text-base">We could not create an line-based SVG image from the source image and
            settings you provided. <span
              class="font-bold">Try changing the settings or choose another source image.</span></p>
        </div>
      </div>
    </div>
    <!-- / IMAGE -->
    <!-- OVERLAY -->
    <ae-backdrop class="p-6 ae-backdrop" v-show="backDropVisible" @click.native.self="showBackdrop">
      <DarkCard>
        <div class="w-full">
          <div class="text-center">
            <h3 class="text-gray-400 p-2 text-2xl">Edit Art</h3>
          </div>
          <div class="flex flex-row justify-around items-center mb-6 mt-2">
            <div class="flex w-full justify-between text-gray-400 mb-2">
              <label for="color">Color</label>
            </div>
            <div class="w-full flex flex-row justify-end items-center">
              <div>
                <input id="color" type="color" v-model="currentColor">
              </div>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex w-full justify-between text-gray-400 mb-2">
              <label for="strokeWidth">Stroke Width</label>
            </div>
            <div class="w-full">
              <input id="strokeWidth" class="w-full max-w-full" type="range" step="10" min="50" max="300"
                     v-model="strokeWidth"/>
            </div>
          </div>
          <div class="flex flex-row mb-4">
            <div class="flex w-full justify-between text-gray-400 mb-2">
              <label>Type</label>
            </div>
            <div class="w-full">
              <ae-switch
                class="w-full"
                @input="updateValue"
                name="example"
                :choices="[
                    { label: 'Photo', value: 'photo' },
                    { label: 'Illustration', value: 'illustration' },
                  ]"
                :default="this.centerline ? 'illustration' : 'photo'"
              ></ae-switch>
            </div>
          </div>
          <div>
          </div>
          <div v-if="showIllustration">
            <div class="mb-4">
              <div class="flex w-full justify-between text-gray-400 mb-2">
                <label for="dilationRadius">Line Smoothing</label>
              </div>
              <div class="w-full">
                <input id="dilationRadius" class="w-full max-w-full" type="range" step="1" min="1" max="20"
                       v-model="dilationRadius"/>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex w-full justify-between text-gray-400 mb-2">
                <label for="binaryThreshold">Details</label>
              </div>
              <div class="w-full">
                <input id="binaryThreshold" class="w-full max-w-full" type="range" step="1" min="0" max="100"
                       v-model="binaryThreshold"/>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="mb-4">
              <div class="flex w-full justify-between text-gray-400 mb-2">
                <label for="blurKernel">Line Smoothing</label>
              </div>
              <div class="w-full">
                <input id="blurKernel" class="w-full max-w-full" type="range" step="1" min="1" max="10"
                       v-model="blurKernel"/>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex w-full justify-between text-gray-400 mb-2">
                <label for="hysteresisHighThreshold">Details</label>
              </div>
              <div class="w-full">
                <input id="hysteresisHighThreshold" class="w-full max-w-full" type="range" step="1" min="1" max="100"
                       v-model="hysteresisHighThreshold"/>
              </div>
            </div>
          </div>
          <ae-button face="round" fill="primary" @click="closeBackdropAndUpdatePreview" extend>
            Update Preview
          </ae-button>
        </div>
      </DarkCard>
    </ae-backdrop>
    <!-- / OVERLAY -->
    <div class="w-full absolute bottom-0 mb-6">
      <div @click="$store.dispatch('setFirstTimeRenderFalse')" v-if="firstTimeRender">
        <Toast class="m-4 p-4" >
          Change the appearance of your artwork by clicking "Edit Artwork".
        </Toast>
      </div>
      <ae-button-group class="mx-4" v-show="isReady">
        <ae-button face="round" fill="secondary" @click="showBackdrop">
          Edit Artwork
        </ae-button>
        <ae-button face="round" fill="primary" @click="submit">
          Set Position
        </ae-button>
      </ae-button-group>
      <div class="w-full px-4" v-show="isLoading">
        <ae-button face="round" disabled extend>
          Loading..
        </ae-button>
      </div>
    </div>
  </div>
</template>

<script>

  import BiggerLoader from '~/components/BiggerLoader'
  import WhiteHeader from '~/components/WhiteHeader'
  import {
    AeBackdrop,
    AeButton,
    AeButtonGroup,
    AeCard,
    AeIcon,
    AeSwitch
  } from '@aeternity/aepp-components/src/components'
  import config from '~/config'
  import Toast from '../components/Toast'
  import DarkCard from '../components/DarkCard'

  const STATUS_LOADING = 1, STATUS_READY = 2

  export default {
    name: 'Render',
    components: {
        DarkCard,
      Toast,
      AeIcon,
      AeButtonGroup,
      AeBackdrop,
      AeCard,
      AeButton,
      WhiteHeader,
      BiggerLoader,
      AeSwitch
    },
    data() {
      return {
        hysteresisHighThreshold: 50,
        currentColor: '#f7296e',
        centerline: true,
        blurKernel: 4,
        binaryThreshold: 45,
        dilationRadius: 4,
        strokeWidth: 100,
        status: STATUS_LOADING,
        progress: -1,
        backDropVisible: false,
        oldImage: null
      }
    },
    computed: {
      transformedImage() {
        return this.$store.state.transformedImage
      },
      originalImage() {
        return this.$store.state.originalImage
      },
      firstTimeRender() {
        return this.$store.state.firstTimeRender
      },
      settings() {
        return this.$store.state.settings
      },
      droneSettings() {
        return config.droneSettings
      },
      showIllustration() {
        return this.centerline
      },
      isLoading() {
        return this.status === STATUS_LOADING
      },
      isReady() {
        return this.status === STATUS_READY
      }
    },
    methods: {
      back() {
        this.$router.push('contribute')
      },
      submit() {
        this.$router.push('positioning')
      },
      updateValue(val) {
        this.centerline = (val !== 'photo')
      },
      showBackdrop() {
        this.$store.dispatch('setFirstTimeRenderFalse')
        this.backDropVisible = !this.backDropVisible
      },
      closeBackdropAndUpdatePreview() {
        this.backDropVisible = false
        setTimeout(this.updatePreview, 200);
      },
      async updatePreview() {
        this.status = STATUS_LOADING
        this.oldImage = this.transformedImage.src;
        await this.$store.dispatch(`updateSettings`, {
          color: this.currentColor,
          threshold: Number(this.threshold),
          hysteresisHighThreshold: 100 - Number(this.hysteresisHighThreshold),
          centerline: Number(this.centerline),
          blurKernel: Number(this.blurKernel),
          binaryThreshold: Number(this.binaryThreshold), // inverse binary threshold
          dilationRadius: Number(this.dilationRadius),
          strokeWidth: Number(this.strokeWidth)
        })
        this.status = STATUS_READY
        this.oldImage = null
      },
      progressCallback(progress) {
        const progress100 = Math.round(progress * 100)
        if (this.progress !== progress100) {
          this.progress = progress100
        }
      }
    },
    created() {
      this.threshold = this.settings.threshold
      this.currentColor = this.settings.color
      this.hysteresisHighThreshold = 100 - this.settings.hysteresisHighThreshold
      this.centerline = this.settings.centerline
      this.blurKernel = this.settings.blurKernel
      this.binaryThreshold = this.settings.binaryThreshold
      this.dilationRadius = this.settings.dilationRadius
      this.strokeWidth = this.settings.strokeWidth
      this.$store.dispatch('registerProgressCallback', this.progressCallback)
    },
    async mounted() {
      await this.$store.dispatch(`transformImage`)
      this.status = STATUS_READY
    },
    beforeDestroy() {
      this.$store.dispatch('removeProgressCallback')
    }
  }
</script>

<style scoped>
  .ae-image-preview {
    max-height: 60vh;
  }

  .ae-image-preview img {
    max-height: inherit;
    width: auto;
    height: auto;
  }

  .ae-preview-wrap {
    height: 70vh;
  }

  .ae-backdrop {
    background-color: rgba(75,75,75,.95);
  }

  .bg-half-transparent {
    background-color: rgba(26, 32, 44, 0.6);
  }
</style>
