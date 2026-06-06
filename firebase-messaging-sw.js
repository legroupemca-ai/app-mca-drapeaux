importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:"AIzaSyD0HmS-DNkHkFYd8mFARBBstNxR8EfM9IY",
  authDomain:"le-groupe-mca.firebaseapp.com",
  projectId:"le-groupe-mca",
  storageBucket:"le-groupe-mca.firebasestorage.app",
  messagingSenderId:"283186732172",
  appId:"1:283186732172:web:7150db863f8a6ee1ad2fa9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload=>{
  const n=payload.notification||{};
  return self.registration.showNotification(n.title||'Le Groupe MCA',{
    body:n.body||'',
    icon:'/app-mca-drapeaux/icon-192.png',
    badge:'/app-mca-drapeaux/icon-192.png',
    tag:'mca-promo',
    data:{url:'https://legroupemca-ai.github.io/app-mca-drapeaux/'},
    vibrate:[200,100,200]
  });
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)
    ||'https://legroupemca-ai.github.io/app-mca-drapeaux/';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const c of list){
        if(c.url.includes('app-mca-drapeaux')&&'focus'in c)return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
