<template>
  <div>
    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">THE DRONE ART</h1>
    </div>
    <div class="w-full pt-4 pb-4">
      <div class="border-grey-darker border-t border-b">
        <CanvasJS :draggable=true></CanvasJS>
      </div>
    </div>
    <div class="w-full pl-4 pr-4">
      <ae-list>
        <ae-list-item>
          <ae-button extend="" face="round" fill="primary" @click="$router.push('contribute')">Contribute Art
          </ae-button>
        </ae-list-item>
        <ae-list-item class="justify-center" @click="$router.push('overview')">
          <ae-text align="center" weight="bold" class="color-primary" face="uppercase-base">
            My Bids Overview
          </ae-text>
        </ae-list-item>
        <ae-list-item class="justify-center" fill="secondary">
          <ae-text align="center" weight="bold" face="uppercase-base">Learn More</ae-text>
        </ae-list-item>
        <ae-list-item class="justify-center" fill="secondary" @click="$router.push('slots')">
          <ae-text align="center" weight="bold" face="uppercase-base">Slots</ae-text>
        </ae-list-item>
      </ae-list>
    </div>
  </div>
</template>

<script>
  import CanvasJS from './CanvasJS.vue'

  export default {
    name: 'Home',
    components: { CanvasJS },

  }
</script>

<style scoped></style>
