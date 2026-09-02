/* assets/lernsession-engine.js – gemeinsame Engine der MT-Lernsession-Tools
   ---------------------------------------------------------------
   HUD (XP/Streak), Posten-Navigation und Auswertung sowie die häufig
   wiederkehrenden Posten-Typen (PDF, Video, Folien, Wahr/Falsch,
   Lückentext, Quiz, Beschriften, Erklären-Karten). Löst die bisher in
   jedem lernsession-*.html copy-paste eingebettete Engine ab.

   Die einbindende Seite deklariert wie bisher selbst:
     var MODE = /[?&]mode=challenge/.test(location.search) ? 'challenge' : 'lernpfad';
     var ALL = [ ... ];
     var STATIONS = ALL.filter(function(s){ ... });   // Modul-eigener Filter
     function buildBody(idx, st){ ... }                // Dispatch auf LSEngine.buildXxx()
                                                         // + eigene lokale build-Funktionen
   Reihenfolge am Ende der Seite:
     LSEngine.configure({ ... });
     LSEngine.initState();
     LSEngine.buildAll(); LSEngine.showCard(0); LSEngine.updateNav();

   API:
     LSEngine.configure({unitLabel, modeBanner:{pageTitle,subtitle,docTitle}, finish:{...}})
       modeBanner.pageTitle/subtitle/docTitle: function(mode) -> string
       finish.rank: function(pct) -> string
       finish.badges: function(pct) -> [{icon,name,got}, ...]
       finish.pointsWord: string, Default 'Punkte'
       finish.headerLabel: function(mode) -> string, Default Prüfung beendet/Geschafft
       finish.closingHtml: string, wird nach den Abzeichen eingefügt
       finish.backLink: false blendet den "Alle Lerntools"-Link aus (Default true)
     LSEngine.initState() – setzt N/current/solved/earned/maxPts/xp/streak/bestStreak
     LSEngine.buildAll() / .showCard(which) / .updateNav() / .renderProgress()
     LSEngine.goNext() / .goPrev() / .jumpTo(i) / .restart()
     LSEngine.findIdx(id) / .shuffle(a) / .shuffleIdx(n)
     LSEngine.addXp(n) / .registerAnswer(ok)
     LSEngine.buildPdf/.buildVideo/.buildSlides/.buildTF/.buildGaps/.buildQuiz/
       .buildLabelType/.buildLabelChoose/.buildExplain(idx, st)
       (buildTF: optional st.trueLabel/st.falseLabel statt "Wahr"/"Falsch")
     LSEngine.lbState/.lbFill/.lbClear/.lbUse/.lbReturn/.lbDrop/.lbOnDrop/
       .lbSelectChip/.lbClickBox – Drag&Drop-Baustein hinter buildLabelChoose,
       öffentlich für eigene Zuordnungs-Varianten (z. B. Tabellen-Zuordnung).
   --------------------------------------------------------------- */
