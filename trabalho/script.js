let cartasJogador = [];
let cartasMaquina = [];
let cartaVira = null;

const cartas = [
  { nome: "A", valor: 20 },
  { nome: "2", valor: 30 },
  { nome: "3", valor: 50 },
  { nome: "4", valor: 4 },
  { nome: "5", valor: 5 },
  { nome: "6", valor: 6 },
  { nome: "7", valor: 7 },
  { nome: "Q", valor: 8 },
  { nome: "J", valor: 9 },
  { nome: "K", valor: 10 }
];

// Função para calcular a Manilha (carta que vence todas)
function calcularManilha(vira) {
  let index = cartas.findIndex(c => c.nome === vira.nome);
  return cartas[(index + 1) % cartas.length].nome;
}

// Função para sortear as cartas no início de cada rodada
function sortearCartas() {
  let baralho = [...cartas];
  cartasJogador = [];
  cartasMaquina = [];

  let indiceVira = Math.floor(Math.random() * baralho.length);
  cartaVira = baralho.splice(indiceVira, 1)[0];

  for (let i = 0; i < 3; i++) {
    let indice = Math.floor(Math.random() * baralho.length);
    cartasJogador.push(baralho.splice(indice, 1)[0]);

    indice = Math.floor(Math.random() * baralho.length);
    cartasMaquina.push(baralho.splice(indice, 1)[0]);
  }
}

// Função para gerar o HTML de cada carta, levando em consideração a manilha
function gerarCartaHTML(carta, isManilha, mostrar = true) {
  if (!mostrar) {
    return `
      <div class="card">
        <div class="card-content">
          <div class="top"><span>?</span><span>?</span></div>
          <div class="card-body">?</div>
          <div class="bottom"><span>?</span><span>?</span></div>
        </div>
      </div>
    `;
  }

  function pedirTruco() {
    const overlay = document.getElementById('truco-overlay');
    overlay.style.display = 'flex';
  
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 2000); // aparece por 2 segundos
  }

  // Simbolos dos naipes (aleatórios ou fixos)
  const simbolos = ["♠", "♥", "♦", "♣"];
  const naipe = simbolos[Math.floor(Math.random() * simbolos.length)];

  return `
    <div class="card ${isManilha ? 'manilha' : ''}">
      <div class="card-content">
        <div class="top">
          <span class="card-value">${carta.nome}</span>
          <span class="card-suit">${naipe}</span>
        </div>
        <div class="card-body">${naipe}</div>
        <div class="bottom">
          <span class="card-value">${carta.nome}</span>
          <span class="card-suit">${naipe}</span>
        </div>
      </div>
    </div>
  `;
}

// Função para exibir as cartas de jogador, máquina e a carta vira
function exibirCartas() {
  const divJogador = document.getElementById('cartas-jogador1');
  const divMaquina = document.getElementById('cartas-jogador2');
  const divVira = document.getElementById('carta-vira');
  const manilha = calcularManilha(cartaVira);

  // Exibir cartas do jogador
  divJogador.innerHTML = cartasJogador.map((carta, index) => {
    const isManilha = carta.nome === manilha;
    return `<div onclick="jogarCarta(${index})">${gerarCartaHTML(carta, isManilha)}</div>`;
  }).join('');

  // Exibir cartas da máquina
  divMaquina.innerHTML = cartasMaquina.map(() => gerarCartaHTML({}, false, false)).join('');

  // Exibir carta "Vira"
  divVira.innerHTML = gerarCartaHTML(cartaVira, cartaVira.nome === manilha);
}

// Função para jogar uma carta e comparar com a carta da máquina
function jogarCarta(indiceJogador) {
  if (cartasJogador.length === 0) return;

  const cartaJogador = cartasJogador.splice(indiceJogador, 1)[0];
  const indiceMaquina = Math.floor(Math.random() * cartasMaquina.length);
  const cartaMaquina = cartasMaquina.splice(indiceMaquina, 1)[0];

  alert(`Você jogou ${cartaJogador.nome} e a Máquina jogou ${cartaMaquina.nome}`);

  const vencedor = compararCartas(cartaJogador, cartaMaquina);

  if (vencedor === "jogador") {
    vitoriasNaRodadaJogador++;
    alert("Você ganhou essa mão!");
  } else if (vencedor === "maquina") {
    vitoriasNaRodadaMaquina++;
    alert("A Máquina ganhou essa mão!");
  } else {
    alert("Empate!");
  }

  exibirCartas();

  // Verifica se alguém ganhou a rodada
  if (vitoriasNaRodadaJogador === 2 || vitoriasNaRodadaMaquina === 2 || cartasJogador.length === 0) {
    if (vitoriasNaRodadaJogador > vitoriasNaRodadaMaquina) {
      scoreJogador++;
      alert("🏆 Você venceu a rodada!");
    } else if (vitoriasNaRodadaMaquina > vitoriasNaRodadaJogador) {
      scoreMaquina++;
      alert("🤖 A Máquina venceu a rodada!");
    } else {
      alert("⚖️ Rodada empatada!");
    }

    atualizarPontuacao();
    verificarFimDeJogo();
    alert("Rodada encerrada! Clique em 'Próxima Rodada' para continuar.");
  }
}

// Função para comparar as cartas jogadas (jogador vs máquina)
function compararCartas(carta1, carta2) {
  const manilha = calcularManilha(cartaVira);

  const ehManilha1 = carta1.nome === manilha;
  const ehManilha2 = carta2.nome === manilha;

  if (ehManilha1 && !ehManilha2) return "jogador";
  if (!ehManilha1 && ehManilha2) return "maquina";

  if (ehManilha1 && ehManilha2) {
    if (carta1.valor > carta2.valor) return "jogador";
    if (carta2.valor > carta1.valor) return "maquina";
    return "empate";
  }

  if (carta1.valor > carta2.valor) return "jogador";
  if (carta2.valor > carta1.valor) return "maquina";
  return "empate";
}

// Função para atualizar a pontuação
function atualizarPontuacao() {
  document.getElementById('score-jogador1').textContent = scoreJogador;
  document.getElementById('score-jogador2').textContent = scoreMaquina;
}

// Função para verificar se o jogo acabou
function verificarFimDeJogo() {
  if (scoreJogador >= 3) {
    alert("🎉 Você venceu o jogo!");
    resetarJogo();
  } else if (scoreMaquina >= 3) {
    alert("💀 A Máquina venceu o jogo!");
    resetarJogo();
  }
}

// Função para resetar o jogo
function resetarJogo() {
  scoreJogador = 0;
  scoreMaquina = 0;
  vitoriasNaRodadaJogador = 0;
  vitoriasNaRodadaMaquina = 0;
  proximaRodada();
}

// Função para iniciar a próxima rodada
function proximaRodada() {
  vitoriasNaRodadaJogador = 0;
  vitoriasNaRodadaMaquina = 0;
  sortearCartas();
  exibirCartas();
}

// Começa o jogo na primeira rodada
proximaRodada();