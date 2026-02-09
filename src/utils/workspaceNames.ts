const adjectives = [
  'Swift', 'Bright', 'Bold', 'Calm', 'Clever',
  'Cozy', 'Crisp', 'Daring', 'Eager', 'Fierce',
  'Gentle', 'Happy', 'Jolly', 'Keen', 'Lively',
  'Lucky', 'Merry', 'Noble', 'Plucky', 'Quirky',
  'Radiant', 'Snappy', 'Sunny', 'Tidy', 'Vivid',
  'Warm', 'Witty', 'Zesty', 'Nimble', 'Stellar',
];

const nouns = [
  'Panda', 'Otter', 'Fox', 'Falcon', 'Badger',
  'Penguin', 'Koala', 'Dolphin', 'Owl', 'Lynx',
  'Raven', 'Heron', 'Gecko', 'Puffin', 'Wombat',
  'Ferret', 'Sparrow', 'Toucan', 'Moose', 'Quokka',
  'Ibis', 'Finch', 'Orca', 'Lemur', 'Crane',
  'Marten', 'Newt', 'Robin', 'Sloth', 'Condor',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateWorkspaceName(): string {
  return `${pick(adjectives)} ${pick(nouns)}`;
}
