<template lang="pug">
button.c-toggle.is-unstyled(
  :class='element'
  @click='$emit("toggle")'
  :aria-label='L("Toggle navigation")'
)
  i(:class='iconClass')
    slot
</template>

<script>
export default ({
  name: 'Toggle',
  props: {
    element: {
      type: String,
      validator: v => ['navigation', 'sidebar'].includes(v),
      required: true
    }
  },
  computed: {
    iconClass () {
      return `icon-${this.element === 'navigation' ? 'bars' : 'info'}`
    }
  }
})
</script>

<style lang="scss" scoped>
@import "_variables.scss";

$speed: 300ms;
$iconSize: 2.75rem;


</style>
