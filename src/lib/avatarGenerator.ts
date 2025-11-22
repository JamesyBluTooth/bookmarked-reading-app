export interface AvatarOptions {
  backgroundColor?: string;
  size?: number;
}

export const generateAvatarUrl = (seed: string, options?: AvatarOptions): string => {
  const baseUrl = 'https://api.dicebear.com/9.x/personas/svg';
  const params = new URLSearchParams({
    seed,
    backgroundColor: options?.backgroundColor || 'b6e3f4',
    ...(options?.size && { size: options.size.toString() })
  });
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