(function(win){
  var CHECK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var unitLabel = 'Posten';
  var finishCfg = null;

  /* ---------- Utils ---------- */
  function findIdx(id){ for(var i=0;i<N;i++){ if(STATIONS[i].id===id) return i; } return -1; }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
  function shuffleIdx(n){ var a=[]; for(var i=0;i<n;i++) a.push(i); return shuffle(a); }
  function fold(s){ return String(s).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim(); }
  function matchKeys(input, it){ var f=fold(input); if(!f) return false; if(f===fold(it.name)) return true; for(var i=0;i<it.keys.length;i++){ if(f.indexOf(fold(it.keys[i]))!==-1) return true; } return false; }

  /* ---------- HUD / XP / Streak ---------- */
  function renderHud(){
    document.getElementById('hudXp').textContent = xp;
    var sc=0; for(var i=0;i<N;i++){ if(solved[i]) sc++; }
    document.getElementById('hudBar').style.width = Math.round(sc/N*100)+'%';
    document.getElementById('hudStreakNum').textContent = streak;
    var onFire = streak >= 3;
    document.getElementById('hudBar').classList.toggle('on-fire', onFire);
    document.getElementById('hudStreakEmoji').style.display = onFire ? 'none' : '';
    document.getElementById('hudFireWrap').style.display = onFire ? 'inline-block' : 'none';
    document.getElementById('hudStreakNum').className = onFire ? 'streak-num-fire' : '';
  }
  function addXp(n){ xp+=n; var el=document.getElementById('hudXp'); renderHud(); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  function showStreakPop(){ var el=document.createElement('span'); el.className='streak-pop'; el.textContent='+1 🔥'; document.getElementById('hudStreak').appendChild(el); setTimeout(function(){ el.remove(); }, 900); }
  function registerAnswer(ok){
    if(ok){ streak++; if(streak>bestStreak) bestStreak=streak; addXp(10+(streak>=3?5:0)); showStreakPop(); var s=document.getElementById('hudStreak'); s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); }
    else { streak=0; renderHud(); }
  }

  /* ---------- Setup ---------- */
  function configure(cfg){
    cfg = cfg || {};
    if(cfg.unitLabel) unitLabel = cfg.unitLabel;
    finishCfg = cfg.finish || null;
    var mb = cfg.modeBanner;
    if(mb){
      if(mb.pageTitle) document.getElementById('pageTitle').textContent = mb.pageTitle(MODE);
      if(mb.subtitle) document.getElementById('subtitle').textContent = mb.subtitle(MODE);
      if(mb.docTitle) document.title = mb.docTitle(MODE);
    }
    if(MODE==='challenge'){
      document.getElementById('lsDots').classList.add('selectable');
      document.querySelector('.ls-select-hint').classList.add('show');
      var hud=document.querySelector('.hud'); if(hud) hud.style.display='none';
    }
  }

  function initState(){
    win.N = STATIONS.length;
    win.current = 0;
    win.solved = []; win.earned = []; win.maxPts = [];
    for (var i = 0; i < N; i++) { solved[i] = false; earned[i] = 0; maxPts[i] = 0; }
    win.xp = 0; win.streak = 0; win.bestStreak = 0;
  }

  /* ---------- Posten-Rahmen ---------- */
  function buildAll(){
    var stage=document.getElementById('stage'); stage.innerHTML='';
    STATIONS.forEach(function(st, idx){
      var card=document.createElement('div');
      card.className='station'+(st.boss?' boss':'')+(idx===0?'':' hidden'); card.id='station-'+idx;
      card.innerHTML='<div class="station-kicker">'+st.kicker+'</div>'+
        '<div class="station-title">'+st.title+'</div>'+
        '<div class="station-lead">'+st.lead+'</div>'+
        (st.media?'<div class="station-media">'+st.media+'</div>':'')+
        '<div class="station-body" id="body-'+idx+'"></div>';
      stage.appendChild(card);
      buildBody(idx, st);
    });
    var fin=document.createElement('div'); fin.className='station hidden'; fin.id='station-finish';
    fin.innerHTML='<div class="finish" id="finishBody"></div>'; stage.appendChild(fin);
  }

  /* ---------- PDF / Video / Folien ---------- */
  function buildPdf(idx, st){
    maxPts[idx]=0;
    document.getElementById('body-'+idx).innerHTML=
      '<iframe src="'+st.src+'" class="pdf-frame"></iframe>'+
      '<p style="font-size:0.78rem;color:var(--text-muted);margin:6px 0 14px;">'+
        'PDF wird nicht angezeigt? <a href="'+st.src+'" target="_blank">Folien herunterladen</a></p>'+
      '<div class="read-btn-row"><button class="read-btn" id="pdfbtn-'+idx+'">'+
      '<div class="read-btn-icon">'+CHECK_SVG+'</div>'+
      '<span class="read-btn-text">Gelesen ✓ (+5 XP)</span></button></div>';
    document.getElementById('pdfbtn-'+idx).addEventListener('click', function(){
      if(solved[idx]) return; solved[idx]=true; addXp(5);
      this.disabled=true; this.classList.add('done');
      this.querySelector('.read-btn-text').textContent='Gelesen ✓';
      updateNav();
    });
  }

  function buildVideo(idx, st){
    maxPts[idx]=0;
    document.getElementById('body-'+idx).innerHTML=
      '<div style="width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;box-shadow:var(--shadow-md);margin-bottom:12px;">'+
      '<iframe width="100%" height="100%" src="'+st.src+'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="display:block;border:0;"></iframe></div>'+
      '<div class="read-btn-row"><button class="read-btn" id="vidbtn-'+idx+'">'+
      '<div class="read-btn-icon">'+CHECK_SVG+'</div>'+
      '<span class="read-btn-text">Gesehen ✓ (+5 XP)</span></button></div>';
    document.getElementById('vidbtn-'+idx).addEventListener('click', function(){
      if(solved[idx]) return; solved[idx]=true; addXp(5);
      this.disabled=true; this.classList.add('done');
      this.querySelector('.read-btn-text').textContent='Gesehen ✓';
      updateNav();
    });
  }

  function buildSlides(idx, st){
    maxPts[idx]=0;
    var cur=0;
    var slides=st.slides;
    var body=document.getElementById('body-'+idx);

    var html='<div class="slideshow" id="ssw-'+idx+'">';
    slides.forEach(function(sl,si){
      html+='<div class="slide-panel'+(si===0?' active':'')+'" id="ssp-'+idx+'-'+si+'">';
      html+='<div class="slide-header" style="background:'+sl.bg+';">';
      html+='<span class="slide-icon">'+sl.icon+'</span>';
      html+='<span class="slide-htitle" style="color:'+sl.color+';">'+sl.title+'</span>';
      html+='</div><div class="slide-body read">'+sl.body+'</div></div>';
    });
    html+='</div>';
    html+='<div class="slide-nav-row">';
    html+='<button class="slide-nav-btn" id="sprev-'+idx+'" disabled>← Zurück</button>';
    html+='<div style="display:flex;align-items:center;gap:8px;"><div class="slide-dots" id="sdots-'+idx+'"></div>';
    html+='<span class="slide-counter" id="sctr-'+idx+'"></span></div>';
    html+='<button class="slide-nav-btn" id="snext-'+idx+'">Weiter →</button>';
    html+='</div>';
    html+='<div class="read-btn-row" id="sbtnrow-'+idx+'" style="display:'+(slides.length<=1?'':'none')+'">';
    html+='<button class="read-btn" id="readbtn-'+idx+'">';
    html+='<div class="read-btn-icon">'+CHECK_SVG+'</div>';
    html+='<span class="read-btn-text">Gelesen ✓ (+5 XP)</span></button></div>';
    body.innerHTML=html;

    function renderDots(){
      var el=document.getElementById('sdots-'+idx); el.innerHTML='';
      slides.forEach(function(sl,si){
        var d=document.createElement('span'); d.className='slide-dot'+(si===cur?' active':si<cur?' done':'');
        d.addEventListener('click',function(){ if(si!==cur) go(si); });
        el.appendChild(d);
      });
      var ctr=document.getElementById('sctr-'+idx);
      if(ctr) ctr.textContent=(cur+1)+' / '+slides.length;
    }
    function renderNav(){
      document.getElementById('sprev-'+idx).disabled=(cur===0);
      document.getElementById('snext-'+idx).disabled=(cur===slides.length-1);
      var btnRow=document.getElementById('sbtnrow-'+idx);
      if(btnRow) btnRow.style.display=(cur===slides.length-1)?'':'none';
    }
    function go(newIdx){
      var dir=newIdx>cur?'right':'left';
      var panel=document.getElementById('ssp-'+idx+'-'+newIdx);
      slides.forEach(function(sl,si){ document.getElementById('ssp-'+idx+'-'+si).classList.remove('active','slide-in-right','slide-in-left'); });
      panel.classList.add('active',dir==='right'?'slide-in-right':'slide-in-left');
      cur=newIdx; renderDots(); renderNav();
    }
    renderDots(); renderNav();
    document.getElementById('sprev-'+idx).addEventListener('click',function(){ if(cur>0) go(cur-1); });
    document.getElementById('snext-'+idx).addEventListener('click',function(){ if(cur<slides.length-1) go(cur+1); });

    var tsX=0;
    document.getElementById('ssw-'+idx).addEventListener('touchstart',function(e){ tsX=e.touches[0].clientX; },{passive:true});
    document.getElementById('ssw-'+idx).addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].clientX-tsX;
      if(Math.abs(dx)>42){ if(dx<0&&cur<slides.length-1) go(cur+1); else if(dx>0&&cur>0) go(cur-1); }
    },{passive:true});

    document.getElementById('readbtn-'+idx).addEventListener('click',function(){
      if(solved[idx]) return; solved[idx]=true; addXp(5);
      this.disabled=true; this.classList.add('done');
      this.querySelector('.read-btn-text').textContent='Gelesen ✓';
      updateNav();
    });
  }

  /* ---------- Wahr/Falsch ---------- */
  function buildTF(idx, st){
    maxPts[idx]=st.items.length*0.5;
    var trueLabel = st.trueLabel || 'Wahr';
    var falseLabel = st.falseLabel || 'Falsch';
    var body=document.getElementById('body-'+idx);
    st.items.forEach(function(it, ii){
      var item=document.createElement('div'); item.className='tf-item';
      item.innerHTML='<div class="tf-statement">'+it.s+'</div>'+
        '<div class="tf-btns"><button class="tf-btn" data-i="'+ii+'" data-v="true">'+trueLabel+'</button>'+
        '<button class="tf-btn" data-i="'+ii+'" data-v="false">'+falseLabel+'</button></div>'+
        '<div class="tf-exp" id="tfexp-'+idx+'-'+ii+'">'+it.e+'</div>';
      body.appendChild(item);
    });
    body.querySelectorAll('.tf-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var ii=+btn.dataset.i; var pick=btn.dataset.v==='true';
        if(body.querySelector('.tf-btn[data-i="'+ii+'"]:disabled')) return;
        var it=st.items[ii];
        body.querySelectorAll('.tf-btn[data-i="'+ii+'"]').forEach(function(b){ b.disabled=true; if((b.dataset.v==='true')===it.a) b.classList.add('reveal'); });
        if(pick===it.a){ btn.classList.add('sel-correct'); earned[idx]+=0.5; registerAnswer(true); } else { btn.classList.add('sel-wrong'); registerAnswer(false); }
        document.getElementById('tfexp-'+idx+'-'+ii).classList.add('show');
        var answered=0; for(var k=0;k<st.items.length;k++){ if(document.querySelector('#body-'+idx+' .tf-btn[data-i="'+k+'"]:disabled')) answered++; }
        if(answered===st.items.length) solved[idx]=true;
        updateNav();
      });
    });
  }

  /* ---------- Lückentext ---------- */
  function buildGaps(idx, st){
    var gapCount=0; var html='<div class="gap-text">';
    st.parts.forEach(function(part){
      if(typeof part==='string'){ html+=part; }
      else { var gi=gapCount++; var opts=shuffleIdx(part.opts.length);
        html+='<select data-g="'+gi+'" data-correct="'+part.correct+'"><option value="-1">…</option>';
        opts.forEach(function(oi){ html+='<option value="'+oi+'">'+part.opts[oi]+'</option>'; });
        html+='</select>';
      }
    });
    html+='</div><div class="check-btn-row"><button class="btn btn-primary" id="gapcheck-'+idx+'">Prüfen</button></div>';
    document.getElementById('body-'+idx).innerHTML=html;
    maxPts[idx]=gapCount*0.5;
    document.getElementById('gapcheck-'+idx).addEventListener('click', function(){
      if(solved[idx]) return;
      var sels=document.querySelectorAll('#body-'+idx+' select'); var ok=0;
      sels.forEach(function(sel){ sel.classList.remove('correct','wrong'); var good=(+sel.value===+sel.dataset.correct); if(good){sel.classList.add('correct'); ok++;} else sel.classList.add('wrong'); sel.disabled=true; registerAnswer(good); });
      earned[idx]=ok*0.5; solved[idx]=true; this.disabled=true; updateNav();
    });
  }

  /* ---------- Quiz ---------- */
  function buildQuiz(idx, st){
    maxPts[idx]=st.questions.length*0.5;
    var body=document.getElementById('body-'+idx);
    st.questions.forEach(function(qq, qi){
      var block=document.createElement('div'); block.className='q-block';
      var h='<div class="q-text">'+(qi+1)+'. '+qq.q+'</div>';
      shuffleIdx(qq.opts.length).forEach(function(oi){ h+='<button class="opt" data-q="'+qi+'" data-o="'+oi+'">'+qq.opts[oi]+'</button>'; });
      block.innerHTML=h; body.appendChild(block);
    });
    body.querySelectorAll('.opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        var qi=+btn.dataset.q, oi=+btn.dataset.o, qq=st.questions[qi];
        if(body.querySelector('.opt[data-q="'+qi+'"]:disabled')) return;
        body.querySelectorAll('.opt[data-q="'+qi+'"]').forEach(function(b){ b.disabled=true; if(+b.dataset.o===qq.correct) b.classList.add('correct'); });
        if(oi!==qq.correct){ btn.classList.add('wrong'); registerAnswer(false); } else { earned[idx]+=0.5; registerAnswer(true); }
        var answered=0; for(var k=0;k<st.questions.length;k++){ if(document.querySelector('#body-'+idx+' .opt[data-q="'+k+'"]:disabled')) answered++; }
        if(answered===st.questions.length) solved[idx]=true;
        updateNav();
      });
    });
  }

  /* ---------- Beschriften – Challenge: eintippen ---------- */
  function buildLabelType(idx, st){
    maxPts[idx]=st.items.length*0.5;
    var html='<div class="slots-grid">';
    st.items.forEach(function(it){
      html+='<div class="slot-row"><div class="slot-num">'+it.n+'</div><div class="type-cell">'+
        '<input class="type-input" id="lb-'+idx+'-'+it.n+'" type="text" autocomplete="off" placeholder="Nr. '+it.n+' …">'+
        '<div class="type-sol" id="lbsol-'+idx+'-'+it.n+'" style="display:none;"></div></div></div>';
    });
    html+='</div><div class="check-btn-row"><button class="btn btn-primary" id="lbcheck-'+idx+'">Überprüfen</button></div>';
    document.getElementById('body-'+idx).innerHTML=html;
    st.items.forEach(function(it, i){
      document.getElementById('lb-'+idx+'-'+it.n).addEventListener('keydown', function(e){
        if(e.key==='Enter'){ e.preventDefault(); var nx=st.items[i+1]; if(nx) document.getElementById('lb-'+idx+'-'+nx.n).focus(); }
      });
    });
    document.getElementById('lbcheck-'+idx).addEventListener('click', function(){
      if(solved[idx]) return; var correct=0;
      st.items.forEach(function(it){
        var inp=document.getElementById('lb-'+idx+'-'+it.n); var sol=document.getElementById('lbsol-'+idx+'-'+it.n);
        inp.classList.remove('correct','wrong');
        var ok=matchKeys(inp.value, it);
        if(ok){ inp.classList.add('correct'); sol.style.display='none'; correct++; } else { inp.classList.add('wrong'); sol.textContent='→ '+it.name; sol.style.display='block'; }
        registerAnswer(ok);
      });
      earned[idx]=correct*0.5; solved[idx]=true; this.disabled=true; updateNav();
    });
  }

  /* ---------- Beschriften – Lernpfad: Drag & Drop ----------
     Öffentlich (lbState/lbFill/…/lbClickBox), weil eigene Zuordnungs-
     Varianten (z. B. eine Tabellen-Zuordnung) denselben Baustein
     wiederverwenden. */
  var lbState={word:null,src:null,bank:null,sel:null,selChip:null};
  function lbOnDrop(box, word, source){
    if(box.classList.contains('correct')||box.classList.contains('wrong')) return;
    var disp=box.dataset.filled||null;
    if(source.isSlot){ lbClear(source.el); if(disp) lbFill(source.el,disp); }
    else { lbUse(word,lbState.bank); if(disp) lbReturn(disp,lbState.bank); }
    lbFill(box,word);
  }
  function lbFill(box,word){ box.dataset.filled=word; box.textContent=word; box.className='lb-slot lb-filled'; box.setAttribute('draggable','true'); }
  function lbClear(box){ delete box.dataset.filled; box.textContent='—'; box.className='lb-slot'; box.setAttribute('draggable','false'); }
  function lbUse(word,bank){ var ok=false; bank.querySelectorAll('.lb-chip').forEach(function(c){ if(!ok&&c.dataset.word===word&&!c.classList.contains('used')){c.classList.add('used');ok=true;} }); }
  function lbReturn(word,bank){ var ok=false; bank.querySelectorAll('.lb-chip').forEach(function(c){ if(!ok&&c.dataset.word===word&&c.classList.contains('used')){c.classList.remove('used');ok=true;} }); }
  function lbDrop(box){
    if(!lbState.word||box.classList.contains('correct')||box.classList.contains('wrong')) return;
    var disp=box.dataset.filled||null;
    if(lbState.src&&lbState.src.classList.contains('lb-slot')){ lbClear(lbState.src); if(disp) lbFill(lbState.src,disp); }
    else { lbUse(lbState.word,lbState.bank); if(disp) lbReturn(disp,lbState.bank); }
    lbFill(box,lbState.word); lbState.word=lbState.src=null;
  }
  function lbSelectChip(chip,word,bank){
    if(chip.classList.contains('selected')){ chip.classList.remove('selected'); lbState.sel=null; lbState.selChip=null; document.querySelectorAll('.lb-slot.lb-ready').forEach(function(b){b.classList.remove('lb-ready');}); return; }
    document.querySelectorAll('.lb-chip.selected').forEach(function(c){c.classList.remove('selected');});
    chip.classList.add('selected'); lbState.sel=word; lbState.selChip=chip; lbState.bank=bank;
    document.querySelectorAll('.lb-slot').forEach(function(b){ b.classList.remove('lb-ready'); if(!b.dataset.filled&&!b.classList.contains('correct')&&!b.classList.contains('wrong')) b.classList.add('lb-ready'); });
  }
  function lbClickBox(box,bank){
    if(box.classList.contains('correct')||box.classList.contains('wrong')) return;
    if(box.dataset.filled){ lbReturn(box.dataset.filled,bank); lbClear(box); if(lbState.sel) box.classList.add('lb-ready'); return; }
    if(!lbState.sel) return;
    lbFill(box,lbState.sel); lbUse(lbState.sel,bank); lbState.sel=null;
    if(lbState.selChip){lbState.selChip.classList.remove('selected');lbState.selChip=null;}
    document.querySelectorAll('.lb-slot.lb-ready').forEach(function(b){b.classList.remove('lb-ready');});
  }
  function buildLabelChoose(idx,st){
    maxPts[idx]=st.items.length*0.5;
    var names=st.items.map(function(it){return it.name;}).filter(function(v,i,a){return a.indexOf(v)===i;});
    var body=document.getElementById('body-'+idx);
    var bank=document.createElement('div'); bank.className='lb-bank';
    shuffle(names).forEach(function(word){
      var chip=document.createElement('span'); chip.className='lb-chip'; chip.textContent=word; chip.dataset.word=word; chip.setAttribute('draggable','true');
      chip.addEventListener('dragstart',function(e){lbState.word=word;lbState.src=chip;lbState.bank=bank;e.dataTransfer.effectAllowed='move';});
      chip.addEventListener('touchstart',function(e){lbState.bank=bank;MTDnD.touchStart(e,chip,word,false,'.lb-slot',lbOnDrop);},{passive:false});
      chip.addEventListener('click',function(){lbSelectChip(chip,word,bank);});
      bank.appendChild(chip);
    });
    body.appendChild(bank);
    var grid=document.createElement('div'); grid.className='slots-grid';
    st.items.forEach(function(p){
      var row=document.createElement('div'); row.className='slot-row';
      var badge=document.createElement('div'); badge.className='slot-num'; badge.textContent=p.n;
      var box=document.createElement('div'); box.className='lb-slot'; box.dataset.slot=p.n; box.textContent='—';
      box.addEventListener('dragover',function(e){e.preventDefault();if(!box.classList.contains('correct')&&!box.classList.contains('wrong'))box.classList.add('lb-over');});
      box.addEventListener('dragleave',function(){box.classList.remove('lb-over');});
      box.addEventListener('drop',function(e){e.preventDefault();box.classList.remove('lb-over');lbDrop(box);});
      box.addEventListener('dragstart',function(e){if(!box.dataset.filled){e.preventDefault();return;}lbState.word=box.dataset.filled;lbState.src=box;lbState.bank=bank;e.dataTransfer.effectAllowed='move';});
      box.addEventListener('touchstart',function(e){if(!box.dataset.filled)return;lbState.bank=bank;MTDnD.touchStart(e,box,box.dataset.filled,true,'.lb-slot',lbOnDrop);},{passive:false});
      box.addEventListener('click',function(){lbClickBox(box,bank);});
      row.appendChild(badge);row.appendChild(box);grid.appendChild(row);
    });
    body.appendChild(grid);
    var checkBtn=document.createElement('button'); checkBtn.className='btn btn-primary'; checkBtn.style.marginTop='12px';
    checkBtn.textContent='Überprüfen';
    checkBtn.addEventListener('click',function(){
      if(solved[idx]) return; var correct=0;
      st.items.forEach(function(p){
        var box=grid.querySelector('[data-slot="'+p.n+'"]');
        box.classList.remove('lb-filled','lb-over','lb-ready');
        if(box.dataset.filled===p.name){box.classList.add('correct');correct++;}else{box.classList.add('wrong');}
      });
      earned[idx]=correct*0.5; solved[idx]=true; checkBtn.disabled=true; updateNav();
    });
    body.appendChild(checkBtn);
  }

  /* ---------- Erklären – Flip-Karte: Frage vorne, Musterlösung hinten,
     nach dem Umdrehen selbst einschätzen (Wusste ich / Nochmal üben) ---------- */
  function buildExplain(idx, st){
    maxPts[idx]=st.cards.length;
    var body=document.getElementById('body-'+idx);
    var cur=0, isFlipped=false;
    var rated=[]; for(var i=0;i<st.cards.length;i++) rated[i]=null;

    body.innerHTML =
      '<div class="exp-counter" id="expctr-'+idx+'"></div>'+
      '<div class="exp-scene" id="expscene-'+idx+'"><div class="exp-flip" id="expflip-'+idx+'">'+
        '<div class="exp-face exp-front"><div class="exp-q-text" id="expq-'+idx+'"></div>'+
        '<div class="exp-hint">Karte umdrehen für die Musterlösung</div></div>'+
        '<div class="exp-face exp-back"><div class="exp-a-text" id="expa-'+idx+'"></div></div>'+
      '</div></div>'+
      '<div class="exp-controls">'+
        '<button class="btn btn-ghost" id="expprev-'+idx+'">← Zurück</button>'+
        '<button class="btn btn-success" id="expflipbtn-'+idx+'">Umdrehen</button>'+
        '<button class="btn btn-ghost" id="expnext-'+idx+'">Weiter →</button>'+
      '</div>'+
      '<div class="exp-rate-row" id="exprate-'+idx+'" style="visibility:hidden;"></div>';

    function renderRate(){
      var row=document.getElementById('exprate-'+idx);
      if(rated[cur]===null){
        row.innerHTML='<button class="exp-rate-btn rate-good" id="expgood-'+idx+'">Wusste ich ✓</button>'+
          '<button class="exp-rate-btn rate-bad" id="expbad-'+idx+'">Nochmal üben</button>';
        document.getElementById('expgood-'+idx).addEventListener('click', function(e){ e.stopPropagation(); rate(true); });
        document.getElementById('expbad-'+idx).addEventListener('click', function(e){ e.stopPropagation(); rate(false); });
      } else {
        row.innerHTML='<button class="exp-rate-btn rated '+(rated[cur]?'picked-good':'picked-bad')+'" disabled>'+(rated[cur]?'Wusste ich ✓':'Nochmal üben')+'</button>';
      }
    }

    function rate(ok){
      if(rated[cur]!==null) return;
      rated[cur]=ok; registerAnswer(ok);
      var doneCount=0, goodCount=0;
      rated.forEach(function(r){ if(r!==null) doneCount++; if(r===true) goodCount++; });
      earned[idx]=goodCount;
      if(doneCount===st.cards.length) solved[idx]=true;
      renderRate(); updateNav();
    }

    function show(){
      var c=st.cards[cur];
      document.getElementById('expq-'+idx).textContent=c.q;
      document.getElementById('expa-'+idx).textContent=c.a;
      document.getElementById('expctr-'+idx).textContent='Karte '+(cur+1)+' von '+st.cards.length;
      document.getElementById('expprev-'+idx).disabled=(cur===0);
      isFlipped=false; document.getElementById('expflip-'+idx).classList.remove('flipped');
      document.getElementById('exprate-'+idx).style.visibility='hidden';
      renderRate();
    }

    function flip(){
      isFlipped=!isFlipped;
      document.getElementById('expflip-'+idx).classList.toggle('flipped');
      document.getElementById('exprate-'+idx).style.visibility=isFlipped?'visible':'hidden';
    }

    document.getElementById('expscene-'+idx).addEventListener('click', flip);
    document.getElementById('expflipbtn-'+idx).addEventListener('click', function(e){ e.stopPropagation(); flip(); });
    document.getElementById('expnext-'+idx).addEventListener('click', function(e){ e.stopPropagation(); cur=(cur+1)%st.cards.length; show(); });
    document.getElementById('expprev-'+idx).addEventListener('click', function(e){ e.stopPropagation(); if(cur>0){ cur--; show(); } });

    show();
  }

  /* ---------- Navigation / Auswertung ---------- */
  function renderProgress(){
    var dots=document.getElementById('lsDots'); dots.innerHTML='';
    for(var i=0;i<N;i++){
      var d=document.createElement('div');
      d.className='ls-dot'+(i===current?' active':'')+(solved[i]?' done':'');
      d.textContent=solved[i]?'✓':(i+1);
      if(MODE==='challenge'){
        d.title=STATIONS[i].kicker+' – '+STATIONS[i].title;
        d.addEventListener('click', (function(ii){ return function(){ jumpTo(ii); }; })(i));
      }
      dots.appendChild(d);
    }
    document.getElementById('lsMeta').textContent = (current<N) ? (unitLabel+' '+(current+1)+' von '+N) : 'Auswertung';
  }
  function jumpTo(i){
    if(i===current) return;
    current=i; showCard(i); updateNav();
  }
  function showCard(which){
    document.querySelectorAll('.station').forEach(function(c){ c.classList.add('hidden'); });
    document.getElementById(which==='finish'?'station-finish':'station-'+which).classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function updateNav(){
    var nextBtn=document.getElementById('nextBtn'), prevBtn=document.getElementById('prevBtn');
    prevBtn.style.visibility=(current===0)?'hidden':'visible';
    if(current<N){ nextBtn.disabled=!solved[current]; nextBtn.textContent=(current===N-1)?'Zur Auswertung →':'Weiter →'; }
    renderProgress(); renderHud();
  }
  function goNext(){ if(current<N){ if(!solved[current]) return; current++; if(current<N){ showCard(current); updateNav(); } else { showFinish(); } } }
  function goPrev(){ if(current===0) return; if(current>=N) current=N-1; else current--; showCard(current); document.getElementById('nextBtn').style.visibility='visible'; document.getElementById('nextBtn').disabled=false; updateNav(); }

  function showFinish(){
    var cfg = finishCfg || {};
    var total=0, max=0, expGood=0, expTotal=0;
    for(var i=0;i<N;i++){
      if(STATIONS[i].type==='explain'){ expGood+=earned[i]; expTotal+=maxPts[i]; }
      else { total+=earned[i]; max+=maxPts[i]; }
    }
    var pct=max>0?Math.round(total/max*100):0;
    var rank = cfg.rank ? cfg.rank(pct) : '';
    var badges = cfg.badges ? cfg.badges(pct) : [];
    var got=0, bh=''; badges.forEach(function(b){ if(b.got) got++; bh+='<span class="badge-chip'+(b.got?' earned':'')+'">'+(b.got?b.icon:'<span class="lock">🔒</span>')+' '+b.name+'</span>'; });

    var pointsWord = cfg.pointsWord || 'Punkte';
    var headline, scoreSub, explainNote='', breakdown='';
    if(MODE==='challenge'){
      var note = max>0 ? Math.round((1 + total/max*5)*10)/10 : 1;
      headline = '<div class="big-score">Note '+note.toFixed(1)+'</div>';
      scoreSub = '<div class="score-sub">'+total+' / '+max+' Punkte ('+pct+' %) · simulierte Note, keine offizielle Bewertung</div>';
      if(expTotal>0) explainNote = '<div class="score-sub">Erklären-Karten: '+expGood+' von '+expTotal+' selbst als «gewusst» eingeschätzt (nicht in der Note)</div>';
      breakdown='<ul class="score-breakdown">';
      for(var bi=0;bi<N;bi++){
        if(STATIONS[bi].type==='explain') continue;
        breakdown+='<li><span>'+STATIONS[bi].title+'</span><span>'+earned[bi]+' / '+maxPts[bi]+' P.</span></li>';
      }
      breakdown+='</ul>';
    } else {
      headline = '<div class="rank">'+rank+'</div><div class="big-score">'+xp+' XP</div>';
      scoreSub = '<div class="score-sub">'+total+' / '+max+' '+pointsWord+' ('+pct+' %) · längste Serie 🔥 '+bestStreak+' · '+got+'/'+badges.length+' Abzeichen</div>';
    }
    var headerLabel = cfg.headerLabel ? cfg.headerLabel(MODE) : (MODE==='challenge'?'Prüfung beendet':'Geschafft');
    var closingHtml = cfg.closingHtml || '';
    var backLinkHtml = (cfg.backLink===false) ? '' : '<a class="back-link" href="../index.html" style="display:block;margin-top:14px;">← Alle Lerntools</a>';
    document.getElementById('finishBody').innerHTML=
      '<div class="station-kicker">'+headerLabel+'</div>'+
      headline+
      scoreSub+
      explainNote+
      breakdown+
      '<div class="badges">'+bh+'</div>'+
      closingHtml+
      '<button class="btn btn-primary" onclick="LSEngine.restart()">Nochmals starten</button>'+
      backLinkHtml;
    showCard('finish');
    document.getElementById('nextBtn').style.visibility='hidden';
    document.getElementById('prevBtn').style.visibility='visible';
    renderProgress();
  }

  function restart(){
    current=0; xp=0; streak=0; bestStreak=0;
    for(var i=0;i<N;i++){ solved[i]=false; earned[i]=0; }
    document.getElementById('nextBtn').style.visibility='visible';
    buildAll(); showCard(0); updateNav();
  }

  win.LSEngine = {
    configure: configure,
    initState: initState,
    findIdx: findIdx,
    shuffle: shuffle,
    shuffleIdx: shuffleIdx,
    addXp: addXp,
    registerAnswer: registerAnswer,
    buildAll: buildAll,
    renderProgress: renderProgress,
    jumpTo: jumpTo,
    showCard: showCard,
    updateNav: updateNav,
    goNext: goNext,
    goPrev: goPrev,
    restart: restart,
    buildPdf: buildPdf,
    buildVideo: buildVideo,
    buildSlides: buildSlides,
    buildTF: buildTF,
    buildGaps: buildGaps,
    buildQuiz: buildQuiz,
    buildLabelType: buildLabelType,
    buildLabelChoose: buildLabelChoose,
    buildExplain: buildExplain,
    lbState: lbState,
    lbFill: lbFill,
    lbClear: lbClear,
    lbUse: lbUse,
    lbReturn: lbReturn,
    lbDrop: lbDrop,
    lbOnDrop: lbOnDrop,
    lbSelectChip: lbSelectChip,
    lbClickBox: lbClickBox
  };
})(window);
