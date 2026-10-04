(()=>{
  const root=document.documentElement,sections=[...document.querySelectorAll('.chapter')],dots=[...document.querySelectorAll('.chapter-dots a')];
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff=motionPreference.matches,active=0,frame=0,context=null;
  const timelines=new Map();
  const qs=s=>document.querySelector(s);
  const status=qs('#status');let statusTimer;
  function announce(message){status.textContent=message;clearTimeout(statusTimer);statusTimer=setTimeout(()=>status.textContent='',4500)}
  function animate(){
    context?.revert();context=null;timelines.clear();
    root.classList.toggle('no-motion',motionOff);
    qs('#motion').textContent=motionOff?'動き：OFF':'動き：ON';qs('#motion').setAttribute('aria-pressed',String(!motionOff));
    if(motionOff||!window.gsap||!window.ScrollTrigger)return;
    gsap.registerPlugin(ScrollTrigger);
    context=gsap.context(()=>{
      sections.forEach(section=>{
        const intro=section.querySelectorAll('.section-head > *, .cover-copy > *');
        gsap.fromTo(intro,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.75,ease:'power3.out',stagger:.09,scrollTrigger:{trigger:section,start:'top 62%',once:true}});
        const steps=[...section.querySelectorAll('.flow-step')];
        if(steps.length){
          const tl=gsap.timeline({defaults:{duration:.55,ease:'power3.out'},scrollTrigger:{trigger:section.querySelector('.flow'),start:'top 80%',once:true}});
          steps.forEach((el,index)=>tl.fromTo(el,{autoAlpha:0,y:13},{autoAlpha:1,y:0},index*.32));
          timelines.set(section.id,tl);
        }
        const reveals=[...section.querySelectorAll('[data-reveal]')];
        reveals.forEach((el,i)=>gsap.fromTo(el,{autoAlpha:0,y:23},{autoAlpha:1,y:0,duration:.7,ease:'power3.out',delay:innerWidth>760?(i%4)*.1:0,scrollTrigger:{trigger:el,start:'top 91%',once:true}}));
      });
    });
    document.fonts.ready.then(()=>ScrollTrigger.refresh());
  }
  function update(){
    frame=0;
    const limit=Math.max(1,document.documentElement.scrollHeight-innerHeight),progress=Math.max(0,Math.min(1,scrollY/limit));
    qs('.progress').style.transform=`scaleX(${progress})`;
    let index=0;sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=innerHeight*.45)index=i});
    if(active!==index){active=index;if(window.gsap&&!motionOff)gsap.to('.seed',{rotation:[-5,0,-4,3,-3,2,0,-4,3,-2,0][index%11],scale:1.08+(index%3)*.035,duration:1.2,ease:'power2.out',overwrite:'auto'})}
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===active);if(i===active)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')});
    qs('#counter').textContent=`${String(active+1).padStart(2,'0')} / ${sections.length}`;
    qs('#prev').disabled=active===0;qs('#next').disabled=active===sections.length-1;
  }
  function queueUpdate(){if(!frame)frame=requestAnimationFrame(update)}
  function go(index){sections[Math.max(0,Math.min(sections.length-1,index))].scrollIntoView({behavior:motionOff?'auto':'smooth',block:'start'})}
  qs('#prev').addEventListener('click',()=>go(active-1));qs('#next').addEventListener('click',()=>go(active+1));
  qs('#motion').addEventListener('click',()=>{motionOff=!motionOff;animate()});
  const onMotionChange=e=>{motionOff=e.matches;animate()};
  if(motionPreference.addEventListener)motionPreference.addEventListener('change',onMotionChange);else if(motionPreference.addListener)motionPreference.addListener(onMotionChange);
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(active+1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(active-1)}});
  document.querySelectorAll('.replay').forEach(b=>b.addEventListener('click',()=>{if(motionOff){announce('現在は動きを停止しています。左下の「動き：OFF」で切り替えられます。');return}timelines.get(b.closest('.chapter').id)?.restart()}));
  const scenarios=[{amount:'60',future:'54万円',paid:'0円',title:'一括受領時'},{amount:'33',future:'27万円',paid:'27万円',title:'12回精算後'},{amount:'6',future:'0円',paid:'54万円',title:'24回精算後'}];
  function setCash(index){const data=scenarios[index];qs('#cash-title').textContent=data.title;qs('#cash-amount').textContent=data.amount;qs('#cash-future').textContent=data.future;qs('#cash-paid').textContent=data.paid;document.querySelectorAll('[data-cash]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cash)===index)));document.querySelectorAll('.cash-column').forEach((b,i)=>b.dataset.active=String(i===index));if(window.gsap&&!motionOff)gsap.fromTo('.cash-inspector .amount',{autoAlpha:.3,y:8},{autoAlpha:1,y:0,duration:.4,ease:'power2.out'});}
  document.querySelectorAll('[data-cash]').forEach(b=>b.addEventListener('click',()=>setCash(Number(b.dataset.cash))));
  addEventListener('scroll',queueUpdate,{passive:true});addEventListener('resize',queueUpdate,{passive:true});
  addEventListener('beforeprint',()=>{document.querySelectorAll('.chapter [style]').forEach(el=>{if(el.style.opacity==='0')el.style.opacity='1'});setCash(0)});
  if(new URLSearchParams(location.search).has('print'))motionOff=true;
  try{animate()}catch(error){root.classList.add('no-motion');document.querySelectorAll('[data-reveal],.flow-step,.section-head > *,.cover-copy > *').forEach(el=>{el.style.opacity='1';el.style.visibility='visible';el.style.transform='none'});console.error(error)}update();
  window.__partnerDeck={get active(){return active},setCash,showAll(){motionOff=true;animate()},go};
})();
