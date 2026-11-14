'use strict';
const $=id=>document.getElementById(id), cats=['Görsel örüntü','Uzamsal algı','Sayısal mantık','Sözel mantık','Soyut sınıflandırma'], shapes=['▲','●','■','◆','✚','★','⬟','⬢'];
let bank=[],test=[],answers=[],idx=0,chosen=-1,mode='fixed',level=2,start=0,timer=null,history=JSON.parse(localStorage.getItem('nq-history')||'[]');
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
   const start=(s*3+d)%8,template=n%4;
   let steps;
   if(template===0){const step=1+(s%3);steps=[step,step,step,step];}
   else if(template===1){const a=1+(s%2),b=3+(s%2);steps=[a,b,a,b];}
   else if(template===2){const a=1+(s%3);steps=[a,a+1,a+2,a+3];}
   else {const step=1+(s%3);steps=[step,-step,step,-step];}
   const vals=[start];for(let k=0;k<3;k++)vals.push((vals[k]+steps[k]+16)%8);
   ans=shapes[(vals[3]+steps[3]+16)%8];
   opts=makeOptions(ans,shapes.filter(x=>x!==ans));
   q={v:vals.map((x,i)=>(i+1)+') '+shapes[x]).join('  →  ')+'  →  5) ?',a:ans,opts,ex:['Şekiller her adımda aynı sayıda ilerliyor.','İleri ve geri adımlar sırayla uygulanıyor.','İlerleme miktarı her adımda bir artıyor.','Şekiller sırayla ileri ve geri hareket ediyor.'][template]};
  }else if(c===1){
   const from=(s+d)%4,template=n%4;
   let turns;
   if(template===0){const t=1+(s%3);turns=[t,t,t,t];}
   else if(template===1){const a=1+(s%2),b=3-a;turns=[a,b,a,b];}
   else if(template===2){const t=1+(s%2);turns=[t,t+1,t+2,t+3];}
   else {const t=1+(s%3);turns=[t,-t,t,-t];}
   const vals=[from];for(let k=0;k<3;k++)vals.push((vals[k]+turns[k]+8)%4);
   ans=directions[(vals[3]+turns[3]+8)%4];
   opts=mix(directions);
   q={v:vals.map((x,i)=>(i+1)+') '+directions[x]).join('  →  ')+'  →  5) ?',a:ans,opts,ex:['Her adımda aynı yönde aynı miktarda dönülüyor.','Saat yönü ve ters yön dönüşleri sırayla değişiyor.','Dönüş miktarı her adımda bir çeyrek tur artıyor.','Saat yönü ve ters yön dönüşleri sırayla uygulanıyor.'][template]};
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
function iqRank(score){if(score<20)return 'Şempanze modu 🐒';if(score<40)return 'Normal 🙂';if(score<60)return 'Akıllı 🧠';if(score<80)return 'Zeki ⚡';return 'Dahi 🏆'}
function iqComment(score){if(score<20)return 'Bugün beyin biraz tasarruf modunda. Sorun değil, en iyi fikirler bazen geç açılır.';if(score<40)return 'Mantık motoru çalışıyor; sadece vites henüz büyütülmemiş. Bir tur daha denemeye değer.';if(score<60)return 'Gayet dengeli! Beyin görevini yaptı, kahve molasını da hak etti.';if(score<80)return 'Güzel performans. Nöronlar toplantıyı yapmış, kararları da zamanında almış.';return 'Tebrikler! Bugün beyin mesaiye erken başlamış, çıkış saatini de unutmuş.'}
function updateHistory(){ $('recent').innerHTML=history.slice(0,3).map(x=>'<p>'+x.score+'/100 · IQ endeksi '+(x.rank||iqRank(x.score))+' · '+x.date+'</p>').join('')||'Henüz test yok.'}
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
function render(){let q=test[idx];chosen=-1;$('qnum').textContent='SORU '+(idx+1)+' / 20';$('progress').style.width=(idx/20*100)+'%';$('cat').textContent=cats[q.c];$('diff').textContent=['','BAŞLANGIÇ','KOLAY','ORTA','ZOR','UZMAN'][q.d];$('question').textContent=['Soldan sağa ilerleyen şekil dizisinde 5. sıraya hangi şekil gelmeli?','Dönüş kuralına göre sonraki yönü seç.','Sayı dizisindeki eksik değeri bul.','İlişkiyi aynı mantıkla tamamla.','Farklı olan şeklin numarasını seç.'][q.c];$('visual').textContent=q.v;$('options').innerHTML=q.opts.map((x,i)=>'<button class="option" onclick="choose('+i+')"><b>'+String.fromCharCode(65+i)+'</b> '+x+'</button>').join('');$('next').disabled=true;$('next').textContent=idx===19?'TESTİ BİTİR':'CEVABI ONAYLA'}
function choose(i){if(chosen!==-1)return;if(!test[idx]||!test[idx].opts||i<0||i>=test[idx].opts.length)return;chosen=i;document.querySelectorAll('.option').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.disabled=true});next()}
function next(){if(chosen<0)return;let q=test[idx],ok=q.opts[chosen]===q.a;answers.push({c:q.c,ok});let seen=new Set(JSON.parse(localStorage.getItem('nq-seen')||'[]'));seen.add(q.id);localStorage.setItem('nq-seen',JSON.stringify([...seen]));if(mode==='adaptive')level=Math.max(1,Math.min(5,level+(ok?1:-1)));idx++;if(idx===20)finish();else render()}
function finish(){clearInterval(timer);let n=answers.filter(x=>x.ok).length,secs=Math.floor((Date.now()-start)/1000),score=n*5;$('score').textContent=score;$('scoreSmall').textContent=score;$('iqRank').textContent=iqRank(score);$('iqMarker').style.left=score+'%';$('correct').textContent=n+'/20';$('duration').textContent=Math.floor(secs/60)+' dk '+secs%60+' sn';$('analysis').innerHTML=cats.map((c,i)=>'<p>'+c+' <b>'+answers.filter(x=>x.c===i&&x.ok).length+'/4</b></p>').join('');$('feedback').textContent=iqComment(score)+' Bu endeks yalnızca bu testteki performansını gösterir; bilimsel IQ puanı veya zekâ tanısı değildir.';history.unshift({score,rank:iqRank(score),date:new Date().toLocaleDateString('tr-TR')});history=history.slice(0,50);localStorage.setItem('nq-history',JSON.stringify(history));show('result')}
function quit(){if(confirm('Testten çıkmak istiyor musun?'))home()}
function showHistory(){show('history');$('historyList').innerHTML=history.map(x=>'<p>'+x.score+'/100 · IQ endeksi '+(x.rank||iqRank(x.score))+' · '+x.date+'</p>').join('')||'Kayıt yok.'}
build();$('count').textContent=bank.length+' SORU';updateHistory();
// Inline HTML controls are explicitly exposed for mobile browsers.
window.startTest=startTest;window.choose=choose;window.next=next;window.quit=quit;window.home=home;window.showHistory=showHistory;
