/* ===== StudyWarzz FX layer: pure enhancement, never edits app logic ===== */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const touch=matchMedia('(hover:none)').matches;
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e};

/* ---------- cinematic intro (photo reveal) ---------- */
function intro(){
  const d=el('div');d.id='fx-intro';
  d.innerHTML=`<div class="pic"></div><div class="leak"></div><div class="vig"></div>
  <canvas class="stars"></canvas>
  <div class="bar t"></div><div class="bar b"></div>
  <div class="center">
    <svg viewBox="0 0 32 32" fill="none"><path d="M18 3L6 17H16L13 29L26 14H16L18 3Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <small class="pre">B.TECH  •  SEMESTER PREP  •  LIVE BATTLES</small>
    <h1>${[...'STUDYWARZZ'].map((c,i)=>`<span style="animation-delay:${1.1+i*.09}s">${c}</span>`).join('')}</h1>
    <div class="line"></div>
    <small class="tag">STUDY  ·  COMPETE  ·  CONQUER</small>
  </div>
  <button class="skip" type="button">SKIP ▸</button>`;
  document.body.appendChild(d);
  requestAnimationFrame(()=>{const pc=document.getElementById('fx-precover');pc&&pc.remove()});
  // twinkling star field inside intro
  const c=$('.stars',d),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const st=Array.from({length:120},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.6+.4,p:Math.random()*6,s:.02+Math.random()*.05}));
  let alive=true;(function f(){if(!alive)return;x.clearRect(0,0,c.width,c.height);
    for(const s of st){s.p+=s.s;const a=.35+.65*Math.abs(Math.sin(s.p));x.globalAlpha=a;x.fillStyle='#fff';x.shadowBlur=10;x.shadowColor='#ffb3e1';
      drawStar(x,s.x,s.y,s.r*(1+a),4,.25)}
    requestAnimationFrame(f)})();
  let done=false;
  const finish=()=>{if(done)return;done=true;d.classList.add('out');
    const ph=$('.fx-photo');ph&&ph.classList.add('on');
    setTimeout(()=>{alive=false;d.remove();document.dispatchEvent(new Event('fx:ready'))},reduce?200:1500)};
  $('.skip',d).onclick=finish;
  setTimeout(finish,reduce?300:4600);
}
// shared star shape: n points, inner ratio k
function drawStar(x,cx,cy,r,n=5,k=.45,rot=0){
  x.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n-Math.PI/2,rr=i%2?r*k:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}
  x.closePath();x.fill();
}

/* ---------- background layers ---------- */
function background(){
  document.body.prepend(el('div','fx-photo','<i></i>'),el('div','fx-aurora','<i></i><i></i><i></i>'),el('div','fx-grid'));
  addEventListener('mousemove',e=>{const p=$('.fx-photo i');if(p&&!reduce)p.style.translate=`${(e.clientX/innerWidth-.5)*-26}px ${(e.clientY/innerHeight-.5)*-18}px`});
  document.body.append(el('div','fx-noise'),el('div','','' ));
  const prog=el('div');prog.id='fx-progress';document.body.append(prog);
  addEventListener('scroll',()=>{const h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});
  const vg=el('div');vg.id='fx-vignette';document.body.append(vg);
  if(reduce)return;
  const c=el('canvas');c.id='fx-bg';document.body.prepend(c);
  const x=c.getContext('2d');let W,H,P=[],mx=-999,my=-999,S=[];
  const rs=()=>{W=c.width=innerWidth;H=c.height=innerHeight;
    const n=Math.min(90,Math.floor(W*H/22000));
    P=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.6,h:Math.random()<.25?185:325}));};
  rs();addEventListener('resize',rs);
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  const shoot=()=>{S.push({x:Math.random()*W,y:-20,vx:4+Math.random()*4,vy:5+Math.random()*4,l:1});setTimeout(shoot,2500+Math.random()*5000)};setTimeout(shoot,2000);
  (function loop(){
    if(document.hidden){requestAnimationFrame(loop);return}
    x.clearRect(0,0,W,H);
    for(const p of P){
      const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
      if(d<140){p.x+=dx/d*1.2;p.y+=dy/d*1.2}
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      x.beginPath();x.fillStyle=`hsla(${p.h},100%,70%,.85)`;x.shadowBlur=10;x.shadowColor=`hsl(${p.h},90%,65%)`;p.h===185?drawStar(x,p.x,p.y,p.r*2.2,4,.25,p.x*.01):x.arc(p.x,p.y,p.r,0,7);x.fill();
    }
    x.shadowBlur=0;
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
      const a=P[i],b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<120){x.strokeStyle=`rgba(255,45,149,${.16*(1-d/120)})`;x.lineWidth=1;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
      }
    for(const p of P){const d=Math.hypot(p.x-mx,p.y-my);if(d<170){x.strokeStyle=`rgba(255,94,196,${.4*(1-d/170)})`;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(mx,my);x.stroke()}}
    S=S.filter(s=>{s.x+=s.vx;s.y+=s.vy;s.l-=.012;const g=x.createLinearGradient(s.x,s.y,s.x-s.vx*10,s.y-s.vy*10);g.addColorStop(0,`rgba(255,255,255,${s.l})`);g.addColorStop(1,'transparent');x.strokeStyle=g;x.lineWidth=2;x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x-s.vx*10,s.y-s.vy*10);x.stroke();return s.l>0});
    requestAnimationFrame(loop);
  })();
}

