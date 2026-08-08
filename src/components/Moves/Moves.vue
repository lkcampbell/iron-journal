<template>
  <div>
    <!-- content -->
    <q-input
      class="q-my-sm"
      label="Search name or key word"
      v-model="filter"
      debounce="500"
      standout="bg-blue-grey text-white"
      :input-style="{ color: '#ECEFF4' }"
      dense
      clearable
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div v-for="(category, index) in Moves" :key="index">
      <div v-for="(move, mIndex) in category" :key="mIndex">
        <div v-if="show(move)" class="q-mb-sm">
          <move :move="move" :moveType="index as string" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref, watch } from 'vue';
import { IMove } from 'src/components/models';
import { Moves } from 'src/lib/moves';
import { focusMoveKey } from 'src/lib/moveNavigation';

import Move from 'src/components/Moves/Move.vue';

export default defineComponent({
  name: 'Moves',
  components: { Move },
  setup() {
    const filter = ref('');
    const focusMoveName = ref<string | null>(null);
    // Clear any active search filter so a jumped-to move is guaranteed to be in the DOM.
    watch(focusMoveName, (name) => {
      if (name) filter.value = '';
    });
    provide(focusMoveKey, focusMoveName);
    const show = (move: IMove): boolean => {
      if (filter.value === '' || filter.value === null) {
        return true;
      }

      if (move.name !== undefined) {
        if (RegExp(filter.value, 'i').test(move.name)) {
          return true;
        }
      }

      if (move.keywords !== undefined) {
        if (RegExp(filter.value, 'i').test(move.keywords)) {
          return true;
        }
      }
      return false;
    };

    return {
      Moves,
      filter,
      show,
    };
  },
});
</script>
