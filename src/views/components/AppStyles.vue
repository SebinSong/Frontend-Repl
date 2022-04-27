<template lang="pug">
v-style.
  :root {
    --primary_0: #FF0000;
  }
</template>

<script>
import colorsMixins from '@view-utils/colorsManipulation.js'

export default {
  name: 'AppStyles',
  mixins: [colorsMixins]
}
</script>