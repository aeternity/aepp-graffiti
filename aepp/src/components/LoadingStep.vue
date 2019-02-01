<template>
  <div class="flex flex-row">
    <div class="p-4">
      <transition mode="out-in" name="loading">
        <p v-if="currentStep < activeStep" class="w-4 h-4"></p>
        <ae-loader v-if="!errorStep && currentStep === activeStep"></ae-loader>
        <ae-icon  v-if="currentStep > activeStep" name="check"></ae-icon>
        <ae-icon  v-if="errorStep && activeStep === errorStep" name="close"></ae-icon>
      </transition>
      </div>
    <div class="p-4 pl-0 font-mono text-lg text-grey-darkest">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import { AeIcon, AeLoader } from '@aeternity/aepp-components'

  export default {
    name: 'LoadingStep',
    props: ['activeStep', 'currentStep', 'errorStep'],
    components: { AeLoader, AeIcon }
  }
</script>

<style scoped>

</style>
