<template>
  <div>
    <OnboardingStep v-if="view === 1" key="v1">
      <div class="w-full flex justify-center items-center">
        <img src="//placehold.it/300x200" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Welcome!</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Paint your creative ideas on a wall. In Mexico City.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 2" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="//placehold.it/300x200" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">How?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Upload your own creation in this app. Modify the settings and bid for drone time.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 3" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="//placehold.it/300x200" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Bidding?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Your artwork will take a certain amount of time. The available time gets allocated to the highest bidders.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 4" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="//placehold.it/300x200" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Drones?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >If your bid is successful our drones will paint your artwork on the wall in Mexico City.</ae-text>
      </div>
    </OnboardingStep>



    <footer class="w-full">
      <div class="w-full flex flex-row justify-center">
        <div v-for="step in MAX_VIEW" :class="step !== view ? 'ae-step-indicator' : 'ae-step-indicator-active'" :key="step">
        </div>
      </div>
      <div class="w-full flex flex-row justify-between p-4">
        <ae-button v-if="backText" fill="normal" face="round" @click="back">
          {{backText}}
        </ae-button>

        <ae-button v-if="nextText" fill="primary" class="ml-auto" face="round" @click="next">
          {{nextText}}
        </ae-button>
      </div>
    </footer>

  </div>
</template>

<script>
  import OnboardingStep from '@/components/OnboardingStep'

  export default {
    name: 'Onboarding',
    data () {
      return {
        view: 1,
        MIN_VIEW: 1,
        MAX_VIEW: 4
      }
    },
    components: {
      OnboardingStep
    },
    computed: {
      nextText() {
        if(this.view === 4) return 'Get Started'
        else return 'Next'
      },

      backText() {
        if(this.view === 1) return null
        else return 'Back'
      }
    },
    methods: {
      next() {
        if(this.view === this.MAX_VIEW) return
        this.view += 1
      },
      back() {
        if(this.view === this.MIN_VIEW) return
        this.view -= 1
      }
    }
  }
</script>

<style type="scss">
.ae-step-indicator {
  background: #555;
  border-radius: 10px;
  height: 10px;
  width: 10px;
  margin-left: 2px;
  margin-right: 2px;
}
.ae-step-indicator-active {
  background: #FF0D6A;
  border-radius: 10px;
  height: 10px;
  width: 10px;
  margin-left: 2px;
  margin-right: 2px;
}
</style>
