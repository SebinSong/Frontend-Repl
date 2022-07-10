<template lang="pug">
  transition-expan
    .c-container(v-if='ephemeral.text')
      banner-simple(class='c-banner' :severity='ephemeral.severity')
        .c-inner
          .c-inner-text(v-if='allowA' :data-test='dataTest' role='alert' v-safe-html:a='ephemeral.text')
          .c-inner-text(v-else :data-test='dataTest' role='alert' v-safe-html='ephemeral.text')
          button.is-icon-small.c-button(
            type='button'
            :class='`is-${ephemeral.severity}`'
            :aria-label='L("Dismiss message")'
            @click='clean'
          )
            i.icon-times
</template>

<script>
import BannerSimple from './BannerSimple.vue'
import TransitionExpand from '@components/TransitionExpand.vue'

export default ({
  name: 'BannerScoped',
  components: {
    BannerSimple,
    TransitionExpand
  },
  props: {
    dataTest: {
      type: String,
      default: 'feedbackMsg'
    },
    allowA: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ephemeral: {
        text: null,
        severity: null
      }
    }
  },
  methods: {
    // To be used by parent. Example:
    // this.$refs.BannerScoped.success(L('Changes saved!'))
    clean () {
      this.updateBanner('', '')
    },
    danger (text) {
      this.updateBanner(text, 'danger')
    },
    success (text) {
      this.updateBanner(text, 'success')
    },
    updateBanner (text, severity) {
      this.ephemeral.text = text
      this.ephemeral.severity = severity
    }
  }
})
</script>

<style lang="scss" scoped>
@import "_variable.scss";

.c-container {
  display: flex;
  align-items: flex-start;
  overflow: hidden;
}

.c-banner {
  width: 100%;
  margin-top: 1.5rem;
  overflow: hidden;
}

.c-inner {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &-text {
    text-align: left; // for even when the parent has another aignment
    word-break: break-word; // handle long messages
    font-weight: 600;
  }
}

$severities: "success" $success_0 $success_1, "danger" $danger_0 $danger_1;

.c-button {
  transition: box-shadow 150ms ease-in;
  margin-left: 0.5rem;

  @each $class, $color, $hover in $severities {
    &.is-#{$class} {
      color: $color;

      &:hover,
      &:focus {
        background-color: $hover;
      }

      &:focus {
        box-shadow: 0 0 0 1px $color;
      }
    }
  }
}
</style>