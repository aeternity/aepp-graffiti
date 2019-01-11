<template>
  <div class="flex flex-row">
    <div class="p-4">
      <transition mode="out-in" name="loading">
        <p v-if="currentStep < activeStep" class="w-4 h-4"></p>
        <ae-loader v-if="currentStep === activeStep"></ae-loader>
        <ae-icon  v-if="currentStep > activeStep" name="check"></ae-icon>
      </transition>
      </div>
    <div class="p-4 pl-0 font-mono text-lg text-grey-darkest">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LoadingStep',
    props: ['activeStep', 'currentStep', ]
  }
</script>

<style scoped>
  .fade-enter-active, .loading-leave-active {
    transition: opacity .3s ease;
    transition-delay: 0;
  }
  .loading-enter, .loading-leave-to
    /* .component-fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
