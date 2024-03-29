<template>
  <div>
    <div class="flex justify-center mt-4">
      <div v-if="bidData || error" class="max-w-desktop p-4">
        <DarkCard>
          <div class="flex flex-col p-4 w-full text-grey-darkest" v-if="!error">
            <h1 class="text-center mb-4">
              Bid {{bidData.seq_id}}
            </h1>
            <h3 class="text-center mb-4">
              <span v-if="bidData.success && !bidData.slot.active">Accepted</span>
              <span v-if="!bidData.success">Rejected</span>
              <span v-if="bidData.success && bidData.slot.active">Pending</span>
              <span>
                in Slot {{bidData.slot.id}}
              </span>
            </h3>
            <div class="flex items-center justify-center mb-8 flex-row">
              <ae-identicon :address="bidData.user"></ae-identicon>
              <div class="font-mono ml-2" style="word-break: break-all;">
                {{bidData.user}}
              </div>
            </div>

            <div v-show="imageLoaded" class="border-2 p-2 rounded">
              <img alt="artwork" :src="`${config.apiUrl[aeternity.networkId]}/ipfs/${bidData.data.artwork_reference}.svg`"
                   @load="imageLoaded = true">
            </div>
            <div>
              <bigger-loader v-show="!imageLoaded"></bigger-loader>
            </div>
            <div class="flex justify-end mt-8 flex-col-reverse sm:flex-row">
              <ae-button class="mr-4 w-full sm:w-auto" type="exciting" @click="placeBid">
                Place a bid
              </ae-button>
              <ae-button type="dramatic" class=" w-full sm:w-auto mb-4 sm:mt-0" @click="seeImageOnCanvas">
                See Image on Canvas
              </ae-button>
            </div>
          </div>
          <!-- ERROR -->
          <div v-if="error" class="p-4 w-full text-grey-darkest">
            <h1 class="text-center leading-normal" v-html="error"></h1>
          </div>
        </DarkCard>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import config from '~/config'
  import Utils from '../utils/blockchainUtil.js'
  import BiggerLoader from '../components/BiggerLoader'
  import { AeButton, AeIdenticon } from '@aeternity/aepp-components/src/components'
  import aeternity from '../utils/aeternityNetwork.js'
  import DarkCard from '../components/DarkCard'

  export default {
    name: 'Bid',
    components: { DarkCard, AeButton, AeIdenticon, BiggerLoader },
    data () {
      return {
        bidData: null,
        imageLoaded: false,
        error: null
      }
    },
    computed: {
      aeternity () {
        return aeternity
      },
      config () {
        return config
      },
      amount () {
        return this.bidData ? Utils.atomsToAe(this.bidData.amount) : 0
      }
    },
    methods: {
      placeBid () {
        if (!aeternity.hasActiveWallet()) {
          // Not in base-aepp
          window.location.href = 'https://base.aepps.com/browser/graffiti.aeternity.com'
        } else {
          this.$router.push('contribute')
        }
      },
      seeImageOnCanvas () {
        if (aeternity.hasActiveWallet()) {
          // Not in base-aepp
          this.$router.push('/')
        } else {
          this.$router.push('/desktop/svg')
        }
      }
    },
    async created () {
      if (!this.$route.params.id || isNaN(this.$route.params.id)) {
        return this.error = `400<br />Bad request. Please provide a numerical ID (eg. '/bid/1').`
      }
      try {
        const bid = await axios.get(`${config.apiUrl[aeternity.networkId]}/bid/${this.$route.params.id}`)
        this.bidData = bid.data
      } catch (e) {
        if (String(e.message).includes('404')) {
          this.error = '404<br />Bid not found.'
        } else {
          this.error = '500<br />Please try again later.'
        }
      }
    }
  }
</script>

<style scoped>
  .max-w-desktop {
    width: 100%;
    max-width: 700px;
  }
</style>
