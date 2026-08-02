<template>
  <div class="row full-width items-center q-pl-md q-pr-sm q-mt-sm">
    <span class="col-shrink text-h5 q-pr-sm">JOURNAL</span>
    <q-input
      v-model="filter"
      class="col-grow q-mb-sm"
      dense
      standout="bg-blue-grey text-white"
      :input-style="{ color: '#ECEFF4' }"
      debounce="500"
      clearable
      label="Search by title or content"
    >
      <template v-slot:before>
        <q-btn class="col-shrink" icon="add_circle" flat dense @click="addJournal">
          <q-tooltip>Add a journal entry</q-tooltip>
        </q-btn>
      </template>

      <template v-slot:prepend>
        <q-icon name="search" />
      </template>

      <template v-slot:after>
        <q-btn-dropdown icon="sort" flat dense content-class="card-bg">
          <q-tooltip>Sort journal entries</q-tooltip>
          <q-list>
            <q-item clickable v-close-popup @click="sortOrder = 'created-desc'">
              <q-item-section>Date Created (Newest First)</q-item-section>
              <q-item-section v-if="sortOrder === 'created-desc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sortOrder = 'created-asc'">
              <q-item-section>Date Created (Oldest First)</q-item-section>
              <q-item-section v-if="sortOrder === 'created-asc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sortOrder = 'updated-desc'">
              <q-item-section>Date Last Updated (Newest First)</q-item-section>
              <q-item-section v-if="sortOrder === 'updated-desc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sortOrder = 'updated-asc'">
              <q-item-section>Date Last Updated (Oldest First)</q-item-section>
              <q-item-section v-if="sortOrder === 'updated-asc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sortOrder = 'title-asc'">
              <q-item-section>Title (A-Z)</q-item-section>
              <q-item-section v-if="sortOrder === 'title-asc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="sortOrder = 'title-desc'">
              <q-item-section>Title (Z-A)</q-item-section>
              <q-item-section v-if="sortOrder === 'title-desc'" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </q-input>
  </div>

  <!-- Pinned -->
  <div v-for="entry in sortedJournal" :key="entry.index">
    <journal-entry
      :ref="(el) => setEntryRef(entry.index, el)"
      v-if="entry.journal.pinned"
      :index="entry.index"
      open
      @imgUpload="
        journalEntryID = entry.index;
        imageToLoad = null;
        showImageLoad = true;
      "
      @remove="removeJournal(entry.index)"
    />
  </div>

  <!-- Not pinned -->
  <div v-for="entry in sortedJournal" :key="entry.index">
    <journal-entry
      :ref="(el) => setEntryRef(entry.index, el)"
      v-if="showJournal(entry.journal) && !entry.journal.pinned"
      :index="entry.index"
      :open="entry.index === 0"
      @imgUpload="
        journalEntryID = entry.index;
        imageToLoad = null;
        showImageLoad = true;
      "
      @remove="removeJournal(entry.index)"
    />
  </div>

  <q-dialog v-model="showImageLoad">
    <q-card class="card-bg">
      <q-card-section class="text-center text-bold bg-secondary">Upload Image</q-card-section>

      <q-card-section>
        <q-file
          v-model="imageToLoad"
          standout="bg-blue-grey text-white"
          :input-style="{ color: '#ECEFF4' }"
          label="Select Image"
          accept="image/*"
        />
      </q-card-section>

      <q-card-section>
        <q-select
          label="Float"
          v-model="imageFloatSelect"
          :options="Object.values(imageFloat)"
          dense
          hint="Select image float (allows text to wrap around the image)"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="Save" flat color="primary" @click="loadImage" />
        <q-btn label="Close" flat color="warning" dense @click="showImageLoad = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import { computed, defineComponent, ref } from 'vue';

import { IJournalEntry } from 'src/components/models';

import { useCampaign } from 'src/store/campaign';
import { useConfig } from 'src/store/config';

import { NewJournal } from 'src/lib/campaign';

import JournalEntry from 'src/components/Journal/JournalEntry.vue';

