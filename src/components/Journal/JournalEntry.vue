<template>
  <q-expansion-item class="q-px-sm" header-class="q-py-none q-px-none" :default-opened="open" expand-icon-toggle>
    <template v-slot:header>
      <div class="row full-width items-center">
        <i-input class="col-grow q-mr-sm" label="Title" v-model="title" />
        <q-btn class="col-shrink" flat dense :icon="pinIcon(index)" @click="pin(index)" />
        <q-btn class="col-shrink" v-if="config.data.edit" flat dense icon="delete" @click="$emit('remove')">
          <q-tooltip>Delete this journal entry</q-tooltip>
        </q-btn>
      </div>
    </template>

    <q-editor
      ref="editor"
      placeholder="Content"
      v-model="content"
      :definitions="{
        image: {
          tip: 'Upload an image',
          icon: 'add_photo_alternate',
          handler: () => $emit('imgUpload'),
        },
      }"
      :toolbar="[
        [
          {
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify'],
          },
        ],
        ['ordered', 'unordered'],
        ['bold', 'italic', 'strike', 'underline'],
        [
          {
            icon: $q.iconSet.editor.size,
            fixedLabel: true,
            list: 'no-icons',
            options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'],
          },
          'color',
          'hr',
        ],
        ['undo', 'redo'],
        ['image'],
      ]"
      dense
    >
      <template v-slot:color>
        <q-btn flat dense icon="format_color_text" :style="{ color: currentColor }">
          <!-- no-focus: QMenu's default focus trap fights QEditor's own
          focus-then-restore-selection logic in runCmd, silently dropping
          the foreColor command. -->
          <q-menu ref="colorMenu" no-focus>
            <q-color
              :model-value="currentColor"
              default-view="palette"
              no-header
              no-footer
              @update:model-value="setColor"
            />
          </q-menu>
        </q-btn>
      </template>
    </q-editor>
    <div class="q-pb-sm" />
  </q-expansion-item>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useCampaign } from 'src/store/campaign';
import { useConfig } from 'src/store/config';

import IInput from 'src/components/Widgets/IInput.vue';

interface IQEditorRef {
  runCmd: (cmd: string, param?: string) => void;
}

interface IQMenuRef {
  hide: () => void;
}

export default defineComponent({
  name: 'JournalEntry',
  components: { IInput },
  props: {
    index: {
      type: Number,
      required: true,
    },
    open: {
      type: Boolean,
    },
  },
  emits: ['remove', 'imgUpload'],
  setup(props) {
    const campaign = useCampaign();
    const config = useConfig();

    const pinIcon = (index: number): string => {
      return campaign.data.journal[index].pinned ? 'mdi-pin' : 'mdi-pin-off';
    };
    const pin = (index: number) => {
      campaign.data.journal[index].pinned = !campaign.data.journal[index].pinned;
    };

    // Routed through computed setters (rather than v-model straight onto the store) so every
    // edit stamps updatedAt for the "Date Last Updated" sort.
    const title = computed({
      get: () => campaign.data.journal[props.index].title,
      set: (value: string) => {
        campaign.data.journal[props.index].title = value;
        campaign.data.journal[props.index].updatedAt = Date.now();
      },
    });
    const content = computed({
      get: () => campaign.data.journal[props.index].content,
      set: (value: string) => {
        campaign.data.journal[props.index].content = value;
        campaign.data.journal[props.index].updatedAt = Date.now();
      },
    });

    const editor = ref<IQEditorRef | null>(null);
    // Insert at the last-known cursor position instead of appending to the
    // end: QEditor saves the caret's Range on blur, and runCmd('insertHTML')
    // restores it before applying document.execCommand.
    const insertImage = (html: string) => {
      editor.value?.runCmd('insertHTML', html);
    };
    const currentColor = ref<string | null>(null);
    const colorMenu = ref<IQMenuRef | null>(null);
    const setColor = (color: string | null) => {
      if (color === null) return;
      currentColor.value = color;
      editor.value?.runCmd('foreColor', color);
      colorMenu.value?.hide();
    };

    return {
      campaign,
      config,
      pinIcon,
      pin,
      title,
      content,
      editor,
      insertImage,
      currentColor,
      colorMenu,
      setColor,
    };
  },
});
</script>

<style lang="sass">
// QColor's palette swatches (used by the journal editor's color picker) have no
// hover indicator by default. QMenu teleports this popup to document.body, so
// this must stay unscoped to still reach it.
.q-color-picker__cube:hover
  // Both rings are inset (never extend past the swatch's own box), so corner
  // and edge swatches in the grid render identically to interior ones - an
  // outset ring risks getting clipped by the palette container there.
  // White-then-black (black listed last so it renders behind/inside white):
  // on any swatch at least one ring contrasts, since they're opposites.
  box-shadow: inset 0 0 0 2px #fff, inset 0 0 0 4px rgba(0, 0, 0, .75)
</style>
