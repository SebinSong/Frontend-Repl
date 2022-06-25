import Vue from 'vue'

import ErrorPage from '@views/containers/loading-error/ErrorPage.vue'
import LoadingPage from '@views/containers/loading-error/LoadingPage.vue'

function asyncHandler (lazyImport, { loading, error } = {}) {
  return () => ({
    // HACK: sometimes a bundler bug makes it necessary to use
    // `.then(m => m.default ?? m)` when importing a module with `import()`
    component: lazyImport().then(m => m.default ?? m),
    loading,
    error
  })
}

export function lazyComponent(name, lazyImport, { loading, error } = {}) {
  Vue.component(name, asyncHandler(lazyImport, { loading, error }))
}

export function lazyPage (lazyImport, { loading, error } = {}) {
  const handler = asyncHandler(lazyImport, { loading, error })

  return () => Promise.resolve({
    functional: true,
    render (h, { data, children }) {
      return h(handler, data, children)
    }
  })
}