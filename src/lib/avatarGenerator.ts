export interface AvatarOptions {
  backgroundColor?: string;
  size?: number;
  skinColor?: string[];
  eyes?: string[];
  face?: string[];
  hair?: string[];
  hairColor?: string[];
  facialHair?: string[];
  facialHairColor?: string[];
  body?: string[];
  clothingColor?: string[];
  mouth?: string[];
  nose?: string[];
}

export const generateAvatarUrl = (seed: string, options?: AvatarOptions): string => {
  const baseUrl = 'https://api.dicebear.com/9.x/personas/svg';
  const params = new URLSearchParams({
    seed,
    backgroundColor: options?.backgroundColor || 'b6e3f4',
    ...(options?.size && { size: options.size.toString() }),
  });

  // Add array-based options
  if (options?.skinColor && options.skinColor.length > 0) {
    params.append('skinColor', options.skinColor.join(','));
  }
  if (options?.eyes && options.eyes.length > 0) {
    params.append('eyes', options.eyes.join(','));
  }
  if (options?.face && options.face.length > 0) {
    params.append('face', options.face.join(','));
  }
  if (options?.hair && options.hair.length > 0) {
    params.append('hair', options.hair.join(','));
  }
  if (options?.hairColor && options.hairColor.length > 0) {
    params.append('hairColor', options.hairColor.join(','));
  }
  if (options?.facialHair && options.facialHair.length > 0) {
    params.append('facialHair', options.facialHair.join(','));
  }
  if (options?.facialHairColor && options.facialHairColor.length > 0) {
    params.append('facialHairColor', options.facialHairColor.join(','));
  }
  if (options?.body && options.body.length > 0) {
    params.append('body', options.body.join(','));
  }
  if (options?.clothingColor && options.clothingColor.length > 0) {
    params.append('clothingColor', options.clothingColor.join(','));
  }
  if (options?.mouth && options.mouth.length > 0) {
    params.append('mouth', options.mouth.join(','));
  }
  if (options?.nose && options.nose.length > 0) {
    params.append('nose', options.nose.join(','));
  }

  return `${baseUrl}?${params.toString()}`;
};

export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateSeedFromString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
};

export const BACKGROUND_COLORS = [
  { name: 'Sky Blue', value: 'b6e3f4' },
  { name: 'Lavender', value: 'd4b5f7' },
  { name: 'Mint', value: 'b5f7d4' },
  { name: 'Peach', value: 'f7d4b5' },
  { name: 'Pink', value: 'f7b5d4' },
  { name: 'Yellow', value: 'f7f4b5' },
  { name: 'Coral', value: 'f7b5b5' },
  { name: 'Teal', value: 'b5f7f4' },
];

export const SKIN_COLORS = [
  { name: 'Light', value: 'ffdbb4' },
  { name: 'Medium Light', value: 'edb98a' },
  { name: 'Medium', value: 'd08b5b' },
  { name: 'Medium Dark', value: 'ae5d29' },
  { name: 'Dark', value: '614335' },
];

export const HAIR_COLORS = [
  { name: 'Blonde', value: 'f59e0b' },
  { name: 'Light Brown', value: 'a16207' },
  { name: 'Brown', value: '78350f' },
  { name: 'Dark Brown', value: '451a03' },
  { name: 'Black', value: '000000' },
  { name: 'Auburn', value: 'dc2626' },
  { name: 'Red', value: 'ef4444' },
  { name: 'Gray', value: '9ca3af' },
  { name: 'White', value: 'f3f4f6' },
];

export const CLOTHING_COLORS = [
  { name: 'Black', value: '000000' },
  { name: 'White', value: 'ffffff' },
  { name: 'Gray', value: '6b7280' },
  { name: 'Red', value: 'ef4444' },
  { name: 'Blue', value: '3b82f6' },
  { name: 'Green', value: '22c55e' },
  { name: 'Yellow', value: 'eab308' },
  { name: 'Purple', value: 'a855f7' },
];

export const AVATAR_FEATURES = {
  eyes: ['open', 'closed', 'happy', 'sleep', 'surprised', 'wink'],
  face: ['square', 'round'],
  hair: ['full', 'short', 'buzzcut', 'bald', 'long'],
  facialHair: ['none', 'beard', 'goatee', 'mustache', 'stubble'],
  body: ['squared', 'rounded', 'small'],
  mouth: ['smile', 'smirk', 'open', 'serious'],
  nose: ['small', 'medium', 'large', 'pointed'],
};
