<template>
  <q-expansion-item
    class="q-px-sm"
    header-class="q-py-none q-px-none"
    :default-opened="open"
    expand-icon-toggle
    :data-testid="`journal-entry-${index}`"
  >
    <template v-slot:header>
      <div class="row full-width items-center">
        <i-input class="col-grow q-mr-sm" label="Title" v-model="title" data-testid="journal-entry-title" />
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
      data-testid="journal-entry-editor"
      :definitions="{
        image: {
          tip: 'Upload an image',
          icon: 'add_photo_alternate',
          handler: () => $emit('imgUpload'),
        },
      }"
      :toolbar="[
        ['align'],
        ['ordered', 'unordered'],
        ['bold', 'italic', 'strike', 'underline'],
        ['size', 'color', 'hr'],
        ['undo', 'redo'],
        ['image'],
      ]"
      dense
    >
      <!-- QEditor's native options-array dropdowns (what 'align'/'size' used to be) never
      get a tooltip on the trigger button in this Quasar version - only single-command
      buttons do. Rebuilt as slot buttons so every option can carry a real q-tooltip. -->
      <template v-slot:align>
        <q-btn flat dense :icon="$q.iconSet.editor.align">
          <q-tooltip>Align</q-tooltip>
          <q-menu no-focus>
            <div class="q-editor__toolbar-group">
              <q-btn flat dense :icon="$q.iconSet.editor.left" v-close-popup @click="runCmd('justifyLeft')">
                <q-tooltip>Left align</q-tooltip>
              </q-btn>
              <q-btn flat dense :icon="$q.iconSet.editor.center" v-close-popup @click="runCmd('justifyCenter')">
                <q-tooltip>Center align</q-tooltip>
              </q-btn>
              <q-btn flat dense :icon="$q.iconSet.editor.right" v-close-popup @click="runCmd('justifyRight')">
                <q-tooltip>Right align</q-tooltip>
              </q-btn>
              <q-btn flat dense :icon="$q.iconSet.editor.justify" v-close-popup @click="runCmd('justifyFull')">
                <q-tooltip>Justify align</q-tooltip>
              </q-btn>
            </div>
          </q-menu>
        </q-btn>
      </template>

      <template v-slot:size>
        <q-btn flat dense :icon="$q.iconSet.editor.size">
          <q-tooltip>Font size</q-tooltip>
          <q-menu no-focus>
            <q-list dense>
              <q-item
                v-for="(label, i) in sizeLabels"
                :key="label"
                clickable
                v-close-popup
                @click="runCmd('fontSize', String(i + 1))"
              >
                <q-item-section v-html="sizeItemHtml(i + 1, label)" />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <template v-slot:color>
        <q-btn flat dense icon="format_color_text" :style="{ color: currentColor }">
          <q-tooltip>Text color</q-tooltip>
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
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';

import { useCampaign } from 'src/store/campaign';
import { useConfig } from 'src/store/config';
import { registerJournalInsert, unregisterJournalInsert } from 'src/lib/journalEditor';

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
    const runCmd = (cmd: string, param?: string) => {
      editor.value?.runCmd(cmd, param);
    };
    // Insert at the last-known cursor position instead of appending to the end: QEditor
    // tracks the caret continuously (it saves the Range on every document selectionchange,
    // not just on blur) and runCmd('insertHTML') restores it before applying
    // document.execCommand, so this lands wherever the user last clicked or typed in this
    // entry - even if focus is currently on a Move/Roller button elsewhere on the page.
    // execCommand('insertHTML') collapses the caret to a point *inside* the newly
    // inserted element (e.g. inside its trailing <b> label) rather than cleanly after
    // the whole block, so a second insert right afterwards - without the user clicking
    // or typing in between - would land nested inside the first note instead of after
    // it. A trailing zero-width space gives the browser a plain text node to collapse
    // the caret into right after the block, so it reads as a normal "after this note"
    // position and the next insert lands as a sibling instead of nesting.
    const insertHtml = (html: string) => {
      runCmd('insertHTML', `${html}\u200B`);
    };
    // Registers this entry so campaign.appendToJournal (used by Moves, the dice
    // Roller, and progress tracks) can insert at this editor's cursor instead of
    // blindly appending to the end - mirrors how image uploads already insert here.
    onMounted(() => registerJournalInsert(props.index, insertHtml));
    onUnmounted(() => unregisterJournalInsert(props.index));
    const currentColor = ref<string | null>(null);
    const colorMenu = ref<IQMenuRef | null>(null);
    const setColor = (color: string | null) => {
      if (color === null) return;
      currentColor.value = color;
      runCmd('foreColor', color);
      colorMenu.value?.hide();
    };

    // Mirrors QEditor's own size1..size7 lang strings (see the built-in
    // 'size-N' definitions), so our rebuilt dropdown reads identically.
    const sizeLabels = ['Very small', 'A bit small', 'Normal', 'Medium-large', 'Big', 'Very big', 'Maximum'];
    const sizeItemHtml = (n: number, label: string) => `<font size="${n}">${label}</font>`;

    return {
      campaign,
      config,
      pinIcon,
      pin,
      title,
      content,
      editor,
      runCmd,
      insertHtml,
      currentColor,
      colorMenu,
      setColor,
      sizeLabels,
      sizeItemHtml,
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