/* ---------- custom cursor ---------- */
function cursor(){
  if(touch||reduce)return;
  const r=el('div'),d=el('div');r.id='fx-cursor';d.id='fx-cursor-dot';document.body.append(r,d);
  let rx=0,ry=0,tx=0,ty=0;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;d.style.opacity=r.style.opacity=1;d.style.transform=`translate(${tx}px,${ty}px)`;
    r.classList.toggle('hot',!!e.target.closest('button,a,select,input,[onclick]'))});
  (function f(){rx+=(tx-rx)*.16;ry+=(ty-ry)*.16;r.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(f)})();
  document.addEventListener('mouseleave',()=>d.style.opacity=r.style.opacity=0);
}

/* ---------- ticker + hero extras (new, decorative) ---------- */
function layoutExtras(){
  const hdr=$('header.sticky');
  const items=['💻 C PROGRAMMING','🐍 PYTHON','📐 MATHS & CALCULUS','🧪 ENGINEERING CHEMISTRY','📖 PROFESSIONAL ENGLISH','⚔ LIVE BATTLES','🔥 KEEP THE STREAK','🏆 CLIMB THE RANKS'];
  const row=items.map(t=>`<span>${t}</span><b>◆</b>`).join('');
  const t=el('div');t.id='fx-ticker';t.innerHTML=`<div>${row}${row}</div>`;
  hdr&&hdr.after(t);
  const hero=$('#tab-dashboard > div:first-child');
  if(hero){hero.classList.add('fx-hero');hero.append(el('div','fx-orb','<i></i><i></i><i></i>'));
    const h1=$('h1',hero);if(h1)h1.classList.add('fx-grad');}
  $$('#tab-dashboard .w-24').forEach(s=>s.classList.add('fx-stat'));
  $$('.rounded-full.font-mono').forEach(b=>b.classList.add('fx-badge'));
  $$('#tab-dashboard .text-3xl').forEach(i=>i.classList.add('fx-float'));
}

/* ---------- 3D tilt + spotlight cards ---------- */
const CARD_SEL='#tab-dashboard .grid>div,#subject-cards-container>div,#weak-topics-list>div,#tab-dashboard .md\\:flex-row,#tab-rankings>div,#tab-profile>div:first-child,#todo-items-list>div';
function decorate(root=document){
  $$(CARD_SEL,root).forEach(c=>{
    if(c.dataset.fx)return;c.dataset.fx=1;c.classList.add('fx-card');
    if(!touch&&!reduce){
      c.addEventListener('mousemove',e=>{const b=c.getBoundingClientRect(),px=(e.clientX-b.left)/b.width,py=(e.clientY-b.top)/b.height;
        c.style.setProperty('--mx',px*100+'%');c.style.setProperty('--my',py*100+'%');
        if(!c.querySelector('button,input,select,textarea,a,[onclick]')&&b.height>90)c.style.transform=`perspective(900px) rotateX(${(.5-py)*7}deg) rotateY(${(px-.5)*9}deg) translateZ(6px)`});
      c.addEventListener('mouseleave',()=>c.style.transform='');
    }
  });
  $$('.text-3xl',root).forEach(i=>{if(i.closest('#subject-cards-container'))i.classList.add('fx-float')});
}

