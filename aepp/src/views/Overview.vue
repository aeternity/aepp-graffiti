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
      <div v-for="bid in bids" :key='bid.seqId'>
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
            <div class="absolute pin-b pin-r rounded-full btn-primary-round"
                 @click="shareBid(bid.seqId)">
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
  </div>

</template>

<script>
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Util from '../utils/blockchain_util'
  import BiggerLoader from '~/components/BiggerLoader'
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeCard } from '@aeternity/aepp-components'
  import config from '~/config'
  import bugsnagClient from '~/utils/bugsnag'

  const INITAL_STATE = 0, SHOW_LIST = 1, EMPTY_LIST = 2, ERROR_STATE = 3

  export default {
    name: 'Overview',
    components: { BiggerLoader, AeCard, WhiteHeader },
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
          const calledAllBids = await this.client.contractNodeCall(String(this.blockchainSettings.contractAddress), 'sophia-address', 'all_auction_slots', '()', '').catch(e => console.error(e))

          if (!calledAllBids) {
            this.error = 'Could not retrieve data from contract. Are you online?'
            bugsnagClient.notify('calledAllBids is undefined')
            return this.state = ERROR_STATE
          }

          const height = await this.client.height()

          const decodedAllBids = await this.client.contractNodeDecodeData(Util.auctionSlotListType, calledAllBids.out).catch(e => console.error(e))

          if (!decodedAllBids) {
            this.error = 'Could not decode data from contract.'
            bugsnagClient.notify('decodedAllBids is undefined')
            return this.state = ERROR_STATE
          }

          const slots = Util.auctionSlotListToObject(decodedAllBids)

          if (slots.length === 0) return this.state = EMPTY_LIST

          const allBids = slots.map(slot => {
            let allBids = []

            allBids = allBids.concat(slot.successfulBids.filter(bid => bid.user === this.address).map(bid => {
              bid.successful = true
              return bid
            }))

            allBids = allBids.concat(slot.failedBids.filter(bid => bid.user === this.address).map(bid => {
              bid.successful = false
              return bid
            }))

            allBids = allBids.map(bid => {
              bid.amount = Util.atomsToAe(bid.amount)
              bid.finished = Util.slotIsPast(slot, height)
              bid.slotId = slot.id
              bid.minimumAmount = Math.min(...slot.successfulBids.map(x => x.amountPerTime).map(x => Util.atomsToAe(x).toFixed(4)))
              bid.url = config.apiUrl + '/ipfs/' + bid.data.artworkReference + '.svg'
              return bid
            })
            return allBids
          })

          if(allBids.length === 0) return this.state = EMPTY_LIST

          this.bids = allBids.reduce((acc, val) => acc.concat(val), []).sort((a, b) => b.seqId - a.seqId)

          if (this.bids.length > 0) this.state = SHOW_LIST
          else return this.state = EMPTY_LIST
        } catch (e) {
          this.error = e.message
          console.error(e)
          this.state = ERROR_STATE
          bugsnagClient.notify(e)
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
  .bid-image {
    max-height: 200px;
  }

  .btn-primary-round {
    background: #ff0d6a;
    color: #fff;
    box-shadow: 0 0 8px rgba(0, 33, 87, .4);
  }
</style>
