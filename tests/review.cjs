'use strict';
// Testes sem dependências: DOM, relógio e agendador simulados; não são testes visuais.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const source=fs.readFileSync('script.js','utf8');
let total=0;
const allSnapshots=[];
function test(name,fn){fn();total++;console.log('PASS '+name);}
function harness(storage={},reduced=false){
  let now=1000000,blocked=false,nextId=1;const jobs=new Map(),elements=new Map(),snapshots=[];
  const document={activeElement:null,hidden:false,querySelector(selector){if(!elements.has(selector))elements.set(selector,element(selector));return elements.get(selector)},addEventListener(){}};
  function element(selector){return {selector,dataset:{},hidden:false,open:false,textContent:'',_html:'',isConnected:true,classList:{toggle(){}},set innerHTML(v){this._html=v;if(selector==='#app'){snapshots.push(v);allSnapshots.push(v)}},get innerHTML(){return this._html},focus(){document.activeElement=this},querySelector(s){return document.querySelector(s)},closest(s){return document.querySelector(s)},addEventListener(){},showModal(){this.open=true},close(){this.open=false}};}
  const localStorage={getItem(k){if(blocked)throw Error('blocked');return storage[k]??null},setItem(k,v){if(blocked)throw Error('blocked');storage[k]=v},removeItem(k){if(blocked)throw Error('blocked');delete storage[k]}};
  const sandbox={document,localStorage,Date:{now:()=>now},setInterval(){},setTimeout(fn,delay){const id=nextId++;jobs.set(id,{fn,at:now+delay});return id},clearTimeout(id){jobs.delete(id)},matchMedia:()=>({matches:reduced}),FormData:class{constructor(t){this.values=t.values}get(k){return this.values[k]}}};
  const context=vm.createContext(sandbox);vm.runInContext(source,context);
  const run=code=>vm.runInContext(code,context);
  const click=dataset=>run(`click({target:{closest:()=>({dataset:${JSON.stringify(dataset)}})}})`);
  const action=action=>click({action});
  const submit=(id,values)=>run(`submit({preventDefault(){},target:{id:${JSON.stringify(id)},values:${JSON.stringify(values)}}})`);
  function advance(ms){const end=now+ms;for(let loops=0;loops<100;loops++){let found=null;for(const [id,job]of jobs)if(job.at<=end&&(!found||job.at<found[1].at))found=[id,job];if(!found)break;jobs.delete(found[0]);now=found[1].at;found[1].fn();}now=end;}
  const html=()=>document.querySelector('#app').innerHTML;
  function choose(i){click({select:String(i)});action('validate');}
  return {run,action,click,submit,advance,html,choose,document,storage,snapshots,jobs,block(v){blocked=v},now(){return now},setNow(v){now=v},reload(){const another=vm.createContext({...sandbox});vm.runInContext(source,another);return code=>vm.runInContext(code,another)}};
}
function solve(h){
  h.choose(1);h.advance(350);h.action('next');
  for(const i of [1,3,2])h.click({move:String(i),dir:'-1'});
  h.action('validate');h.advance(1050);h.action('next');h.choose(2);h.advance(700);h.action('next');h.choose(0);h.advance(350);h.action('next');h.choose(1);h.advance(350);h.action('next');
}
test('diagnóstico não inicia relógio; pular não dispara uma segunda partida',()=>{
  const h=harness();h.submit('start-form',{team:'Equipe teste'});assert.equal(h.run('state'),null);assert(h.html().includes('O cronômetro ainda não começou.'));h.advance(500);h.action('skip');const start=h.run('state.startedAt');assert.equal(start,h.now());h.advance(3000);assert.equal(h.run('state.startedAt'),start);assert.equal(h.jobs.size,0);
});
test('diagnóstico termina sozinho e respeita movimento reduzido',()=>{
  const h=harness();h.submit('start-form',{team:'Time'});h.advance(1399);assert.equal(h.run('state'),null);h.advance(1);assert.equal(h.run('state.current'),0);
  const r=harness({},true);r.submit('start-form',{team:'Time'});r.advance(0);assert.equal(r.run('state.current'),0);r.choose(1);r.advance(0);assert.equal(r.run('state.completed'),1);
});
test('e-mail selecionável, bloqueio de validação dupla, feedback e pistas sem duplicação',()=>{
  const h=harness();h.run(`start('<img src=x onerror=bad>')`);assert(!h.html().includes('<img src=x'));h.action('next');assert.equal(h.run('state.current'),0);h.action('validate');assert(!h.run('ui.busy'));
  for(let i=0;i<3;i++){h.click({select:String(i)});assert(h.html().includes('De: '+['Projetos NEXUS','Central de contas','Suporte NEXUS'][i]));assert(!/class="[^"\n]*\bcorrect\b/.test(h.html()));assert(!h.html().includes('phishing-signals'));}
  h.choose(0);h.action('validate');h.click({select:'1'});h.action('next');assert.equal(h.run('ui.selected'),0);h.advance(350);assert.equal(h.run('state.errors'),1);assert.equal(h.run('state.completed'),0);assert.equal(h.document.activeElement.selector,'#feedback');
  for(let i=0;i<3;i++)h.action('hint');assert.equal(h.run('state.hints.length'),1);assert.equal(h.document.activeElement.selector,'[data-action="hint"]');
  h.choose(1);h.advance(350);assert.equal(h.run('state.current'),0);assert.equal(h.run('state.completed'),1);assert(h.html().includes('phishing-signals'));h.click({select:'2'});assert.equal(h.run('state.completed'),1);h.action('validate');assert.equal(h.run('state.errors'),1);
});
test('ordenação, execução animada e bloqueio dos controles durante o processamento',()=>{
  const h=harness();h.run("start('Algoritmo')");h.choose(1);h.advance(350);h.action('next');assert.equal(h.run('state.order.join()'),'2,0,3,1');h.action('validate');h.click({move:'1',dir:'-1'});assert.equal(h.run('state.order.join()'),'2,0,3,1');h.advance(1050);assert.equal(h.run('state.errors'),1);
  for(const i of [1,3,2])h.click({move:String(i),dir:'-1'});assert.equal(h.run('state.order.join()'),'0,1,2,3');h.action('validate');assert(h.html().includes('algorithm-console running'));h.advance(1050);assert.equal(h.run('state.completed'),2);assert.equal(h.run('state.current'),1);
});
test('fluxo completo pelas ações de interface, vitória validada e tempo congelado',()=>{
  const h=harness();h.run("start('Equipe completa')");solve(h);assert.equal(h.run('state.completed'),5);assert.equal(h.run('state.current'),5);
  h.submit('recovery-form',{code:'731'});assert.equal(h.run('state.finishedAt'),null);h.submit('recovery-form',{code:'00000'});assert.equal(h.run('state.errors'),1);assert(h.html().includes('value="00000"'));
  h.submit('recovery-form',{code:'73142'});const end=h.run('state.finishedAt');assert(end);assert(h.html().includes('CÓDIGO VALIDADO'));h.submit('recovery-form',{code:'73142'});h.advance(1200);assert(h.html().includes('RESTAURADO!'));assert(h.html().includes('CONCLUSÃO DENTRO DO PRAZO'));h.advance(10000);assert.equal(h.run('elapsed()'),end-h.run('state.startedAt'));
  const reload=h.reload();assert.equal(reload('saved.finishedAt'),end);reload("click({target:{closest:()=>({dataset:{action:'resume'}})}})");assert(h.html().includes('RESTAURADO!'));
});
test('erros contextualizados de rede, IA e cifra sem vazamento visual da resposta',()=>{
  const h=harness();h.run("start('Erros')");h.run('state.current=2;state.completed=2;ui=freshUI();render()');
  for(const i of [0,1,2]){h.click({select:String(i)});assert(!/class="[^"\n]*\bcorrect\b/.test(h.html()));assert(!h.html().includes('branch-active'));}
  h.choose(0);h.advance(700);assert(h.run('notice').includes('três primeiros blocos'));h.choose(1);h.advance(700);assert(h.run('notice').includes('já está sendo usado'));h.choose(2);h.advance(700);assert(h.html().includes('branch-active'));h.action('next');
  assert(h.html().includes('Classificação equivocada'));assert(!h.html().includes('NOVOS EXEMPLOS'));h.choose(1);h.advance(350);assert.equal(h.run('state.completed'),3);h.choose(0);h.advance(350);assert(h.html().includes('Nenhum modelo foi treinado'));h.action('next');
  assert(!h.html().includes('cipher-tile selected"><span>D</span><b'));h.click({letter:'2'});assert(!h.document.querySelector('#announcer').textContent.includes('para S'));h.choose(0);h.advance(350);assert.equal(h.run('state.completed'),4);h.choose(1);h.advance(350);assert(h.html().includes('decode')&&h.html().includes('MENSAGEM DECIFRADA'));
});
test('prazo exato e expiração durante validação cancelam a ação pendente',()=>{
  const h=harness();h.run("start('Relógio')");h.advance(599001);h.run('tick()');assert.equal(h.document.querySelector('#clock').textContent,'00:01');h.advance(899);h.choose(1);h.advance(100);h.run('tick()');assert.equal(h.document.querySelector('#clock').textContent,'00:00');assert(h.document.querySelector('#modal').open);assert.equal(h.run('state.completed'),0);h.advance(1000);assert.equal(h.run('state.completed'),0);h.action('explore');assert(h.run('state.exploration'));solve(h);h.submit('recovery-form',{code:'73142'});h.action('show-victory');assert(h.html().includes('CONCLUSÃO EM MODO EXPLORAÇÃO'));
});
test('retomada conserva cronômetro e saves v1; saves inválidos são ignorados',()=>{
  const h=harness();h.run("start('Persistência')");h.choose(1);h.advance(350);const start=h.run('state.startedAt');h.advance(12000);const reload=h.reload();assert.equal(reload('saved.completed'),1);assert.equal(reload('saved.startedAt'),start);reload("click({target:{closest:()=>({dataset:{action:'resume'}})}})");assert.equal(h.document.querySelector('#clock').textContent,'09:48');
  const valid=JSON.parse(h.storage['ads-experience.v1']);for(const change of [{current:6},{current:0,completed:5},{hints:[0,0]},{hints:[4]},{order:[0,0,2,3]},{finishedAt:h.now(),current:0},{version:9}]){h.storage['ads-experience.v1']=JSON.stringify({...valid,...change});assert.equal(h.run('readSave()'),null);}h.storage['ads-experience.v1']='{invalid';assert.equal(h.run('readSave()'),null);
});
test('reinício seletivo, cancelamento e cancelamento de callbacks antigos',()=>{
  const h=harness({other:'preservar'});h.run("start('Reinício')");const before=h.run('JSON.stringify(state)');h.action('reset');h.action('close');assert.equal(h.run('JSON.stringify(state)'),before);h.choose(1);h.action('reset');h.action('confirm-reset');h.advance(2000);assert.equal(h.run('state'),null);assert.equal(h.storage.other,'preservar');assert(!h.storage['ads-experience.v1']);assert(h.html().includes('Aceitar missão'));h.submit('start-form',{team:'Outra equipe'});h.action('skip');assert.equal(h.run('state.completed'),0);assert.equal(h.run('state.errors'),0);assert.equal(h.run('state.hints.length'),0);
});
test('armazenamento bloqueado não interrompe o jogo',()=>{
  const h=harness();h.block(true);h.run("start('Sem armazenamento')");h.choose(1);h.advance(350);assert.equal(h.run('state.completed'),1);h.action('reset');h.action('confirm-reset');assert.equal(h.run('state'),null);
});
test('recursos locais existentes, movimento reduzido e cronômetro fora de aria-live',()=>{
  for(const name of ['index.html','styles.css','script.js']){const text=fs.readFileSync(name,'utf8');assert(!text.includes('\0'));assert(!/https?:\/\/|\bfetch\s*\(|\bimport\s|\b(?:alert|prompt|confirm)\s*\(/.test(text));}
  const html=fs.readFileSync('index.html','utf8');for(const [,ref]of html.matchAll(/(?:src|href)="([^"#]+)"/g))assert(fs.existsSync(ref));assert.equal((html.match(/aria-live=/g)||[]).length,1);
  const css=fs.readFileSync('styles.css','utf8');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('font-size:18px'));assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
  const h=harness();h.run("start('Local')");assert(!/id="clock"[^>]*aria-live/.test(h.html()));for(const s of h.snapshots){const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'IDs duplicados');}
});
if(process.env.ADS_SNAPSHOTS)fs.writeFileSync(process.env.ADS_SNAPSHOTS,JSON.stringify(allSnapshots));
console.log(`\n${total} grupos de testes concluídos. Layout, leitor de tela e teclado reais precisam de navegador.`);
