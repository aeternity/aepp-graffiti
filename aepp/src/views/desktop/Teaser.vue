<template>
  <div class="flex flex-col items-center">
    <div class="pt-8 px-2 max-w-desktop">
      <div class="w-full p-8">
        <img alt="drone graffiti logo" src="../../assets/0_DGP_lockup_black_1.svg">
      </div>
      <div class="my-4">
        <ae-card class="w-full">
          <div class="flex flex-col py-4 items-center w-full">
            <h1 class="text-grey-darker">Smart Contract</h1>
            <div class="font-mono text-xl mt-4 max-w-full break-words text-center">{{teaserContractAddress}}</div>
            <div class="font-mono text-xl mt-4">{{geolocation}}</div>
            <ae-button
              @click="openLocation" face="round" fill="primary" class="mt-4" v-if="geolocation">
              Show location on google maps
            </ae-button>
            <ae-loader v-else></ae-loader>
          </div>
        </ae-card>
      </div>
      <div v-if="teaserData.length === 0">
        <BiggerLoader></BiggerLoader>
      </div>
      <div class="flex flex-col mt-2 mb-8">
        <div v-for="teaser in finishedTeaser" :key="teaser.id" class="w-full mb-6">
          <ae-card class="w-full">
            <div class="max-w-full">
              <h1 class="w-full text-center pt-8 pb-4 text-grey-darker leading-tight">{{teaser.title}}</h1>
              <div class="w-full text-center font-mono text-xl mb-6 break-words">
                {{teaser.transaction}}
              </div>
              <div class="flex flex-col md:flex-row max-w-full">
                <img class="teaser-image max-w-full p-4" alt="artwork" :src="teaser.svg">
                <div class="flex flex-col">
                  <div class="field">
                    <div class="text-grey">Block</div>
                    <div class="font-mono text-xl">
                      <a target="_blank" class="text-grey-dark" :href="`https://explorer.aepps.com/#/generation/${teaser.block.key_block.height}`">
                        {{teaser.block && teaser.block.key_block.height}}
                      </a>
                    </div>
                  </div>
                  <div class="field">
                    <div class="text-grey">Date</div>
                    <div class="font-mono text-xl">
                      {{teaser.block && new Date(teaser.block.key_block.time).toLocaleString()}}
                    </div>
                  </div>
                  <div class="field">
                    <div class="text-grey">IPFS Hash</div>
                    <div class="font-mono text-xl">
                      <a target="_blank"
                         :href="`https://gateway.ipfs.io/ipfs/${teaser.artworkReference}`"
                         class="text-grey-dark break-words max-w-full">
                        {{teaser.artworkReference}}
                      </a>
                    </div>
                  </div>
                  <div class="field flex w-full">
                    <ae-button fill="primary" face="round" @click="openTransaction(teaser.transaction)">
                      See Transaction on the Blockchain
                    </ae-button>
                  </div>
                </div>
              </div>
            </div>
          </ae-card>
        </div>
        <div v-for="teaser in loadingTeaser" :key="teaser.id" class="w-full">
          <ae-card class="w-full">
            <div class="flex w-full justify-center py-8">
              <BiggerLoader></BiggerLoader>
            </div>
          </ae-card>
        </div>
      </div>
      <!--
      <div class="bg-purple my-8">
        <div>
          <h1 class="font-mono">Aeternity Network</h1>
        </div>
        <div class="flex flex-col my-2">
          <div class="flex flex-row">
            <div class="field">
              <div class="text-grey">Latest Block</div>
              <div class="font-mono text-xl">{{height}}</div>
            </div>
            <div class="field">
              <div class="text-grey">Date</div>
              <div class="font-mono text-xl">
                {{currentBlock && new Date(currentBlock.key_block.time).toLocaleString()}}
              </div>
            </div>
            <div class="field">
              <div class="text-grey">Micro Blocks</div>
              <div class="font-mono text-xl">
                {{currentBlock && currentBlock.micro_blocks.length}}
              </div>
            </div>
          </div>

          <div class="field">
            <div class="text-grey">Mined By</div>
            <div class="font-mono text-xl">
              {{currentBlock && currentBlock.key_block.beneficiary}}
            </div>
          </div>
        </div>
      </div>-->
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { AeButton, AeCard } from '@aeternity/aepp-components'
  import BiggerLoader from '../../components/BiggerLoader'
  import TeaserUtil from '~/utils/blockchain_teaser_utils'
  import ChainNode from '@aeternity/aepp-sdk/es/chain/node'
  import ContractNodeAPI from '@aeternity/aepp-sdk/es/contract/node'
  import AeLoader from '@aeternity/aepp-components/src/components/aeLoader/aeLoader'

  export default {
    name: 'Teaser',
    components: {AeLoader, BiggerLoader, AeButton, AeCard},
    data() {
      return {
        mainnetUrl: "https://sdk-mainnet.aepps.com",
        teaserContractAddress: "ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr",
        teaserData: [],
        height: null,
        currentBlock: null,
        geolocation: null
      }
    },
    computed: {
      finishedTeaser() {
        return this.teaserData.filter(t => t && !!t.svg)
      },
      loadingTeaser() {
        return this.teaserData.filter(t => t && !t.svg)
      },
    },
    methods: {
      async getBlock(height) {
        return await axios.get(`${this.mainnetUrl}/v2/generations/height/${height}`)
          .then(x => x.data);
      },
      async teaserContractData() {
        const client = await ChainNode.compose(ContractNodeAPI)({
          url: this.mainnetUrl,
          internalUrl: this.mainnetUrl,
        })

        const called = await client.contractNodeCall(this.teaserContractAddress, 'sophia-address', 'all_artworks', '()', '')
        const decoded = await client.contractNodeDecodeData(TeaserUtil.artworkListType, called.out)
        return TeaserUtil.artworkListToObject(decoded);
      },

      async teaserContractGeolocation() {
        const client = await ChainNode.compose(ContractNodeAPI)({
          url: this.mainnetUrl,
          internalUrl: this.mainnetUrl,
        })

        const called = await client.contractNodeCall(this.teaserContractAddress, 'sophia-address', 'get_geolocation', '()', '')
        const decoded = await client.contractNodeDecodeData(TeaserUtil.geolocationType, called.out)
        return TeaserUtil.geolocationToObject(decoded);
      },

      async transactionHash(height) {
        const block = await this.getBlock(height);
        const microblocks = await Promise.all(
          block.micro_blocks
            .map(microblock => axios.get(`${this.mainnetUrl}/v2/micro-blocks/hash/${microblock}/transactions`)
              .then(x => x.data))
        );
        return microblocks
          .reduce((acc, val) => acc.concat(val.transactions), [])
          .filter(t => t.tx.contract_id && t.tx.contract_id === this.teaserContractAddress)
          .map(t => t.hash)[0];
      },
      async getHeight() {
        return await axios.get(`${this.mainnetUrl}/v2/key-blocks/current/height`)
          .then(x => x.data.height)
      },
      openTransaction(id) {
        window.open(`https://explorer.aepps.com/#/tx/${id}`)
      },
      openLocation() {
        window.open(`https://www.google.com/maps/search/${this.geolocation}`)
      }
    },
    async created() {
      this.height = await this.getHeight();
      this.currentBlock = await this.getBlock(this.height);
      this.teaserData = await this.teaserContractData();

      this.teaserData = await Promise.all(this.teaserData.map(async teaser => {
        teaser.transaction = await this.transactionHash(teaser.updatedAt);
        teaser.block = await this.getBlock(teaser.updatedAt);
        const rawSVG = await axios.get(`https://backend.dronegraffiti.com/ipfs/${teaser.artworkReference}.svg`).then(x => x.data);
        teaser.title = rawSVG.match(/<title>(.*)<\/title>/)[1];
        teaser.svg = `data:image/svg+xml;base64,${btoa(rawSVG)}`;
        return teaser;
      }))

      this.geolocation = await this.teaserContractGeolocation();
    }
  }
</script>

<style lang="scss" scoped>
  .bg-purple {
    background: #311b58;
    -webkit-box-shadow: 0 0 10px 0 rgba(0, 0, 0, .11);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, .11);
    border-radius: 10px;
    color: #fff;
    padding: 50px;
  }

  .field {
    padding: 1em 0;
  }

  .teaser-image {
    width: auto;
    height: auto;
    max-height: 400px;
  }

  .field {
    word-break:break-all;
  }

</style>
