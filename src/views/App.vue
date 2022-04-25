<template lang="pug">
  div(
    id="app"
    data-test="app"
    :class="appClasses"
  )
    p Hello world!
    a(
      href="https://www.google.com/doodles"
      target="_blank"
    ) wow
</template>

<script>
export default {
  name: 'App',
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
$color: #ff0000;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: $color;
  margin-top: 60px;
}
</style>
