<template>
  <div>
    <div class="absolute pin-t pin-r p-4" @click="quit()">
      <ae-icon class="text-xl" name="close"></ae-icon>
    </div>
    <OnboardingStep v-if="view === 1" key="v1">
      <div class="w-full flex justify-center items-center">
        <img src="@/assets/0_DGP_lockup_black_1.svg" class="onboarding-logo" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Welcome!</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Let drones spray your creative ideas on a wall in Mexico City.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 2" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="@/assets/0_DGP_lockup_black_1.svg" class="onboarding-logo" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">How?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Upload your own creation in this app. Refine the conversion settings and bid for drone time.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 3" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="@/assets/0_DGP_lockup_black_1.svg" class="onboarding-logo" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Bidding?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >Your artwork will take a certain amount of time for the drones to spray. The available time gets allocated to the highest bidders.</ae-text>
      </div>
    </OnboardingStep>
    <OnboardingStep v-if="view === 4" key="v2">
      <div class="w-full flex justify-center items-center">
        <img src="@/assets/0_DGP_lockup_black_1.svg" class="onboarding-logo" />
      </div>
      <div class="mt-4">
        <ae-text align="center" weight="bold" class="text-center" fill="primary" face="sans-l">Drones?</ae-text>
      </div>
      <div class="text-center w-2/3">
        <ae-text align="center" class="text-center" face="sans-base" >If your bid is successful at the end of one auction slot our drones will spray your artwork on the wall in Mexico City.</ae-text>
      </div>
    </OnboardingStep>

    <footer class="w-full fixed pin-b">
      <div class="w-full flex flex-row justify-center">
        <div v-for="step in MAX_VIEW" :class="step !== view ? 'ae-step-indicator' : 'ae-step-indicator-active'" :key="step">
        </div>
      </div>
      <div class="w-full flex flex-row justify-between p-4">
        <ae-button v-if="backText" fill="neutral" face="round" @click="back">
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
      quit(){
        this.$store.dispatch('setFirstTimeOpenedFalse');
        this.$router.push('/')
      },
      next() {
        if(this.view === this.MAX_VIEW)  {
          this.$store.dispatch('setFirstTimeOpenedFalse');
          return this.$router.push('contribute');
        }
        this.view += 1
      },
      back() {
        if(this.view === this.MIN_VIEW) return this.$router.push('home');
        this.view -= 1
      }
    }
  }
</script>

<style type="scss">
  .onboarding-logo {
    margin-top: 20px;
    height: 200px;
  }

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
