<template lang="pug">
nav.c-navigation(
  :aria-label='L("Main")'
  :class='{ "is-active": ephemeral.isActive }'
)
</template>

<script>
import sbp from '~/shared/sbp.js'

// child components
import Toggle from '@components/Toggle.vue'

export default ({
  name: 'Navigation',
  components: {
    Toggle
  },
  data () {
    return {
      ephemeral: {
        isActive: false,
        isTouch: null,
        timeTravelComponentName: null
      }
    }
  }
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
