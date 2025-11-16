npm install firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4S97KFl2G7Rog9LdSNp06iDrzJvgdvbs",
  authDomain: "concurso-de-tapas.firebaseapp.com",
  projectId: "concurso-de-tapas",
  storageBucket: "concurso-de-tapas.firebasestorage.app",
  messagingSenderId: "338153988544",
  appId: "1:338153988544:web:d482906e3edbfb46b5e825",
  measurementId: "G-QK2K2DS8JW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


npm install -g firebase-tools

firebase login
firebase init
firebase deploy




6️⃣ Subir la app a GitHub Pages (gratis y público)

En el proyecto React:

npm install gh-pages --save-dev


En package.json añade:

"homepage": "https://TU_USUARIO.github.io/concurso-tapas"


En scripts añade:

"predeploy": "npm run build",
"deploy": "gh-pages -d build"


Ejecuta:

npm run deploy


🎉 ¡Listo en internet!

7️⃣ Crear un QR que lleve a la web

Usa cualquier generador gratis:
https://www.qr-code-generator.com/

Pon el enlace:
https://TU_USUARIO.github.io/concurso-tapas

Lo imprimes en tu cartel.