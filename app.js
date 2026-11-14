'use strict';
const $=id=>document.getElementById(id), cats=['Geometrik örüntü','Görsel miktar','Sayısal mantık','Sözel mantık','Soyut sınıflandırma'], shapes=['▲','●','■','◆','✚','★','⬟','⬢'];
let bank=[],test=[],answers=[],idx=0,chosen=-1,mode='fixed',level=2,start=0,timer=null,history=JSON.parse(localStorage.getItem('nq-history')||'[]');
function dotsMarkup(count,size=54){
 let dots='';for(let i=0;i<count;i++)dots+='<i></i>';
 return '<span class="dot-card" style="width:'+size+'px;min-height:'+size+'px"><span class="dot-grid">'+dots+'</span></span>';
}
function polygonMarkup(sides,size=58){
 const pts=[];for(let i=0;i<sides;i++){const angle=-Math.PI/2+(2*Math.PI*i/sides);pts.push((32+24*Math.cos(angle)).toFixed(1)+','+(32+24*Math.sin(angle)).toFixed(1))}
 return '<svg class="geo-shape" width="'+size+'" height="'+size+'" viewBox="0 0 64 64" aria-label="'+sides+' köşeli şekil"><polygon points="'+pts.join(' ')+'" fill="rgba(88,166,255,.10)" stroke="#8fc5ff" stroke-width="2.8" stroke-linejoin="round"/></svg>';
}
function optionMarkup(q,x,i){
 const letter=String.fromCharCode(65+i);
 if(q.optionSides)return '<button class="option visual-option" onclick="choose('+i+')"><b>'+letter+'</b><span>'+polygonMarkup(Number(x),48)+'</span></button>';\n if(q.optionDots)return '<button class="option visual-option" onclick="choose('+i+')"><b>'+letter+'</b><span>'+dotsMarkup(Number(x),50)+'</span></button>';
 return '<button class="option" onclick="choose('+i+')"><b>'+letter+'</b> '+x+'</button>';
}
const mix=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function build(){
 let id=0;
 const directions=['↑','→','↓','←'];
 const relationSets=[
  [['kedi','yavru'],['köpek','yavru'],['at','tay'],['koyun','kuzu'],['inek','buzağı']],
  [['köpek','havlamak'],['kedi','miyavlamak'],['kuş','ötmek'],['aslan','kükremek'],['eşek','anırmak']],
  [['makas','kesmek'],['kalem','yazmak'],['süpürge','temizlemek'],['anahtar','açmak'],['cetvel','ölçmek']],
  [['marangoz','testere'],['terzi','iğne'],['doktor','stetoskop'],['ressam','fırça'],['çiftçi','saban']],
  [['kitap','sayfa'],['ağaç','dal'],['ev','oda'],['araba','tekerlek'],['bisiklet','pedal']]
 ];
 const makeOptions=(answer,others)=>{
  const out=[String(answer)];
  for(const x of mix(others.map(String))) if(!out.includes(x)){out.push(x);if(out.length===4)break}
  let k=1;while(out.length<4){let x=String(answer)+' '+k++;if(!out.includes(x))out.push(x)}
  return mix(out);
 };
 for(let d=1;d<=5;d++)for(let c=0;c<5;c++)for(let n=0;n<20;n++){
  const s=n+(d-1)*20;
  let q,opts,ans;
  if(c===0){
   const template=n%4;
   let base,steps;
   if(template===0){base=3+(s%2);steps=[1,1,1,1];}
   else if(template===1){base=8+(s%3);steps=[-1,-1,-1,-1];}
   else if(template===2){base=3+(s%2);steps=[2,2,2,2];}
   else {base=3+(s%2);steps=[1,2,1,2];}
   const vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k]);
   ans=String(vals[4]);
   opts=makeOptions(ans,[ans-1,ans+1,ans-2,ans+2,ans-3,ans+3].filter(x=>x>=3&&x<=12));
   q={v:'',a:ans,opts,visualSequence:vals.slice(0,4),optionSides:true,ex:['Her adımda köşe sayısı 1 artıyor.','Her adımda köşe sayısı 1 azalıyor.','Her adımda köşe sayısı 2 artıyor.','Köşe sayısı sırayla 1 ve 2 artıyor.'][template]};
  }else if(c===1){
   const template=n%4;
   let base,steps;
   if(template===0){base=2+(s%3);steps=[1,1,1,1];}
   else if(template===1){base=7+(s%3);steps=[-1,-1,-1,-1];}
   else if(template===2){base=1+(s%2);steps=[2,2,2,2];}
   else {base=2+(s%2);steps=[1,2,1,2];}
   const vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k]);
   ans=String(vals[4]);
   opts=makeOptions(ans,[ans-2,ans-1,ans+1,ans+2,ans+3].filter(x=>x>=1&&x<=9));
   q={v:'',a:ans,opts,visualCounts:vals.slice(0,4),optionDots:true,ex:['Her adımda bir nokta ekleniyor.','Her adımda bir nokta çıkarılıyor.','Her adımda iki nokta ekleniyor.','Nokta sayısı sırayla bir ve iki artıyor.'][template]};
  }else if(c===2){
   const template=n%4;
   let vals;
   if(template===0){const base=4+(s%19),step=2+(s%7)+Math.floor(d/2);vals=[0,1,2,3].map(k=>base+k*step);ans=base+4*step;}
   else if(template===1){const base=8+(s%13),a=2+(s%4),b=3+(s%5);vals=[base,base+a,base+a+b,base+2*a+b];ans=base+2*a+2*b;}
   else if(template===2){const base=2+(s%2),ratio=2+(s%2);vals=[base,base*ratio,base*ratio**2,base*ratio**3];ans=base*ratio**4;}
   else {const k=2+(s%10);vals=[k*k,(k+1)**2,(k+2)**2,(k+3)**2];ans=(k+4)**2;}
   opts=makeOptions(ans,[ans+1,ans-1,ans+2,ans*2,Math.max(0,ans-2)]);
   q={v:vals.join('　·　')+'　·　?',a:String(ans),opts,ex:['Dizi sabit miktarda artıyor.','Artış miktarları sırayla iki farklı değer arasında değişiyor.','Her terim bir öncekinin aynı sayı ile çarpılmasıyla bulunuyor.','Ardışık tam kare sayılar kullanılmış.'][template]};
  }else if(c===3){
   const g=(n+Math.floor((d-1)/2))%relationSets.length,group=relationSets[g];
   const pIndex=(n*2+d)%5,tIndex=(pIndex+1+(n%3))%5;
   const p=group[pIndex],t=group[tIndex];
   ans=t[1];
   opts=makeOptions(ans,group.filter((x,i)=>i!==tIndex).map(x=>x[1]));
   q={v:p[0]+' → '+p[1]+'\n'+t[0]+' → ?',a:ans,opts,ex:['Canlı ile yavrusu arasındaki ilişki korunur.','Canlının çıkardığı ses eşleştirilir.','Nesne ile yaptığı iş eşleştirilir.','Meslek ile kullanılan araç eşleştirilir.','Bütün ile onu oluşturan parça arasındaki ilişki korunur.'][g]};
  }else{
   const groups=[
    {same:['▲','■','◆','⬟','⬢'],odd:['●','★','✚']},
    {same:['●','○','◉','◎','◌'],odd:['▲','■','◆']},
    {same:['★','☆','✦','✧','✩'],odd:['●','▲','■']},
    {same:['■','□','▪','▫','▣'],odd:['●','★','▲']},
    {same:['▲','△','▴','▵','⟁'],odd:['●','■','★']}
   ];
   const group=groups[(n+ d)%groups.length],base=group.same[s%group.same.length],odd=group.odd[(s+d)%group.odd.length],at=(s*3+d)%4;
   const vals=[base,group.same[(s+1)%group.same.length],group.same[(s+2)%group.same.length],group.same[(s+3)%group.same.length]];
   vals[at]=odd;opts=mix(['1','2','3','4']);ans=String(at+1);
   q={v:vals.map((x,i)=>(i+1)+') '+x).join('　　'),a:ans,opts,ex:'Üç şekil aynı sınıfa ait; farklı sınıfa giren şeklin konumunu bul.'};
  }
  bank.push({id:id++,d,c,...q});
 }
}
function show(name){['home','quiz','result','history'].forEach(x=>$(x).classList.toggle('hidden',x!==name))}
function toIQ(score){return Math.round(70+(score/100)*60)}
function iqRank(iq){if(iq<85)return 'Ortalamanın altında';if(iq<115)return 'Ortalama aralığı';if(iq<130)return 'Ortalamanın üstünde';return 'Çok yüksek aralık'}
function iqComment(score){if(score<20)return 'Bugün beyin biraz tasarruf modunda. Sorun değil, en iyi fikirler bazen geç açılır.';if(score<40)return 'Mantık motoru çalışıyor; sadece vites henüz büyütülmemiş. Bir tur daha denemeye değer.';if(score<60)return 'Gayet dengeli! Beyin görevini yaptı, kahve molasını da hak etti.';if(score<80)return 'Güzel performans. Nöronlar toplantıyı yapmış, kararları da zamanında almış.';return 'Tebrikler! Bugün beyin mesaiye erken başlamış, çıkış saatini de unutmuş.'}
function updateHistory(){ $('recent').innerHTML=history.slice(0,3).map(x=>'<p>NEUROIQ '+(x.iq||toIQ(x.score))+' · '+(x.rank||iqRank(x.iq||toIQ(x.score)))+' · '+x.date+'</p>').join('')||'Henüz test yok.'}
function home(){clearInterval(timer);show('home');updateHistory()}
function startTest(m){
 mode=m;level=2;idx=0;answers=[];
 const seen=new Set(JSON.parse(localStorage.getItem('nq-seen')||'[]'));
 const used=new Set();test=[];
 for(let i=0;i<20;i++){
  const c=i%5,d=mode==='fixed'?Math.ceil((i+1)/4):level;
  let options=bank.filter(q=>q.c===c&&q.d===d&&!seen.has(q.id)&&!used.has(q.id));
  if(!options.length)options=bank.filter(q=>q.c===c&&!seen.has(q.id)&&!used.has(q.id));
  if(!options.length)options=bank.filter(q=>q.c===c&&!used.has(q.id));
  const q=mix(options)[0];
  if(!q)throw new Error('Bu test için benzersiz soru bulunamadı.');
  test.push(q);used.add(q.id);
 }
 start=Date.now();$('mode').textContent=m==='fixed'?'SABİT TEST':'ADAPTİF TEST';show('quiz');
 timer=setInterval(()=>{let s=Math.floor((Date.now()-start)/1000);$('clock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);
 render();
}
function render(){
 let q=test[idx];chosen=-1;$('qnum').textContent='SORU '+(idx+1)+' / 20';$('progress').style.width=(idx/20*100)+'%';$('cat').textContent=cats[q.c];$('diff').textContent=['','BAŞLANGIÇ','KOLAY','ORTA','ZOR','UZMAN'][q.d];
 $('question').textContent=q.c===0?'Şekil dizisinde köşe sayısındaki değişimi incele. Sıradaki şekil hangisi?':q.c===1?'Nokta sayısındaki değişimi incele. Sıradaki kartta kaç nokta olmalı?':['Sayı dizisindeki eksik değeri bul.','İlişkiyi aynı mantıkla tamamla.','Farklı olan şeklin numarasını seç.'][q.c-2];
 if(q.visualSequence){
  $('visual').innerHTML='<div class="shape-sequence">'+q.visualSequence.map((n,i)=>'<div class="shape-step">'+polygonMarkup(n,54)+'<small>'+(i+1)+'.</small></div>').join('<span class="shape-arrow">→</span>')+'<span class="shape-missing">?</span></div>';
 }else if(q.visualCounts){
  $('visual').innerHTML='<div class="shape-sequence">'+q.visualCounts.map((n,i)=>'<div class="shape-step">'+dotsMarkup(n,54)+'<small>'+(i+1)+'.</small></div>').join('<span class="shape-arrow">→</span>')+'<span class="shape-missing">?</span></div>';
 }else{$('visual').textContent=q.v}
 $('options').innerHTML=q.opts.map((x,i)=>optionMarkup(q,x,i)).join('');$('next').disabled=true;$('next').textContent=idx===19?'TESTİ BİTİR':'CEVABI ONAYLA';
}
function choose(i){if(chosen!==-1)return;if(!test[idx]||!test[idx].opts||i<0||i>=test[idx].opts.length)return;chosen=i;document.querySelectorAll('.option').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.disabled=true});next()}
function next(){if(chosen<0)return;let q=test[idx],ok=q.opts[chosen]===q.a;answers.push({c:q.c,ok});let seen=new Set(JSON.parse(localStorage.getItem('nq-seen')||'[]'));seen.add(q.id);localStorage.setItem('nq-seen',JSON.stringify([...seen]));if(mode==='adaptive')level=Math.max(1,Math.min(5,level+(ok?1:-1)));idx++;if(idx===20)finish();else render()}
function finish(){clearInterval(timer);let n=answers.filter(x=>x.ok).length,secs=Math.floor((Date.now()-start)/1000),score=n*5,iq=toIQ(score);$('score').textContent=iq;$('scoreSmall').textContent=score+'%';$('iqRank').textContent=iqRank(iq);$('iqMarker').style.left=((iq-70)/60*100)+'%';$('correct').textContent=n+'/20';$('duration').textContent=Math.floor(secs/60)+' dk '+secs%60+' sn';$('analysis').innerHTML=cats.map((c,i)=>'<p>'+c+' <b>'+answers.filter(x=>x.c===i&&x.ok).length+'/4</b></p>').join('');$('feedback').textContent=iqComment(score)+' Gösterilen değer, 70–130 aralığına ölçeklenmiş deneysel NEUROIQ endeksidir; standartlaştırılmış veya klinik IQ puanı değildir.';history.unshift({score,iq,rank:iqRank(iq),date:new Date().toLocaleDateString('tr-TR')});history=history.slice(0,50);localStorage.setItem('nq-history',JSON.stringify(history));show('result')}
function quit(){if(confirm('Testten çıkmak istiyor musun?'))home()}
function showHistory(){show('history');$('historyList').innerHTML=history.map(x=>'<p>NEUROIQ '+(x.iq||toIQ(x.score))+' · '+(x.rank||iqRank(x.iq||toIQ(x.score)))+' · '+x.date+'</p>').join('')||'Kayıt yok.'}
build();$('count').textContent=bank.length+' SORU';updateHistory();
// Inline HTML controls are explicitly exposed for mobile browsers.
window.startTest=startTest;window.choose=choose;window.next=next;window.quit=quit;window.home=home;window.showHistory=showHistory;
