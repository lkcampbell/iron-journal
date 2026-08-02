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
        ['undo', 'redo'],
        ['image'],
      ]"
      dense
    />
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

    return {
      campaign,
      config,
      pinIcon,
      pin,
      title,
      content,
      editor,
      insertImage,
    };
  },
});
</script>