interface IJournalEntryRef {
  insertImage: (html: string) => void;
}

export default defineComponent({
  name: 'Journal',
  components: { JournalEntry },
  setup() {
    const campaign = useCampaign();
    const config = useConfig();

    const addJournal = () => campaign.data.journal.unshift(NewJournal());
    const removeJournal = (index: number) => {
      if (window.confirm('Are you sure you want to delete this entry?')) campaign.data.journal.splice(index, 1);
    };

    const entryRefs: Record<number, IJournalEntryRef> = {};
    const setEntryRef = (index: number, el: IJournalEntryRef | null) => {
      if (el) {
        entryRefs[index] = el;
      } else {
        delete entryRefs[index];
      }
    };

    const filter = ref('');
    const showJournal = (journal: IJournalEntry): boolean => {
      if (filter.value === '' || filter.value === null) {
        return true;
      }

      if (journal.title !== undefined) {
        if (RegExp(filter.value, 'i').test(journal.title)) {
          return true;
        }
      }

      if (journal.content !== undefined) {
        if (RegExp(filter.value, 'i').test(journal.content)) {
          return true;
        }
      }
      return false;
    };

    type SortOrder = 'created-desc' | 'created-asc' | 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';
    const sortOrder = ref<SortOrder>('created-desc');

    // Entries from before createdAt/updatedAt existed fall back to 0 (oldest).
    const byTimestamp = (field: 'createdAt' | 'updatedAt', direction: 1 | -1) => {
      return (a: { journal: IJournalEntry }, b: { journal: IJournalEntry }) =>
        direction * ((a.journal[field] ?? 0) - (b.journal[field] ?? 0));
    };

    // Sorting is view-only: it never reorders campaign.data.journal, so it can't lose data or need undoing.
    const sortedJournal = computed(() => {
      const entries = campaign.data.journal.map((journal, index) => ({ journal, index }));
      if (sortOrder.value === 'created-asc') return entries.sort(byTimestamp('createdAt', 1));
      if (sortOrder.value === 'created-desc') return entries.sort(byTimestamp('createdAt', -1));
      if (sortOrder.value === 'updated-asc') return entries.sort(byTimestamp('updatedAt', 1));
      if (sortOrder.value === 'updated-desc') return entries.sort(byTimestamp('updatedAt', -1));
      if (sortOrder.value === 'title-asc') return entries.sort((a, b) => a.journal.title.localeCompare(b.journal.title));
      return entries.sort((a, b) => b.journal.title.localeCompare(a.journal.title));
    });

    enum imageFloat {
      Left = 'left',
      Right = 'right',
      None = 'none',
    }
    const imageFloatSelect = ref(imageFloat.None);
    const imageToLoad = ref(null);
    const journalEntryID = ref(0);
    const showImageLoad = ref(false);
    const loadImage = () => {
      const f: File = imageToLoad.value as unknown as File;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = ev.target?.result;
        let imgClass = 'journal-img';
        if (imageFloatSelect.value === imageFloat.Left) {
          imgClass += ' float-left';
        }
        if (imageFloatSelect.value === imageFloat.Right) {
          imgClass += ' float-right';
        }
        const html = `<img class="${imgClass}" src="${img as string}" />`;
        const entry = entryRefs[journalEntryID.value];
        if (entry) {
          entry.insertImage(html);
        } else {
          campaign.appendToJournal(journalEntryID.value, html);
        }
      };

      reader.readAsDataURL(f);
      showImageLoad.value = false;
    };

    return {
      showJournal,
      addJournal,
      removeJournal,
      sortOrder,
      sortedJournal,
      loadImage,
      setEntryRef,
      showImageLoad,
      imageFloat,
      imageToLoad,
      imageFloatSelect,
      journalEntryID,
      filter,
      config,
      campaign,
    };
  },
});
</script>

<style lang="sass">
.journal-img
  max-width: 100%
  max-height: 300px
  margin: 5px

.float-left
  float: left
  clear: right

.float-right
  float: right
  clear: left
</style>
