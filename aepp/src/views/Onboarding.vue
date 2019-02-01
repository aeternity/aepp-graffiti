<template>
  <div>
    <OnboardingStep
      v-if="view === 1"
      key="v1"
      image="0_DGP_lockup_black_1.svg"
      headline="Have a drone paint your art on a real wall in Mexico City"
      text="Bid with AE to win drone time for your art"
    >
    </OnboardingStep>
    <OnboardingStep
      v-if="view === 2"
      key="v1"
      image="0_DGP_lockup_black_1.svg"
      headline="Upload an image and make an artwork out of it"
      text="Your image will be vectorized, get creative with editing"
    >
    </OnboardingStep>
    <OnboardingStep
      v-if="view === 3"
      key="v1"
      image="0_DGP_lockup_black_1.svg"
      headline="Bid enough AE to win the required drone time"
      text="The aeternity smart contract sends the artworks of all successful bids to the drones"
    >
    </OnboardingStep>
    <OnboardingStep
      v-if="view === 4"
      key="v1"
      image="0_DGP_lockup_black_1.svg"
      headline="Be part of the first smart contract art on this scale"
      text="Checkout the wall and get creative"
    >
    </OnboardingStep>

    <footer class="w-full fixed pin-b">
      <div class="w-full flex flex-row p-4">
        <div @click="quit" class="w-1/3 p-2">
          <ae-text face="uppercase-base" weight=700>SKIP</ae-text>
        </div>
        <div class="w-1/3 flex flex-row justify-center p-2">
          <div v-for="step in MAX_VIEW" :class="step !== view ? 'ae-step-indicator' : 'ae-step-indicator-active'" :key="step">
          </div>
        </div>
        <div class="w-1/3 flex justify-end p-2" @click="next"  v-if="nextText">
          <ae-text face="uppercase-base" weight=700>{{nextText}}</ae-text>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import OnboardingStep from '@/components/OnboardingStep'
  import { AeText } from '@aeternity/aepp-components'

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
      OnboardingStep,
      AeText
    },
    computed: {
      nextText() {
        if(this.view === 4) return 'START'
        else return 'NEXT'
      }
    },
    methods: {
      quit(){
        this.$router.push('/')
      },
      next() {
        if(this.view === this.MAX_VIEW)  {
          return this.$router.push('/');
        }
        this.view += 1
      }

    },
    mounted() {
      this.$store.dispatch('setFirstTimeOpenedFalse')
    }
  }
</script>

<style type="scss">
  .onboarding-logo {
    margin-top: 20px;
    height: 200px;
  }

  .ae-step-indicator {
    background: #bbb;
    border-radius: 10px;
    height: 10px;
    width: 10px;
    margin-left: 3px;
    margin-right: 3px;
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