/* ---------- ripple + magnetic buttons ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)/2.5,p=el('span','fx-ripple');
  p.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;
  if(getComputedStyle(b).overflow==='visible')b.style.overflow='hidden';
  b.append(p);setTimeout(()=>p.remove(),700);
  burst(e.clientX,e.clientY,10,false);
});

/* ---------- STAR particles (replaces confetti) ---------- */
let conf,cx,parts=[],raf=0;
function ensureConf(){if(conf)return;conf=el('canvas');conf.id='fx-conf';conf.width=innerWidth;conf.height=innerHeight;document.body.append(conf);cx=conf.getContext('2d');addEventListener('resize',()=>{conf.width=innerWidth;conf.height=innerHeight})}
const STAR_COLS=['#ffffff','#ffd1f0','#ff9ee6','#ff5ec4','#fde047','#7df3ff'];
function burst(x,y,n=60,big=true,colors){
  if(reduce)return;ensureConf();
  const C=colors||STAR_COLS;
  for(let i=0;i<n;i++){const a=Math.random()*6.28,v=(big?3:1.2)+Math.random()*(big?9:3);
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:.955,g:.035,r:(big?4:2)+Math.random()*(big?9:4),c:C[i%C.length],
      pts:Math.random()<.55?4:5,k:Math.random()<.5?.28:.45,rot:Math.random()*6,vr:(Math.random()-.5)*.1,tw:Math.random()*6,l:1,dec:.008+Math.random()*.01,trail:big&&Math.random()<.4})}
  if(big){parts.push({ring:1,x,y,r:6,l:1})}
  if(!raf)tick();
}
function tick(){
  cx.clearRect(0,0,conf.width,conf.height);
  parts=parts.filter(p=>{
    if(p.ring){p.r+=14;p.l-=.035;cx.save();cx.globalAlpha=Math.max(p.l,0);cx.strokeStyle='#ff9ee6';cx.lineWidth=2;cx.shadowBlur=20;cx.shadowColor='#ff2d95';cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);cx.stroke();cx.restore();return p.l>0}
    p.vx*=p.drag;p.vy=p.vy*p.drag+p.g;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.tw+=.25;p.l-=p.dec;
    const tw=.6+.4*Math.sin(p.tw);
    cx.save();cx.globalAlpha=Math.max(p.l,0)*tw+.1*Math.max(p.l,0);cx.fillStyle=p.c;cx.shadowBlur=14;cx.shadowColor=p.c;
    if(p.trail){cx.strokeStyle=p.c;cx.globalAlpha*=.5;cx.lineWidth=1.2;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*4,p.y-p.vy*4);cx.stroke();cx.globalAlpha=Math.max(p.l,0)*tw}
    drawStar(cx,p.x,p.y,p.r*(.7+.3*tw),p.pts,p.k,p.rot);cx.restore();
    return p.l>0&&p.y<conf.height+60});
  raf=parts.length?requestAnimationFrame(tick):0;
  if(!raf)cx.clearRect(0,0,conf.width,conf.height);
}
/* starfall: glowing shooting stars drifting down the screen */
function rain(ms=4000){const t=Date.now();ensureConf();(function f(){if(Date.now()-t>ms||reduce)return;
  const x=Math.random()*innerWidth;
  parts.push({x,y:-20,vx:(Math.random()-.5)*1.5,vy:2+Math.random()*3,drag:1,g:.02,r:3+Math.random()*7,c:STAR_COLS[Math.random()*6|0],pts:4,k:.3,rot:0,vr:.03,tw:Math.random()*6,l:1.6,dec:.004,trail:true});
  if(!raf)tick();setTimeout(f,70)})()}
