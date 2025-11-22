export interface AvatarOptions {
  backgroundColor?: string;
  size?: number;
  eyes?: string[];
  face?: string[];
  hair?: string[];
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
  if (options?.eyes && options.eyes.length > 0) {
    params.append('eyes', options.eyes.join(','));
  }
  if (options?.face && options.face.length > 0) {
    params.append('face', options.face.join(','));
  }
  if (options?.hair && options.hair.length > 0) {
    params.append('hair', options.hair.join(','));
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

export const AVATAR_FEATURES = {
  eyes: ['open', 'closed', 'happy', 'sleep', 'surprised', 'wink'],
  face: ['square', 'round'],
  hair: ['full', 'short', 'buzzcut', 'bald', 'long'],
  mouth: ['smile', 'smirk', 'open', 'serious'],
  nose: ['small', 'medium', 'large', 'pointed'],
};
