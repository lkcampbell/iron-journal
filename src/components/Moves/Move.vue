<template>
  <q-expansion-item
    class="shadow-1 overflow-hidden"
    :label="move.name"
    :caption="caption"
    :header-class="cardStyle"
    style="border-radius: 4px"
  >
    <q-card class="card-bg">
      <q-card-section v-html="move.text" />
      <q-card-section class="q-gutter-sm">
        <div class="row items-center">
          <q-btn label="Insert move text" icon="mdi-book-open-page-variant-outline" outline dense @click="insertReference">
            <q-tooltip>Insert this move's text into the journal</q-tooltip>
          </q-btn>
        </div>

        <div class="row items-center q-gutter-sm no-wrap">
          <q-btn-toggle class="col-grow" :options="statOpts" label="Attribute" dense flat spread v-model="statSelect" />
          <q-input
            v-if="statSelect === 'other'"
            class="col-1"
            type="number"
            label="Other"
            dense
            borderless
            hide-bottom-space
            v-model="statOtherAttr"
          >
            <q-tooltip>Custom attribute value</q-tooltip>
          </q-input>
          <q-input class="col-1" type="number" label="Adds" dense borderless hide-bottom-space v-model="statAdds" />
          <q-btn dense flat @click="rollStat">
            <q-icon name="mdi-dice-6" />
            <q-tooltip>Roll +Attribute</q-tooltip>
          </q-btn>
        </div>

        <div v-if="statRoll.result" class="row items-center justify-evenly text-h6">
          <div :class="statRoll.action.color">
            {{ statRoll.result }}<span v-if="statRoll.challenge.match"> with a match</span>
          </div>
          <span :class="statRoll.action.color">{{ statRoll.action.score }}</span
          ><span>vs</span>
          <span :class="statRoll.challenge.die1.color">{{ statRoll.challenge.die1.roll }}</span
          ><span>|</span>
          <span :class="statRoll.challenge.die2.color">{{ statRoll.challenge.die2.roll }}</span>
          <q-btn icon="save" flat dense @click="saveStatRoll">
            <q-tooltip>Save roll to journal</q-tooltip>
          </q-btn>
          <q-btn icon="mdi-close-circle" flat dense @click="clearStatRoll">
            <q-tooltip>Clear roll result</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section v-if="move.oracles" class="q-gutter-md">
        <q-btn
          v-for="(table, index) in move.oracles"
          :key="index"
          :label="'Roll ' + table"
          @click="click(table)"
          outline
        />
        <q-btn label="Clear results" outline @click="results = []" />
        <q-btn icon="save" outline @click="save" />
        <div>
          <span v-for="(res, index) in results" :key="index" class="q-pr-md">{{ res }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { IMove } from 'src/components/models';
import { Move } from 'src/lib/oracles/move';
import { characterStatOpts, moveRoll, NewRollData, oracleRoll } from 'src/lib/roll';
import { formatMoveActionRollNote, formatMoveReferenceNote, formatRollNote } from 'src/lib/journalNotes';
import { useCampaign } from 'src/store/campaign';

export default defineComponent({
  name: 'Move',
  props: {
    move: {
      type: Object as PropType<IMove>,
      required: true,
    },
    moveType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const campaign = useCampaign();

    const results = ref([] as string[]);
    const click = (o: string) => {
      if (props.move.oracles !== undefined) {
        results.value.push(oracleRoll(Move[o]));
      }
    };
    const cardStyle = computed((): string => {
      return 'shadow-1 overflow-hidden text-h6 move-header ' + props.moveType.split(' ')[0].toLowerCase();
    });
    const caption = computed((): string => {
      return `${props.moveType}: ${props.move.source}`;
    });
    const save = () => {
      results.value.forEach((v) => {
        campaign.appendToJournal(0, formatRollNote('moveoracleroll', `${props.move.name}: ${v}`));
      });
    };

    const insertReference = () => {
      campaign.appendToJournal(0, formatMoveReferenceNote(props.move, props.moveType));
    };

    const statOpts = computed(() => characterStatOpts(campaign.data.character));
    const statSelect = ref('');
    const statOtherAttr = ref(0);
    const statAdds = ref(0);
    const statRoll = ref(NewRollData());
    const rollStat = () => {
      const attr =
        statSelect.value === 'other'
          ? statOtherAttr.value
          : statSelect.value.includes(':')
          ? +statSelect.value.split(':')[1]
          : 0;
      statRoll.value = moveRoll(attr, statAdds.value, campaign.data.character.tracks.momentum.value, false);
    };
    const clearStatRoll = () => (statRoll.value = NewRollData());
    const saveStatRoll = () => {
      if (!statRoll.value.result) return;
      campaign.appendToJournal(0, formatMoveActionRollNote(props.move, props.moveType, statRoll.value));
      clearStatRoll();
    };

    return {
      click,
      results,
      save,
      cardStyle,
      caption,

      insertReference,

      statOpts,
      statSelect,
      statOtherAttr,
      statAdds,
      statRoll,
      rollStat,
      clearStatRoll,
      saveStatRoll,
    };
  },
});
</script>

<style lang="sass">
ul
  margin: 0em
  padding: 1.5em

ul li
  margin: 0
  padding: 0

.move-header
  text-shadow: 1px 1px 1px #4C566A

.adventure
  background-color: $adventure

.combat
  background-color: $combat

.fate
  background-color: $fate

.quest
  background-color: $quest

.relationship
  background-color: $relationship

.suffer
  background-color: $suffer

.delve
  background-color: $delve

.optional
  background-color: $delve
</style>
