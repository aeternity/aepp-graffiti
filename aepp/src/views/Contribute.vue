<template>
  <div class="h-screen">
    <WhiteHeader title="Choose Artwork" :back="back">
      <h2>Uploading an Image</h2>
      <p class="p-4 pb-0">
        On this page you are asked to upload an image. It will accept most common image formats including but not limited to: jpg, jpeg, png
      </p>
      <p class="p-4 pb-0">
        Please do not upload SVG images, the SVG for the drone will be created later in this process and there will be options to adjust the final appearance.
      </p>
    </WhiteHeader>

    <div class="w-full p-8 flex justify-center">
      <div class="w-full h-full" v-if="isInitial">
        <form enctype="multipart/form-data" novalidate class="w-full">
          <div class="dropbox border-4 border-grey border-dashed relative flex justify-center items-center h-64 bg-grey-light rounded-lg">
            <input type="file" name="image" ref="uploadInput"
                   @change="filesChange($event.target.files)"
                   accept="image/*" class="absolute pin opacity-0 w-full h-full">
            <div v-if="isInitial" class="p-4 text-center text-grey-dark">
              <h3>Place your art here</h3><br>
              <span>Upload an JPEG or PNG image. <br> Click to browse.</span>
            </div>
          </div>
        </form>
      </div>

      <div class="w-full text-center" v-if="isLoading">
        <BiggerLoader></BiggerLoader>
      </div>

      <div v-if="originalImage.src">
        <div class="w-full flex justify-center mb-6 bg-white p-4 rounded-lg">
          <div class="ae-image-preview">
            <img ref="image" class="w-full h-full" @load="imageLoad" :src="originalImage.src" :alt="originalImage.name">
          </div>
        </div>
        <div class="text-center mb-4">
          <h2 class="mb-2">That's a piece of art!</h2>
          <span class="text-grey-darkest leading-normal font-medium">Continue to make it suiteable for the wall or reset to choose another one.</span>
        </div>
        <div class="w-full">
          <ae-list>
            <ae-list-item class="justify-center">
              <ae-button face="round" fill="primary" @click="next" extend>Continue with this art</ae-button>
            </ae-list-item>
            <ae-list-item @click="reset" class="justify-center">
              <ae-text face="uppercase-base" weight="bold">Reset</ae-text>
            </ae-list-item>
          </ae-list>

        </div>
      </div>
      <div v-if="isError" class="w-full p-4">
        <div class="w-full flex justify-center p-4">
          <span class="text-xl text-red">{{error}}</span>
        </div>
        <div class="w-full flex justify-center p-4">
          <ae-button face="round" fill="primary" @click="reset">Ok</ae-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

  import BiggerLoader from "../components/BiggerLoader";
  import WhiteHeader from '@/components/WhiteHeader'
  import { AeList, AeListItem, AeButton, AeText } from '@aeternity/aepp-components'

  const STATUS_INITIAL = 0, STATUS_LOADING = 1, STATUS_SUCCESS = 2, STATUS_ERROR = 3

  export default {
    name: 'Upload',
    components: { WhiteHeader, BiggerLoader, AeList, AeListItem, AeButton, AeText },
    data () {
      return {
        fileCount: 0,
        currentStatus: 0,
        uploadError: null,
        error: ''
      }
    },
    computed: {
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isSuccess () {
        return this.currentStatus === STATUS_SUCCESS
      },
      isLoading () {
        return this.currentStatus === STATUS_LOADING
      },
      isError () {
        return this.currentStatus === STATUS_ERROR
      },
      originalImage () {
        return this.$store.state.originalImage
      }
    },
    methods: {
      reset () {
        this.currentStatus = STATUS_INITIAL
        this.$store.dispatch('resetImage')
      },
      back() {
        this.$router.push('/');
      },
      filesChange (fileList) {

        this.$store.dispatch('resetState')

        this.currentStatus = STATUS_LOADING
        // handle file changes
        const file = fileList[0]

        /*
        if (file.size > 1000000) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Maximum allowed file size is 1 MB'
          return
        }
        */

        if (!file.type.includes('image')) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Please upload an image'
          return
        }

        if(['image/png', 'image/jpg', 'image/jpeg'].indexOf(file.type) === -1) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Please upload a JPEG or PNG image'
          return
        }

        this.$store.dispatch(`uploadImage`, file)

      },
      imageLoad () {
        this.currentStatus = STATUS_SUCCESS
        this.$store.dispatch(`updateOriginalImage`, {
          width: this.$refs.image.naturalWidth,
          height: this.$refs.image.naturalHeight
        })
      },
      next() {
        this.$router.push(`render`)
      }
    }
  }
</script>

<style scoped>

  .dropbox {
    height: 60vh;
  }

  .ae-image-preview {
    max-height: 30vh;
  }

  .ae-image-preview img {
    max-height: inherit;
    width: auto;
    height: auto;
  }
</style>
