<template>
  <div>
    <!-- HEADER -->
    <div class="ae-white-header relative">
      <div @click="goBack" class="ae-back">
        <ae-icon v-if="back" name="back"></ae-icon>
      </div>
      <div class="ae-title">
        <img src="../assets/0_DGP_Logo_black_1.svg" class="logo" @click="$router.push('/')" alt="Drone Library Logo"/>
        <span>{{title}}</span>
      </div>
      <ae-dropdown class="ae-menu">
        <ae-icon name="more" class="ae-back" slot="button"/>
        <li>
          <ae-button @click="$router.push('onboarding')">
            Show Onboarding
          </ae-button>
        </li>
        <li>
          <ae-button @click="$router.push('overview')">
            My Bids
          </ae-button>
        </li>
        <li>
          <ae-button @click="$router.push('/')">
            Main Screen
          </ae-button>
        </li>
        <li v-if="hasDefaultSlot">
          <ae-button @click="showBackdrop">
            Help
          </ae-button>
        </li>
      </ae-dropdown>
    </div>

    <!-- HELP OVERLAY -->
    <ae-backdrop class="p-6" v-show="backDropVisible" @click.native.self="showBackdrop">
      <ae-card>
        <div class="flex justify-center items-center flex-col text-grey-darkest pt-4">
          <slot></slot>
          <ae-button fill="primary" class="mt-8" face="round">
            Close
          </ae-button>
        </div>
      </ae-card>
    </ae-backdrop>
  </div>

</template>

<script>
  import { AeIcon, AeDropdown, AeButton, AeBackdrop, AeCard } from '@aeternity/aepp-components'

  export default {
    name: 'WhiteHeader',
    components: { AeDropdown, AeIcon, AeButton, AeBackdrop, AeCard },
    props: {
      'back': {
        type: Function,
        default: null
      },
      'title': {
        type: String,
      }
    },
    data() {
      return {
        backDropVisible: false
      }
    },
    computed: {
      hasDefaultSlot () {
        return !!this.$slots.default
      }
    },
    methods: {
      goBack () {
        if (this.back) this.back()
      },
      showBackdrop () {
        this.backDropVisible = !this.backDropVisible
      }
    }
  }
</script>

<style lang="scss" scoped>
  .ae-white-header {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10);
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background: #fff;
    position: relative;
    font-family: "Inter UI", sans-serif;
    z-index: 10;
  }

  .logo {
    height: 2.5rem;
    margin-right: 0.8rem
  }

  .ae-back {
    padding: 0.75rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    min-width: 3rem;
  }

  .ae-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    line-height: 1rem;
    margin: auto;
  }

  .ae-back {
    margin-right: auto;
  }

  .ae-menu {
    margin-left: auto;
  }

</style>