function fireworks(n=7){for(let i=0;i<n;i++)setTimeout(()=>burst(innerWidth*(.15+Math.random()*.7),innerHeight*(.15+Math.random()*.4),55,true),i*380)}
/* cinematic letterbox bars */
function letterbox(ms=1600){if(reduce)return;const b=el('div','fx-lb','<i></i><i></i>');document.body.append(b);setTimeout(()=>b.classList.add('out'),ms);setTimeout(()=>b.remove(),ms+700)}
/* light-streak "warp" on tab change */
function warp(){if(reduce)return;const w=el('div','fx-warp');document.body.append(w);setTimeout(()=>w.remove(),800)}

window.FX={burst,rain,fireworks,letterbox};

/* ---------- animated counters ---------- */
function countUp(node){
  const raw=node.textContent.trim(),m=raw.match(/^(\d+)(.*)$/);if(!m||reduce)return;
  const end=+m[1],suf=m[2],t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);node.textContent=Math.round(end*e)+suf;if(k<1)requestAnimationFrame(f);else node.textContent=raw})(t0);
}
function dashCounters(){$$('#tab-dashboard .fx-stat .font-mono').forEach(n=>{if(n.children.length===0)countUp(n)});const s=$('#dash-streak-count');s&&countUp(s)}

/* ---------- tab + modal entrance via observers ---------- */
function watchTabs(){
  ['dashboard','bank','study','weak','rankings','profile'].forEach(id=>{
    const t=$('#tab-'+id);if(!t)return;
    let wasHidden=t.classList.contains('hidden');
    new MutationObserver(()=>{const h=t.classList.contains('hidden');const show=wasHidden&&!h;wasHidden=h;if(show){
      t.classList.remove('fx-enter');void t.offsetWidth;t.classList.add('fx-enter');warp();
      requestAnimationFrame(()=>{decorate(t);stagger(t);if(id==='dashboard')dashCounters()});
    }}).observe(t,{attributes:true,attributeFilter:['class']});
  });
  $$('[id$="-modal"]').forEach(m=>{
    let wasH=m.classList.contains('hidden');
    new MutationObserver(()=>{const h=m.classList.contains('hidden');const show=wasH&&!h;wasH=h;if(show){
      m.classList.remove('fx-backdrop');void m.offsetWidth;m.classList.add('fx-backdrop');
      const inner=m.firstElementChild;if(inner){inner.classList.remove('fx-pop');void inner.offsetWidth;inner.classList.add('fx-pop')}
      burst(innerWidth/2,innerHeight/2,14,false);
    }}).observe(m,{attributes:true,attributeFilter:['class']});
  });
}
function stagger(root){
  $$('.grid>div,#todo-items-list>div,#weak-topics-list>div,#linear-syllabus-content>*',root).forEach((c,i)=>c.style.setProperty('--i',i));
  $$('#tab-dashboard .grid>div',root).forEach((c,i)=>{c.classList.remove('fx-reveal');c.style.setProperty('--d',i*.09+'s');void c.offsetWidth;c.classList.add('fx-reveal');
    c.addEventListener('animationend',()=>{c.classList.remove('fx-reveal');c.style.opacity=1},{once:true})});
}

