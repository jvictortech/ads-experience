'use strict';
// Conteúdo editável: os índices das alternativas começam em zero.
const MISSIONS=[
{area:'Segurança da Informação',title:'Identifique a ameaça',role:'Analista de Segurança da Informação',description:'Protege sistemas e informações, identifica ameaças e ajuda a prevenir incidentes.',brief:'Qual mensagem deve ser tratada como suspeita de phishing?',options:['Atualização do projeto: a reunião será às 14h. Consulte os detalhes no calendário interno.','URGENTE! Sua conta será bloqueada em 5 minutos. Informe sua senha em nexus-validacao.exemplo para manter o acesso.','Seu chamado de suporte foi registrado. Acompanhe pelo portal interno que você já utiliza.'],correct:1,hint:'Observe urgência, pedido de senha e endereço desconhecido.',feedback:'A combinação desses sinais exige cautela. Confirme pelo canal oficial e nunca informe sua senha pelo link. As outras mensagens também devem ser avaliadas: só o texto não garante segurança.',fragment:'7'},
{area:'Programação',title:'Reconstrua a lógica',role:'Desenvolvedor de Software',description:'Transforma problemas em soluções por meio de lógica, código e testes.',brief:'O portal perdeu a sequência do login. Use os botões de subir e descer para organizar as etapas, de cima para baixo.',steps:['Receber usuário e senha.','Conferir os dados.','Decidir se os dados são válidos.','Liberar acesso se forem válidos; caso contrário, mostrar erro.'],hint:'Primeiro o sistema recebe informações; só depois pode verificar e decidir.',feedback:'Um algoritmo é uma sequência organizada de instruções. Receber, conferir, decidir e responder: cada etapa prepara a próxima.',fragment:'3'},
{area:'Redes',title:'Restabeleça a conexão',role:'Analista de Redes',description:'Conecta dispositivos e mantém a comunicação entre computadores e serviços.',brief:'O PC possui IP 192.168.10.20 e máscara 255.255.255.0. Neste exercício, dispositivos da mesma rede local compartilham os três primeiros blocos do endereço; o último deve ser diferente. Qual servidor pode se comunicar diretamente com esse PC nessa rede?',options:['192.168.20.10','192.168.10.20 — endereço já usado pelo PC','192.168.10.50'],correct:2,hint:'Compare os três primeiros blocos e evite repetir o endereço completo do PC.',feedback:'192.168.10.50 pertence à mesma sub-rede e possui endereço diferente do PC.',fragment:'1'},
{area:'Inteligência Artificial',title:'Ensine a IA a observar',role:'Profissional de IA e Dados',description:'Prepara dados, desenvolve modelos e avalia resultados para solucionar problemas.',brief:'A IA aprendeu com fotos de gatos sempre em ambientes internos e cães sempre em jardins. Agora confunde um gato no jardim com um cão. Qual é a melhor ação?',options:['Acrescentar exemplos variados e corretamente rotulados de gatos e cães em diferentes ambientes e testar novamente.','Aceitar todas as respostas porque a IA nunca erra.','Excluir os testes para esconder o problema.'],correct:0,hint:'A IA pode ter aprendido a observar o cenário em vez do animal.',feedback:'Dados pouco variados podem gerar associações equivocadas. Diversidade de exemplos e avaliação são essenciais.',fragment:'4'},
{area:'Criptografia',title:'Decifre a mensagem',role:'Desenvolvedor com atuação em Segurança',description:'Aplica mecanismos de proteção para preservar informações em sistemas.',brief:'Decifre “DGV”. Foi usada uma cifra de César com avanço de três letras. Para decifrar, volte três letras em cada posição.',options:['WEB','ADS','CPU'],correct:1,hint:'Volte três posições em cada letra.',feedback:'A mensagem é ADS. Esta cifra serve para aprender o conceito; sistemas reais precisam de criptografia moderna.',fragment:'2'}
];
// Estado persistente original; a reformulação mantém compatibilidade com partidas v1.
const KEY = 'ads-experience.v1', LIMIT = 600000;
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const reset = document.querySelector('#reset');
let state = null, saved = readSave(), notice = '', hintOpen = false, lastFocus = null;
let ui = freshUI(), pending = null, epoch = 0, diagnostic = null;
const OBJECTIVES = ['Inspecione as mensagens e sinalize uma suspeita de phishing.', 'Organize e execute a sequência de login.', 'Escolha um servidor e teste a conexão local.', 'Escolha uma ação para corrigir o treinamento da IA.', 'Decifre a mensagem voltando três letras.'];
const GUIDANCE = ['Abra cada mensagem antes de decidir. O que merece uma segunda olhada?', 'Cada etapa depende da anterior. Use as setas e veja o fluxo funcionar.', 'Compare os endereços. Uma rede precisa de endereços compatíveis e distintos.', 'Observe os exemplos: será que o modelo aprendeu sobre o animal ou o cenário?', 'Toque nas letras D, G e V para explorar o deslocamento.'];
function freshUI() { return {selected:null, busy:false, attempted:null, code:'', cipherLetter:0, restoring:false, celebration:false}; }
function reducedMotion() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function readSave() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s || s.version !== 1 || !Number.isFinite(s.startedAt) || s.startedAt <= 0 || !Number.isInteger(s.current) || s.current < 0 || s.current > 5 || !Number.isInteger(s.completed) || s.completed < s.current || s.completed > Math.min(5,s.current+1) || typeof s.team !== 'string' || s.team.length > 30 || !Number.isInteger(s.errors) || s.errors < 0 || !Array.isArray(s.hints) || s.hints.some(n=>!Number.isInteger(n)||n<0||n>Math.min(s.current,4)) || new Set(s.hints).size!==s.hints.length || !Array.isArray(s.order) || s.order.length!==4 || new Set(s.order).size!==4 || s.order.some(n=>!Number.isInteger(n)||n<0||n>3) || typeof s.exploration!=='boolean' || (s.finishedAt!==null && (!Number.isFinite(s.finishedAt)||s.current!==5||s.completed!==5||s.finishedAt<s.startedAt||(!s.exploration&&s.finishedAt-s.startedAt>=LIMIT)))) return null;
    return s;
  } catch { return null; }
}
function save() { try { localStorage.setItem(KEY,JSON.stringify(state)); } catch { /* Armazenamento opcional. */ } }
function elapsed(at=Date.now()) { return Math.max(0,(state.finishedAt??at)-state.startedAt); }
function time(ms) { const seconds=Math.floor(Math.max(0,ms)/1000); return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'); }
function esc(v) { return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function announce(message) { document.querySelector('#announcer').textContent=message; }
function focusScreen() { if(!modal.open) document.querySelector('#mission-title, .victory h1, .landing h1, #diagnostic-title, #restore-title')?.focus(); }
function focusFeedback() { if(!modal.open) document.querySelector('#feedback')?.focus(); }
function cancelPending() { epoch++; if(pending!==null)clearTimeout(pending); pending=null; ui.busy=false; }
function schedule(fn, delay) { const token=epoch; pending=setTimeout(()=>{pending=null;if(token===epoch)fn();}, reducedMotion()?0:delay); }
function showDialog(title,body,buttons,locked=false) {
  if(!modal.open)lastFocus=document.activeElement;
  document.querySelector('#modal-content').innerHTML=`<span class="eyebrow">CENTRAL NEXUS</span><h2 id="modal-title">${title}</h2>${body}<div class="actions">${buttons}</div>`;
  modal.dataset.locked=String(locked);
  if(!modal.open)modal.showModal();
  modal.querySelector('[data-action="close"]')?.focus();
}
function closeDialog() { modal.close(); if(lastFocus?.isConnected)lastFocus.focus();else focusScreen(); }
modal.addEventListener('cancel',e=>{if(modal.dataset.locked==='true')e.preventDefault();});
modal.addEventListener('close',()=>{if(!modal.open){if(lastFocus?.isConnected)lastFocus.focus();else focusScreen();}if(state&&!state.finishedAt)tick();});
function icon(kind,cls='') {
  const paths={mail:'M3 6h26v20H3z M3 7l13 10L29 7',code:'M11 8L3 16l8 8 M21 8l8 8-8 8 M18 4l-4 24',network:'M12 3h8v8h-8z M3 22h8v7H3z M21 22h8v7h-8z M16 11v6H7v5 M16 17h9v5',ai:'M10 6h12l5 8v10l-6 5H11l-6-5V14z M11 16h1 M20 16h1 M12 23h8 M16 1v5',lock:'M8 14V9a8 8 0 0116 0v5 M5 14h22v16H5z M16 21v4',server:'M5 3h22v26H5z M5 12h22 M5 21h22 M10 7h1 M10 16h1 M10 25h1',check:'M5 17l7 7L28 7'};
  return `<svg class="icon ${cls}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> <path d="${paths[kind]||paths.server}"/></svg>`;
}
function nexa(message,compact=false) {
  return `<div class="nexa ${compact?'compact':''}"><svg class="nexa-avatar" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3L57 17v30L32 61 7 47V17z" fill="#233750" stroke="#ad9bff"/><rect x="16" y="19" width="32" height="27" rx="11" fill="#0b1729" stroke="#7be5ee"/><path d="M23 29h4m10 0h4M26 38q6 5 12 0" stroke="#7be5ee" stroke-width="3" stroke-linecap="round"/><path d="M32 10v9" stroke="#ad9bff"/></svg><div><span class="nexa-name">NEXA <small>ASSISTENTE DE OPERAÇÕES</small></span><p>${message}</p></div></div>`;
}
function coreArt(online=false) {
  return `<svg class="core-art ${online?'online':''}" viewBox="0 0 600 430" role="img" aria-label="Central NEXUS com servidores e cinco módulos ${online?'restaurados':'em falha'}"><defs><pattern id="core-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#26374b" stroke-width=".7"/></pattern></defs><rect width="600" height="430" fill="url(#core-grid)"/><path d="M50 340L300 200 550 340 300 420Z" fill="#0c192b" stroke="#31465f"/><g class="core-wires" fill="none" stroke="${online?'#a8f28b':'#6edce7'}" stroke-width="2"><path d="M300 280L95 165V105M300 280L505 165V105M300 280L95 340M300 280L505 340M300 280V72"/></g><g class="traffic" fill="#78e7ed"><circle cx="95" cy="105" r="4"/><circle cx="505" cy="105" r="4"/><circle cx="300" cy="72" r="4"/></g><g transform="translate(215 118)"><path d="M0 45L85 0 170 45v150l-85 48L0 195Z" fill="#15273c" stroke="#668299"/><path d="M85 90L170 45v150l-85 48Z" fill="#0d1c30"/><path d="M0 45l85 45 85-45M85 90v153" fill="none" stroke="#57738a"/><g fill="#203c50" stroke="#5cc8d4"><path d="M15 70l55 30v28L15 98Z M15 112l55 30v28l-55-30Z M15 154l55 30v28l-55-30Z"/></g><g fill="${online?'#a8f28b':'#ff8d90'}"><circle cx="26" cy="86" r="3"/><circle cx="26" cy="128" r="3"/><circle cx="26" cy="170" r="3"/></g><text x="119" y="137" fill="#78e7ed" font-family="monospace" font-size="15" transform="rotate(-29 119 137)">NEXUS</text></g>${[[95,105],[505,105],[95,340],[505,340],[300,55]].map(([x,y],i)=>`<g transform="translate(${x} ${y})"><rect x="-28" y="-22" width="56" height="44" rx="9" fill="#152337" stroke="${online?'#9ee28a':'#ff9395'}"/><text y="5" text-anchor="middle" fill="${online?'#b6f4a0':'#ffb8b9'}" font-family="monospace" font-size="16">${online?'✓':'0'+(i+1)}</text></g>`).join('')}<rect x="210" y="385" width="180" height="27" rx="13" fill="#112238"/><text x="300" y="403" text-anchor="middle" fill="${online?'#a8f28b':'#9bb2ca'}" font-family="monospace" font-size="10" letter-spacing="2">${online?'TODOS OS MÓDULOS ONLINE':'CONEXÃO INTERROMPIDA'}</text></svg>`;
}
function landing() {
  reset.hidden=true; app.dataset.screen='landing';
  app.innerHTML=`<section class="landing"><div class="hero-copy"><span class="incident-label"><span></span> INCIDENTE DETECTADO</span><p class="eyebrow hero-kicker">ADS EXPERIENCE / MISSÃO 001</p><h1 tabindex="-1">O sistema caiu.<br><span>Você entra<br>em ação.</span></h1><p class="hero-subtitle">MISSÃO: SALVE O SISTEMA</p><p class="lead">O portal caiu. A rede falhou. A IA perdeu o rumo.<br>A NEXUS TECNOLOGIA precisa de uma equipe para recuperar o controle. Essa equipe é a sua.</p><div class="meta"><span><b>10</b> minutos de missão</span><span><b>2–3</b> participantes</span><span><b>05</b> áreas para explorar</span></div>${saved?`<div class="resume-note"><strong>Operação salva encontrada</strong><span>${esc(saved.team)} · ${saved.completed}/5 módulos recuperados</span></div><div class="actions"><button class="primary" data-action="resume">Continuar partida ${icon('code')}</button><button data-action="reset">Nova equipe</button><button class="text-button" data-action="help">Como jogar</button></div>`:`<form id="start-form" class="launch"><label for="team">CODINOME DA EQUIPE <span>opcional · até 30 caracteres</span></label><input id="team" name="team" maxlength="30" autocomplete="off" placeholder="Ex.: Guardiões do código"><div class="actions"><button class="primary" type="submit">Aceitar missão <span aria-hidden="true">↗</span></button><button type="button" class="text-button" data-action="help">Como jogar</button></div></form>`}<p class="hero-footnote">Sem experiência em programação? Perfeito. Comece pela curiosidade.</p></div><div class="hero-visual"><div class="window-bar"><span class="window-dots">● ● ●</span><span>NEXUS / VISÃO DO NÚCLEO</span><span>01:SYS</span></div>${coreArt()}<div class="incident-readout"><span class="incident-symbol">!</span><div><strong>5 módulos comprometidos</strong><p>Equipe de resposta necessária para restauração.</p></div><span class="readout-tag">CRÍTICO</span></div><div class="visual-legend"><span><i></i> SERVIÇOS INDISPONÍVEIS</span><span>AGUARDANDO SUA EQUIPE</span></div></div></section><section class="mission-route" aria-label="Áreas da missão"><span class="route-label">SEU PERCURSO</span>${MISSIONS.map((m,i)=>`<div>${icon(['mail','code','network','ai','lock'][i])}<span><small>0${i+1}</small>${m.area}</span></div>`).join('')}</section>`;
}
function beginDiagnostic(team) {
  cancelPending(); diagnostic=team.trim().slice(0,30)||'Equipe NEXUS'; reset.hidden=true;app.dataset.screen='diagnostic';
  app.innerHTML=`<section class="diagnostic"><span class="eyebrow">INICIANDO PROTOCOLO DE RESPOSTA</span><h1 id="diagnostic-title" tabindex="-1">Conectando sua equipe.</h1>${nexa('Sou a NEXA. Vou acompanhar vocês. Cada módulo recuperado revela uma parte do código final.')}<div class="diagnostic-lines"><p>✓ Equipe identificada: ${esc(diagnostic)}</p><p>✓ Ambiente de treinamento isolado</p><p>→ Preparando a caixa de entrada…</p></div><div class="loading-track"><span></span></div><p class="muted">O cronômetro ainda não começou.</p><button class="primary" data-action="skip">Pular diagnóstico e começar →</button></section>`;
  focusScreen();schedule(finishDiagnostic,1400);
}
function finishDiagnostic() { if(diagnostic===null)return;const team=diagnostic;diagnostic=null;cancelPending();start(team); }
function start(team) {
  cancelPending(); diagnostic=null;ui=freshUI();state={version:1,team:team.trim().slice(0,30)||'Equipe NEXUS',startedAt:Date.now(),current:0,completed:0,errors:0,hints:[],order:[2,0,3,1],exploration:false,finishedAt:null};notice='';hintOpen=false;save();render();focusScreen();
}
function inventory() {
  return `<div class="fragments" aria-label="Fragmentos na ordem das missões">${MISSIONS.map((m,i)=>`<span class="fragment ${i>=state.completed?'locked':''}" role="img" aria-label="Missão ${i+1}: ${i<state.completed?'fragmento '+m.fragment:'bloqueado'}"><small>0${i+1}</small><b>${i<state.completed?m.fragment:'·'}</b></span>`).join('')}</div>`;
}
function sidebar() {
  return `<aside class="sidebar"><div class="sidebar-heading"><span class="eyebrow">PAINEL DA OPERAÇÃO</span><strong>${state.completed}<small>/ 5 MÓDULOS</small></strong><div class="progress-track"><span style="width:${state.completed*20}%"></span></div></div><ol class="modules">${MISSIONS.map((m,i)=>`<li class="${i<state.completed?'done':i===state.current?'active':'locked'}" ${i===state.current?'aria-current="step"':''} aria-label="Missão ${i+1}: ${m.area}, ${i<state.completed?'recuperado':i===state.current?'atual':'bloqueado'}"><span class="module-icon">${icon(i<state.completed?'check':['mail','code','network','ai','lock'][i])}</span><div><small>MISSÃO 0${i+1} <span>${i<state.completed?'✓':i===state.current?'EM CURSO':'BLOQUEADA'}</span></small><strong>${m.area}</strong></div></li>`).join('')}</ol><div class="inventory"><div class="section-label">FRAGMENTOS RECUPERADOS</div>${inventory()}<p>Guarde a ordem. Ela abre o núcleo.</p></div>${nexa(state.current<5?(state.current<state.completed?'Bom trabalho. Leiam o resultado e sigam quando estiverem prontos.':GUIDANCE[state.current]):'Os cinco fragmentos estão com vocês. Digitem o código na ordem das missões.')}</aside>`;
}
function optionClass(i,solved) {
  return `${ui.selected===i?'selected':''} ${solved&&i===MISSIONS[state.current].correct?'correct':''} ${!solved&&ui.attempted===i?'incorrect':''}`;
}
function choiceButtons(solved,kind='choice') {
  const m=MISSIONS[state.current];return `<div class="options ${kind}-options">${m.options.map((text,i)=>`<button class="option ${optionClass(i,solved)}" data-select="${i}" aria-pressed="${ui.selected===i}" ${solved||ui.busy?'disabled':''}><span class="letter">${'ABC'[i]}</span><span>${esc(text)}</span><span class="selection-dot" aria-hidden="true">${solved&&i===m.correct?'✓':ui.attempted===i&&!solved?'×':ui.selected===i?'●':'○'}</span></button>`).join('')}</div>`;
}
function actionButton(label,solved,iconName='code') {return solved?'':`<div class="task-action"><span class="muted">${ui.busy?'Processando sua decisão…':ui.selected===null&&state.current!==1?'Selecione uma opção para continuar.':'Tudo pronto? Teste sua decisão.'}</span><button class="primary" data-action="validate" ${ui.busy||(ui.selected===null&&state.current!==1)?'disabled':''}>${icon(iconName)} ${ui.busy?'Processando…':label}</button></div>`;}
const MAILS=[{sender:'Projetos NEXUS',address:'projetos@nexus.exemplo',subject:'Atualização do projeto',time:'14:02'},{sender:'Central de contas',address:'acesso@nexus-validacao.exemplo',subject:'Aviso sobre sua conta',time:'13:58'},{sender:'Suporte NEXUS',address:'suporte@nexus.exemplo',subject:'Seu chamado foi registrado',time:'13:45'}];
function mailbox(solved) {
  const selected=ui.selected, mail=selected===null?null:MAILS[selected];
  return `<div class="mailbox"><div class="tool-bar"><span>${icon('mail')} NEXUS MAIL <small>CAIXA DE ENTRADA FICTÍCIA</small></span><span class="tool-status">3 MENSAGENS</span></div><div class="mail-layout"><div class="mail-list" role="group" aria-label="Mensagens da caixa de entrada">${MAILS.map((m,i)=>`<button class="mail-row ${optionClass(i,solved)}" data-select="${i}" aria-pressed="${selected===i}" ${ui.busy?'disabled':''}><span class="mail-row-top"><strong>${m.sender}</strong><time>${m.time}</time></span><span class="mail-subject"><b>${'ABC'[i]}</b> ${m.subject}</span><span class="mail-preview">${esc(MISSIONS[0].options[i].slice(0,66))}…</span></button>`).join('')}</div><section class="mail-detail" aria-label="Mensagem selecionada">${mail?`<div class="mail-envelope">${icon('mail')}<span>MENSAGEM ${'ABC'[selected]}</span></div><h3 tabindex="-1" id="selection-title">${mail.subject}</h3><p class="mail-address">De: ${mail.sender}<br><span>${mail.address}</span></p><div class="mail-body">${esc(MISSIONS[0].options[selected])}</div>${solved&&selected===1?'<div class="phishing-signals"><span><b>01 · Urgência</b>Pressão para agir em 5 minutos.</span><span><b>02 · Pedido de senha</b>Informação que não deve ser enviada por links.</span><span><b>03 · Domínio desconhecido</b>Confirme por um canal oficial.</span></div>':''}`:`<div class="mail-empty">${icon('mail')}<h3>Uma pista pode estar na sua caixa de entrada.</h3><p>Abra as três mensagens e analise o conteúdo.</p></div>`}</section></div></div>${actionButton('Marcar como suspeita',solved,'mail')}`;
}
function algorithm(solved) {
  return `<div class="algorithm-console ${ui.busy?'running':''}"><div class="tool-bar"><span>${icon('code')} CONSTRUTOR DE ALGORITMO</span><span class="tool-status">LOGIN / FLUXO VISUAL</span></div><div class="algorithm-start"><span></span> INÍCIO DO PROCESSO</div><ol class="sequence">${state.order.map((id,i)=>`<li style="--step:${i}"><span class="step-index">0${i+1}</span><span class="step-connector" aria-hidden="true"></span><span class="step-text">${MISSIONS[1].steps[id]}</span><div class="move-controls"><button data-move="${i}" data-dir="-1" aria-label="Subir etapa: ${MISSIONS[1].steps[id]}" ${solved||ui.busy||i===0?'disabled':''}>↑</button><button data-move="${i}" data-dir="1" aria-label="Descer etapa: ${MISSIONS[1].steps[id]}" ${solved||ui.busy||i===3?'disabled':''}>↓</button></div><span class="execution-marker" aria-hidden="true">▶</span></li>`).join('')}</ol><div class="algorithm-end">${solved?'✓ FLUXO RECONSTRUÍDO':ui.busy?'→ EXECUTANDO ETAPAS…':'FIM DO PROCESSO'}</div></div>${actionButton('Executar',solved)}`;
}
function network(solved) {
  const chosen=ui.selected;
  return `<div class="network-console"><div class="tool-bar"><span>${icon('network')} TOPOLOGIA LOCAL</span><span class="tool-status">MÁSCARA /24</span></div><div class="network-map ${ui.busy?'transmitting':''} ${solved?'connected':''} ${ui.attempted!==null&&!solved?'connection-failed':''}"><div class="network-source"><div class="device"><svg viewBox="0 0 90 70" aria-hidden="true"><rect x="12" y="6" width="66" height="45" rx="4" fill="#142b40" stroke="#7bcbd8" stroke-width="2"/><path d="M45 51v12M25 63h40" stroke="#7bcbd8" stroke-width="2"/><path d="M25 20h25M25 28h40M25 36h16" stroke="#9aabe0" stroke-width="2"/></svg><strong>SEU COMPUTADOR</strong><code>192.168.10.20</code></div><div class="source-wire" aria-hidden="true"><span></span></div><div class="device switch-device">${icon('network')}<strong>SWITCH</strong><small>REDE LOCAL</small></div></div><div class="network-branches" role="group" aria-label="Servidores disponíveis">${MISSIONS[2].options.map((text,i)=>`<div class="server-branch ${chosen===i?'branch-selected':''} ${solved&&chosen===i?'branch-active':''}"><span class="branch-wire" aria-hidden="true"><i></i></span><button class="server-node ${optionClass(i,solved)}" data-select="${i}" aria-pressed="${chosen===i}" ${solved||ui.busy?'disabled':''}>${icon('server')}<span><small>SERVIDOR ${'ABC'[i]}</small><code>${text.split(' — ')[0]}</code>${i===1?'<em>Endereço já usado pelo PC</em>':''}</span><b class="node-status">${solved&&chosen===i?'✓':ui.attempted===i&&!solved?'×':chosen===i?'●':'○'}</b></button></div>`).join('')}</div></div><div class="network-caption">${solved?'✓ Conexão direta estabelecida':ui.busy?'→ Pacote em trânsito para o servidor selecionado…':ui.attempted!==null?'× Conexão não estabelecida. Revise o endereço.':'Selecione um servidor para enviar um pacote de teste.'}</div></div>${actionButton('Testar conexão',solved,'network')}`;
}
function animalArt(animal,garden,label) {
  const cat=animal==='cat';return `<svg viewBox="0 0 170 115" role="img" aria-label="${cat?'Gato':'Cão'} ${garden?'no jardim':'em ambiente interno'}"><rect width="170" height="115" rx="8" fill="${garden?'#253d38':'#353447'}"/>${garden?'<circle cx="143" cy="22" r="11" fill="#d8ce8a"/><path d="M0 78Q40 60 80 78T170 75V115H0Z" fill="#42624c"/><path d="M15 95l4-13 4 13m115 2 4-13 4 13" fill="none" stroke="#9ebd81"/>':'<rect x="12" y="13" width="43" height="35" rx="3" fill="#64738c"/><path d="M34 13v35M12 30h43" stroke="#a2bcd0"/><path d="M0 88h170" stroke="#676078"/><path d="M129 52V32h22v20m-11 0v35" stroke="#a8a0bb" fill="none"/>'}<ellipse cx="87" cy="94" rx="43" ry="6" fill="#101a2380"/><ellipse cx="84" cy="77" rx="27" ry="18" fill="${cat?'#d2ab81':'#c89470'}"/><path d="M61 84Q37 84 43 65" stroke="${cat?'#d2ab81':'#c89470'}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M72 84v12m24-12v12" stroke="${cat?'#d2ab81':'#c89470'}" stroke-width="9" stroke-linecap="round"/><path d="${cat?'M88 58l-4-22 17 9 17-9-3 25Z':'M83 48q-16-6-13 16l12 7m29-23q20-2 15 18l-13 4'}" fill="${cat?'#d2ab81':'#a87556'}"/><ellipse cx="100" cy="60" rx="22" ry="20" fill="${cat?'#e0bc93':'#d4a17e'}"/><g fill="#182337"><circle cx="93" cy="58" r="2.2"/><circle cx="108" cy="58" r="2.2"/><path d="M97 66h6l-3 4Z"/></g>${cat?'<path d="M81 65l-11-2m11 7-12 2m49-7 11-2m-11 7 12 2" stroke="#ede2c9"/>':''}</svg>`;
}
function sample(animal,garden,caption) { return `<figure class="animal-sample">${animalArt(animal,garden)}<figcaption>${caption}</figcaption></figure>`; }
function aiLab(solved) {
  return `<div class="ai-lab"><div class="tool-bar"><span>${icon('ai')} LABORATÓRIO DE TREINAMENTO</span><span class="tool-status">MODELO EM AVALIAÇÃO</span></div><div class="training-stage"><div class="training-data"><div class="section-label">${solved?'NOVOS EXEMPLOS · MAIS VARIEDADE':'EXEMPLOS USADOS NO TREINAMENTO'}</div><div class="samples">${sample('cat',false,'GATO · INTERIOR')}${sample('dog',true,'CÃO · JARDIM')}${solved?sample('cat',true,'GATO · JARDIM')+sample('dog',false,'CÃO · INTERIOR'):''}</div></div><div class="model-divider" aria-hidden="true">→</div><div class="model-test"><div class="section-label">${solved?'PRÓXIMO PASSO':'TESTE COM NOVO EXEMPLO'}</div>${solved?`<div class="retrain-result">${icon('ai')}<strong>Dados ampliados.<br>Hora de testar de novo.</strong><p>Mais cenários para cada animal, com rótulos corretos.</p></div>`:`${sample('cat',true,'REALIDADE: GATO')}<div class="prediction"><span>RESPOSTA DO MODELO</span><strong>× Cão</strong><small>Classificação equivocada</small></div>`}</div></div><p class="simulation-note">${solved?'Simulação pedagógica: os exemplos ilustram uma estratégia de melhoria. Nenhum modelo foi treinado e nenhuma precisão foi medida.':'Simulação pedagógica · imagens ilustrativas de um problema de treinamento.'}</p></div><div class="decision-heading">${solved?'✓ Estratégia de treinamento selecionada':'Qual decisão sua equipe tomaria?'}</div>${choiceButtons(solved,'training')}${actionButton('Aplicar decisão',solved,'ai')}`;
}
function decoder(solved) {
  const encrypted='DGV',plain='ADS',alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ',position=alphabet.indexOf(encrypted[ui.cipherLetter]);
  return `<div class="decoder ${solved?'decoded':''}"><div class="tool-bar"><span>${icon('lock')} DECODIFICADOR CÉSAR</span><span class="tool-status">DESLOCAMENTO −3</span></div><div class="cipher-display"><span class="section-label">${solved?'MENSAGEM DECIFRADA':'MENSAGEM INTERCEPTADA'}</span><div class="cipher-letters">${[...encrypted].map((c,i)=>`<button data-letter="${i}" aria-pressed="${ui.cipherLetter===i}" aria-label="Explorar letra ${c}" class="cipher-tile ${ui.cipherLetter===i?'selected':''}"><span>${c}</span>${solved?`<b style="--step:${i}">${plain[i]}</b>`:''}</button>`).join('')}</div><span class="cipher-instruction">${solved?'✓ Deslocamento aplicado às três letras':'Selecione uma letra para explorar sua posição no alfabeto.'}</span></div><div class="alphabet-help"><span>COMO LER</span>Avanço de 3 para cifrar. Volta de 3 para decifrar.<br><strong>D → A</strong><strong>G → D</strong></div><div class="alphabet-scroll" tabindex="0" role="region" aria-label="Duas faixas de alfabeto. Role horizontalmente para ver todas as letras."><div class="alphabet-label">LETRA CIFRADA</div><div class="alphabet-row">${[...alphabet].map((c,i)=>`<span class="${i===position?'highlight':''}">${c}</span>`).join('')}</div><div class="alphabet-label">VOLTE 3 POSIÇÕES</div><div class="alphabet-row">${[...alphabet].map((_,i)=>`<span class="${i===position&&(solved||ui.cipherLetter<2)?'highlight':''}">${!solved&&ui.cipherLetter===2&&i===position?'?':alphabet[(i+23)%26]}</span>`).join('')}</div></div><p class="muted decoder-note">${!solved&&ui.cipherLetter===2?'A última correspondência fica por sua conta: volte três posições a partir de V.':'As faixas mostram a correspondência na mesma coluna. Ao voltar além de A, continue em Z.'}</p></div>${choiceButtons(solved,'cipher')}${actionButton('Decodificar mensagem',solved,'lock')}`;
}
function recoveryConsole() {
  return `<div class="recovery-console"><div class="tool-bar"><span>${icon('server')} NÚCLEO NEXUS / RECUPERAÇÃO</span><span class="tool-status good">5/5 MÓDULOS PRONTOS</span></div><div class="recovery-content"><div class="recovery-seal">${icon('lock')}</div><p class="section-label">AUTORIZAÇÃO DE RESTAURAÇÃO</p><h3>Uma última conexão.<br>A de tudo que vocês aprenderam.</h3><p>Reúna os fragmentos na ordem das missões e libere o núcleo.</p>${inventory()}<form id="recovery-form" class="recovery"><label for="code">CÓDIGO DE RECUPERAÇÃO · 5 DÍGITOS</label><input id="code" name="code" value="${esc(ui.code)}" inputmode="numeric" maxlength="5" autocomplete="off" aria-describedby="code-help feedback" placeholder="·····"><small id="code-help">Da missão 01 à missão 05, sem espaços.</small><button class="primary" type="submit">${icon('server')} Restaurar sistema</button></form></div></div>`;
}
function feedback(solved) {
  if(solved){const m=MISSIONS[state.current];return `<div id="feedback" class="feedback success" tabindex="-1"><div class="reward-fragment"><small>FRAGMENTO</small><b>${m.fragment}</b></div><div><span class="section-label">✓ MÓDULO RECUPERADO</span><h3>${m.area}: online.</h3><p>${m.feedback}</p></div></div>`;}
  return `<div id="feedback" class="${notice?'feedback error':''}" tabindex="-1">${notice?`<span class="error-symbol" aria-hidden="true">×</span><div><strong>Ainda não. Vamos rever?</strong><p>${notice}</p></div>`:''}</div>`;
}
function render() {
  reset.hidden=false;
  if(state.finishedAt){if(ui.restoring)restoration();else victory();return;}
  app.dataset.screen='operation';
  const m=MISSIONS[state.current],solved=state.current<state.completed;
  // Saves antigos que já concluíram uma missão também reabrem seu resultado visual.
  if(solved&&m?.options&&ui.selected===null)ui.selected=m.correct;
  const task=m?[mailbox,algorithm,network,aiLab,decoder][state.current](solved):recoveryConsole();
  app.innerHTML=`<section class="dashboard"><div><p class="eyebrow">EQUIPE DE RESPOSTA / <span>${esc(state.team)}</span></p><h1>Central de operações<span class="operation-status">${state.exploration?'MODO EXPLORAÇÃO':'MISSÃO ATIVA'}</span></h1></div><div class="clock"><div>${icon('code')}<small>${state.exploration?'TEMPO TOTAL':'TEMPO RESTANTE'}</small></div><strong id="clock">--:--</strong></div></section><div class="workspace">${sidebar()}<section class="mission mission-${state.current}" aria-labelledby="mission-title" aria-busy="${ui.busy}"><div class="mission-heading"><div><span class="eyebrow">${m?`MISSÃO 0${state.current+1} / 05 · ${m.area.toUpperCase()}`:'PROTOCOLO FINAL · AUTORIZAÇÃO'}</span><h2 id="mission-title" tabindex="-1">${m?m.title:'Hora de restaurar o sistema.'}</h2></div>${m?`<button class="hint-trigger" data-action="hint" aria-expanded="${hintOpen}" aria-controls="mission-hint" ${ui.busy?'disabled':''}><span aria-hidden="true">✧</span> ${hintOpen?'Ocultar pista':'Pedir pista'}</button>`:''}</div>${m?`<div class="objective"><span>OBJETIVO</span><p>${OBJECTIVES[state.current]}</p></div><div id="mission-hint" class="hint-panel" ${hintOpen?'':'hidden'}><strong>NEXA / PISTA</strong><p>${m.hint}</p></div><p class="brief">${m.brief}</p>`:''}${task}${m?feedback(solved):`<div id="feedback" class="${notice?'feedback error':''}" tabindex="-1">${notice?`<p>${notice}</p>`:''}</div>`}<div class="mission-bottom">${m?`<div class="profession">${icon(['mail','code','network','ai','lock'][state.current])}<div><small>QUEM FAZ ISSO?</small><strong>${m.role}</strong><p>${m.description}</p></div></div>`:'<p class="muted">✓ Segurança · ✓ Programação · ✓ Redes · ✓ IA · ✓ Criptografia</p>'}${solved?`<button class="primary next-button" data-action="next">${state.completed===5?'Ir para recuperação':'Próxima missão'} <span aria-hidden="true">→</span></button>`:''}</div></section></div>`;
  tick();
}
function canPlay(at=Date.now()) { if(!state||state.finishedAt)return false;if(!state.exploration&&elapsed(at)>=LIMIT){tick();return false;}return true; }
function check(answer) {
  if(!state||state.current>=5||state.current<state.completed||!canPlay())return;
  const m=MISSIONS[state.current],correct=m.steps?state.order.every((n,i)=>n===i):answer===m.correct;
  if(correct){state.completed++;notice='';ui.attempted=null;ui.selected=m.options?m.correct:null;ui.celebration=true;}
  else {
    state.errors++;ui.attempted=answer;
    const errors=[
      'Releia a mensagem escolhida e procure uma combinação de sinais: pressão, pedido de informações e endereço de destino. Só o texto não garante que uma mensagem seja segura.',
      'O fluxo parou: uma etapa tentou usar informações que ainda não estavam prontas. Pense no que precisa acontecer antes de verificar, decidir e responder.',
      answer===1?'Esse endereço já está sendo usado pelo PC. Dois dispositivos não devem usar o mesmo endereço nesta rede.': 'Esse servidor não compartilha os três primeiros blocos com o PC. Neste exercício, isso impede a comunicação direta na rede local.',
      'O modelo precisa ser avaliado e aprender com exemplos adequados. Esconder testes ou aceitar tudo não resolve as associações equivocadas.',
      'A mensagem ainda não foi decifrada. Volte três letras para cada caractere, em vez de avançar. Experimente usar as faixas de apoio.'
    ];notice=errors[state.current];
  }
  save();render();focusFeedback();
}
function validate() {
  if(ui.busy||!canPlay()||state.current>=5||state.completed>state.current)return;
  if(state.current!==1&&ui.selected===null)return;
  const answer=ui.selected;
  ui.busy=true;notice='';ui.attempted=null;render();
  announce(state.current===1?'Executando as quatro etapas.':state.current===2?'Testando a conexão selecionada.':'Analisando sua decisão.');
  // A validação real só acontece depois da apresentação, sem avançar a missão.
  schedule(()=>{ui.busy=false;check(answer);},state.current===1?1050:state.current===2?700:350);
}
function tick() {
  if(!state||state.finishedAt)return;
  const remaining=LIMIT-elapsed(),clock=document.querySelector('#clock');
  if(clock){clock.textContent=time(state.exploration?elapsed():Math.ceil(remaining/1000)*1000);clock.closest('.clock').classList.toggle('urgent',!state.exploration&&remaining<60000);}
  if(remaining<=0&&!state.exploration){
    if(ui.busy){cancelPending();render();return;}
    if(!modal.open)showDialog('O tempo chegou ao fim.',`<p>Vocês recuperaram ${state.completed} de 5 módulos. Ainda há descobertas pela frente. Continuem em exploração para concluir, com o registro de conclusão fora do prazo.</p>`,'<button class="primary" data-action="explore">Continuar em modo exploração</button><button data-action="reset">Reiniciar</button>',true);
  }
}
function restoration() {
  app.dataset.screen='restoration';
  app.innerHTML=`<section class="restoration"><span class="badge">✓ CÓDIGO VALIDADO</span><h1 id="restore-title" tabindex="-1">Restaurando o núcleo.</h1>${coreArt(true)}<div class="restore-modules">${MISSIONS.map((m,i)=>`<span style="--step:${i}">✓ ${m.area}</span>`).join('')}</div><button class="primary" data-action="show-victory">Ver resultado →</button></section>`;
}
function victory() {
  app.dataset.screen='victory';
  app.innerHTML=`<section class="victory"><div class="victory-top"><div><span class="badge">● TODOS OS SERVIÇOS ONLINE</span><p class="eyebrow">OPERAÇÃO CONCLUÍDA / NEXUS TECNOLOGIA</p><h1 tabindex="-1">SISTEMA<br><span>RESTAURADO!</span></h1><p class="victory-team">Vocês fizeram isso, <strong>${esc(state.team)}</strong>.</p><span class="finish-status">${state.exploration?'CONCLUSÃO EM MODO EXPLORAÇÃO':'CONCLUSÃO DENTRO DO PRAZO'}</span></div><div class="victory-art">${coreArt(true)}${ui.celebration?`<div class="confetti" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div>`:''}</div></div><div class="stats"><div><span>TEMPO TOTAL</span><strong>${time(elapsed())}</strong></div><div><span>PISTAS UTILIZADAS</span><strong>${state.hints.length}<small> / 5</small></strong></div><div><span>TENTATIVAS INCORRETAS</span><strong>${state.errors}</strong></div><div class="stats-team"><span>RESULTADO</span><strong>5/5 <small>módulos</small></strong></div></div><div class="career-section"><div><span class="eyebrow">SEU PRÓXIMO NÍVEL PODE SER AQUI</span><h2>Análise e Desenvolvimento<br>de Sistemas.</h2><p>Em Análise e Desenvolvimento de Sistemas, você aprende a analisar problemas, desenvolver aplicações, trabalhar com dados e construir soluções tecnológicas.</p></div><div class="career-areas">${MISSIONS.map((m,i)=>`<div>${icon(['mail','code','network','ai','lock'][i])}<span>${m.area}</span><b>✓</b></div>`).join('')}</div></div><div class="victory-message"><blockquote>Hoje você salvou um sistema.<br><strong>Amanhã pode criar soluções que transformam vidas.</strong></blockquote><button class="primary" data-action="reset">Nova equipe <span aria-hidden="true">↗</span></button></div><p class="credits">Mostra de Profissões | ADS <span>Profº: João Victor Pinheiro da Silva</span></p></section>`;
}
function submit(e) {
  if(e.target.id!=='start-form'&&e.target.id!=='recovery-form')return;
  e.preventDefault();
  if(e.target.id==='start-form'){if(diagnostic!==null||state)return;beginDiagnostic(new FormData(e.target).get('team'));return;}
  const submittedAt=Date.now();
  if(ui.busy||!canPlay(submittedAt)||state.completed!==5||state.current!==5)return;
  const code=new FormData(e.target).get('code');ui.code=code;
  if(!/^\d{5}$/.test(code)){notice='Digite exatamente cinco dígitos para completar o código.';render();document.querySelector('#code').focus();announce(notice);return;}
  if(code!=='73142'){state.errors++;notice='Código incorreto. Confira os fragmentos na ordem das missões, da primeira à quinta.';save();render();document.querySelector('#code').focus();announce(notice);return;}
  // Conclusão registrada no instante da validação, antes da sequência visual.
  state.finishedAt=submittedAt;ui.restoring=true;ui.celebration=true;save();render();focusScreen();
  schedule(()=>{ui.restoring=false;render();focusScreen();},1200);
}
function click(e) {
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.select!==undefined){
    if(ui.busy||!canPlay()||state.current>=5)return;
    const value=Number(b.dataset.select);if(!Number.isInteger(value)||value<0||value>2)return;
    const solved=state.current<state.completed;
    if(solved&&state.current!==0)return;
    ui.selected=value;notice='';ui.attempted=null;render();
    if(!modal.open)document.querySelector(`[data-select="${value}"]`)?.focus();
    if(state.current===0)announce('Mensagem '+ 'ABC'[value]+': '+MISSIONS[0].options[value]);
    return;
  }
  if(b.dataset.move!==undefined){
    if(ui.busy||!canPlay()||state.current!==1||state.completed>1)return;
    const i=Number(b.dataset.move),direction=Number(b.dataset.dir),j=i+direction;
    if(!Number.isInteger(i)||i<0||i>3||![1,-1].includes(direction)||j<0||j>3)return;
    [state.order[i],state.order[j]]=[state.order[j],state.order[i]];notice='';ui.attempted=null;save();render();
    if(!modal.open)(document.querySelector(`[data-move="${j}"][data-dir="${direction}"]:not(:disabled)`)||document.querySelector(`[data-move="${j}"]:not(:disabled)`))?.focus();
    announce('Etapa movida para a posição '+(j+1)+'.');return;
  }
  if(b.dataset.letter!==undefined){
    if(ui.busy||!canPlay()||state.current!==4)return;
    const n=Number(b.dataset.letter);if(!Number.isInteger(n)||n<0||n>2)return;
    ui.cipherLetter=n;render();if(!modal.open)document.querySelector(`[data-letter="${n}"]`)?.focus();
    announce(n===2&&state.completed===4?'Letra V selecionada. Volte três posições.':`Correspondência: ${'DGV'[n]} para ${'ADS'[n]}.`);return;
  }
  switch(b.dataset.action){
    case 'help':showDialog('Sua equipe. Cinco desafios. Uma missão.','<ol><li>Formem uma equipe de 2 a 3 participantes.</li><li>Inspecionem o cenário de cada missão e conversem antes de decidir.</li><li>Selecionem uma resposta e usem o botão de ação para testar.</li><li>Errou? Tentem novamente. NEXA pode oferecer uma pista.</li><li>Guardem os fragmentos na ordem e restaurem o núcleo.</li></ol><p>O relógio começa após o diagnóstico, quando o primeiro desafio estiver disponível. Usem Tab, Shift+Tab e Enter ou Espaço. A ordenação usa botões de subir e descer. Se o tempo acabar, continuem em exploração.</p>','<button class="primary" data-action="close">Entendido</button>');break;
    case 'close':closeDialog();break;
    case 'skip':finishDiagnostic();break;
    case 'resume':if(!saved)return;cancelPending();ui=freshUI();state=saved;notice='';hintOpen=false;render();focusScreen();break;
    case 'reset':showDialog('Preparar uma nova equipe?','<p>O progresso e as estatísticas desta partida serão apagados. A próxima equipe começará do início, com 10 minutos.</p>','<button class="primary" data-action="confirm-reset">Sim, iniciar nova equipe</button><button data-action="close">Voltar à partida</button>',!!state&&!state.finishedAt&&!state.exploration&&elapsed()>=LIMIT);break;
    case 'confirm-reset':cancelPending();diagnostic=null;state=null;saved=null;ui=freshUI();notice='';hintOpen=false;try{localStorage.removeItem(KEY);}catch{}closeDialog();landing();focusScreen();announce('Nova equipe: progresso e estatísticas reiniciados.');break;
    case 'explore':if(!state||state.finishedAt||elapsed()<LIMIT)return;cancelPending();state.exploration=true;save();closeDialog();render();focusScreen();break;
    case 'hint':if(ui.busy||!canPlay()||state.current>=5)return;hintOpen=!hintOpen;if(hintOpen&&!state.hints.includes(state.current))state.hints.push(state.current);save();render();if(!modal.open)document.querySelector('[data-action="hint"]')?.focus();if(hintOpen)announce(MISSIONS[state.current].hint);break;
    case 'validate':validate();break;
    case 'next':if(ui.busy||!canPlay()||state.completed!==state.current+1)return;cancelPending();state.current++;ui=freshUI();notice='';hintOpen=false;save();render();focusScreen();break;
    case 'show-victory':if(!state?.finishedAt)return;cancelPending();ui.restoring=false;render();focusScreen();break;
  }
}
reset.dataset.action='reset';
document.addEventListener('submit',submit);
document.addEventListener('click',click);
document.addEventListener('input',e=>{if(e.target.id==='code')ui.code=e.target.value;});
setInterval(tick,250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
landing();
