import { forwardRef } from 'react';
import { icons, type LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = forwardRef<SVGSVGElement, DynamicIconProps>(
  ({ name, ...props }, ref) => {
    // Convert kebab-case to PascalCase for Lucide icon lookup
    const iconName = name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') as keyof typeof icons;

    const Icon = icons[iconName];

    if (!Icon) {
      // Fallback to a circle if icon not found
      const FallbackIcon = icons.Circle;
      return <FallbackIcon ref={ref} {...props} />;
    }

    return <Icon ref={ref} {...props} />;
  }
);

DynamicIcon.displayName = 'DynamicIcon';
