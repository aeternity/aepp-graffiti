<template>
    <div class="p-8 flex flex-col justify-center items-center">
      <div class="w-full flex justify-center items-center ae-image-height">
        <img :src="require(`~/assets/${image}`)" class="onboarding-logo" alt="onboarding step" />
      </div>
      <div>
        <div class="mt-4 pl-2 pr-2">
          <h2 class="text-center ">{{headline}}</h2>
        </div>
        <div class="text-center mt-2 pl-2 pr-2">
          <span class="text-grey-darkest text-xl">{{text}}</span>
        </div>
      </div>

    </div>
</template>

<script>
  export default {
    name: 'OnboardingStep',
    props: [ 'image', 'headline', 'text' ]
  }
</script>

<style scoped lang="scss">
  .ae-image-height {
    height: 50vh
  }
</style>
