import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import { nextTick } from 'vue'
import routes from './routes'

// Tab switches (Campaign/Character/Journal/Challenges/World) are route
// pushes, not browser back/forward, so vue-router's built-in
// `savedPosition` (popstate-only) never fires for them. Track each route's
// scroll offset ourselves so every tab remembers where you left it.
const scrollPositions = new Map<string, number>()

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior(to) {
      const saved = scrollPositions.get(to.fullPath)
      return new Promise((resolve) => {
        void nextTick(() => resolve({ left: 0, top: saved ?? 0 }))
      })
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })

  Router.beforeEach((to, from) => {
    scrollPositions.set(from.fullPath, window.scrollY)
  })

  return Router
})
