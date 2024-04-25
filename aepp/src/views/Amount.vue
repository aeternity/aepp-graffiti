<template>
  <div>
    <WhiteHeader :back="back" title="Your Bid"></WhiteHeader>
    <div class="w-full p-8 pt-4 pb-6">
      <div class="flex justify-center flex-col">
        <span class="text-xl text-center leading-normal text-grey-darker">
          Your artwork would take <span class="bold-info">{{transformedImage.dronetime}} minutes</span> to paint. How much AE do you want to bid in total?
        </span>
        <span class="text-xs text-center leading-normal text-gray-600">
          Keep in mind, higher paying bids (AE/Min) will replace lower paying ones if the slot capacity is reached. In case your artwork is not included you will receive a refund.
        </span>
      </div>
      <div class="mt-8 text-black">
        <ae-input type="number" label="Total Bid" step="0.01" placeholder="1" min="0" aemount  :value="amount"
                  @input="updateData" :error="!!error">
          <template slot="header">
            <span class="text-grey">AE</span>
          </template>
          <ae-toolbar slot="footer">
            <div class="w-full flex justify-between">
              <span>{{transformedImage.dronetime}} Minutes</span>
              <span class="bold-info">~{{perMinute.toLocaleString('en-US')}} AE per minute</span>
            </div>
          </ae-toolbar>
        </ae-input>
      </div>
      <div class="text-red-600 text-sm mt-2" v-if="bidToLow">
        Your bid would only pay ~{{perMinute.toLocaleString('en-US')}} AE per minute, the minimum required for the slot is greater {{minimumBid}} AE/Min.
      </div>

      <div class="w-full mt-4 flex justify-center">
        <ae-button face="round" fill="primary" :disabled="error || bidToLow" @click="next" extend>Place Bid</ae-button>
      </div>
    </div>
    <CriticalErrorOverlay
      @continue="error = null"
      :error="error"
      errorCTA="Okay"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>
  import WhiteHeader from '../components/WhiteHeader'
  import { AeButton, AeInput, AeToolbar } from '@aeternity/aepp-components/src/components'
  import Utils from '~/utils/blockchainUtil'
  import CriticalErrorOverlay from '~/components/CriticalErrorOverlay'
  import aeternity from '~/utils/aeternityNetwork'
  import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk'


  export default {
    name: 'Amount',
    components: { CriticalErrorOverlay, AeInput, WhiteHeader, AeToolbar, AeButton },
    data () {
      return {
        amount: 4,
        perMinute: 0,
        error: null,
        balance: null,
        bidToLow: false,
        minimumBid: 0
      }
    },
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      slotObject () {
        return this.$store.state.bid.slotObject
      }
    },
    methods: {
      updateData (e) {
        if (e === '') {
          this.amount = null
        } else {
          this.amount = e
          this.perMinute = this.amount / this.transformedImage.dronetime
          this.minimumBid = (this.$store.state.bid.slotObject.minimumBid).toFixed(2);
          this.bidToLow = this.$store.state.bid.slotObject.minimumBid >= this.amount;
        }
        this.error = null
      },
      back () {
        this.$router.push('slots')
      },
      next () {

        this.error = null

        if (this.remainingDrawtime < this.transformedImage.dronetime && this.perMinute < parseFloat(this.slotObject.minimumBid)) {
          this.error = `The minimum bid for this slot is ${this.slotObject.minimumBid.toFixed(5)} AE per minute`
        }

        if (this.amount < 0.001) {
          this.error = `The minimum bid is 0.001 AE.`
        }

        if (this.balance.lt(this.amount)) {
          this.error = `Your bid total (${this.amount} AE) exceeds your balance (${this.balance} AE).`
        }

        if (!this.error) {
          this.$store.dispatch('updateBidding', {
            amount: this.amount
          })
          this.$router.push('confirm')
        }

      }
    },
    async mounted () {
      this.minimumBid = (this.$store.state.bid.slotObject.minimumBid).toFixed(2);
      this.bidToLow = this.$store.state.bid.slotObject.minimumBid >= this.amount;

      try {
        this.perMinute = this.amount / this.transformedImage.dronetime
        this.balance = Utils.atomsToAe(await aeternity.client.getBalance(aeternity.address, { format: AE_AMOUNT_FORMATS.AETTOS }))
      } catch (e) {
        console.error(e)
        this.balance = 0
      }
    }
  }
</script>

<style scoped>
  .bold-info {
    font-weight: 800;
  }
</style>
