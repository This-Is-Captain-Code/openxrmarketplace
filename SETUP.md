# NeoSaga Setup Guide

## Snap Camera Kit Configuration

To enable AR lenses in NeoSaga, you need to configure your Snap Camera Kit credentials.

### Prerequisites

1. **Snap Camera Kit Account**: Sign up at [camera-kit.snapchat.com](https://camera-kit.snapchat.com/)
2. **API Token**: Generate from the Camera Kit dashboard
3. **Lens Group**: Create a lens group and get the Group ID
4. **Lenses**: Upload or select lenses and note their IDs

### Configuration Steps

#### 1. Add Your Credentials

Edit `client/src/lib/config.ts`:

```typescript
export const SNAP_API_TOKEN = 'YOUR_ACTUAL_API_TOKEN';
export const SNAP_GROUP_ID = 'YOUR_ACTUAL_GROUP_ID';
export const DEFAULT_LENS_ID = 'YOUR_FIRST_LENS_ID';
```

#### 2. Update Lens Data

Edit `client/src/pages/CameraView.tsx` and replace the `mockLenses` array:

```typescript
const lenses: Lens[] = [
  { id: 'your_lens_id_1', name: 'Rainbow', groupId: 'YOUR_GROUP_ID' },
  { id: 'your_lens_id_2', name: 'Sparkle', groupId: 'YOUR_GROUP_ID' },
  { id: 'your_lens_id_3', name: 'Vintage', groupId: 'YOUR_GROUP_ID' },
  { id: 'your_lens_id_4', name: 'Neon', groupId: 'YOUR_GROUP_ID' },
  { id: 'your_lens_id_5', name: 'Blur', groupId: 'YOUR_GROUP_ID' },
];
```

#### 3. Optional: Add Lens Thumbnails

To show preview images for each lens, add `iconUrl` to each lens object:

```typescript
{
  id: 'your_lens_id',
  name: 'Rainbow',
  iconUrl: '/path/to/lens-preview.jpg',
  groupId: 'YOUR_GROUP_ID'
}
```

### Testing

1. Save your changes
2. Refresh the browser
3. Grant camera permissions when prompted
4. Select different lenses from the carousel
5. Capture photos with AR effects applied

### Troubleshooting

**Camera not loading?**
- Check browser console for errors
- Verify camera permissions are granted
- Ensure you're using HTTPS (required for camera access)

**Lenses not applying?**
- Verify API token is correct
- Check Group ID matches your lens group
- Ensure lens IDs are valid
- Check browser console for Snap Camera Kit errors

**Getting network errors?**
- The placeholder credentials will cause "Network request failed" errors
- Replace with your actual credentials to fix this

### Resources

- [Snap Camera Kit Docs](https://docs.snap.com/camera-kit)
- [Camera Kit Dashboard](https://camera-kit.snapchat.com/)
- [Lens Studio](https://ar.snap.com/lens-studio) - Create custom lenses

### Architecture

The app uses:
- **Frontend**: React + TypeScript + Vite
- **Camera**: Snap Camera Kit SDK
- **Styling**: Tailwind CSS + shadcn/ui
- **Font**: Lexlox (custom)

### Development

```bash
npm run dev  # Start dev server on port 5000
```

The app will auto-reload as you make changes.
