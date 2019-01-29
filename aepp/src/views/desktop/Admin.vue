<template>
  <div>
    <bigger-loader v-if="loading"/>
    <div v-if="!loading">
      <h2>current height</h2><br>
      <pre>{{height}}</pre>
      <br>
      <h2>slots</h2><br>
      <div class="flex slot-row">
        <div class="w-1/6">Slot Id</div>
        <div class="w-1/6">Time Capacity</div>
        <div class="w-1/6">Bid Time Bounds</div>
        <div class="w-1/6">Block Height Bounds</div>
        <div class="w-1/6">Successful Bids</div>
        <div class="w-1/6">Failed Bids</div>
      </div>
      <div v-for="slot in slots" :key="slot.id">
        <div class="flex slot-row">
          <div class="w-1/6">
            {{slot.id}}
            <ae-badge v-if="slot.timing.active" class="active-badge">active</ae-badge>
            <ae-badge v-if="slot.timing.past">past</ae-badge>
            <ae-badge v-if="slot.timing.future">future</ae-badge>
            <br>
            <ae-button v-if="slot.timing.past" face="round" fill="primary">
              <a :href="slot.downloadLink">
                export
                <ae-icon name="save"/>
              </a>
            </ae-button>
          </div>
          <div class="w-1/6">{{slot.capacityUsed}} min used of {{slot.timeCapacity}} min</div>
          <div class="w-1/6">
            Minimum Time: {{slot.minimumTimePerBid}} min<br>
            Maximum Time: {{slot.maximumTimePerBid}} min
          </div>
          <div class="w-1/6">
            Start height {{slot.startBlockHeight}}<br>
            est.
            <Countdown :initialTime="(slot.startBlockHeight - height) * avgBlockTime"></Countdown>
            <br>
            <br>
            End height&nbsp;&nbsp;{{slot.endBlockHeight}}<br>
            est.
            <Countdown :initialTime="(slot.endBlockHeight - height) * avgBlockTime"></Countdown>
          </div>
          <div class="w-1/6">
            Count: {{slot.success.bids.length}}<br>
            Σ Amount: {{slot.success.amountSum.toFixed()}} AE<br>
            Σ Time: {{slot.success.timeSum}} min
            <div v-if="slot.success.bids.length">
              Min: {{Math.min(...slot.success.amountPerTime)}} AE/min<br>
              Max: {{Math.max(...slot.success.amountPerTime)}} AE/min
            </div>
            <ae-button v-if="slot.success.bids.length" face="round" fill="primary"
                       @click="showBids(slot.id, 'successful', slot.success.bids)">
              inspect
              <ae-icon name="eye"/>
            </ae-button>
          </div>
          <div class="w-1/6">
            Count: {{slot.failed.bids.length}}<br>
            Σ Amount: {{slot.failed.amountSum.toFixed()}} AE<br>
            Σ Time: {{slot.failed.timeSum}} min
            <div v-if="slot.failed.bids.length">
              Min: {{Math.min(...slot.failed.amountPerTime)}} AE/min<br>
              Max: {{Math.max(...slot.failed.amountPerTime)}} AE/min
            </div>
            <ae-button v-if="slot.failed.bids.length" face="round" fill="primary"
                       @click="showBids(slot.id, 'failed', slot.failed.bids)">
              inspect
              <ae-icon name="eye"/>
            </ae-button>
          </div>
        </div>
      </div>
      <bigger-loader v-if="inspectBidsLoading"/>
      <div v-if="this.inspectBids">
        <h2>{{this.inspectBids.state}} bids Slot {{this.inspectBids.slotId}}</h2><br>
        <div class="flex slot-row">
          <div class="w-1/2">Data</div>
          <div class="w-1/2">Preview</div>
        </div>
        <div v-for="bid in this.inspectBids.bids" :key="bid.seqId">
          <div class="flex slot-row">
            <div class="w-1/2">
              Sequence: {{bid.seqId}}<br>
              Amount: {{bid.amountAe.toFixed()}} AE<br>
              Time: {{bid.time}} min<br>
              Amount/Time: {{bid.amountPerTimeAe}} AE/min<br>
              Bidder: {{bid.user}}<br>
              X:{{bid.data.coordinates.x}} Y:{{bid.data.coordinates.y}}
            </div>
            <div class="w-1/2">
              <img :src='bid.url' v-if="bid.url" class="w-full preview-image" alt="Bidding Image">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { EpochChain, EpochContract } from '@aeternity/aepp-sdk'
  import Util from '@/utils/blockchain_util'
  import Countdown from '@/components/Countdown'
  import { AeBadge, AeButton, AeIcon } from '@aeternity/aepp-components'
  import BiggerLoader from '@/components/BiggerLoader'
  import BigNumber from 'bignumber.js'

  export default {
    name: 'Canvas',
    components: {BiggerLoader, AeBadge, AeButton, AeIcon, Countdown},
    data() {
      return {
        slots: [],
        height: 0,
        avgBlockTime: 3 * 60,
        loading: true,
        interval: null,
        inspectBidsLoading: false,
        inspectBids: null
      }
    },
    methods: {
      async loadData() {
        const client = await EpochChain.compose(EpochContract)({
          url: `https://ae-art-testnet.piwo.app`,
          internalUrl: `https://ae-art-testnet.piwo.app`,
        }).catch(console.error);

        this.height = await client.height();

        const called = await client.contractEpochCall(this.$store.state.blockchainSettings.contractAddress, 'sophia-address', 'all_auction_slots', '()', '').catch(console.error);
        const decoded = await client.contractEpochDecodeData(Util.auctionSlotListType, called.out).catch(console.error);
        this.slots = Util.auctionSlotListToObject(decoded)
          .sort((a, b) => a.endBlockHeight - b.endBlockHeight)
          .map(slot => {
            return {
              id: slot.id,
              downloadLink: `${this.$store.state.apiUrl}/slots/${slot.id}`,
              timing: {
                past: Util.slotIsPast(slot, this.height),
                active: Util.slotIsActive(slot, this.height),
                future: Util.slotIsFuture(slot, this.height)
              },
              timeCapacity: slot.timeCapacity,
              minimumTimePerBid: slot.minimumTimePerBid,
              maximumTimePerBid: slot.maximumTimePerBid,
              startBlockHeight: slot.startBlockHeight,
              endBlockHeight: slot.endBlockHeight,
              capacityUsed: Util.slotCapacityUsed(slot) ,
              success: {
                bids: slot.successfulBids.sort((a, b) => a.seqId - b.seqId),
                amountSum: Util.atomsToAe(slot.successfulBids.reduce((acc, x) => acc.plus(x.amount), new BigNumber(0))),
                timeSum: slot.successfulBids.reduce((acc, x) => Number(x.time) + acc, 0),
                amountPerTime: slot.successfulBids.map(x => x.amountPerTime).map(x => Util.atomsToAe(x).toFixed(4))
              },
              failed: {
                bids: slot.failedBids.sort((a, b) => a.seqId - b.seqId),
                amountSum: Util.atomsToAe(slot.failedBids.reduce((acc, x) => acc.plus(x.amount), new BigNumber(0))),
                timeSum: slot.failedBids.reduce((acc, x) => Number(x.time) + acc, 0),
                amountPerTime: slot.failedBids.map(x => x.amountPerTime).map(x => Util.atomsToAe(x).toFixed(4))
              },

            }
          });
        this.loading = false;
      },
      async showBids(slotId, state, bids) {
        this.inspectBidsLoading = true;
        this.inspectBids = null;
        bids = bids.map(bid => {
          bid.url = this.$store.state.apiUrl + "/ipfs/" + bid.data.artworkReference + ".svg";
          bid.amountAe = Util.atomsToAe(bid.amount);
          bid.amountPerTimeAe = Util.atomsToAe(bid.amountPerTime).toFixed(4);
          return bid;
        });
        this.inspectBidsLoading = false;
        this.inspectBids = {slotId: slotId, state: state, bids: bids};
      }
    },
    created() {
      this.loadData();
      this.interval = setInterval(this.loadData, 30000);
    },
    beforeDestroy() {
      clearInterval(this.interval)
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@aeternity/aepp-components/src/styles/variables/colors.scss";

  a {
    color: $color-neutral-maximum;
    text-decoration: none;
  }

  .slot-row {
    padding: 10px;
    border-top: 1px solid lightgray;
  }

  .active-badge {
    background-color: $color-primary;
  }

  .ae-button {
    transform-origin: top left;
    transform: scale(0.7);
  }

  .preview-image {
    max-height: 300px;
  }
</style>
