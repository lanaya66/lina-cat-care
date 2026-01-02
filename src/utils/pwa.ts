/**
 * PWA 注册工具
 */

/**
 * 注册 Service Worker
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration);
        })
        .catch((error) => {
          console.log('Service Worker 注册失败:', error);
        });
    });
  }
}

/**
 * 检查是否可以安装 PWA
 */
export function checkInstallPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA 可以安装');
  });

  return {
    showInstallPrompt: async () => {
      if (!deferredPrompt) {
        return false;
      }

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`用户选择: ${outcome}`);
      deferredPrompt = null;
      return outcome === 'accepted';
    },
  };
}

