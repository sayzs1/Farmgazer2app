interface CategoryTagProps {
  category: 'weeds' | 'drought' | 'disease' | 'ponding' | 'healthy' | 'pest';
}

export function CategoryTag({ category }: CategoryTagProps) {
  // Define color schemes for each category
  const colorSchemes = {
    weeds: 'bg-emerald-100 text-emerald-800',
    drought: 'bg-amber-100 text-amber-800',
    disease: 'bg-red-100 text-red-800',
    ponding: 'bg-blue-100 text-blue-800',
    healthy: 'bg-green-100 text-green-800',
    pest: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className={`inline-block px-2 py-1 text-base font-medium rounded ${colorSchemes[category]}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </div>
  );
}