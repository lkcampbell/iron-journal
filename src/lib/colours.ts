import { EMapItems } from 'src/components/models';

export const colours: { [index: string]: string } = {
  [EMapItems.NPCs]: '#A37BA8ff',
  [EMapItems.Sites]: '#51959fff',
  [EMapItems.Locations]: '#849accff',
  location: 'rgba(0, 0, 0, 0.6)',
  bond: '#4caf50ff',
  selected: '#eceff4ff',
  player: '#ff3d00ff',
};

// CSS filter that recolours a black icon to match `colours.bond` (#4caf50),
// used to mark bonded map items directly on their icon instead of a badge.
export const bondIconFilter = 'invert(56%) sepia(75%) saturate(454%) hue-rotate(93deg) brightness(94%) contrast(90%)';

// CSS filter that recolours a black icon to match `colours.player` (#ff3d00),
// used to make the player marker stand out from the location/site/NPC icons.
export const playerIconFilter = 'invert(34%) sepia(46%) saturate(7110%) hue-rotate(3deg) brightness(101%) contrast(104%)';
