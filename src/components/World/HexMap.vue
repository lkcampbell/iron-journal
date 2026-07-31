<template>
  <q-layout
    view="hHh lpR fFf"
    container
    :style="{
      width: `${campaign.data.maps[config.data.map].width + 20}px`,
      height: '500px',
    }"
  >
    <q-page-container>
      <q-page v-scroll="onScroll" ref="mapbox">
        <div class="text-h6 row sf-header items-center q-pa-lg bg-dark" v-show="mapLoading">
          Rendering Map...
          <q-btn label="LOADING" flat loading />
        </div>
        <div
          v-show="!mapLoading"
          class="hexmap"
          ref="hexmap"
          id="hexmap"
          :style="{
            minWidth: `${campaign.data.maps[config.data.map].width}px`,
            height: `${campaign.data.maps[config.data.map].height}px`,
          }"
          @click="click($event)"
        ></div>
      </q-page>
    </q-page-container>
  </q-layout>

  <q-dialog v-model="showDialog" seamless transition-show="fade" transition-hide="fade">
    <q-card class="card-bg" :style="{ minWidth: '40%', transform: `translate(${dialogPos.x}px, ${dialogPos.y}px)` }">
      <div
        class="row justify-center items-center bg-dark text-caption q-py-xs"
        style="cursor: move"
        v-touch-pan.mouse.prevent.stop="onDialogDrag"
      >
        Cell Settings
      </div>

      <q-card-section class="row justify-between items-center bg-secondary text-h5">
        <q-input
          class="col"
          label="Cell Name"
          v-model="campaign.data.maps[config.data.map].cells[selectedID].name"
          dense
          borderless
        />
        <q-btn class="col-shrink" icon="close" flat dense @click="showDialog = false" />
      </q-card-section>

      <q-card-section class="q-pa-sm q-mb-sm">
        <div class="row q-gutter-sm items-center">
          <q-select
            class="col-grow"
            label="Set cell status"
            hint="Automatically set to 'location' when a Site, Location, or NPC is added here. Only 'location' cells get a label/icon on the map."
            v-model="campaign.data.maps[config.data.map].cells[selectedID].stat"
            :options="Object.values(ECellStatus)"
          />
          <q-btn
            v-if="campaign.data.maps[config.data.map].player === selectedID"
            class="col-shrink"
            dense
            outline
            label="Go away"
            @click="campaign.data.maps[config.data.map].player = undefined"
          />
          <q-btn
            v-else
            class="col-shrink"
            dense
            outline
            label="Go here"
            @click="campaign.data.maps[config.data.map].player = selectedID"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm">
        <cell :mapID="config.data.map" :cellID="selectedID" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, PropType, watch, Ref } from 'vue';
import { dom, scroll, useQuasar } from 'quasar';

import { ECellStatus, EMapItems, ISearchResults } from '../models';

import { useCampaign } from 'src/store/campaign';
import { useConfig } from 'src/store/config';

import { Svg, SVG } from '@svgdotjs/svg.js';
import { extendHex, defineGrid, HexFactory, Grid, Hex } from 'honeycomb-grid';
import { CellLabel, NewCell } from 'src/lib/world';
import { bondIconFilter, colours } from 'src/lib/colours';
import { icon } from 'src/lib/icons';
import { estimateHexH, estimateHexW, sleep } from 'src/lib/util';

import Cell from './Cell.vue';

