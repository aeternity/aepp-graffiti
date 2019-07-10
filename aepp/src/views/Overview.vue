<template>
  <div>
    <WhiteHeader title="Your Bids"></WhiteHeader>

    <div class="w-full p-4 text-center" v-if="isInitialState">
      <BiggerLoader></BiggerLoader>
    </div>

    <div class="w-full p-4 text-center" v-if="isErrorState">
      <h1 class="text-center mt-3">Error</h1>
      <div class="w-full text-center font-mono text-xl text-red mt-2">
        {{error}}
      </div>
    </div>

    <div class="w-full p-4" v-if="isShowListState">
      <div v-for="bid in bids" :key='bid.seq_id'>
        <ae-card class="mb-4">

          <template slot="header">
            <img :src='bid.url' v-if="bid.url" class="w-full bid-image" alt="Bidding Image">
            <div class="w-full text-center mt-4" v-else>
              <BiggerLoader></BiggerLoader>
            </div>
          </template>
          <div class="w-full relative">
            <div class="flex flex-row justify-between">
              <div class="flex flex-col mt-2">
                <span>
                  Amount
                </span>
                <span class="font-mono text-black text-lg">
                  {{bid.amount.toFixed(2)}} AE
                </span>
              </div>
              <div class="flex flex-col mt-2">
                <span>
                  Slot
                </span>
                <span class="font-mono text-right text-black text-lg">
                  {{bid.slotId}}
                </span>
              </div>
            </div>
            <div class="flex flex-col mt-2">
                <span>
                  Estimated Painting Time
                </span>
              <span class="font-mono text-black text-lg">
                  {{bid.time}} Minutes
                </span>
            </div>
            <div class="flex flex-col mt-2">
                <span>
                  Status
                </span>
              <span class="font-mono text-black text-lg">
                  <span v-if="bid.successful">Successful</span>
                  <span v-if="!bid.successful">Failed</span>
                  <span v-if="bid.finished && !bid.successful"><br> (Minimum bid: {{bid.minimumAmount}} AE / Min)</span>
                  <span v-if="!bid.finished && bid.successful"> (Pending)</span>
              </span>
            </div>
            <div class="absolute bottom-0 right-0 rounded-full btn-primary-round"
                 @click="shareBid(bid.seq_id)">
              <div class="flex items-center justify-center p-4">
                <img src="../assets/share.svg" alt="share">
              </div>
            </div>
          </div>
        </ae-card>
      </div>
    </div>
    <div class="w-full p-4" v-if="isEmptyListState">
      <h2 class="text-center">No bids found.</h2>
    </div>
    <div @click="$router.push('/')" class="fixed bottom-0 right-0 p-8 cursor-pointer">
      <div class="ae-icon-size rounded-full text-xl py-4  px-8 text-white">Home</div>
    </div>
  </div>

</template>

<script>
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Util from '../utils/blockchain_util'
  import BiggerLoader from '~/components/BiggerLoader'
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeCard } from '@aeternity/aepp-components'
  import config from '~/config'
  import AeIcon from '@aeternity/aepp-components/src/components/ae-icon/ae-icon'
  import contractSource from '~/DroneGraffitiAuction.aes'

  const INITAL_STATE = 0, SHOW_LIST = 1, EMPTY_LIST = 2, ERROR_STATE = 3

  export default {
    name: 'Overview',
    components: {AeIcon, BiggerLoader, AeCard, WhiteHeader },
    data () {
      return {
        bids: [],
        state: INITAL_STATE,
        address: null,
        error: null,
      }
    },
    computed: {
      blockchainSettings () {
        return config.blockchainSettings
      },
      isInitialState () {
        return this.state === INITAL_STATE
      },
      isShowListState () {
        return this.state === SHOW_LIST
      },
      isEmptyListState () {
        return this.state === EMPTY_LIST
      },
      isErrorState () {
        return this.state === ERROR_STATE
      }
    },
    methods: {
      shareBid(id) {
        window.open(`https://aepp.dronegraffiti.com/bid/${id}`)
      },
      async updateMyBids () {
        try {

          const contractInstance = await this.client.getContractInstance(contractSource, {contractAddress: this.blockchainSettings.contractAddress})
          const slots = await contractInstance.methods.all_auction_slots()

          const height = await this.client.height()

          if (!slots.decodedResult) {
            this.error = 'Could not decode data from contract.'
            return this.state = ERROR_STATE
          }


          if (slots.decodedResult.length === 0) return this.state = EMPTY_LIST

          const allBids = slots.decodedResult.map(slot => {
            let allBids = []

            allBids = allBids.concat(slot.successful_bids.filter(bid => bid.user === this.address).map(bid => {
              bid.successful = true
              return bid
            }))

            allBids = allBids.concat(slot.failed_bids.filter(bid => bid.user === this.address).map(bid => {
              bid.successful = false
              return bid
            }))

            allBids = allBids.map(bid => {
              bid.amount = Util.atomsToAe(bid.amount)
              bid.finished = Util.slotIsPast(slot, height)
              bid.slotId = slot.id
              bid.minimumAmount = Math.min(...slot.successful_bids.map(x => x.amount_per_time).map(x => Util.atomsToAe(x).toFixed(4)))
              bid.url = config.apiUrl + '/ipfs/' + bid.data.artwork_reference + '.svg'
              return bid
            })
            return allBids
          })

          if(allBids.length === 0) return this.state = EMPTY_LIST

          this.bids = allBids.reduce((acc, val) => acc.concat(val), []).sort((a, b) => b.seq_id - a.seq_id)

          if (this.bids.length > 0) this.state = SHOW_LIST
          else return this.state = EMPTY_LIST
        } catch (e) {
          this.error = e.message
          console.error(e)
          this.state = ERROR_STATE
        }

      }
    },
    created () {
      Aepp().then(async ae => {
        this.client = ae
        this.address = await this.client.address()
        await this.updateMyBids()
      })
    }
  }
</script>

<style scoped>

  .ae-icon-size {
    background-color: #FF0D6A;
  }

  .bid-image {
    max-height: 200px;
  }

  .btn-primary-round {
    background: #ff0d6a;
    color: #fff;
    box-shadow: 0 0 8px rgba(0, 33, 87, .4);
  }
</style>
