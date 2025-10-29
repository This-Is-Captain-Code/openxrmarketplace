import { useState } from 'react';
import LensCarousel, { Lens } from '../LensCarousel';

const mockLenses: Lens[] = [
  { id: '1', name: 'Rainbow', groupId: 'mock' },
  { id: '2', name: 'Sparkle', groupId: 'mock' },
  { id: '3', name: 'Vintage', groupId: 'mock' },
  { id: '4', name: 'Neon', groupId: 'mock' },
  { id: '5', name: 'Blur', groupId: 'mock' },
  { id: '6', name: 'Sketch', groupId: 'mock' },
];

export default function LensCarouselExample() {
  const [selectedId, setSelectedId] = useState('1');

  return (
    <div className="bg-background p-6">
      <LensCarousel
        lenses={mockLenses}
        onLensSelect={(lens) => {
          console.log('Lens selected:', lens.name);
          setSelectedId(lens.id);
        }}
        selectedLensId={selectedId}
      />
    </div>
  );
}
