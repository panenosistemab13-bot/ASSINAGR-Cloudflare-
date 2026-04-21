// initial-data.js
// Run this file in a node environment or import it into your app to seed Firestore with default terms or contracts.
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

// Puxa as suas configs do seu arquivo .env ou o firebase-applet-config
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const termos = {
  text: "Orientações sobre o PLANO DE ROTA: \n a. É proibida parada nos primeiros 150 km iniciais, exceto problema mecânico/elétrico;\n b. Respeitar o horário de rodagem, no período de 05h00min às 22h00min para produto acabado e 05h00min às 19h00min para o transporte de grãos;\n c. Qualquer desvio de trajeto sem prévia autorização é uma falta grave."
};

async function seedData() {
  try {
    await setDoc(doc(db, "configuracoes", "termos"), termos);
    console.log("Termos do contrato carregados no Firestore com sucesso!");
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

seedData();
