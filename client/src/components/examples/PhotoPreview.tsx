import PhotoPreview from '../PhotoPreview';

const mockImageData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxOTIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA4IiBoZWlnaHQ9IjE5MjAiIGZpbGw9IiMxZTI5M2IiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5DYXB0dXJlZCBQaG90bzwvdGV4dD48L3N2Zz4=';

export default function PhotoPreviewExample() {
  return (
    <PhotoPreview
      imageDataUrl={mockImageData}
      onClose={() => console.log('Close preview')}
      onRetake={() => console.log('Retake photo')}
    />
  );
}
