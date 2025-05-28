// Variáveis globais
let cartasJogador = [];
let cartasMaquina = [];
let cartaVira = null;
let scoreJogador = 0;
let scoreMaquina = 0;
let vitoriasNaRodadaJogador = 0;
let vitoriasNaRodadaMaquina = 0;
let valorRodada = 1;
let trucoAtivo = false;
let quemComeca = 'jogador'; // 'jogador' ou 'maquina'
let aguardandoJogada = false;
let quemPediuTruco = null;

const cartas = [
  { nome: "4", valor: 4 },
  { nome: "5", valor: 5 },
  { nome: "6", valor: 6 },
  { nome: "7", valor: 7 },
  { nome: "Q", valor: 8 },
  { nome: "J", valor: 9 },
  { nome: "K", valor: 10 },
  { nome: "A", valor: 11 },
  { nome: "2", valor: 12 },
  { nome: "3", valor: 13 }
];

// Função para calcular a Manilha
function calcularManilha(vira) {
  let index = cartas.findIndex(c => c.nome === vira.nome);
  return cartas[(index + 1) % cartas.length].nome;
}

// Função para avaliar a força da mão da IA
function avaliarMao(cartas, manilha) {
  let forca = 0;
  let temManilha = 0;
  
  cartas.forEach(carta => {
    if (carta.nome === manilha) {
      forca += 20;
      temManilha++;
    } else {
      forca += carta.valor;
    }
  });
  
  return { forca, temManilha };
}

// IA decide sobre o truco
function iaDecideTruco() {
  const manilha = calcularManilha(cartaVira);
  const avaliacao = avaliarMao(cartasMaquina, manilha);
  
  if (avaliacao.temManilha >= 2 || avaliacao.forca > 35) {
    return 'aumentar';
  } else if (avaliacao.temManilha >= 1 || avaliacao.forca > 25) {
    return 'aceitar';
  } else {
    return 'correr';
  }
}

// Função para sortear as cartas
function sortearCartas() {
  let baralho = [...cartas, ...cartas, ...cartas, ...cartas]; // 4 naipes
  cartasJogador = [];
  cartasMaquina = [];

  // Embaralhar
  for (let i = baralho.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
  }

  // Carta vira
  cartaVira = baralho.pop();

  // Distribuir cartas
  for (let i = 0; i < 3; i++) {
    cartasJogador.push(baralho.pop());
    cartasMaquina.push(baralho.pop());
  }
}

