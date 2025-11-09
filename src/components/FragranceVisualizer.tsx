import { generateGradient } from "@/lib/fragranceColorMapper";

interface FragranceVisualizerProps {
  visualData: {
    colors: { color: string; percentage: number; name: string }[];
    dominantColor: string;
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function FragranceVisualizer({ visualData, size = 'medium', className = '' }: FragranceVisualizerProps) {
  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  };

  const gradient = generateGradient(visualData.colors);

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <div
        className="w-full h-full rounded-full shadow-lg"
        style={{
          background: gradient,
        }}
        title={visualData.colors.map(c => `${c.name}: ${c.percentage}%`).join('\n')}
      />
    </div>
  );
}
