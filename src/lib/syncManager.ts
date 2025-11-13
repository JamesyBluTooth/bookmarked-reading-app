import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

export class SyncManager {
  private static syncInProgress = false;
  private static userId: string | null = null;

  static setUserId(userId: string) {
    this.userId = userId;
  }

  static async syncOnLoad(): Promise<void> {
    if (this.syncInProgress || !this.userId) return;
    this.syncInProgress = true;

    try {
      const store = useAppStore.getState();
      const localTimestamp = store.lastSyncedAt;

      // Fetch latest snapshot from cloud
      const { data: cloudSnapshot, error } = await supabase
        .from('snapshots')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cloud snapshot:', error);
        return;
      }

      // Compare timestamps
      if (cloudSnapshot) {
        const cloudTimestamp = cloudSnapshot.updated_at;
        
        if (!localTimestamp || new Date(cloudTimestamp) > new Date(localTimestamp)) {
          // Cloud is newer, download and hydrate
          console.log('Syncing from cloud (cloud is newer)');
          store.hydrateFromSnapshot(cloudSnapshot.snapshot);
          store.setLastSyncedAt(cloudTimestamp);
        } else {
          // Local is newer, upload to cloud
          console.log('Syncing to cloud (local is newer)');
          await this.uploadSnapshot();
        }
      } else {
        // No cloud snapshot exists, upload local
        console.log('No cloud snapshot found, uploading local');
        await this.uploadSnapshot();
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  static async uploadSnapshot(): Promise<void> {
    if (!this.userId) return;

    try {
      const store = useAppStore.getState();
      const snapshot = store.getSnapshot();
      const timestamp = new Date().toISOString();

      const { error } = await supabase
        .from('snapshots')
        .upsert({
          user_id: this.userId,
          snapshot,
          updated_at: timestamp,
          version: 1,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error uploading snapshot:', error);
      } else {
        store.setLastSyncedAt(timestamp);
        console.log('Snapshot uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  static startAutoSync(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.uploadSnapshot();
    }, intervalMs);
  }

  static setupBeforeUnloadSync(): void {
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable background upload
      const store = useAppStore.getState();
      const snapshot = store.getSnapshot();
      
      if (this.userId) {
        const blob = new Blob([JSON.stringify({
          user_id: this.userId,
          snapshot,
          updated_at: new Date().toISOString(),
        })], { type: 'application/json' });
        
        // Note: sendBeacon has size limits, consider edge function for large data
        navigator.sendBeacon(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/snapshots`, blob);
      }
    });
  }
}
