// Variáveis globais do jogo
let cartasJogador = [];
let cartasMaquina = [];
let cartaVira = null;
let scoreJogador = 0;
let scoreMaquina = 0;
let vitoriasNaRodadaJogador = 0;
let vitoriasNaRodadaMaquina = 0;
let pontosEmJogo = 1;
let vezDoJogador = true;
let quemComecaProximaRodada = 'jogador'; // Quem ganhou a última rodada
let trucoAtivo = false;
let trucoSolicitadoPor = null;
let cartaJogadaJogador = null;
let cartaJogadaMaquina = null;
let aguardandoResposta = false;

// Cartas do baralho com seus valores
const cartas = [
 { nome: "4", valor: 1 },
 { nome: "5", valor: 2 },
 { nome: "6", valor: 3 },
 { nome: "7", valor: 4 },
 { nome: "Q", valor: 5 },
 { nome: "J", valor: 6 },
 { nome: "K", valor: 7 },
 { nome: "A", valor: 8 },
 { nome: "2", valor: 9 },
 { nome: "3", valor: 10 }
];

// Função para calcular a Manilha
function calcularManilha(vira) {
 let index = cartas.findIndex(c => c.nome === vira.nome);
 return cartas[(index + 1) % cartas.length].nome;
}

// Função para sortear as cartas
function sortearCartas() {
 let baralho = [...cartas];
 cartasJogador = [];
 cartasMaquina = [];

 // Sortear carta vira
 let indiceVira = Math.floor(Math.random() * baralho.length);
 cartaVira = baralho.splice(indiceVira, 1)[0];

 // Distribuir 3 cartas para cada jogador
 for (let i = 0; i < 3; i++) {
 let indice = Math.floor(Math.random() * baralho.length);
 cartasJogador.push(baralho.splice(indice, 1)[0]);

 indice = Math.floor(Math.random() * baralho.length);
 cartasMaquina.push(baralho.splice(indice, 1)[0]);
 }
}

// Função para gerar HTML da carta
function gerarCartaHTML(carta, isManilha, mostrarVerso = false) {
 if (mostrarVerso) {
 return `
 <div class="card card-back">
 <div class="card-content">
 <div class="card-body">🂠</div>
 </div>
 </div>
 `;
 }

 const simbolos = ["♠", "♥", "♦", "♣"];
 const naipe = simbolos[Math.floor(Math.random() * simbolos.length)];
 const corNaipe = (naipe === "♥" || naipe === "♦") ? "red" : "black";

 return `
 <div class="card ${isManilha ? 'manilha' : ''}">
 <div class="card-content">
 <div class="top">
 <span class="card-value">${carta.nome}</span>
 <span class="card-suit" style="color: ${corNaipe}">${naipe}</span>
 </div>
 <div class="card-body" style="color: ${corNaipe}">${naipe}</div>
 <div class="bottom">
 <span class="card-value">${carta.nome}</span>
 <span class="card-suit" style="color: ${corNaipe}">${naipe}</span>
 </div>
 </div>
 </div>
 `;
}

// Função para exibir as cartas na tela
function exibirCartas() {
 const divJogador = document.getElementById('cartas-jogador');
 const divMaquina = document.getElementById('cartas-maquina');
 const divVira = document.getElementById('carta-vira');
 const manilha = calcularManilha(cartaVira);

 // Exibir cartas do jogador
 divJogador.innerHTML = cartasJogador.map((carta, index) => {
 const isManilha = carta.nome === manilha;
 return `<div onclick="jogarCartaJogador(${index})">${gerarCartaHTML(carta, isManilha)}</div>`;
 }).join('');

 // Exibir cartas da máquina (verso)
 divMaquina.innerHTML = cartasMaquina.map(() => gerarCartaHTML({}, false, true)).join('');

 // Exibir carta vira
 const isManilhaVira = cartaVira.nome === manilha;
 divVira.innerHTML = gerarCartaHTML(cartaVira, isManilhaVira);

 // Exibir nome da manilha
 document.getElementById('manilha-nome').textContent = manilha;

 // Atualizar pontuação
 atualizarInterface();
}

