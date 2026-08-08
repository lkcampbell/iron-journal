/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute } from 'workbox-precaching'

// Use with precache injection
// `self.__WB_MANIFEST` is a placeholder replaced at build time by workbox's
// InjectManifest webpack plugin; there's no lib.webworker types here to type it.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
precacheAndRoute(self.__WB_MANIFEST)
