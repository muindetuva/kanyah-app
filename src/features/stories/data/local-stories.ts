export type LocalStoryArtwork =
  | 'daraja-la-msituni'
  | 'golden-flute'
  | 'hadithi-za-moto'
  | 'juma'
  | 'mtoto-wa-jua'
  | 'nias-bright-idea'
  | 'night-kingdom'
  | 'nyayo-za-usiku'

export type LocalStory = {
  artwork: LocalStoryArtwork
  cards: string[]
  category: 'Adventure' | 'Fairy Tales' | 'Folklore' | 'Mystery'
  slug: string
  summary: string
  title: string
}

export const localStories: LocalStory[] = [
  {
    artwork: 'golden-flute',
    cards: [
      'Long ago, beside a great old tree, a child discovered a golden flute hidden among its roots.',
      'The first note carried across the savannah, and every creature stopped to listen.',
      'The child learned that the flute sounded brightest when its music was shared with others.',
    ],
    category: 'Folklore',
    slug: 'the-golden-flute',
    summary: 'A timeless tale of music, magic, and the spirit of the savannah.',
    title: 'The Golden Flute',
  },
  {
    artwork: 'night-kingdom',
    cards: [
      'At the edge of the night market, a young hero noticed that every lantern had lost its song.',
      'High above the village, the cloud king guarded the missing melodies in a stormy mountain.',
      'With courage and kindness, the hero returned the songs and lit the whole valley again.',
    ],
    category: 'Adventure',
    slug: 'mfalme-wa-mawingu',
    summary: 'Safari ya kishujaa kuelekea angani, kumwona mfalme wa mawingu.',
    title: 'Mfalme wa Mawingu',
  },
  {
    artwork: 'juma',
    cards: [
      'Juma heard music in the rain, but nobody else in the village could hear its secret rhythm.',
      'He followed the melody through the fields as the raindrops formed a shimmering path.',
      'At the end of the path, Juma found a story the clouds had carried across generations.',
    ],
    category: 'Mystery',
    slug: 'mvua-iliyoiba-sauti',
    summary: 'Juma anagundua siri kubwa ya mvua ya ajabu.',
    title: 'Mvua Iliyoiba Sauti',
  },
  {
    artwork: 'hadithi-za-moto',
    cards: [
      'When the moon rose, Bibi gathered the children around the fire and began a tale older than the village.',
      'In her story, the lion learned that strength alone could never outrun the patient tortoise.',
      'The children carried Bibi’s lesson home: wisdom grows whenever a story is shared.',
    ],
    category: 'Folklore',
    slug: 'hadithi-za-moto',
    summary: 'Bibi’s fireside tale brings an old lesson to life beneath a sky full of stars.',
    title: 'Hadithi za Moto',
  },
  {
    artwork: 'daraja-la-msituni',
    cards: [
      'Three friends crossed the old rope bridge in search of a bird whose song could wake the forest.',
      'The deeper they travelled, the brighter the butterflies became and the louder the river sang.',
      'On the far bank, they discovered that the forest had been guiding them all along.',
    ],
    category: 'Adventure',
    slug: 'daraja-la-msituni',
    summary: 'Three friends follow a sparkling river across the wildest bridge in the forest.',
    title: 'Daraja la Msituni',
  },
  {
    artwork: 'nyayo-za-usiku',
    cards: [
      'Amina woke to find tiny golden footprints glowing across her bedroom floor.',
      'With her lantern and magnifying glass, she followed them toward the carved wooden chest.',
      'Inside was a forgotten family map and the beginning of a brand-new mystery.',
    ],
    category: 'Mystery',
    slug: 'nyayo-za-usiku',
    summary: 'A trail of glowing footprints leads Amina toward a secret hidden close to home.',
    title: 'Nyayo za Usiku',
  },
  {
    artwork: 'mtoto-wa-jua',
    cards: [
      'Every morning, Kito climbed the hill to greet the sun before the village woke.',
      'One cloudy day, he closed his eyes and remembered every warm sunrise he had ever seen.',
      'His hopeful song carried across the valley, and golden light returned to the sky.',
    ],
    category: 'Fairy Tales',
    slug: 'mtoto-wa-jua',
    summary: 'A hopeful child discovers how to carry sunlight even through the cloudiest day.',
    title: 'Mtoto wa Jua',
  },
  {
    artwork: 'nias-bright-idea',
    cards: [
      'Nia loved questions, especially the ones nobody in her classroom could answer yet.',
      'She combined colors, music, numbers, and stories until a bright new idea appeared.',
      'Soon the whole class was inventing together, because one idea can light many more.',
    ],
    category: 'Adventure',
    slug: 'nias-bright-idea',
    summary: 'Nia follows her curiosity and discovers that learning can spark brilliant adventures.',
    title: 'Nia’s Bright Idea',
  },
]

export function getLocalStory(slug: string) {
  return localStories.find((story) => story.slug === slug)
}
