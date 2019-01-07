<template>
  <div>
    <div @click="showBackdrop" class="absolute ae-info-button">
      <ae-icon name="info" fill="alternative" class="text-3xl w-8 h-8"></ae-icon>
    </div>
    <ae-backdrop v-if="backDropVisible" @click.native.capture="showBackdrop">
      <ae-card>
        <div class="flex justify-center items-center flex-col">
          <slot></slot>
          <ae-button fill="primary" class="mt-8" face="round">
            Close
          </ae-button>
        </div>
      </ae-card>
    </ae-backdrop>
  </div>
</template>

<script>
  export default {
    name: 'InfoLayer',
    components: {},
    data () {
      return { backDropVisible: false }
    },
    methods: {
      showBackdrop () {
        this.backDropVisible = !this.backDropVisible
      }
    }
  }
</script>

<style scoped>
  .ae-info-button {
    top: 17px;
    right: 10px;
  }
</style>
