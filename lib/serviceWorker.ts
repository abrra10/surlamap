// Service Worker Registration and Management

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return false;
    }

    try {
      console.log('🚀 Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered successfully');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        window.location.reload();
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      return true;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return false;
    }
  }

  private handleMessage(message: ServiceWorkerMessage) {
    switch (message.type) {
      case 'CACHE_UPDATED':
        console.log('📦 Cache updated:', message.data);
        break;
      case 'OFFLINE_ACTION_QUEUED':
        console.log('📝 Offline action queued:', message.data);
        break;
      case 'SYNC_COMPLETED':
        console.log('✅ Background sync completed');
        break;
      default:
        console.log('📨 Service Worker message:', message);
    }
  }

  private notifyUpdateAvailable() {
    // Show update notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Surlamap Update Available', {
        body: 'A new version is available. Click to update.',
        icon: '/images/logo.png',
        requireInteraction: true
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  async update(): Promise<boolean> {
    if (!this.registration) {
      console.log('❌ No Service Worker registration found');
      return false;
    }

    try {
      console.log('🔄 Updating Service Worker...');
      await this.registration.update();
      
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.unregister();
      console.log('✅ Service Worker unregistered');
      return true;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return false;
    }
  }

  // Send message to service worker
  async sendMessage(message: ServiceWorkerMessage): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.log('❌ No active Service Worker');
      return;
    }

    try {
      this.registration.active.postMessage(message);
    } catch (error) {
      console.error('❌ Failed to send message to Service Worker:', error);
    }
  }

  // Check if app is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get offline status
  async getOfflineStatus(): Promise<{ isOnline: boolean; lastSync?: Date }> {
    const isOnline = this.isOnline();
    
    // Get last sync time from IndexedDB or localStorage
    const lastSync = localStorage.getItem('lastSync');
    
    return {
      isOnline,
      lastSync: lastSync ? new Date(lastSync) : undefined
    };
  }

  // Queue offline action
  async queueOfflineAction(action: {
    type: string;
    data: any;
    timestamp: number;
  }): Promise<void> {
    try {
      // Store in IndexedDB or localStorage
      const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
      offlineActions.push(action);
      localStorage.setItem('offlineActions', JSON.stringify(offlineActions));
      
      // Notify service worker
      await this.sendMessage({
        type: 'OFFLINE_ACTION_QUEUED',
        data: action
      });
      
      console.log('📝 Offline action queued:', action);
    } catch (error) {
      console.error('❌ Failed to queue offline action:', error);
    }
  }

  // Get queued offline actions
  getQueuedOfflineActions(): any[] {
    try {
      return JSON.parse(localStorage.getItem('offlineActions') || '[]');
    } catch (error) {
      console.error('❌ Failed to get queued offline actions:', error);
      return [];
    }
  }

  // Clear queued offline actions
  clearQueuedOfflineActions(): void {
    localStorage.removeItem('offlineActions');
  }
}

// Global service worker manager instance
const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register service worker on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerManager.register();
  });

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('🌐 App is online');
    serviceWorkerManager.sendMessage({ type: 'ONLINE' });
  });

  window.addEventListener('offline', () => {
    console.log('📴 App is offline');
    serviceWorkerManager.sendMessage({ type: 'OFFLINE' });
  });

  // Listen for service worker update events
  window.addEventListener('sw-update-available', () => {
    console.log('🔄 Service Worker update available');
    // You can show a UI notification here
  });
}

export default serviceWorkerManager;
