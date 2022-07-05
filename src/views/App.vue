<template lang="pug">
  div(
    id="app"
    data-test="app"
    :class="appClasses"
    :data-sync="ephemeral.syncs"
    :data-logged-in="ephemeral.finishedLogin"
  )
    app-styles
    banner-general(ref='bannerGeneral')
    navigation(v-if='showNav' class='l-navigation')
    router-view.l-page
    modal.l-modal
</template>

<script>
import sbp from '~/shared/sbp.js'
import AppStyles from '@components/AppStyles.vue'
import BannerGeneral from '@components/banners/BannerGeneral.vue'
import Modal from '@components/modal/Modal.vue'
import Navigation from './containers/navigation/Navigation.vue'
import { mapMutations } from 'vuex'

export default {
  name: 'App',
  components: {
    AppStyles,
    BannerGeneral,
    Navigation,
    Modal
  },
  data () {
    return {
      ephemeral: {
        syncs: [],
        finishedLogin: 'no',
        isCorrupted: false
      }
    }
  },
  computed: {
    showNav () {
      return true
      /*
      return this.$store.state.loggedIn &&
        this.$store.getters.groupsByName.length > 0 &&
        this.$route.path !== '/join' // true when the user is logged-in
      */
    },
    appClasses () {
      return {
        'l-with-navigation': this.showNav,
        'l-no-navigation': !this.showNav,
        'js-reducedMotion': this.$store.state.reducedMotion,
        'is-dark-theme': this.$store.getters.isDarkTheme
      }
    },
    isInCypress () {
      return !!window.cypress
    }
  },
  methods: {
    ...mapMutations([
      'setReducedMotion'
    ])
  },
  mounted () {
    sbp('okTurtles.data/set', 'BANNER', this.$refs.bannerGeneral)
    // call from anywhere in the app:
    // sbp('okTurtles.data/get', 'BANNER').show(L('Trying to reconnect...'), 'wifi')
    // sbp('okTurtles.data/get', 'BANNER').danger(L('message'), 'icon-type')
    // sbp('okTurtles.data/get', 'BANNER').clean()
  }
}
</script>