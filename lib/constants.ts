export const VALID_CATEGORIES = [
  'disease',
  'weeds',
  'drought',
  'healthy',
  'ponding',
  'pests',
] as const;

export type CategoryTag = typeof VALID_CATEGORIES[number]; 