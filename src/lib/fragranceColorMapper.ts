/**
 * Maps fragrance note categories and families to colors for visualization
 */

interface ColorMapping {
  [key: string]: string;
}

// HSL colors for different note families
export const familyColors: ColorMapping = {
  citrus: 'hsl(142, 76%, 36%)', // Green
  floral: 'hsl(330, 81%, 60%)', // Pink
  woody: 'hsl(25, 95%, 30%)', // Brown
  spicy: 'hsl(0, 72%, 51%)', // Red
  fresh: 'hsl(217, 91%, 60%)', // Blue
  oriental: 'hsl(38, 92%, 50%)', // Amber
  fruity: 'hsl(24, 95%, 53%)', // Orange
  aquatic: 'hsl(188, 94%, 43%)', // Cyan
  aromatic: 'hsl(271, 76%, 53%)', // Purple
  green: 'hsl(142, 71%, 45%)', // Lime green
  leather: 'hsl(30, 47%, 25%)', // Dark brown
  gourmand: 'hsl(0, 0%, 50%)', // Gray
};

// Default color for unknown families
const defaultColor = 'hsl(220, 13%, 69%)'; // Muted gray

/**
 * Get color for a fragrance note based on its family
 */
export function getNoteColor(family: string): string {
  const normalizedFamily = family.toLowerCase().trim();
  return familyColors[normalizedFamily] || defaultColor;
}

/**
 * Generate visual data from a formula
 * Returns color data for visualization components
 */
export function generateVisualData(formula: any[]): any {
  const visualData = {
    colors: [] as { color: string; percentage: number; name: string }[],
    dominantColor: '',
  };

  if (!formula || formula.length === 0) {
    return visualData;
  }

  // Sort by percentage descending
  const sortedFormula = [...formula].sort((a, b) => b.percentage - a.percentage);

  // Generate color array
  visualData.colors = sortedFormula.map(note => ({
    color: getNoteColor(note.family || ''),
    percentage: note.percentage,
    name: note.name,
  }));

  // Dominant color is the one with highest percentage
  if (sortedFormula.length > 0) {
    visualData.dominantColor = getNoteColor(sortedFormula[0].family || '');
  }

  return visualData;
}

/**
 * Generate a color gradient string from visual data
 */
export function generateGradient(colors: { color: string; percentage: number }[]): string {
  if (!colors || colors.length === 0) {
    return defaultColor;
  }

  if (colors.length === 1) {
    return colors[0].color;
  }

  // Create a conic gradient based on percentages
  let currentPercent = 0;
  const stops = colors.map(c => {
    const start = currentPercent;
    currentPercent += c.percentage;
    return `${c.color} ${start}% ${currentPercent}%`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}
