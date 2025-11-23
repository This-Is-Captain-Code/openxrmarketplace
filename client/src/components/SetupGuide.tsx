import { Button } from './ui/button';
import { ExternalLink, Key, Folder, Camera } from 'lucide-react';

interface SetupGuideProps {
  onDismiss: () => void;
}

export default function SetupGuide({ onDismiss }: SetupGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-auto">
      <div className="max-w-2xl w-full bg-background rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Setup Snap Camera Kit</h1>
          <Button
            data-testid="button-dismiss-setup"
            onClick={onDismiss}
            variant="ghost"
            size="sm"
          >
            Skip for now
          </Button>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            To enable AR lenses in NeoSaga, you need to configure your Snap Camera Kit credentials.
            Follow these steps to get started:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Create a Snap Camera Kit Account</h3>
                <p>
                  Visit the Snap Camera Kit dashboard and create an account if you don't have one.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open('https://camera-kit.snapchat.com/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Snap Camera Kit
                </Button>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Get Your API Token</h3>
                <p>
                  In the Snap Camera Kit dashboard, generate an API token. You'll need this to authenticate.
                </p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                  <Key className="w-4 h-4" />
                  <code>SNAP_API_TOKEN</code>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Create a Lens Group</h3>
                <p>
                  Create a lens group and note the Group ID. Add or select lenses for your app.
                </p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-xs font-mono">
                  <Folder className="w-4 h-4" />
                  <code>SNAP_GROUP_ID</code>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">4</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Configure Your App</h3>
                <p>
                  Open <code className="px-1.5 py-0.5 bg-muted rounded text-xs">client/src/lib/config.ts</code> and add your credentials:
                </p>
                <div className="p-3 bg-muted/50 rounded font-mono text-xs space-y-1 overflow-x-auto">
                  <div><span className="text-muted-foreground">export const</span> SNAP_API_TOKEN = <span className="text-primary">'your_api_token_here'</span>;</div>
                  <div><span className="text-muted-foreground">export const</span> SNAP_GROUP_ID = <span className="text-primary">'your_group_id_here'</span>;</div>
                  <div><span className="text-muted-foreground">export const</span> DEFAULT_LENS_ID = <span className="text-primary">'your_lens_id_here'</span>;</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-card rounded-lg border border-card-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">5</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">Update Lens Data</h3>
                <p>
                  In <code className="px-1.5 py-0.5 bg-muted rounded text-xs">client/src/pages/CameraView.tsx</code>, update the mockLenses array with your actual lens IDs:
                </p>
                <div className="p-3 bg-muted/50 rounded font-mono text-xs space-y-1 overflow-x-auto">
                  <div><span className="text-muted-foreground">const</span> lenses = [</div>
                  <div className="pl-4">{'{ id: '}<span className="text-primary">'your_lens_id_1'</span>{', name: '}<span className="text-primary">'Lens 1'</span>{' },'}</div>
                  <div className="pl-4">{'{ id: '}<span className="text-primary">'your_lens_id_2'</span>{', name: '}<span className="text-primary">'Lens 2'</span>{' },'}</div>
                  <div>];</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Camera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-foreground">Ready to Test!</p>
              <p>
                Once configured, refresh the page and grant camera permissions. Your AR lenses should load automatically!
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.open('https://docs.snap.com/camera-kit', '_blank')}
          >
            View Docs
          </Button>
          <Button onClick={onDismiss}>
            I'll Set This Up Later
          </Button>
        </div>
      </div>
    </div>
  );
}
