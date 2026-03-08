window.SPAWNING = [
  { id: 'webmeji-0', config: 'SHIMEJI_CONFIG' }
];

window.SHIMEJI_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  PLATFORM_SELECTOR: '[data-platform]',

  walkspeed: 25,
  fallspeed: 100,
  jumpspeed: 75,
  gettingupspeed: 2000,

  walk: {
    frames: ["shimeji/shime1.png", "shimeji/shime2.png", "shimeji/shime3.png", "shimeji/shime2.png"],
    interval: 350, loops: 6},

  stand: {
    frames: ["shimeji/shime1.png"],
    interval: 400, loops: 1},

  sit: {
    frames: ["shimeji/shime11.png"],
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 3000, max: 11000},

  spin: {
    frames: ["shimeji/shime1.png"],
    interval: 300, loops: 3},

  dance: {
    frames: ["shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime1.png"],
    interval: 400, loops: 5},

  trip: {
    frames: ["shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png", "shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png"],
    interval: 500, loops: 1},

  forcewalk: { loops: 6 },

  forcethink: {
    frames: ["shimeji/shime27.png", "shimeji/shime28.png"],
    interval: 500, loops: 2},

  pet: {
    frames: ["shimeji/shime15.png", "shimeji/shime16.png", "shimeji/shime17.png"],
    interval: 75},

  drag: {
    frames: ["shimeji/shime5.png", "shimeji/shime7.png", "shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime8.png", "shimeji/shime6.png"],
    interval: 210},

  falling: {
    frames: ["shimeji/shime4.png"],
    interval: 400, loops: 2},

  fallen: {
    frames: ["shimeji/shime19.png", "shimeji/shime18.png"],
    interval: 500, loops: 1},

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  JUMP_CHANCE: 0.05,

  climbSide: {
    frames: ["shimeji/shime13.png", "shimeji/shime14.png"],
    interval: 400, loops: 2},

  hangstillSide: {
    frames: ["shimeji/shime12.png"],
    interval: 400, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  climbTop: {
    frames: ["shimeji/shime24.png", "shimeji/shime25.png"],
    interval: 400, loops: 6},

  hangstillTop: {
    frames: ["shimeji/shime23.png"],
    interval: 400, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  jump: {
    frames: ["shimeji/shime22.png"],
    interval: 400}
};
