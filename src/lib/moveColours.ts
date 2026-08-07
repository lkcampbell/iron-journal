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