// Função para avaliar a força das cartas da máquina
function avaliarCartasMaquina() {
 const manilha = calcularManilha(cartaVira);
 let forcaTotal = 0;
 let temManilha = false;

 cartasMaquina.forEach(carta => {
 if (carta.nome === manilha) {
 forcaTotal += 15; // Manilha vale muito
 temManilha = true;
 } else {
 forcaTotal += carta.valor;
 }
 });

 const forcaMedia = forcaTotal / cartasMaquina.length;

 if (temManilha && forcaMedia > 8) return 'excelente';
 if (forcaMedia > 7) return 'boa';
 if (forcaMedia > 4) return 'media';
 return 'ruim';
}

// Função para a máquina decidir sobre o truco
function maquinaDecidirTruco() {
 const qualidadeCartas = avaliarCartasMaquina();

 switch (qualidadeCartas) {
 case 'excelente':
 return Math.random() < 0.8 ? 'aumentar' : 'aceitar';
 case 'boa':
 return Math.random() < 0.6 ? 'aceitar' : 'aumentar';
 case 'media':
 return Math.random() < 0.7 ? 'aceitar' : 'desistir';
 case 'ruim':
 return Math.random() < 0.3 ? 'aceitar' : 'desistir';
 default:
 return 'desistir';
 }
}

// Função para a máquina pedir truco
function maquinaPedirTruco() {
 if (trucoAtivo || pontosEmJogo >= 12) return false;

 const qualidadeCartas = avaliarCartasMaquina();

 // Máquina só pede truco com cartas boas/excelentes
 if (qualidadeCartas === 'excelente') {
 return Math.random() < 0.4; // 40% de chance
 } else if (qualidadeCartas === 'boa') {
 return Math.random() < 0.2; // 20% de chance
 }

 return false;
}

// Função para o jogador jogar uma carta
function jogarCartaJogador(indiceJogador) {
 if (aguardandoResposta || !vezDoJogador || cartasJogador.length === 0) return;

 const carta = cartasJogador.splice(indiceJogador, 1)[0];
 cartaJogadaJogador = carta;

 // Exibir carta jogada
 const divCartaJogador = document.getElementById('carta-jogada-jogador');
 const manilha = calcularManilha(cartaVira);
 const isManilha = carta.nome === manilha;
 divCartaJogador.innerHTML = gerarCartaHTML(carta, isManilha);

 // Máquina joga sua carta
 setTimeout(() => {
 jogarCartaMaquina();
 }, 1000);

 exibirCartas();
 vezDoJogador = false;
 atualizarInterface();
}

// Função para a máquina jogar uma carta
function jogarCartaMaquina() {
 if (cartasMaquina.length === 0) return;

 // Máquina pede truco antes de jogar?
 if (maquinaPedirTruco()) {
 mostrarTruco('maquina');
 return;
 }

 // Máquina escolhe uma carta aleatória (pode ser melhorada com IA)
 const indiceMaquina = Math.floor(Math.random() * cartasMaquina.length);
 const carta = cartasMaquina.splice(indiceMaquina, 1)[0];
 cartaJogadaMaquina = carta;

 // Exibir carta jogada
 const divCartaMaquina = document.getElementById('carta-jogada-maquina');
 const manilha = calcularManilha(cartaVira);
 const isManilha = carta.nome === manilha;
 divCartaMaquina.innerHTML = gerarCartaHTML(carta, isManilha);

 // Comparar cartas após um tempo
 setTimeout(() => {
 compararCartas();
 }, 1500);

 exibirCartas();
}

