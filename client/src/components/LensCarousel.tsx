import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';

export interface Lens {
  id: string;
  name: string;
  iconUrl?: string;
  groupId?: string;
}

interface LensCarouselProps {
  lenses: Lens[];
  onLensSelect: (lens: Lens) => void;
  selectedLensId?: string;
}

export default function LensCarousel({ lenses, onLensSelect, selectedLensId }: LensCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className="w-full overflow-hidden" ref={emblaRef} data-testid="carousel-lenses">
      <div className="flex gap-3 px-4">
        {lenses.map((lens) => {
          const isSelected = selectedLensId === lens.id;
          return (
            <button
              key={lens.id}
              data-testid={`button-lens-${lens.id}`}
              onClick={() => onLensSelect(lens)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden
                transition-all duration-200
                ${isSelected 
                  ? 'ring-2 ring-primary scale-105' 
                  : 'opacity-70 hover-elevate'
                }
              `}
              aria-label={`Apply ${lens.name} lens`}
            >
              {lens.iconUrl ? (
                <img 
                  src={lens.iconUrl} 
                  alt={lens.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                    {lens.name.slice(0, 2)}
                  </span>
                </div>
              )}
              <div className="sr-only">{lens.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
