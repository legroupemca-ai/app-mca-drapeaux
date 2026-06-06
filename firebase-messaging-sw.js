// Standard Web Push handler — Firebase Messaging SDK retiré

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch(e) { payload = {title:'Le Groupe MCA', body: event.data.text()}; }
  const title = payload.title || 'Le Groupe MCA';
  const options = {
    body:    payload.body || '',
    icon:    '/app-mca-drapeaux/icon-192.png',
    badge:   '/app-mca-drapeaux/icon-192.png',
    tag:     'mca-promo',
    data:    { url: payload.url || 'https://legroupemca-ai.github.io/app-mca-drapeaux/' },
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url)
    || 'https://legroupemca-ai.github.io/app-mca-drapeaux/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('app-mca-drapeaux') && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
