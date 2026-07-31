<template>
  <!-- content -->
  <div>
    <div class="row full-width q-gutter-sm justify-between items-center">
      <q-toggle class="col" icon="mdi-cog" v-model="showControls" label="Move Controls" />
      <div class="row q-gutter-xs justify-end col-shrink">
        <q-btn dense outline label="Add Location" @click="add(EMapItems.Locations)" />
        <q-btn dense outline label="Add Site" @click="add(EMapItems.Sites)" />
        <q-btn dense outline label="Add NPC" @click="add(EMapItems.NPCs)" />
      </div>
    </div>
    <div v-if="show(EMapItems.Locations)">
      <w-location
        class="q-mt-sm"
        v-for="(item, i) in campaign.data.maps[mapID].cells[cellID].locations"
        :key="i"
        v-model="campaign.data.maps[mapID].cells[cellID].locations[i]"
        @delete="campaign.removeObject(EMapItems.Locations, mapID, cellID, i)"
        :controls="showControls"
        @move="campaign.moveLocation(i, { map: mapID, cell: cellID }, $event)"
      />
    </div>

    <div v-if="show(EMapItems.NPCs)">
      <w-npc
        class="q-mt-sm"
        v-for="(item, i) in campaign.data.maps[mapID].cells[cellID].npcs"
        :key="i"
        v-model="campaign.data.maps[mapID].cells[cellID].npcs[i]"
        @delete="campaign.removeObject(EMapItems.NPCs, mapID, cellID, i)"
        :controls="showControls"
        @move="campaign.moveNPC(i, { map: mapID, cell: cellID }, $event)"
      />
    </div>

    <div v-if="show(EMapItems.Sites)">
      <w-site
        class="q-mt-sm"
        v-for="(item, i) in campaign.data.maps[mapID].cells[cellID].sites"
        :key="i"
        v-model="campaign.data.maps[mapID].cells[cellID].sites[i]"
        @delete="campaign.removeObject(EMapItems.Sites, mapID, cellID, i)"
        :controls="showControls"
        @move="campaign.moveSite(i, { map: mapID, cell: cellID }, $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { EMapItems } from '../models';

import { useCampaign } from 'src/store/campaign';
import { useConfig } from 'src/store/config';

import { NewLocation, NewNPC, NewSite } from 'src/lib/world';

import WNpc from 'src/components/World/WNpc.vue';
import WLocation from 'src/components/World/WLocation.vue';
import WSite from 'src/components/World/WSite.vue';

export default defineComponent({
  components: { WNpc, WLocation, WSite },
  name: 'Cell',
  props: {
    mapID: {
      type: Number,
      required: true,
    },
    cellID: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const campaign = useCampaign();
    const add = (type: EMapItems) => {
      switch (type) {
        case EMapItems.NPCs:
          campaign.data.maps[props.mapID].cells[props.cellID].npcs.unshift(NewNPC());
          break;

        case EMapItems.Sites:
          campaign.data.maps[props.mapID].cells[props.cellID].sites.unshift(NewSite());
          break;

        case EMapItems.Locations:
          campaign.data.maps[props.mapID].cells[props.cellID].locations.unshift(NewLocation());
          break;
      }
      campaign.syncCellStat(props.mapID, props.cellID);
    };

    const show = (type: EMapItems): boolean => {
      return (
        campaign.data.maps[props.mapID].cells[props.cellID][type] &&
        campaign.data.maps[props.mapID].cells[props.cellID][type].length > 0
      );
    };

    const config = useConfig();
    const showControls = ref(false);
    return {
      config,
      campaign,

      EMapItems,
      add,
      show,
      showControls,
    };
  },
});
</script>
