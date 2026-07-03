// Static game data — all content in English.

export interface Emotion {
  id: string
  name: string
  emoji: string
  description: string
  situation: string
}

export const emotions: Emotion[] = [
  { id: 'happy', name: 'Happy', emoji: '😊', description: 'A big smile means I feel happy!', situation: 'When I play with my friends, I smile a lot.' },
  { id: 'sad', name: 'Sad', emoji: '😢', description: 'Tears mean I feel sad.', situation: 'When my toy breaks, tears come to my eyes.' },
  { id: 'angry', name: 'Angry', emoji: '😠', description: 'A frown means I feel angry.', situation: 'When someone takes my turn, I frown and stomp my foot.' },
  { id: 'scared', name: 'Scared', emoji: '😨', description: 'Wide eyes mean I feel scared.', situation: 'When I hear a loud noise, my eyes get very wide.' },
  { id: 'surprised', name: 'Surprised', emoji: '😲', description: 'An open mouth means I feel surprised!', situation: 'When I get a gift, my mouth opens wide!' },
  { id: 'calm', name: 'Calm', emoji: '😌', description: 'A soft face means I feel calm.', situation: 'When I read a book, I feel peaceful and quiet.' },
  { id: 'excited', name: 'Excited', emoji: '🤩', description: 'Big eyes and a smile mean I feel excited!', situation: 'When it is my birthday, I can hardly sit still!' },
  { id: 'tired', name: 'Tired', emoji: '🥱', description: 'A yawn means I feel tired.', situation: 'After a long day, I want to yawn and go to sleep.' },
  { id: 'proud', name: 'Proud', emoji: '😁', description: 'A big smile means I feel proud!', situation: 'When I learn something new, I hold my head high!' },
  { id: 'silly', name: 'Silly', emoji: '😜', description: 'A funny face means I feel silly!', situation: 'When I tell a joke, I make a funny face.' },
  { id: 'loved', name: 'Loved', emoji: '🥰', description: 'Hearts in my eyes mean I feel loved.', situation: 'When my family hugs me, I feel warm inside.' },
  { id: 'confused', name: 'Confused', emoji: '🤔', description: 'A thinking face means I feel confused.', situation: 'When I do not understand, I scratch my head.' },
]

export interface ColorItem {
  id: string
  name: string
  hex: string
  emoji: string
}

export const colors: ColorItem[] = [
  { id: 'red', name: 'Red', hex: '#EF4444', emoji: '🍎' },
  { id: 'orange', name: 'Orange', hex: '#F97316', emoji: '🍊' },
  { id: 'yellow', name: 'Yellow', hex: '#FACC15', emoji: '🍌' },
  { id: 'green', name: 'Green', hex: '#22C55E', emoji: '🌳' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', emoji: '🌊' },
  { id: 'purple', name: 'Purple', hex: '#A855F7', emoji: '🍇' },
  { id: 'pink', name: 'Pink', hex: '#EC4899', emoji: '🌸' },
  { id: 'brown', name: 'Brown', hex: '#92400E', emoji: '🐻' },
  { id: 'black', name: 'Black', hex: '#1F2937', emoji: '🐱' },
  { id: 'white', name: 'White', hex: '#F9FAFB', emoji: '☁️' },
  { id: 'gray', name: 'Gray', hex: '#6B7280', emoji: '🐘' },
]

export interface ShapeItem {
  id: string
  name: string
  svg: string
}

export const shapes: ShapeItem[] = [
  { id: 'circle', name: 'Circle', svg: '<circle cx="50" cy="50" r="40" />' },
  { id: 'square', name: 'Square', svg: '<rect x="15" y="15" width="70" height="70" />' },
  { id: 'triangle', name: 'Triangle', svg: '<polygon points="50,15 85,80 15,80" />' },
  { id: 'star', name: 'Star', svg: '<polygon points="50,10 61,40 95,40 67,60 78,90 50,72 22,90 33,60 5,40 39,40" />' },
  { id: 'heart', name: 'Heart', svg: '<path d="M50 85 C 20 60, 10 35, 30 25 C 40 20, 50 30, 50 35 C 50 30, 60 20, 70 25 C 90 35, 80 60, 50 85 Z" />' },
  { id: 'diamond', name: 'Diamond', svg: '<polygon points="50,10 90,50 50,90 10,50" />' },
  { id: 'oval', name: 'Oval', svg: '<ellipse cx="50" cy="50" rx="40" ry="25" />' },
  { id: 'pentagon', name: 'Pentagon', svg: '<polygon points="50,10 90,40 75,85 25,85 10,40" />' },
  { id: 'crescent', name: 'Crescent', svg: '<path d="M 70 20 A 35 35 0 1 0 70 80 A 30 30 0 1 1 70 20 Z" />' },
]

export interface LetterItem {
  letter: string
  word: string
  emoji: string
}

export const alphabet: LetterItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Goat', emoji: '🐐' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👑' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'T', word: 'Tree', emoji: '🌳' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'Xylophone', emoji: '🎹' },
  { letter: 'Y', word: 'Yarn', emoji: '🧶' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
]