// Função para gerar o HTML da carta
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

  const simbolos = ["♠", "♥", "♦", "♣"];
  const naipe = simbolos[Math.floor(Math.random() * simbolos.length)];
  const cor = (naipe === "♥" || naipe === "♦") ? "red" : "black";

  return `
    <div class="card ${isManilha ? 'manilha' : ''}" style="color: ${cor}">
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

// Função para exibir as cartas
function exibirCartas() {
  const divJogador = document.getElementById('cartas-jogador');
  const divMaquina = document.getElementById('cartas-maquina');
  const divVira = document.getElementById('carta-vira');
  const manilha = calcularManilha(cartaVira);

  // Cartas do jogador
  divJogador.innerHTML = cartasJogador.map((carta, index) => {
    const isManilha = carta.nome === manilha;
    return `<div onclick="jogarCarta(${index})">${gerarCartaHTML(carta, isManilha)}</div>`;
  }).join('');

  // Cartas da máquina
  divMaquina.innerHTML = cartasMaquina.map(() => gerarCartaHTML({}, false, false)).join('');

  // Carta vira
  divVira.innerHTML = gerarCartaHTML(cartaVira, cartaVira.nome === manilha);

  // Atualizar indicadores de vez
  document.getElementById('vez-jogador').style.display = quemComeca === 'jogador' ? 'block' : 'none';
  document.getElementById('vez-maquina').style.display = quemComeca === 'maquina' ? 'block' : 'none';
}

// Função para comparar cartas
function compararCartas(carta1, carta2) {
  const manilha = calcularManilha(cartaVira);
  
  const ehManilha1 = carta1.nome === manilha;
  const ehManilha2 = carta2.nome === manilha;
  
  if (ehManilha1 && !ehManilha2) return "carta1";
  if (!ehManilha1 && ehManilha2) return "carta2";
  
  if (carta1.valor > carta2.valor) return "carta1";
  if (carta2.valor > carta1.valor) return "carta2";
  return "empate";
}

// IA joga uma carta
function iaJogaCarta() {
  if (cartasMaquina.length === 0) return;
  
  const manilha = calcularManilha(cartaVira);
  let melhorCarta = 0;
  let melhorValor = -1;
  
  // IA escolhe a melhor carta disponível
  cartasMaquina.forEach((carta, index) => {
    let valor = carta.valor;
    if (carta.nome === manilha) valor += 20;
    if (valor > melhorValor) {
      melhorValor = valor;
      melhorCarta = index;
    }
  });
  
  return cartasMaquina.splice(melhorCarta, 1)[0];
}

// Função para mostrar cartas no centro da tela
function mostrarCartasNoCentro(cartaJogador, cartaIA) {
  const areaJogador = document.getElementById('carta-jogador-jogada');
  const areaIA = document.getElementById('carta-ia-jogada');
  const manilha = calcularManilha(cartaVira);
  
  // Mostrar carta do jogador
  areaJogador.innerHTML = `
    <div style="text-align: center;">
      <p style="margin-bottom: 10px; font-weight: bold;">Você jogou:</p>
      ${gerarCartaHTML(cartaJogador, cartaJogador.nome === manilha)}
    </div>
  `;
  areaJogador.style.display = 'block';
  
  // Mostrar carta da IA
  areaIA.innerHTML = `
    <div style="text-align: center;">
      <p style="margin-bottom: 10px; font-weight: bold;">IA jogou:</p>
      ${gerarCartaHTML(cartaIA, cartaIA.nome === manilha)}
    </div>
  `;
  areaIA.style.display = 'block';
}

// Função para limpar área central
function limparAreaCentral() {
  document.getElementById('carta-jogador-jogada').style.display = 'none';
  document.getElementById('carta-ia-jogada').style.display = 'none';
}

// Função para jogar carta
function jogarCarta(indiceJogador) {
  if (aguardandoJogada || cartasJogador.length === 0) return;
  
  aguardandoJogada = true;
  
  let cartaJogador, cartaMaquina;
  
  if (quemComeca === 'jogador') {
    cartaJogador = cartasJogador.splice(indiceJogador, 1)[0];
    setTimeout(() => {
      cartaMaquina = iaJogaCarta();
      processarJogada(cartaJogador, cartaMaquina, 'jogador');
    }, 1000);
  } else {
    cartaMaquina = iaJogaCarta();
    cartaJogador = cartasJogador.splice(indiceJogador, 1)[0];
    processarJogada(cartaJogador, cartaMaquina, 'maquina');
  }
}

// Processar a jogada
function processarJogada(cartaJogador, cartaMaquina, quemJogouPrimeiro) {
  // Mostrar as cartas no centro da tela
  mostrarCartasNoCentro(cartaJogador, cartaMaquina);
  
  setTimeout(() => {
    const resultado = compararCartas(cartaJogador, cartaMaquina);
    
    let vencedor;
    if (resultado === "carta1") {
      vencedor = quemJogouPrimeiro === 'jogador' ? 'jogador' : 'maquina';
    } else if (resultado === "carta2") {  
      vencedor = quemJogouPrimeiro === 'jogador' ? 'maquina' : 'jogador';
    } else {
      vencedor = 'empate';
    }

    // Mostrar resultado da comparação
    if (vencedor === "jogador") {
      vitoriasNaRodadaJogador++;
      quemComeca = 'jogador'; // Quem ganha joga primeiro
      alert("🎉 Você ganhou esta mão!");
    } else if (vencedor === "maquina") {
      vitoriasNaRodadaMaquina++;
      quemComeca = 'maquina'; // Quem ganha joga primeiro  
      alert("🤖 A IA ganhou esta mão!");
    } else {
      alert("⚖️ Empate nesta mão!");
    }

    // Limpar área central e continuar
    setTimeout(() => {
      limparAreaCentral();
      exibirCartas();
      verificarFimRodada();
      aguardandoJogada = false;
    }, 2000);
    
  }, 2000); // Tempo para ver as cartas no centro
}

// Verificar fim da rodada
function verificarFimRodada() {
  if (vitoriasNaRodadaJogador === 2 || vitoriasNaRodadaMaquina === 2 || cartasJogador.length === 0) {
    setTimeout(() => {
      if (vitoriasNaRodadaJogador > vitoriasNaRodadaMaquina) {
        scoreJogador += valorRodada;
        quemComeca = 'jogador';
        alert(`🏆 Você venceu a rodada e ganhou ${valorRodada} ponto(s)!`);
      } else if (vitoriasNaRodadaMaquina > vitoriasNaRodadaJogador) {
        scoreMaquina += valorRodada;
        quemComeca = 'maquina';
        alert(`🤖 A IA venceu a rodada e ganhou ${valorRodada} ponto(s)!`);
      } else {
        alert("⚖️ Rodada empatada!");
      }

      atualizarPontuacao();
      verificarFimDeJogo();
    }, 1000);
  }
}

// Função para pedir truco
function pedirTruco() {
  if (trucoAtivo || valorRodada >= 12) return;
  
  quemPediuTruco = 'jogador';
  mostrarOverlay("TRUCO!");
  
  setTimeout(() => {
    const decisao = iaDecideTruco();
    
    if (decisao === 'aceitar') {
      valorRodada += 3;
      trucoAtivo = true;
      alert("IA aceitou o truco!");
      document.getElementById('valor-rodada').textContent = valorRodada;
    } else if (decisao === 'aumentar') {
      // IA quer aumentar o truco
      mostrarTrucoButtons('IA aumentou o truco!', 'maquina');
      return;
    } else {
      // IA desistiu - jogador ganha os pontos atuais da rodada
      scoreJogador += valorRodada;
      alert(`IA desistiu! Você ganhou ${valorRodada} ponto(s)!`);
      atualizarPontuacao();
      verificarFimDeJogo();
      return;
    }
  }, 2000);
}

// Função para mostrar overlay
function mostrarOverlay(texto) {
  const overlay = document.getElementById('truco-overlay');
  overlay.textContent = texto;
  overlay.style.display = 'flex';
  
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 2000);
}

// Função para mostrar botões de truco
function mostrarTrucoButtons(mensagem, quemPediu) {
  quemPediuTruco = quemPediu;
  document.getElementById('truco-message').textContent = mensagem;
  
  // Atualizar botão de aumentar baseado no valor atual
  const btnAumentar = document.getElementById('btn-aumentar');
  if (valorRodada >= 9) {
    btnAumentar.style.display = 'none'; // Não pode aumentar mais
  } else {
    btnAumentar.style.display = 'inline-block';
    btnAumentar.textContent = `Aumentar para ${valorRodada + 6}!`;
  }
  
  document.getElementById('truco-buttons').style.display = 'block';
}

// Funções para responder ao truco
function aceitarTruco() {
  valorRodada += 3;
  trucoAtivo = true;
  document.getElementById('truco-buttons').style.display = 'none';
  document.getElementById('valor-rodada').textContent = valorRodada;
  alert("Você aceitou o truco!");
}

function aumentarTruco() {
  const novoValor = valorRodada + 6;
  document.getElementById('truco-buttons').style.display = 'none';
  
  if (quemPediuTruco === 'maquina') {
    // Jogador está aumentando o truco da IA
    mostrarOverlay("VOCÊ AUMENTOU!");
    
    setTimeout(() => {
      const decisaoIA = iaDecideTruco();
      
      if (decisaoIA === 'aceitar') {
        valorRodada = novoValor;
        trucoAtivo = true;
        alert("IA aceitou o aumento!");
        document.getElementById('valor-rodada').textContent = valorRodada;
      } else {
        // IA desistiu do aumento
        scoreJogador += valorRodada;
        alert(`IA desistiu do aumento! Você ganhou ${valorRodada} ponto(s)!`);
        atualizarPontuacao();
        verificarFimDeJogo();
      }
    }, 2000);
  }
}

function correrTruco() {
  document.getElementById('truco-buttons').style.display = 'none';
  
  if (quemPediuTruco === 'maquina') {
    // Jogador desistiu do truco da IA
    scoreMaquina += valorRodada;
    alert(`Você desistiu! IA ganhou ${valorRodada} ponto(s)!`);
  } else {
    // IA desistiu do truco do jogador
    scoreJogador += valorRodada;
    alert(`IA desistiu! Você ganhou ${valorRodada} ponto(s)!`);
  }
  
  atualizarPontuacao();
  verificarFimDeJogo();
}

// Função para atualizar pontuação
function atualizarPontuacao() {
  document.getElementById('score-jogador').textContent = scoreJogador;
  document.getElementById('score-maquina').textContent = scoreMaquina;
}

// Função para verificar fim de jogo
function verificarFimDeJogo() {
  if (scoreJogador >= 12) {
    setTimeout(() => {
      alert("🎉 PARABÉNS! Você venceu o jogo!");
      resetarJogo();
    }, 500);
  } else if (scoreMaquina >= 12);
}