<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Contribute</h1>
    </div>
    <div class="w-full p-4 flex justify-center">
      <form enctype="multipart/form-data" novalidate v-if="isInitial" class="w-full">
        <div class="dropbox border relative flex justify-center items-center h-64">
          <input type="file" name="image" ref="uploadInput"
                 @change="filesChange($event.target.files)"
                 accept="image/*" class="absolute pin opacity-0 w-full h-full">
          <p v-if="isInitial" class="p-4" >
            Drag your file(s) here to begin<br> or click to browse
          </p>
        </div>
      </form>
      <div v-if="isSuccess">
        <div class="w-full flex justify-center">
          <img ref="image" class="w-full h-full" :src="uploadedImage.src" :alt="uploadedImage.name">
        </div>
        <div class="w-full flex justify-center p-4">
          <ae-button class="mr-4" type="normal" @click="reset">Reset</ae-button>
          <ae-button type="dramatic" @click="$router.push(`render`)">Preview Artwork</ae-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

  const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3

  export default {
    name: 'Upload',
    components: {},
    data () {
      return {
        fileCount: 0,
        currentStatus: 0,
        uploadError: null
      }
    },
    computed: {
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isSuccess () {
        return this.currentStatus === STATUS_SUCCESS
      },
      uploadedImage() {
        return this.$store.state.uploadedImage;
      }
    },
    methods: {
      reset() {
        this.currentStatus = STATUS_INITIAL;
      },
      filesChange (fileList) {
        // handle file changes
        const file = fileList[0]
        this.$store.dispatch(`uploadImage`, file);
        this.currentStatus = STATUS_SUCCESS;
      }
    }
  }
</script>

<style scoped>

</style>
