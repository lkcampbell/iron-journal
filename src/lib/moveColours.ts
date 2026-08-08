// Mirrors the move-category colours in src/css/quasar.variables.scss ($adventure, $combat, ...).
// Duplicated here (not imported) following the same plain-TS-map pattern as src/lib/colours.ts —
// keep these two files in sync if the SCSS palette changes.
export const moveCategoryColours: { [index: string]: string } = {
  adventure: '#3b9151',
  relationship: '#663b91',
  combat: '#913b3b',
  suffer: '#917b3b',
  quest: '#3b9191',
  fate: '#3b5191',
  delve: '#66913b',
  optional: '#66913b', // "Optional Delve Moves" — Move.vue's .optional class also maps to $delve
};

// Colours for journal note types with no move-category context.
export const noteTypeColours: { [index: string]: string } = {
  actionroll: '#88c0d0', // $info
  progress: '#a3be8c', // $positive
  progressroll: '#a3be8c', // $positive
  moveoracleroll: '#b48ead', // $accent
};

// Hex equivalents of the text-positive/text-warning/text-negative classes
// roll.ts's updateResults() assigns to IRollData.action.color and
// challenge.die1/die2.color, for reproducing the on-screen roll-result
// colouring (per action/die, not per move outcome) in journal note HTML.
export const rollResultColours: { [index: string]: string } = {
  'text-positive': '#a3be8c', // $positive
  'text-warning': '#ebcb8b', // $warning
  'text-negative': '#bf616a', // $negative
};
