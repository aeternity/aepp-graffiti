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
    <div v-show="isLoading" class="ae-preview-wrap flex justify-center items-center">
      <BiggerLoader></BiggerLoader>
    </div>
    <div class="w-full p-8 ae-preview-wrap">
      <div v-show="isReady" class="h-full">
        <div v-if="transformedImage.width > 0" class="w-full h-full ae-image-preview flex justify-center items-center">
          <img ref="previewImage" :src="transformedImage.src" alt="Rendered Image"/>
        </div>
        <div v-else>
          <h1 class="text-red font-mono text-center">Sorry!
          </h1>
          <p class="text-red mt-2 text-base">We could not create a drone flyable image from the source image and
            settings you provided. <span
              class="font-bold">Try changing the settings or choose another source image.</span></p>
        </div>
      </div>
    </div>
    <ae-backdrop class="p-6" v-show="backDropVisible" @click.native.self="showBackdrop">
      <ae-card>
        <div class="w-full">
          <div class="text-center">
            <h3 class="text-black p-4">Edit Art</h3>
          </div>
          <div class="flex flex-row justify-around items-center mb-6 mt-2">
            <div class="flex w-full justify-between text-black mb-2">
              <label>Color</label>
            </div>
            <div class="w-full flex flex-row">
              <template v-for="(color, index) in droneSettings.colors">
                <div :key="color" @click="changeColor(index)" class="w-full flex justify-center">
                  <div v-if="currentColor === index" :style="{backgroundColor: color}"
                       class="h-8 w-8 rounded-full shadow-lg text-white">
                    <div class="w-full h-full flex justify-center items-center">
                      <ae-icon name="check" class="text-white"></ae-icon>
                    </div>
                  </div>
                  <div v-else :style="{backgroundColor: color}" class="h-8 w-8 rounded-full"></div>
                </div>
              </template>
            </div>
          </div>
          <div class="flex flex-row mb-4">
            <div class="flex w-full justify-between text-black mb-2">
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
              <div class="flex w-full justify-between text-black mb-2">
                <label for="dilationRadius">Line Smoothing</label>
              </div>
              <div class="w-full">
                <input id="dilationRadius" class="w-full max-w-full" type="range" step="1" min="1" max="20"
                       v-model="dilationRadius"/>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex w-full justify-between text-black mb-2">
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
              <div class="flex w-full justify-between text-black mb-2">
                <label for="blurKernel">Line Smoothing</label>
              </div>
              <div class="w-full">
                <input id="blurKernel" class="w-full max-w-full" type="range" step="1" min="1" max="10"
                       v-model="blurKernel"/>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex w-full justify-between text-black mb-2">
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
      </ae-card>
    </ae-backdrop>

    <div class="w-full absolute pin-b mb-6">
      <ae-button-group class="mr-4 ml-4">
        <ae-button face="round" fill="secondary" @click="showBackdrop">
          Edit Artwork
        </ae-button>
        <ae-button face="round" fill="primary" @click="submit">
          Set Position
        </ae-button>
      </ae-button-group>
    </div>
  </div>
</template>

<script>

  import BiggerLoader from '~/components/BiggerLoader'
  import WhiteHeader from '~/components/WhiteHeader'
  import {AeBackdrop, AeButton, AeButtonGroup, AeCard, AeIcon, AeSwitch} from '@aeternity/aepp-components'
  import config from '~/config'

  const STATUS_LOADING = 1, STATUS_READY = 2

  export default {
    name: 'Render',
    components: {
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
        currentColor: 0,
        centerline: true,
        blurKernel: 4,
        binaryThreshold: 45,
        dilationRadius: 4,
        status: STATUS_LOADING,
        progress: -1,
        backDropVisible: false
      }
    },
    computed: {
      transformedImage() {
        return this.$store.state.transformedImage
      },
      originalImage() {
        return this.$store.state.originalImage
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
        this.backDropVisible = !this.backDropVisible
      },
      closeBackdropAndUpdatePreview() {
        this.backDropVisible = false
        setTimeout(this.updatePreview, 0);
      },
      async updatePreview() {
        this.status = STATUS_LOADING
        console.log('loading')
        await this.$store.dispatch(`updateSettings`, {
          color: Number(this.currentColor),
          threshold: Number(this.threshold),
          hysteresisHighThreshold: Number(this.hysteresisHighThreshold),
          centerline: Number(this.centerline),
          blurKernel: Number(this.blurKernel),
          binaryThreshold: Number(this.binaryThreshold),
          dilationRadius: Number(this.dilationRadius)
        })
        this.status = STATUS_READY
      },
      changeColor(index) {
        this.currentColor = index
      },
      progressCallback(progress) {
        const progress100 = Math.round(progress * 100)
        if (this.progress !== progress100) {
          console.log('UPDATING', progress100)
          this.progress = progress100
        }
      }
    },
    created() {
      this.threshold = this.settings.threshold
      this.currentColor = this.settings.color
      this.hysteresisHighThreshold = this.settings.hysteresisHighThreshold
      this.centerline = this.settings.centerline
      this.blurKernel = this.settings.blurKernel
      this.binaryThreshold = this.settings.binaryThreshold
      this.dilationRadius = this.settings.dilationRadius
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
</style>
