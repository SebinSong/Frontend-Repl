<template lang="pug">
  div(
    id="app"
    data-test="app"
    :class="appClasses"
  )
    app-styles
    p Hello world!
    a(
      href="https://www.google.com/doodles"
      target="_blank"
    ) wow
</template>

<script>
import AppStyles from '@components/AppStyles.vue'

export default {
  name: 'App',
  components: {
    AppStyles
  },
  computed: {
    showNav () {
      return false // true when the user is logged-in
    },
    appClasses () {
      return {
        'l-width-navigation': this.showNav,
        'l-no-navigation': !this.showNav
      }
    },
    isInCypress () {
      return !!window.cypress
    }
  },
  methods: {

  }
}
</script>

<style lang="scss">
$color: var(--primary_0);

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: $color;
  margin-top: 60px;
}
</style>