// Função para comparar as cartas jogadas
function compararCartas() {
 if (!cartaJogadaJogador || !cartaJogadaMaquina) return;

 const vencedor = determinarVencedor(cartaJogadaJogador, cartaJogadaMaquina);

 if (vencedor === "jogador") {
 vitoriasNaRodadaJogador++;
 mostrarResultado("Você ganhou a mão! 🎉", "success");
 quemComecaProximaRodada = 'jogador';
 } else if (vencedor === "maquina") {
 vitoriasNaRodadaMaquina++;
 mostrarResultado("Máquina ganhou a mão! 🤖", "error");
 quemComecaProximaRodada = 'maquina';
 } else {
 mostrarResultado("Empate nesta mão! ⚖️", "info");
 }

 // Limpar cartas jogadas após um tempo
 setTimeout(() => {
 document.getElementById('carta-jogada-jogador').innerHTML = '';
 document.getElementById('carta-jogada-maquina').innerHTML = '';
 cartaJogadaJogador = null;
 cartaJogadaMaquina = null;

 // Verificar se a rodada acabou
 verificarFimDaRodada();
 }, 2000);
}

// Função para determinar o vencedor entre duas cartas
function determinarVencedor(carta1, carta2) {
 const manilha = calcularManilha(cartaVira);

 const ehManilha1 = carta1.nome === manilha;
 const ehManilha2 = carta2.nome === manilha;

 // Se uma é manilha e a outra não
 if (ehManilha1 && !ehManilha2) return "jogador";
 if (!ehManilha1 && ehManilha2) return "maquina";

 // Se ambas são manilhas, compara pelo valor original
 if (ehManilha1 && ehManilha2) {
 if (carta1.valor > carta2.valor) return "jogador";
 if (carta2.valor > carta1.valor) return "maquina";
 return "empate";
 }

 // Cartas normais
 if (carta1.valor > carta2.valor) return "jogador";
 if (carta2.valor > carta1.valor) return "maquina";
 return "empate";
}

// Função para verificar se a rodada acabou
function verificarFimDaRodada() {
 // Verifica se alguém ganhou 2 mãos ou se acabaram as cartas
 if (vitoriasNaRodadaJogador === 2 || vitoriasNaRodadaMaquina === 2 ||
 (cartasJogador.length === 0 && cartasMaquina.length === 0)) {

 let vencedorRodada = null;

 if (vitoriasNaRodadaJogador > vitoriasNaRodadaMaquina) {
 vencedorRodada = 'jogador';
 scoreJogador += pontosEmJogo;
 mostrarResultado(`🏆 Você venceu a rodada! (+${pontosEmJogo} pontos)`, "success");
 quemComecaProximaRodada = 'jogador';
 } else if (vitoriasNaRodadaMaquina > vitoriasNaRodadaJogador) {
 vencedorRodada = 'maquina';
 scoreMaquina += pontosEmJogo;
 mostrarResultado(`🤖 Máquina venceu a rodada! (+${pontosEmJogo} pontos)`, "error");
 quemComecaProximaRodada = 'maquina';
 } else {
 mostrarResultado("⚖️ Rodada empatada!", "info");
 // Em caso de empate, quem começou continua começando
 }

 // Resetar variáveis da rodada
 setTimeout(() => {
 vitoriasNaRodadaJogador = 0;
 vitoriasNaRodadaMaquina = 0;
 pontosEmJogo = 1;
 trucoAtivo = false;
 trucoSolicitadoPor = null;

 // Verificar se o jogo acabou
 if (verificarFimDeJogo()) {
 return;
 }

 // Configurar quem começa a próxima rodada
 vezDoJogador = (quemComecaProximaRodada === 'jogador');

 // Iniciar próxima rodada automaticamente
 proximaRodada();
 }, 3000);
 } else {
 // Continuar a rodada - definir quem joga próximo
 if (quemComecaProximaRodada === 'jogador') {
 vezDoJogador = true;
 } else {
 vezDoJogador = false;
 // Máquina joga automaticamente
 setTimeout(() => {
 jogarCartaMaquina();
 }, 1500);
 }
 atualizarInterface();
 }
}

