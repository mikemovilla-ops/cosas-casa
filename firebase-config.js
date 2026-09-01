// Configuración de Firebase.
// 1. Ve a https://console.firebase.google.com/ y crea un proyecto gratuito.
// 2. Dentro del proyecto: Compilación > Firestore Database > Crear base de datos
//    (elige modo de producción, la región más cercana, ej. eur3).
// 3. En "Reglas" de Firestore, pega esto para poder usarla sin cuentas de usuario
//    (solo vosotros dos conoceréis la URL de la app, así que es suficiente):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read, write: if true;
//        }
//      }
//    }
//
// 4. En el proyecto: icono de engranaje > Configuración del proyecto > "Tus apps"
//    > Añadir app > Web (</>). Te dará un objeto firebaseConfig como el de abajo.
// 5. Copia esos valores aquí debajo, sustituyendo los "TU_..._AQUI".

export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};