/* ---------- dynamic content (cards, lists, battle) ---------- */
function watchDynamic(){
  ['subject-cards-container','todo-items-list','weak-topics-list','syllabus-units-container','linear-syllabus-content','rankings-list'].forEach(id=>{
    const n=$('#'+id);if(!n)return;
    new MutationObserver(()=>{decorate(n.parentElement);stagger(n.parentElement)}).observe(n,{childList:true});
  });
  const arena=$('#live-battle-arena');if(!arena)return;
  let lastRound=0,lastVerdict='',combo=0,gameOver=false;
  new MutationObserver(()=>{
    if(arena.classList.contains('hidden')){gameOver=false;combo=0;lastRound=0;vg('');return}
    const rt=arena.textContent.match(/LEVEL\s+(\d+)\s*\/\s*17/);
    if(rt){const n=+rt[1];if(n!==lastRound){lastRound=n;gameOver=false;vg('');
      if(n===1){combo=0;letterbox(1400)}
      const r=el('div');r.id='fx-round';r.innerHTML=`<small>🔓 LEVEL UNLOCKED</small><b>LEVEL ${n}</b>`;document.body.append(r);setTimeout(()=>r.remove(),1050);lastVerdict=''}}
    const v=$('#feedback-verdict',arena);
    if(v&&v.textContent.trim()&&v.textContent!==lastVerdict){
      lastVerdict=v.textContent;
      const ok=/CORRECT/.test(v.textContent)&&!/INCORRECT/.test(v.textContent);
      vg(ok?'good':'bad');setTimeout(()=>vg(''),700);
      if(ok){combo++;const b=$('button.border-emerald-500',arena)||arena;const r=b.getBoundingClientRect();
        burst(r.left+r.width/2,r.top+r.height/2,70,true,['#ffffff','#fde68a','#6ee7b7','#ffd1f0','#ffb3e1']);
        const p=el('div');p.id='fx-float-pts';p.textContent='+ SCORE!';p.style.left=r.left+r.width/2-40+'px';p.style.top=r.top+'px';document.body.append(p);setTimeout(()=>p.remove(),1200);
        if(combo>=2){const c=el('div');c.id='fx-combo';c.textContent=`🔥 ${combo}x COMBO!`;document.body.append(c);setTimeout(()=>c.remove(),1300)}
      }else{combo=0;document.body.classList.add('anim-shake');setTimeout(()=>document.body.classList.remove('anim-shake'),450)}
    }
    const tt=$('#battle-timer-text',arena);
    if(tt){const low=+tt.textContent<=5&&!v?.textContent.trim();arena.classList.toggle('fx-danger',low);if(low)vg('warn');else if($('#fx-vignette').className==='warn')vg('')}
    if(!gameOver&&/Battle Concluded/.test(arena.textContent)){
      gameOver=true;vg('');letterbox(2600);const pod=$('.grid.grid-cols-3',arena);pod&&pod.classList.add('fx-podium');
      fireworks(8);setTimeout(()=>rain(4500),600);
    }
  }).observe(arena,{childList:true,subtree:true,characterData:true});
}
function vg(c){const v=$('#fx-vignette');if(v)v.className=c}

/* ---------- boot ---------- */
function boot(){
  intro();background();cursor();layoutExtras();decorate();watchTabs();watchDynamic();
  stagger(document);
  document.addEventListener('fx:ready',()=>{const t=$('#tab-dashboard');if(t){t.classList.add('fx-enter');dashCounters()}
    $$('#tab-dashboard .grid>div').forEach((c,i)=>{c.classList.add('fx-reveal');c.style.setProperty('--d',i*.1+'s');c.addEventListener('animationend',()=>{c.classList.remove('fx-reveal');c.style.opacity=1},{once:true})});
    burst(innerWidth/2,innerHeight*.3,60,true)});
  $$('#tab-dashboard #motto-quote-text').forEach(()=>{});
  const mq=$('#motto-quote-text');if(mq)new MutationObserver(()=>burst(innerWidth/2,innerHeight*.75,18,false)).observe(mq,{childList:true,characterData:true,subtree:true});
}
(document.readyState==='loading')?addEventListener('DOMContentLoaded',()=>setTimeout(boot,0)):setTimeout(boot,0);
})();

/* ===== CINEMA PACK: spotlight, chapter titles, dolly/glitch hits ===== */
(function(){
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,touch=matchMedia('(hover:none)').matches;
const b=document.body;
const add=(c,h)=>{const e=document.createElement('div');e.className=c;if(h)e.innerHTML=h;b.appendChild(e);return e};
add('fx-rays');
if(!touch&&!reduce){const sp=add('fx-spot');let tx=0,ty=0,x=0,y=0;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY});
  (function f(){x+=(tx-x)*.08;y+=(ty-y)*.08;sp.style.transform=`translate(${x-350}px,${y-350}px)`;requestAnimationFrame(f)})()}
