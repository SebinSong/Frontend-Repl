<template lang="pug">
ul.c-group-list(v-if='groupsByName.length' data-test='groupsList')
  li.c-group-list-item.group-badge(
    v-for='(group, index) in groupsByName'
    :key='`group-${index}`'
    tag='button'
    :class='{ "is-active": currentGroupId === group.contractID }'
  )
    
</template>

<script>
import sbp from '~/shared/sbp.js'
import { mapGetters, mapState } from 'vuex'

export default ({
  name: 'GroupsList',
  computed: {
    ...mapState([
      'currentGroupId'
    ]),
    ...mapGetters([
      'groupsByName',
      'unreadGroupNotificationCountFor'
    ])
  },
  methods: {
    openModal (mode) {
      sbp('okTurtles.events/emit', OPEN_MODAL, mode)
    },
    handleMenuSelect (id) {
      id && this.changeGroup(id)
    },
    changeGroup (hash) {
      this.$store.commit('setCurrentGroupId', hash)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "_variables.scss";


</style>