export interface RoutineStep {
  id: string
  label: string
  emoji: string
  order: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
}

export const morningRoutine: RoutineStep[] = [
  { id: 'wake', label: 'Wake up', emoji: '⏰', order: 1, timeOfDay: 'morning' },
  { id: 'brush', label: 'Brush teeth', emoji: '🪥', order: 2, timeOfDay: 'morning' },
  { id: 'dress', label: 'Get dressed', emoji: '👕', order: 3, timeOfDay: 'morning' },
  { id: 'breakfast', label: 'Eat breakfast', emoji: '🥣', order: 4, timeOfDay: 'morning' },
  { id: 'school', label: 'Go to school', emoji: '🎒', order: 5, timeOfDay: 'morning' },
]

export const eveningRoutine: RoutineStep[] = [
  { id: 'dinner', label: 'Eat dinner', emoji: '🍽️', order: 1, timeOfDay: 'evening' },
  { id: 'play', label: 'Play time', emoji: '🧸', order: 2, timeOfDay: 'evening' },
  { id: 'bath', label: 'Take a bath', emoji: '🛁', order: 3, timeOfDay: 'evening' },
  { id: 'pajamas', label: 'Put on pajamas', emoji: '🩳', order: 4, timeOfDay: 'evening' },
  { id: 'story', label: 'Read a story', emoji: '📖', order: 5, timeOfDay: 'evening' },
  { id: 'sleep', label: 'Go to sleep', emoji: '😴', order: 6, timeOfDay: 'evening' },
]

export interface MemoryCard {
  id: string
  pairId: string
  emoji: string
  name: string
}

export const memoryThemes: Record<
  string,
  { emoji: string; name: string }[]
