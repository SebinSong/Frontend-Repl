<template lang='pug'>
main.c-splash(data-test='homelogo' v-if='!$store.state.currentGroupId')
  //- TODO: split this into two files, one showing the login/signup buttons
  //-       and the other showing the create/join group buttons.
  header(v-if='!$store.state.loggedIn' key='title-login')
    img.logo(src='/images/group-income-icon-transparent.png')
    i18n.is-title-1(tag='h1' data-test='welcomeHome') Welcome to Group Income

  header(v-else key='title-not-login')
    img.logo-2(src='/assets/images/logo-transparent.png')
    i18n.is-subtitle(tag='p') Welcome to Group Income
    
  .buttons(v-if='!$store.state.loggedIn' key='body-loggin')
    i18n(
      tag='button'
      ref='loginBtn'
      @click='openModal("LoginModal")'
      data-test='loginBtn'
    ) Login

    i18n(
      tag='button'
      ref='signupBtn'
      @click='openModal("signupModal")'
      @keyup.enter='openModal("signupModal")'
      data-test='signupBtn'
      v-focus=''
    ) Signup

  .create-or-join(v-else key='body-create')
    .card
      i18n.is-title-3(tag='h3') Create
      i18n(tag='p') Create a new group and invite your friends.

      i18n(
        tag='button'
        @click='openModal("GroupCreationModal")'
        data-test='createGroup'
        :aria-label='L("Add a group")'
      ) Create Group

    .card
      i18n.is-title-3(tag='h3') Join
      i18n(tag='p') Enter an existing group using your username.
      i18n(
        tag='button'
        @click='openModal("GroupJoinModal")'
        data-test='joinGroup'
      ) Join a Group
</template>

<script>
import sbp from '~/shared/sbp.js'
import { OPEN_MODAL } from '@utils/events.js'

export default ({
  name: 'Home',
  mounted () {
    if (this.$route.query.next) {
      this.openModal('LoginModal')
    }
  },
  methods: {
    openModal (mode) {
      sbp('okTurtles.events/emit', OPEN_MODAL, mode)
    }
  }
})
</script>

<style scoped lang="scss">
@import "variables";

.c-splash {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  min-height: 100%;

  @include tablet {
    justify-content: center;
  }
}

.logo {
  width: 8rem;
  margin: 2rem auto;
}

.logo-2 {
  width: 8rem;
  margin: 0 auto 3rem auto;

  @include tablet {
    margin: 0;
    position: absolute;
    left: 1.5rem;
    top: 1.5rem;
  }
}

.is-subtitle {
  @include tablet {
    margin-top: 3rem;
  }

  @include desktop {
    margin-top: 0;
  }
}

.buttons {
  min-width: 230px;
}

.create-or-join {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  justify-content: center;
  text-align: left;

  @include tablet {
    text-align: center;
  }
}

.card {
  margin: 1.5rem 1.5rem 0 1.5rem;
  width: 100%;

  @include tablet {
    width: 24.375rem;
  }

  h3 {
    margin-bottom: 0.25rem;
  }

  svg {
    width: 6rem;
    margin-left: 1rem;
    float: right;

    @include tablet {
      float: none;
      width: 9.75rem;
      margin: 2.5rem auto 1.5rem auto;
    }
  }

  .button {
    margin-top: 2rem;

    @include tablet {
      margin-bottom: 1rem;
    }
  }
}
</style>
