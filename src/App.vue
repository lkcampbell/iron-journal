<template>
  <router-view v-if="loaded" />
</template>
<script lang="ts">
import { defineComponent, watch, ref, onMounted } from 'vue';

import { useConfig } from './store/config';
import { useCampaign } from './store/campaign';
import { debounce, useQuasar } from 'quasar';
import { useAssets } from './store/assets';
import { useOracles } from './store/oracles';
import { sleep } from './lib/util';

export default defineComponent({
  name: 'App',
  setup() {
    const loaded = ref(false);

    const $q = useQuasar();
    $q.dark.set(true);

    const campaign = useCampaign();

    const initialiseData = async () => {
      const assets = useAssets();
      const oracles = useOracles();

      await campaign.populateStore().catch((err) => console.log(err));
      await assets.populateStore().catch((err) => console.log(err));
      await oracles.populateStore().catch((err) => console.log(err));
    };

    onMounted(async () => {
      await initialiseData();
      loaded.value = true;
    });

    const config = useConfig();

    watch(
      () => config.$state,
      async () => {
        await config.save();
      },
      { deep: true }
    );

    watch(
      () => config.$state.data.current,
      async () => {
        await campaign.load(config.data.current);
      }
    );

    watch(
      () => campaign.$state,
      debounce(async () => {
        config.data.saving = true;
        await campaign.save();
        await sleep(200);
        config.data.saving = false;
      }, 1000),
      { deep: true }
    );

    return {
      loaded,
    };
  },
});
</script>

<style lang="sass">
.card-bg
  background: $bg-card

.asset-bg
  background-color: $dark-page

.field
  background: $field

p
  margin-bottom: 5px
  padding-bottom: 0px

.asset-text > ul
  padding: 5px
  margin: 0
  list-style-type: '-'

.asset-text > ul > li
  margin-top: 3px
</style>