> = {
  animals: [
    { emoji: '🐶', name: 'Dog' },
    { emoji: '🐱', name: 'Cat' },
    { emoji: '🐰', name: 'Rabbit' },
    { emoji: '🐻', name: 'Bear' },
    { emoji: '🦊', name: 'Fox' },
    { emoji: '🐼', name: 'Panda' },
  ],
  fruit: [
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🍌', name: 'Banana' },
    { emoji: '🍇', name: 'Grapes' },
    { emoji: '🍓', name: 'Strawberry' },
    { emoji: '🍊', name: 'Orange' },
    { emoji: '🍉', name: 'Watermelon' },
  ],
  toys: [
    { emoji: '⚽', name: 'Ball' },
    { emoji: '🚗', name: 'Car' },
    { emoji: '🪁', name: 'Kite' },
    { emoji: '🎈', name: 'Balloon' },
    { emoji: '🧸', name: 'Teddy' },
    { emoji: '🎸', name: 'Guitar' },
  ],
  weather: [
    { emoji: '☀️', name: 'Sun' },
    { emoji: '🌧️', name: 'Rain' },
    { emoji: '❄️', name: 'Snow' },
    { emoji: '⛈️', name: 'Storm' },
    { emoji: '🌈', name: 'Rainbow' },
    { emoji: '💨', name: 'Wind' },
  ],
  food: [
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍰', name: 'Cake' },
    { emoji: '🥗', name: 'Salad' },
  ],
  space: [
    { emoji: '🌙', name: 'Moon' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🪐', name: 'Planet' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '👽', name: 'Alien' },
    { emoji: '☄️', name: 'Comet' },
  ],
}

export interface PatternQuestion {
  sequence: (string | number)[]
  options: (string | number)[]
  answer: string | number
  type: 'shape' | 'color' | 'number' | 'size'
}

export const patternQuestions: PatternQuestion[] = [
  { sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'], options: ['🔵', '🟢', '🟡'], answer: '🔵', type: 'color' },
  { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙', '⭐'], options: ['⭐', '🌙', '☀️'], answer: '⭐', type: 'shape' },
  { sequence: [1, 2, 3, 4, 5], options: [6, 8, 10], answer: 6, type: 'number' },
  { sequence: [2, 4, 6, 8], options: [10, 9, 7], answer: 10, type: 'number' },
  { sequence: ['🟢', '🟡', '🟠', '🔴', '🟢', '🟡'], options: ['🟠', '🟢', '🔵'], answer: '🟠', type: 'color' },
  { sequence: ['🔺', '🔻', '🔺', '🔻', '🔺', '🔻', '🔺'], options: ['🔻', '⭐', '🟢'], answer: '🔻', type: 'shape' },
  { sequence: [5, 10, 15, 20], options: [25, 30, 22], answer: 25, type: 'number' },
  { sequence: ['🌸', '🌻', '🌼', '🌸', '🌻'], options: ['🌼', '🌷', '🌹'], answer: '🌼', type: 'shape' },
  { sequence: ['🐱', '🐶', '🐱', '🐶', '🐱'], options: ['🐶', '🐰', '🐦'], answer: '🐶', type: 'shape' },
  { sequence: [10, 9, 8, 7, 6], options: [5, 4, 7], answer: 5, type: 'number' },
  { sequence: ['🟤', '🟧', '🟨', '🟩', '🟦', '🟪', '🟤'], options: ['🟧', '⚫', '⚪'], answer: '🟧', type: 'color' },
  { sequence: ['☀️', '🌤️', '☁️', '🌧️', '☀️', '🌤️'], options: ['☁️', '⛈️', '❄️'], answer: '☁️', type: 'shape' },
  { sequence: [3, 6, 9, 12], options: [15, 14, 13], answer: 15, type: 'number' },
  { sequence: ['🍎', '🍌', '🍎', '🍌', '🍎', '🍌'], options: ['🍎', '🍇', '🍊'], answer: '🍎', type: 'shape' },
  { sequence: ['🐾', '🐾', '🐾', '👣', '🐾', '🐾', '🐾', '👣'], options: ['🐾', '🦶', '🖐️'], answer: '🐾', type: 'shape' },
]

// NEW: Animals with their sounds and facts
export interface Animal {
  id: string
  name: string
  emoji: string
  sound: string // descriptive
  habitat: string
}

export const animals: Animal[] = [
  { id: 'dog', name: 'Dog', emoji: '🐶', sound: 'Woof woof!', habitat: 'Home' },
  { id: 'cat', name: 'Cat', emoji: '🐱', sound: 'Meow meow!', habitat: 'Home' },
  { id: 'cow', name: 'Cow', emoji: '🐮', sound: 'Moooo!', habitat: 'Farm' },
  { id: 'pig', name: 'Pig', emoji: '🐷', sound: 'Oink oink!', habitat: 'Farm' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', sound: 'Baaa!', habitat: 'Farm' },
  { id: 'horse', name: 'Horse', emoji: '🐴', sound: 'Neigh!', habitat: 'Farm' },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', sound: 'Cluck cluck!', habitat: 'Farm' },
  { id: 'duck', name: 'Duck', emoji: '🦆', sound: 'Quack quack!', habitat: 'Pond' },
  { id: 'frog', name: 'Frog', emoji: '🐸', sound: 'Ribbit ribbit!', habitat: 'Pond' },
  { id: 'bee', name: 'Bee', emoji: '🐝', sound: 'Buzz buzz!', habitat: 'Garden' },
  { id: 'bird', name: 'Bird', emoji: '🐦', sound: 'Tweet tweet!', habitat: 'Sky' },
  { id: 'owl', name: 'Owl', emoji: '🦉', sound: 'Hoot hoot!', habitat: 'Forest' },
  { id: 'lion', name: 'Lion', emoji: '🦁', sound: 'Roar!', habitat: 'Savanna' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', sound: 'Ooh ooh ah ah!', habitat: 'Jungle' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', sound: 'Trumpet!', habitat: 'Savanna' },
  { id: 'snake', name: 'Snake', emoji: '🐍', sound: 'Hiss hiss!', habitat: 'Forest' },
]

// NEW: Body parts
export interface BodyPart {
  id: string
  name: string
  emoji: string
  description: string
}

export const bodyParts: BodyPart[] = [
  { id: 'head', name: 'Head', emoji: '🙂', description: 'Top of your body' },
  { id: 'eyes', name: 'Eyes', emoji: '👀', description: 'You see with these' },
  { id: 'nose', name: 'Nose', emoji: '👃', description: 'You smell with this' },
  { id: 'mouth', name: 'Mouth', emoji: '👄', description: 'You eat with this' },
  { id: 'ear', name: 'Ear', emoji: '👂', description: 'You hear with this' },
  { id: 'hand', name: 'Hand', emoji: '✋', description: 'You wave with this' },
  { id: 'foot', name: 'Foot', emoji: '🦶', description: 'You walk with this' },
  { id: 'arm', name: 'Arm', emoji: '💪', description: 'You lift with this' },
  { id: 'leg', name: 'Leg', emoji: '🦵', description: 'You run with this' },
  { id: 'heart', name: 'Heart', emoji: '❤️', description: 'It beats in your chest' },
  { id: 'teeth', name: 'Teeth', emoji: '🦷', description: 'You chew with these' },
  { id: 'hair', name: 'Hair', emoji: '💇', description: 'On top of your head' },
]

// NEW: Opposites pairs
export interface OppositePair {
  id: string
  left: { word: string; emoji: string }
  right: { word: string; emoji: string }
}

export const opposites: OppositePair[] = [
  { id: 'big-small', left: { word: 'Big', emoji: '🐘' }, right: { word: 'Small', emoji: '🐭' } },
  { id: 'hot-cold', left: { word: 'Hot', emoji: '🔥' }, right: { word: 'Cold', emoji: '❄️' } },
  { id: 'up-down', left: { word: 'Up', emoji: '⬆️' }, right: { word: 'Down', emoji: '⬇️' } },
  { id: 'day-night', left: { word: 'Day', emoji: '☀️' }, right: { word: 'Night', emoji: '🌙' } },
  { id: 'happy-sad', left: { word: 'Happy', emoji: '😊' }, right: { word: 'Sad', emoji: '😢' } },
  { id: 'fast-slow', left: { word: 'Fast', emoji: '⚡' }, right: { word: 'Slow', emoji: '🐢' } },
  { id: 'open-close', left: { word: 'Open', emoji: '📂' }, right: { word: 'Close', emoji: '📁' } },
  { id: 'full-empty', left: { word: 'Full', emoji: '🥛' }, right: { word: 'Empty', emoji: '🥃' } },
  { id: 'long-short', left: { word: 'Long', emoji: '🐍' }, right: { word: 'Short', emoji: '🐛' } },
  { id: 'wet-dry', left: { word: 'Wet', emoji: '💧' }, right: { word: 'Dry', emoji: '🏜️' } },
  { id: 'hard-soft', left: { word: 'Hard', emoji: '🪨' }, right: { word: 'Soft', emoji: '🧸' } },
  { id: 'loud-quiet', left: { word: 'Loud', emoji: '📣' }, right: { word: 'Quiet', emoji: '🤫' } },
]

// NEW: Sorting categories
export interface SortingCategory {
  id: string
  name: string
  emoji: string
  items: { emoji: string; name: string }[]
}

export const sortingSets: { title: string; categories: SortingCategory[] }[] = [
  {
    title: 'Fruits or Vegetables?',
    categories: [
      { id: 'fruit', name: 'Fruit', emoji: '🍎', items: [
        { emoji: '🍎', name: 'Apple' },
        { emoji: '🍌', name: 'Banana' },
        { emoji: '🍇', name: 'Grapes' },
        { emoji: '🍓', name: 'Strawberry' },
      ]},
      { id: 'vegetable', name: 'Vegetable', emoji: '🥕', items: [
        { emoji: '🥕', name: 'Carrot' },
        { emoji: '🥦', name: 'Broccoli' },
        { emoji: '🌽', name: 'Corn' },
        { emoji: '🥔', name: 'Potato' },
      ]},
    ],
  },
  {
    title: 'Animal or Vehicle?',
    categories: [
      { id: 'animal', name: 'Animal', emoji: '🐾', items: [
        { emoji: '🐶', name: 'Dog' },
        { emoji: '🐱', name: 'Cat' },
        { emoji: '🐰', name: 'Rabbit' },
        { emoji: '🐦', name: 'Bird' },
      ]},
      { id: 'vehicle', name: 'Vehicle', emoji: '🚗', items: [
        { emoji: '🚗', name: 'Car' },
        { emoji: '🚕', name: 'Taxi' },
        { emoji: '✈️', name: 'Plane' },
        { emoji: '🚲', name: 'Bike' },
      ]},
    ],
  },
  {
    title: 'Land or Sky?',
    categories: [
      { id: 'land', name: 'On Land', emoji: '🌳', items: [
        { emoji: '🐶', name: 'Dog' },
        { emoji: '🐱', name: 'Cat' },
        { emoji: '🐘', name: 'Elephant' },
        { emoji: '🦁', name: 'Lion' },
      ]},
      { id: 'sky', name: 'In Sky', emoji: '☁️', items: [
        { emoji: '🐦', name: 'Bird' },
        { emoji: '✈️', name: 'Plane' },
        { emoji: '🚀', name: 'Rocket' },
        { emoji: '🦋', name: 'Butterfly' },
      ]},
    ],
  },
  {
    title: 'Hot or Cold?',
    categories: [
      { id: 'hot', name: 'Hot', emoji: '🔥', items: [
        { emoji: '☀️', name: 'Sun' },
        { emoji: '🔥', name: 'Fire' },
        { emoji: '🌶️', name: 'Pepper' },
        { emoji: '☕', name: 'Coffee' },
      ]},
      { id: 'cold', name: 'Cold', emoji: '❄️', items: [
        { emoji: '❄️', name: 'Snow' },
        { emoji: '🍦', name: 'Ice cream' },
        { emoji: '🧊', name: 'Ice' },
        { emoji: '⛄', name: 'Snowman' },
      ]},
    ],
  },
]

// NEW: Story builder
export interface Story {
  id: string
  title: string
  steps: { id: string; emoji: string; text: string }[]
}

export const stories: Story[] = [
  {
    id: 'morning',
    title: 'A Morning Story',
    steps: [
      { id: '1', emoji: '😴', text: 'I wake up in bed.' },
      { id: '2', emoji: '🪥', text: 'I brush my teeth.' },
      { id: '3', emoji: '🥣', text: 'I eat breakfast.' },
      { id: '4', emoji: '🎒', text: 'I go to school.' },
    ],
  },
  {
    id: 'plant',
    title: 'Growing a Plant',
    steps: [
      { id: '1', emoji: '🌱', text: 'I plant a seed.' },
      { id: '2', emoji: '💧', text: 'I water it.' },
      { id: '3', emoji: '☀️', text: 'The sun shines.' },
      { id: '4', emoji: '🌸', text: 'A flower grows!' },
    ],
  },
  {
    id: 'rain',
    title: 'A Rainy Day',
    steps: [
      { id: '1', emoji: '☁️', text: 'Clouds come.' },
      { id: '2', emoji: '🌧️', text: 'It starts to rain.' },
      { id: '3', emoji: '☂️', text: 'I open my umbrella.' },
      { id: '4', emoji: '🌈', text: 'A rainbow appears!' },
    ],
  },
  {
    id: 'baking',
    title: 'Baking Cookies',
    steps: [
      { id: '1', emoji: '🥣', text: 'I mix the dough.' },
      { id: '2', emoji: '🍪', text: 'I shape the cookies.' },
      { id: '3', emoji: '🔥', text: 'I bake them.' },
      { id: '4', emoji: '😋', text: 'I eat them. Yum!' },
    ],
  },
  {
    id: 'pool',
    title: 'At the Pool',
    steps: [
      { id: '1', emoji: '👕', text: 'I put on my swimsuit.' },
      { id: '2', emoji: '🏊', text: 'I jump in the pool.' },
      { id: '3', emoji: '🌊', text: 'I splash and play.' },
      { id: '4', emoji: '🧖', text: 'I dry off with a towel.' },
    ],
  },
]

// NEW: Music notes for music maker
export const pianoNotes = [
  { note: 'C', freq: 261.63, color: '#EF4444', emoji: '🔴' },
  { note: 'D', freq: 293.66, color: '#F97316', emoji: '🟠' },
  { note: 'E', freq: 329.63, color: '#FACC15', emoji: '🟡' },
  { note: 'F', freq: 349.23, color: '#22C55E', emoji: '🟢' },
  { note: 'G', freq: 392.00, color: '#3B82F6', emoji: '🔵' },
  { note: 'A', freq: 440.00, color: '#8B5CF6', emoji: '🟣' },
  { note: 'B', freq: 493.88, color: '#EC4899', emoji: '🟣' },
  { note: 'C8', freq: 523.25, color: '#EF4444', emoji: '🔴' },
]

// Simple songs to play (note indices)
export const songs: { name: string; emoji: string; notes: number[] }[] = [
  { name: 'Twinkle Star', emoji: '⭐', notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0] },
  { name: 'Happy Birthday', emoji: '🎂', notes: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3] },
  { name: 'Mary Had a Lamb', emoji: '🐑', notes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4] },
]

// NEW: Pet emojis by type and level
export const petEmojis: Record<string, string[]> = {
  cat: ['🐱', '😺', '😸', '😻', '🐱‍👤'],
  dog: ['🐶', '🐕', '🦮', '🐕‍🦺', '🐾'],
  bunny: ['🐰', '🐇', ' hopping ', '🐰', '🥕'],
  dragon: ['🐲', '🐉', '🦖', '🐲', '🔥'],
}

export const petAccessories = [
  { id: 'hat', emoji: '🎩', name: 'Top Hat', cost: 20 },
  { id: 'crown', emoji: '👑', name: 'Crown', cost: 50 },
  { id: 'bow', emoji: '🎀', name: 'Bow', cost: 15 },
  { id: 'glasses', emoji: '🕶️', name: 'Sunglasses', cost: 30 },
  { id: 'flower', emoji: '🌸', name: 'Flower', cost: 10 },
  { id: 'star', emoji: '⭐', name: 'Star', cost: 40 },
]