// Função para verificar se o jogo acabou
function verificarFimDeJogo() {
 if (scoreJogador >= 12) {
 mostrarResultado("🎉 PARABÉNS! Você venceu o jogo!", "success");
 setTimeout(() => resetarJogo(), 3000);
 return true;
 } else if (scoreMaquina >= 12) {
 mostrarResultado("💀 A Máquina venceu o jogo!", "error");
 setTimeout(() => resetarJogo(), 3000);
 return true;
 }
 return false;
}

// Função para resetar o jogo
function resetarJogo() {
 scoreJogador = 0;
 scoreMaquina = 0;
 vitoriasNaRodadaJogador = 0;
 vitoriasNaRodadaMaquina = 0;
 pontosEmJogo = 1;
 trucoAtivo = false;
 trucoSolicitadoPor = null;
 quemComecaProximaRodada = 'jogador';
 vezDoJogador = true;
 proximaRodada();
}

// Função para iniciar próxima rodada
function proximaRodada() {
 // Limpar cartas jogadas
 document.getElementById('carta-jogada-jogador').innerHTML = '';
 document.getElementById('carta-jogada-maquina').innerHTML = '';
 cartaJogadaJogador = null;
 cartaJogadaMaquina = null;

 // Sortear novas cartas
 sortearCartas();
 exibirCartas();

 // Se a máquina começa, ela joga automaticamente
 if (!vezDoJogador) {
 setTimeout(() => {
 jogarCartaMaquina();
 }, 1500);
 }
}

// Função para pedir truco
function pedirTruco() {
 if (trucoAtivo || pontosEmJogo >= 12 || aguardandoResposta) return;

 mostrarTruco('jogador');
}

// Função para mostrar o overlay do truco
function mostrarTruco(quemPediu) {
 trucoSolicitadoPor = quemPediu;
 trucoAtivo = true;
 aguardandoResposta = true;

 const overlay = document.getElementById('truco-overlay');
 const titulo = document.getElementById('truco-titulo');
 const info = document.getElementById('truco-info');

 let proximosPontos = pontosEmJogo + 3;
 if (proximosPontos > 12) proximosPontos = 12;

 if (quemPediu === 'jogador') {
 titulo.textContent = 'TRUCOOOO! 🔥';
 info.textContent = `Você pediu truco! (+${proximosPontos - pontosEmJogo} pontos)`;

 // Máquina decide automaticamente
 setTimeout(() => {
 const decisao = maquinaDecidirTruco();
 responderTrucoMaquina(decisao);
 }, 2000);
 } else {
 titulo.textContent = 'TRUCOOOO! 🤖';
 info.textContent = `A máquina pediu truco! (+${proximosPontos - pontosEmJogo} pontos)`;
 }

 overlay.style.display = 'flex';
}

// Função para responder ao truco (jogador)
function responderTruco(resposta) {
 if (!aguardandoResposta) return;

 const overlay = document.getElementById('truco-overlay');
 overlay.style.display = 'none';

 if (resposta === 'aceitar') {
 pontosEmJogo += 3;
 mostrarResultado(`Truco aceito! Agora vale ${pontosEmJogo} pontos`, "info");
 trucoAtivo = false;
 aguardandoResposta = false;
 } else if (resposta === 'aumentar') {
 let novosPontos = pontosEmJogo + 6;
 if (novosPontos > 12) novosPontos = 12;

 // Máquina decide sobre o aumento
 setTimeout(() => {
 const decisaoMaquina = maquinaDecidirTruco();
 if (decisaoMaquina === 'aceitar') {
 pontosEmJogo = novosPontos;
 mostrarResultado(`Retruco aceito! Agora vale ${pontosEmJogo} pontos`, "info");
 trucoAtivo = false;
 aguardandoResposta = false;
 } else if (decisaoMaquina === 'desistir') {
 scoreJogador += pontosEmJogo;
 mostrarResultado(`Máquina desistiu! Você ganhou ${pontosEmJogo} pontos`, "success");
 setTimeout(() => {
 verificarFimDeJogo();
 if (scoreJogador < 12) proximaRodada();
 }, 2000);
 } else {
 // Máquina aumenta ainda mais
 let pontosFinais = novosPontos + 3;
 if (pontosFinais > 12) pontosFinais = 12;
 pontosEmJogo = pontosFinais;
 mostrarResultado(`Máquina aumentou para ${pontosEmJogo} pontos!`, "info");
 trucoAtivo = false;
 aguardandoResposta = false;
 }
 }, 1500);
 } else if (resposta === 'desistir') {
 scoreMaquina += pontosEmJogo;
 mostrarResultado(`Você desistiu! Máquina ganhou ${pontosEmJogo} pontos`, "error");
 setTimeout(() => {
 verificarFimDeJogo();
 if (scoreMaquina < 12) proximaRodada();
 }, 2000);
 }

 atualizarInterface();
}

