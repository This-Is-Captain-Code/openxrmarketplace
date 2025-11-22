export interface Lens {
  id: string;
  name: string;
  displayName: string;
  coverImage: string;
  iconUrl?: string;
  groupId?: string;
}

interface LensCarouselProps {
  lenses: Lens[];
  onLensSelect: (lens: Lens) => void;
  selectedLensId?: string;
}

export default function LensCarousel({ lenses, onLensSelect, selectedLensId }: LensCarouselProps) {
  return (
    <div className="w-full mb-4" data-testid="carousel-lenses">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-start gap-3 px-4 min-w-max">
          {lenses.map((lens, index) => {
            const isSelected = selectedLensId === lens.id;
            
            return (
              <button
                key={lens.id}
                data-testid={`button-lens-${lens.id}`}
                onClick={() => onLensSelect(lens)}
                className={`
                  flex-shrink-0 rounded-full border-2 w-12 h-12
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-white border-white scale-110' 
                    : 'bg-white/20 border-white/40 backdrop-blur-sm hover:bg-white/30'
                  }
                `}
                aria-label={`Apply ${lens.name} lens`}
              >
                {lens.iconUrl ? (
                  <img 
                    src={lens.iconUrl} 
                    alt={lens.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <span className={`text-xs font-bold ${isSelected ? 'text-foreground' : 'text-white'}`}>
                      {index + 1}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
