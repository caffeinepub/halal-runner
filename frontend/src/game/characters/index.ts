export interface CharacterDef {
  id: number;
  name: string;
  description: string;
  bodyColor: string;
  clothColor: string;
  headwearColor: string;
  skinColor: string;
  headwearType: 'kufi' | 'hijab' | 'turban';
  emoji: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 0,
    name: 'Ahmad',
    description: 'Young boy in a white kufi cap',
    bodyColor: '#2A6B8A',
    clothColor: '#FFFFFF',
    headwearColor: '#F5EDD6',
    skinColor: '#C68642',
    headwearType: 'kufi',
    emoji: '🧢',
  },
  {
    id: 1,
    name: 'Fatima',
    description: 'Girl in a beautiful hijab',
    bodyColor: '#6B2A8A',
    clothColor: '#E8C96A',
    headwearColor: '#4A1A6A',
    skinColor: '#C68642',
    headwearType: 'hijab',
    emoji: '🧕',
  },
  {
    id: 2,
    name: 'Sheikh Omar',
    description: 'Scholar with a white turban',
    bodyColor: '#1A5C1A',
    clothColor: '#F5EDD6',
    headwearColor: '#FFFFFF',
    skinColor: '#8D5524',
    headwearType: 'turban',
    emoji: '👳',
  },
];
