'use strict';
// All quotes and orders are simulated. No network requests, broker APIs, or AI inference.
const KEY='tradepilot-paper-v1';
const definitions=[
 {id:'btc',name:'Bitcoin Momentum',market:'Crypto',symbol:'BTC/USD',base:68420,vol:.002},
 {id:'eur',name:'EUR/USD Trend',market:'Forex',symbol:'EUR/USD',base:1.0842,vol:.00035},
 {id:'doge',name:'DOGE Momentum',market:'Memecoins',symbol:'DOGE/USD',base:.1824,vol:.008}
];
const initial=()=>({cash:10000,realized:0,closed:[],positions:[],enabled:{btc:true,eur:true,doge:true},running:false,prices:Object.fromEntries(definitions.map(d=>[d.id,d.base])),history:Object.fromEntries(definitions.map(d=>[d.id,Array(12).fill(d.base)])),alerts:[],tick:0});
let s;
try{const saved=JSON.parse(localStorage.getItem(KEY));s=saved&&typeof saved.cash==='number'&&saved.prices&&saved.history&&saved.enabled&&Array.isArray(saved.positions)&&Array.isArray(saved.closed)&&Array.isArray(saved.alerts)?{...initial(),...saved,running:false}:initial()}catch{s=initial()}
const $=id=>document.getElementById(id);
const money=x=>(x<0?'−':'')+'$'+Math.abs(x).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt=(x,d)=>x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{notify('Local storage unavailable; changes may not persist.')}};
const notify=msg=>{s.alerts.unshift({at:new Date().toLocaleTimeString(),msg});s.alerts=s.alerts.slice(0,25);$('notice').textContent=msg};
const equity=()=>s.cash+s.positions.reduce((sum,p)=>sum+p.qty*s.prices[p.id],0);
function signal(id){const h=s.history[id];if(!h||h.length<10)return 'WAIT';const short=h.slice(-4).reduce((a,b)=>a+b,0)/4;const long=h.slice(-10).reduce((a,b)=>a+b,0)/10;return short>long*1.0003?'BUY':short<long*.9997?'SELL':'HOLD'}
function openPosition(d){if(s.positions.some(p=>p.id===d.id))return;const eq=equity();const allocation=Math.min(s.cash,eq*.12);if(allocation<10)return;const price=s.prices[d.id];const qty=allocation/price;s.cash-=allocation;s.positions.push({id:d.id,symbol:d.symbol,entry:price,qty,stop:price*.98,target:price*1.04});notify('PAPER BUY '+d.symbol+' '+money(allocation))}
function closePosition(p,reason){const price=s.prices[p.id];const proceeds=p.qty*price;const profit=(price-p.entry)*p.qty;s.cash+=proceeds;s.realized+=profit;s.closed.push({symbol:p.symbol,profit,reason});s.positions=s.positions.filter(x=>x!==p);notify('PAPER SELL '+p.symbol+' '+reason+' P/L '+money(profit))}
function tick(){if(!s.running||document.hidden)return;s.tick++;
 for(const d of definitions){const old=s.prices[d.id];const next=Math.max(d.base*.05,old*(1+(Math.random()-.5)*2*d.vol));s.prices[d.id]=next;s.history[d.id].push(next);s.history[d.id]=s.history[d.id].slice(-30)}
 for(const p of [...s.positions]){const price=s.prices[p.id];if(price<=p.stop)closePosition(p,'STOP LOSS');else if(price>=p.target)closePosition(p,'TAKE PROFIT');else if(signal(p.id)==='SELL')closePosition(p,'SIGNAL EXIT')}
 for(const d of definitions){if(s.enabled[d.id]&&signal(d.id)==='BUY')openPosition(d)}
 persist();render()}
function render(){const eq=equity(),profit=eq-10000;$('equity').textContent=money(eq);$('pnl').textContent='Total P/L: '+money(profit);$('pnl').className=profit>=0?'green':'red';$('trades').textContent=s.closed.length;$('winrate').textContent=s.closed.length?fmt(100*s.closed.filter(t=>t.profit>0).length/s.closed.length,1)+'%':'—';$('open-count').textContent=s.positions.length;$('status').textContent=s.running?'RUNNING':'STOPPED';$('start').textContent=s.running?'Ⅱ Pause bots':'▶ Start bots';
 $('bots').replaceChildren(...definitions.map(d=>{const row=document.createElement('div');row.className='line';const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=d.name;const small=document.createElement('small');small.textContent=d.market+' • '+signal(d.id)+' • SL 2% / TP 4%';info.append(strong,small);const btn=document.createElement('button');btn.className='switch'+(s.enabled[d.id]?' on':'');btn.textContent=s.enabled[d.id]?'ON':'OFF';btn.onclick=()=>{s.enabled[d.id]=!s.enabled[d.id];persist();render()};row.append(info,btn);return row}));
 $('markets').replaceChildren(...definitions.map(d=>{const row=document.createElement('div');row.className='line';const a=document.createElement('div'),b=document.createElement('div');b.className='right';const strong=document.createElement('strong');strong.textContent=d.symbol;const sm=document.createElement('small');sm.textContent=d.market;const price=document.createElement('strong');price.textContent=fmt(s.prices[d.id],d.base<1?6:d.base<10?5:2);const sig=document.createElement('small');sig.textContent=signal(d.id)+' • simulated';a.append(strong,sm);b.append(price,sig);row.append(a,b);return row}));
 const pos=$('positions');pos.replaceChildren();if(!s.positions.length)pos.textContent='No open positions';else for(const p of s.positions){const row=document.createElement('div');row.className='line';const a=document.createElement('div');const b=document.createElement('div');b.className='right';const name=document.createElement('strong');name.textContent=p.symbol;const limits=document.createElement('small');limits.textContent='SL '+fmt(p.stop,5)+' • TP '+fmt(p.target,5);const pl=document.createElement('strong');const gain=(s.prices[p.id]-p.entry)*p.qty;pl.textContent=money(gain);pl.className=gain>=0?'green':'red';const close=document.createElement('button');close.textContent='Close';close.onclick=()=>{closePosition(p,'MANUAL');persist();render()};a.append(name,limits);b.append(pl,close);row.append(a,b);pos.append(row)}
 const alerts=$('alerts');alerts.replaceChildren();if(!s.alerts.length)alerts.textContent='No alerts yet';else for(const a of s.alerts.slice(0,8)){const row=document.createElement('div');row.className='line';const m=document.createElement('div');m.textContent=a.msg;const time=document.createElement('small');time.textContent=a.at;row.append(m,time);alerts.append(row)}
}
$('start').onclick=()=>{s.running=!s.running;notify(s.running?'Paper bots started':'Paper bots paused');persist();render()};
$('stop').onclick=()=>{s.running=false;for(const p of [...s.positions])closePosition(p,'EMERGENCY CLOSE');notify('EMERGENCY STOP: simulation halted; paper positions closed');persist();render()};
$('reset').onclick=()=>{if(!confirm('Reset all simulated trades and restore $10,000?'))return;s=initial();persist();$('notice').textContent='Demo reset';render()};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.running){s.running=false;notify('Bots auto-paused when app went to background');persist()}render()});
window.addEventListener('pagehide',()=>{s.running=false;persist()});
setInterval(tick,3000);render();