// Função para a máquina responder ao truco
function responderTrucoMaquina(resposta) {
 const overlay = document.getElementById('truco-overlay');
 overlay.style.display = 'none';

 if (resposta === 'aceitar') {
 pontosEmJogo += 3;
 mostrarResultado(`Máquina aceitou! Agora vale ${pontosEmJogo} pontos`, "info");
 trucoAtivo = false;
 aguardandoResposta = false;
 } else if (resposta === 'aumentar') {
 let novosPontos = pontosEmJogo + 6;
 if (novosPontos > 12) novosPontos = 12;

 // Mostrar que a máquina aumentou
 mostrarTruco('maquina-aumento');
 setTimeout(() => {
 document.getElementById('truco-overlay').style.display = 'none';
 pontosEmJogo = novosPontos;
 mostrarResultado(`Máquina aumentou para ${pontosEmJogo} pontos!`, "info");
 trucoAtivo = false;
 aguardandoResposta = false;
 }, 2000);
 } else if (resposta === 'desistir') {
 scoreJogador += pontosEmJogo;
 mostrarResultado(`Máquina desistiu! Você ganhou ${pontosEmJogo} pontos`, "success");
 setTimeout(() => {
 verificarFimDeJogo();
 if (scoreJogador < 12) proximaRodada();
 }, 2000);
 }

 atualizarInterface();
}

// Função para mostrar resultado temporário
function mostrarResultado(mensagem, tipo) {
 const overlay = document.getElementById('resultado-overlay');
 const titulo = document.getElementById('resultado-titulo');
 const info = document.getElementById('resultado-info');

 titulo.textContent = mensagem;
 info.textContent = '';

 overlay.style.display = 'flex';

 setTimeout(() => {
 overlay.style.display = 'none';
 }, 2000);
}

// Função para fechar resultado
function fecharResultado() {
 document.getElementById('resultado-overlay').style.display = 'none';
}

// Função para atualizar a interface
function atualizarInterface() {
 document.getElementById('score-jogador').textContent = scoreJogador;
 document.getElementById('score-maquina').textContent = scoreMaquina;
 document.getElementById('pontos-jogo').textContent = pontosEmJogo;

 const vezElement = document.getElementById('vez-de');
 if (aguardandoResposta) {
 vezElement.textContent = 'Aguardando resposta...';
 } else if (vezDoJogador) {
 vezElement.textContent = 'Sua vez de jogar';
 } else {
 vezElement.textContent = 'Vez da máquina';
 }

 // Habilitar/desabilitar botão de truco
 const btnTruco = document.getElementById('btn-truco');
 btnTruco.disabled = trucoAtivo || pontosEmJogo >= 12 || aguardandoResposta || !vezDoJogador;
}

// Inicializar o jogo
function iniciarJogo() {
 sortearCartas();
 exibirCartas();
 atualizarInterface();
}

// Começar o jogo
iniciarJogo();