export default defineComponent({
  name: 'HexMap',
  components: { Cell },
  props: {
    searchResults: {
      type: Object as PropType<ISearchResults>,
      default: <ISearchResults>{},
    },
    selectedCell: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  setup(props) {
    const hexmap: Ref<HTMLElement | null> = ref(null);

    const campaign = useCampaign();
    const config = useConfig();
    const $q = useQuasar();

    const { getScrollTarget, setVerticalScrollPosition, setHorizontalScrollPosition } = scroll;

    const showDialog = ref(false);
    const selectedID = ref('');
    const mapLoading = ref(true);

    const dialogPos = ref({ x: 0, y: 0 });
    const dragStart = ref({ x: 0, y: 0 });

    const onDialogDrag = (evt: { isFirst: boolean; offset: { x: number; y: number } }) => {
      if (evt.isFirst) dragStart.value = { ...dialogPos.value };
      dialogPos.value = {
        x: dragStart.value.x + evt.offset.x,
        y: dragStart.value.y + evt.offset.y,
      };
    };

    const onScroll = (y: number, x: number) => {
      console.log(x, y);
      campaign.data.maps[config.data.map].scrollX = x;
      campaign.data.maps[config.data.map].scrollY = y;
    };

    const h = (x: number, y: number): string => {
      return `h-${x}-${y}`;
    };

    const width = (): number => {
      if (campaign.data.maps[config.data.map].hexW) return campaign.data.maps[config.data.map].hexW as number;

      const w = campaign.data.maps[config.data.map].width; // Map width in px
      const r = campaign.data.maps[config.data.map].hexSize; // hex radius
      return estimateHexW(w, r);
    };

    const height = (): number => {
      if (campaign.data.maps[config.data.map].hexH) return campaign.data.maps[config.data.map].hexH as number;

      return estimateHexH(campaign.data.maps[config.data.map].height, campaign.data.maps[config.data.map].hexSize);
    };

    // Create initial values
    let Hx: HexFactory<{ size: number; orientation: 'flat' | 'pointy' }> = extendHex({
      size: campaign.data.maps[config.data.map].hexSize,
      orientation: campaign.data.maps[config.data.map].hexFlat ? 'flat' : 'pointy',
    });
    let Grid = defineGrid(Hx);
    let grid: Grid<Hex<{ size: number }>>;

    let map: Svg;
    onMounted(async () => {
      console.log('initial map render');
      map = SVG()
        .addTo(hexmap.value as HTMLElement)
        .size('100%', '100%');

      await fullRender();
    });

    const fullRender = async () => {
      mapLoading.value = true;
      await renderGrid();
      renderFills();
      renderIcons();
      renderLabels();
      renderSearch();
      renderPlayer();
      renderSelected();
      scrollToSelected();
      map.transform({
        origin: [0, 0],
        scale: campaign.data.maps[config.data.map].zoom,
      });
      mapLoading.value = false;
    };

    // Render functions
    const getXY = (id: string): { x: number; y: number } => {
      const s = id.split(/-/g);
      if (s.length === 3) {
        // h, x, y
        const hex = grid.get({ x: +s[1], y: +s[2] });
        if (hex) {
          const { x, y } = hex.toPoint();
          return { x: x, y: y };
        }
      }
      return { x: 0, y: 0 };
    };

    const renderGrid = async () => {
      await sleep(0); // Needs an await somewhere to actually run asynchronously
      console.log('Rendering map');
      map.clear();

      Hx = extendHex({
        size: campaign.data.maps[config.data.map].hexSize,
        orientation: campaign.data.maps[config.data.map].hexFlat ? 'flat' : 'pointy',
      });
      Grid = defineGrid(Hx);
      grid = Grid.rectangle({
        width: width(),
        height: height(),
      });
      const corners = Hx().corners();
      const points = corners.map((p) => `${p.x},${p.y}`).join(' ');
      const hexSymbol = map.polygon(points).addClass('hex').fill('none');

      // Place hexes and content
      grid.forEach((hex) => {
        const { x, y } = hex.toPoint();
        const id = h(hex.x, hex.y);
        hexSymbol.clone().addClass(id).addTo(map).translate(x, y);
      });

      const bgk = SVG().image(campaign.data.maps[config.data.map].image);
      bgk.addTo(map).back();
    };

    const renderFills = () => {
      console.log('Rendering fills');
      const cells = campaign.data.maps[config.data.map].cells;
      Object.keys(cells).forEach((id) => {
        map.find(`.${id}`).forEach((cell) => {
          const c = cells[id];
          switch (c.stat) {
            case ECellStatus.Location:
              cell.fill(colours.location);
              break;

            default:
              cell.fill('none');
              break;
          }
        });
      });
    };

    const renderLabels = () => {
      console.log('Rendering labels');
      map.find('.labels').forEach((i) => i.remove());

      // Create a new group
      const labels = SVG().group().addClass('labels');
      const hexSize = campaign.data.maps[config.data.map].hexSize;
      const { x: centerX } = Hx().center();

      // Populate it
      const cells = campaign.data.maps[config.data.map].cells;
      Object.keys(cells).forEach((id) => {
        const c = cells[id];

        if (c.stat === ECellStatus.Location) {
          let { label, type } = CellLabel(c, id);
          const { x, y } = getXY(id);

          SVG()
            .text(label)
            .addClass('label')
            .addTo(labels)
            .font({
              fill: colours[type] || 'white',
              weight: 'bold',
              size: campaign.data.maps[config.data.map].fonts.label.size,
              anchor: 'middle',
            })
            .stroke({ color: 'black', width: 1 })
            .amove(x + centerX, y - hexSize + 3);
        }
      });

      labels.addTo(map).front();
    };

    const renderSearch = () => {
      console.log('Rendering search results');
      //clear existing search labels
      map.find('.search-label').forEach((i) => i.remove());

      if (!(props.searchResults != {} && props.searchResults[config.data.map])) return;

      const { x: centerX } = Hx().center();

      // Add search results
      Object.keys(props.searchResults[config.data.map]).forEach((id) => {
        if (props.searchResults[config.data.map][id]) {
          const { x, y } = getXY(id);
          const cell = props.searchResults[config.data.map][id];
          let { label } = CellLabel(campaign.data.maps[config.data.map].cells[id], id);

          if (map.find(`.${id}`).length > 0) {
            SVG()
              .text(function (add) {
                Object.keys(cell).forEach((oType) => {
                  cell[oType].forEach((i) => {
                    const c = campaign.data.maps[config.data.map].cells[id][oType as EMapItems][i];
                    if (c && c.name !== label) {
                      add.tspan(c.name).stroke({ color: 'black', width: 1 }).fill(colours[oType]).newLine();
                    }
                  });
                });
              })
              .addClass('search-label')
              .addTo(map)
              .font({ size: campaign.data.maps[config.data.map].fonts.search.size, weight: 'bold', anchor: 'middle' })
              .amove(x + centerX, y + campaign.data.maps[config.data.map].hexSize * 2.5 + 5);
          }
        }
      });
    };

    const renderIcons = () => {
      console.log('Rendering icons');
      map.find('.icons').forEach((i) => i.remove());

      const icons = SVG().group().addClass('icons');
      const cells = campaign.data.maps[config.data.map].cells;
      Object.keys(cells).forEach((id) => {
        const c = cells[id];

        if (c.stat === ECellStatus.Location || c.npcs.length > 0) {
          const { x, y } = getXY(id);

          const size = campaign.data.maps[config.data.map].hexSize;
          let i = '';
          if (c.npcs.length > 0) i = icon.person();
          if (c.sites.length > 0) i = icon.dungeon();
          if (c.locations.length > 0) i = icon.location(c.locations[0].type);

          const img = SVG()
            .image(i)
            .addClass('icon')
            .size(size, size)
            .addTo(icons)
            .move(x + size / 2.6, y + size / 2);

          img.mouseenter(() => img.animate(100).transform({ scale: 1.3 }));
          img.mouseleave(() => img.animate(100).transform({ scale: 1 }));

          const hasBond = c.npcs.some((n) => n.bond) || c.locations.some((l) => l.bond);
          if (hasBond) img.css({ filter: bondIconFilter });
        }
      });

      icons.addTo(map);
    };

    const renderPlayer = () => {
      console.log('Render player icon');

      map.find('.player').forEach((p) => p.remove());

      if (!campaign.data.maps[config.data.map].player) return;
      const location = campaign.data.maps[config.data.map].player as string;

      const size = campaign.data.maps[config.data.map].hexSize;
      const { x, y } = getXY(location);

      SVG()
        .image(icon.player())
        .addClass('player')
        .size(size, size)
        .addTo(map)
        .move(x + size, y)
        .front();
    };

    const renderSelected = () => {
      console.log('Rendering selected hex');
      map.find('.selected-hex').forEach((h) => h.remove());

      if (!props.selectedCell) return;
      if (map.find(`.${props.selectedCell}`).length === 0) return;

      const { x, y } = getXY(props.selectedCell);
      const corners = Hx().corners();
      const points = corners.map((p) => `${p.x},${p.y}`).join(' ');

      SVG()
        .polygon(points)
        .addClass('selected-hex')
        .fill('none')
        .stroke({ color: colours.selected, width: 4 })
        .addTo(map)
        .translate(x, y)
        .front();
    };

    const scrollToSelected = () => {
      if (!props.selectedCell || !hexmap.value) return;
      if (map.find(`.${props.selectedCell}`).length === 0) return;

      const target = getScrollTarget(hexmap.value);
      const clientHeight = target instanceof Element ? target.clientHeight : document.documentElement.clientHeight;
      const clientWidth = target instanceof Element ? target.clientWidth : document.documentElement.clientWidth;

      const zoom = campaign.data.maps[config.data.map].zoom;
      const { x, y } = getXY(props.selectedCell);
      const duration = 300;

      setVerticalScrollPosition(target, Math.max(0, y * zoom - clientHeight / 2), duration);
      setHorizontalScrollPosition(target, Math.max(0, x * zoom - clientWidth / 2), duration);
    };

    // PRIMARY CLICK EVENT
    const click = (ev: { offsetX: number; offsetY: number }) => {
      // Get the SVG hex that was clicked on
      const hex = grid.get(Grid.pointToHex(ev.offsetX, ev.offsetY));

      // Derive its ID
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const id = h(hex!.x, hex!.y);

      // Ensure cell data exists before opening the dialog
      if (!campaign.data.maps[config.data.map].cells[id]) {
        campaign.data.maps[config.data.map].cells[id] = NewCell(id);
      }

      selectedID.value = id;
      showDialog.value = true;
    };

    // Zoom
    watch(
      () => campaign.data.maps[config.data.map].zoom,
      () => {
        // Because Safari...
        $q.platform.is.safari
          ? dom.css(hexmap.value as HTMLElement, {
              transformOrigin: '0 0',
              scale: `${campaign.data.maps[config.data.map].zoom}`,
            })
          : map.transform({
              origin: [0, 0],
              scale: campaign.data.maps[config.data.map].zoom,
            });
      }
    );

    // Map config
    watch(
      () => [
        campaign.data.maps[config.data.map].height,
        campaign.data.maps[config.data.map].width,
        campaign.data.maps[config.data.map].hexSize,
        campaign.data.maps[config.data.map].hexFlat,
        campaign.data.maps[config.data.map].hexW,
        campaign.data.maps[config.data.map].hexH,
      ],
      () => {
        console.log('Map config triggered render');
        void fullRender();
      },
      { deep: true }
    );

    watch(
      () => campaign.data.maps[config.data.map].fonts,
      () => {
        renderLabels();
        renderSearch();
      },
      { deep: true }
    );

    // Cell data change
    watch(
      () => campaign.data.maps[config.data.map].cells,
      () => {
        console.log('Cell data triggered render');
        renderFills();
        renderIcons();
        renderLabels();
      },
      { deep: true }
    );

    // Search
    watch(
      () => props.searchResults,
      () => {
        console.log('Search data triggered render');
        renderSearch();
      },
      { deep: true }
    );

    // Move Player
    watch(
      () => campaign.data.maps[config.data.map].player,
      () => renderPlayer()
    );

    // Selected item
    watch(
      () => props.selectedCell,
      () => {
        renderSelected();
        scrollToSelected();
      }
    );

    return {
      campaign,
      config,
      mapLoading,
      hexmap,
      click,
      onScroll,
      showDialog,
      selectedID,
      ECellStatus,
      dialogPos,
      onDialogDrag,
    };
  },
});
</script>

<style lang="sass">
.hexmap svg
  transform-origin: 0 0
  cursor: pointer

svg polygon.hex
  stroke: rgba(256, 256, 256, 0.1)
  stroke-width: 1pt

svg .search-label, .label
  paint-order: stroke fill
</style>