const TITLES={dashboard:['HOME BASE','THE ARENA AWAITS'],bank:['QUESTION BANK','KNOWLEDGE VAULT'],study:['STUDY TIME','FOCUS MODE'],weak:['WEAK TOPICS','TURN WEAKNESS INTO POWER'],rankings:['RANKINGS','WHO RULES THE ARENA?'],profile:['PROFILE & PROGRESS','YOUR JOURNEY SO FAR']};
let first=true;
function chapter(id){if(first){first=false;return}if(reduce||!TITLES[id])return;
  const old=document.getElementById('fx-chapter');old&&old.remove();
  const c=add('','<small>'+TITLES[id][1]+'</small><b>'+TITLES[id][0]+'</b><i></i>');c.id='fx-chapter';setTimeout(()=>c.remove(),2000)}
const orig=window.switchTab;
if(typeof orig==='function')window.switchTab=function(id){const r=orig.apply(this,arguments);chapter(id);return r};
// hits: correct = dolly pulse + flash, wrong = RGB glitch
const vg=document.getElementById('fx-vignette');
if(vg)new MutationObserver(()=>{
  const arena=document.getElementById('live-battle-arena');if(!arena||reduce)return;
  if(vg.className==='good'){arena.animate([{transform:'scale(1)'},{transform:'scale(1.03)',filter:'brightness(1.3)'},{transform:'scale(1)'}],{duration:500,easing:'ease-out'});
    const f=add('fx-flash');setTimeout(()=>f.remove(),400)}
  if(vg.className==='bad'){arena.classList.add('fx-glitch');setTimeout(()=>arena.classList.remove('fx-glitch'),500)}
}).observe(vg,{attributes:true,attributeFilter:['class']});
// scroll reveal for anything newly added to the page content
if('IntersectionObserver' in window&&!reduce){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fx-in');io.unobserve(e.target)}}),{threshold:.08});
  const scan=()=>document.querySelectorAll('main .rounded-3xl:not([data-io])').forEach(n=>{n.dataset.io=1;if(n.getBoundingClientRect().top>innerHeight*.9){n.classList.add('fx-pre');io.observe(n)}});
  scan();setInterval(scan,1500)}
})();

/* ===== CYBER PACK: digital rain, glitch scan, HUD ===== */
(function(){
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;if(reduce)return;
const c=document.createElement('canvas');c.id='fx-rain';document.body.prepend(c);
const x=c.getContext('2d');let W,H,cols,drops;
const rs=()=>{W=c.width=innerWidth;H=c.height=innerHeight;cols=Math.floor(W/22);drops=Array.from({length:cols},()=>Math.random()*-60)};rs();addEventListener('resize',rs);
const G='01アイウエオカキクケコ⚡<>/{}$#@'.split('');
(function f(){x.fillStyle='rgba(5,3,12,.16)';x.globalCompositeOperation='destination-out';x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';
  x.font='14px JetBrains Mono, monospace';
  for(let i=0;i<cols;i++){const edge=Math.min(i,cols-i)/cols;if(edge>.16)continue; // only along screen edges
    const ch=G[Math.random()*G.length|0];x.fillStyle=Math.random()<.15?'#00e5ff':'#ff2d95';x.shadowBlur=8;x.shadowColor=x.fillStyle;
    x.fillText(ch,i*22,drops[i]*20);if(drops[i]*20>H&&Math.random()>.975)drops[i]=0;drops[i]+=.5}
  setTimeout(()=>requestAnimationFrame(f),45)})();
['tl','tr','bl','br'].forEach(k=>{const e=document.createElement('div');e.className='fx-hud '+k;document.body.appendChild(e)});
const sc=document.createElement('div');sc.className='fx-scan';document.body.appendChild(sc);
// random glitch burst on brand
setInterval(()=>{const b=document.querySelector('header .brand-glow');if(!b)return;b.classList.add('fx-glitch');setTimeout(()=>b.classList.remove('fx-glitch'),400)},7000);
})();
