import { InjectionKey, Ref } from 'vue'

// Provided by Moves.vue, injected by each Move.vue: setting this to a move's
// name requests that move scroll into view and expand itself.
export const focusMoveKey: InjectionKey<Ref<string | null>> = Symbol('focusMove')
