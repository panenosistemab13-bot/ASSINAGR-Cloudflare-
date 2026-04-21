import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const configuracoesIniciais = {
  termo_responsabilidade: `Pelo presente Termo de Responsabilidade, o motorista identificado compromete-se a:

1. Zelar pela integridade da carga durante todo o trajeto;
2. Comprir religiosamente as rotas estipuladas e as paradas permitidas;
3. Manter a pontualidade e relatar imediatamente à central qualquer atraso ou ocorrência de sinistro;
4. Não conceder caronas ou desviar o veículo de sua rota original.

Declarando, portanto, ter lido e concordado com as diretrizes do plano de rota anexo.`,
  orientacoes_rota: "a. É proibida parada nos primeiros 150 km iniciais, exceto problema mecânico/elétrico;\nb. Respeitar o horário de rodagem, no período de 05h00min às 22h00min para produto acabado e 05h00min às 19h00min para o transporte de grãos;\nc. Qualquer desvio de trajeto sem prévia autorização é uma falta grave."
};

async function seed() {
  try {
    await setDoc(doc(db, 'settings', 'termos'), configuracoesIniciais);
    console.log('Dados iniciais de settings criados com sucesso!');
    process.exit(0);
  } catch(e) {
    console.error('Erro ao inserir:', e);
    process.exit(1);
  }
}
seed();
