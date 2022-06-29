<template lang="pug">
nav.c-navigation(
  :aria-label='L("Main")'
  :class='{ "is-active": ephemeral.isActive }'
)
  toggle(
    :aria-expanded='ephemeral.isActive'
    element='navigation'
    @toggle='toggleMenu'
  )
    badge.c-toggle-badge(v-if='totalUnreadNotificationCount' data-test='dashboardBadge') {{ totalUnreadNotificationCount }}

  groups-list(v-if='groupsByName.length > 1' :inert='isInert')
</template>

<script>
import sbp from '~/shared/sbp.js'
import { mapGetters } from 'vuex'
import { OPEN_MODAL } from '@utils/events.js'
import { DESKTOP } from '@view-utils/breakpoints.js'
import { debounce } from '@utils/giLodash.js'
// child components
import Toggle from '@components/Toggle.vue'
import Badge from '@components/Badge.vue'
import GroupsList from './GroupsList.vue'

export default ({
  name: 'Navigation',
  components: {
    GroupsList,
    Toggle,
    Badge
  },
  data () {
    return {
      config: {
        debouncedResize: debounce(this.checkIsTouch, 250)
      },
      ephemeral: {
        isActive: false,
        isTouch: null,
        timeTravelComponentName: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'groupsByName',
      'isDarkTheme',
      'totalUnreadNotificationCount'
    ]),
    logo () {
      const name = this.isDarkTheme ? '-white' : ''
      return `/images/logo-transparent${name}.png`
    },
    isInert () {
      return !this.ephemeral.isActive && this.ephemeral.isTouch
    }
  },
  watch: {
    $route (to, from) {
      const isDifferentPage = from.path !== to.path
      if (this.ephemeral.isActive && isDifferentPage) {
        this.ephemeral.isActive = false
      }
    }
  },
  methods: {
    toggleMenu () {
      this.ephemeral.isActive = !this.ephemeral.isActive
    },
    openModal (mode) {
      sbp('okTurtles.event/emit', OPEN_MODAL, mode)
    },
    enableTimeTravel (evt) {
      if (evt.shiftKey && process.env.NODE_ENV !== 'production') {
        console.debug('enable time travel!')
        this.ephemeral.timeTravelComponentName = 'TimeTravel'
      }
    },
    checkIsTouch () {
      this.ephemeral.isTouch = window.innerWidth < DESKTOP
    }
  },
  created () {
    this.checkIsTouch()
  },
  mounted () {
    // TODO - Create a single resize listener to be reused on components
    window.addEventListener('resize', this.config.debouncedResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.config.debouncedResize)
  },
})
</script>

<style lang="scss" scoped>
@import "_variables.scss";

.c-navigation {
  display: flex;
  flex-direction: row;
  font-weight: normal;
  background: $general_2;
}
</style>
