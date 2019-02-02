<template>
  <ae-backdrop class="p-6" v-show="error">
    <ae-card>
      <div class="w-full">
        <h1 class="font-mono text-red text-center pt-4">ERROR</h1>
        <p class="text-base text-red pt-4 text-center">
          {{error}}
        </p>
        <div class="flex justify-center mt-6">
          <ae-button fill="primary" face="round" @click="errorClick">{{errorCTA}}</ae-button>
        </div>
      </div>
    </ae-card>
  </ae-backdrop>
</template>

<script>
  import { AeBackdrop, AeButton, AeCard } from '@aeternity/aepp-components/'

  export default {
    name: 'CriticalErrorOverlay',
    components: { AeBackdrop, AeButton, AeCard },
    props: [ 'error', 'errorCTA', 'errorClick']
  }
</script>

<style scoped>

</style>
