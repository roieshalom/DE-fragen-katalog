// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBDD29_0DyHGF2J6804sOothQileESrLuA",
  authDomain: "fragen-katalog.firebaseapp.com",
  projectId: "fragen-katalog",
  storageBucket: "fragen-katalog.firebasestorage.app",
  messagingSenderId: "208859056966",
  appId: "1:208859056966:web:039f86d0b8722e4395f347",
  measurementId: "G-STMLG4PCQ1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);

    // ✅ Initialize dataLayer for debug mode
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }

    // ✅ Enable debug mode before sending any events
    gtag("js", new Date());
    gtag("config", firebaseConfig.measurementId, { debug_mode: true });

    console.log("📈 Firebase Analytics initialized with debug_mode");
  } else {
    console.warn("⚠️ Firebase Analytics not supported on this device.");
  }
});

export { db, analytics };
