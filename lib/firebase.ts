import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
 // apiKey: "AIzaSyDummyKeyForDemoPurposes",
 // authDomain: "yelloskye-demo.firebaseapp.com",
//  projectId: "yelloskye-demo",
//  storageBucket: "yelloskye-demo.appspot.com",
//  messagingSenderId: "123456789012",
//  appId: "1:123456789012:web:abcdef1234567890abcdef",
  apiKey: "AIzaSyA5-L0_QJtfNYXz5I8EbxyVbP5LhDBBFco",
  authDomain: "yelloskye-demo.firebaseapp.com",
  projectId: "yelloskye-demo",
  storageBucket: "yelloskye-demo.firebasestorage.app",
  messagingSenderId: "878753760386",
  appId: "1:878753760386:web:53f60a11961e89e84d609b",
  measurementId: "G-MNMD5GJLMM"
  
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
