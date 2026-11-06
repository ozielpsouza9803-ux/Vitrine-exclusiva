/**
 * @file src/modules/pwa/pwaService.ts
 * @description Fundação arquitetural para suporte a Progressive Web App (PWA).
 * Permite detecção de evento beforeinstallprompt e registro futuro de Service Worker.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Previne exibição padrão imediata
        e.preventDefault();
        this.installPromptEvent = e as BeforeInstallPromptEvent;
      });

      window.addEventListener('appinstalled', () => {
        this.isInstalled = true;
        this.installPromptEvent = null;
      });
    }
  }

  public canInstall(): boolean {
    return this.installPromptEvent !== null && !this.isInstalled;
  }

  public async triggerInstall(): Promise<boolean> {
    if (!this.installPromptEvent) return false;
    await this.installPromptEvent.prompt();
    const choice = await this.installPromptEvent.userChoice;
    this.installPromptEvent = null;
    return choice.outcome === 'accepted';
  }

  public isRunningStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }
}

export const pwaService = new PWAManager();
