'use strict';
const $=id=>document.getElementById(id), cats=['Geometrik örüntü','Görsel miktar','Sayısal mantık','Sözel ilişki','Mantık yürütme'], shapes=['▲','●','■','◆','✚','★','⬟','⬢'];
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
 if(q.optionSides)return '<button class="option visual-option" onclick="choose('+i+')"><b>'+letter+'</b><span>'+polygonMarkup(Number(x),48)+'</span></button>';
 if(q.optionDots)return '<button class="option visual-option" onclick="choose('+i+')"><b>'+letter+'</b><span>'+dotsMarkup(Number(x),50)+'</span></button>';
 return '<button class="option" onclick="choose('+i+')"><b>'+letter+'</b> '+x+'</button>';
}
const mix=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function build(){
 let id=0;
 const makeOptions=(answer,others)=>{
  const out=[String(answer)];
  for(const x of mix(others.map(String)))if(!out.includes(x)){out.push(x);if(out.length===4)break}
  for(const x of ['Bilinmiyor','Hiçbiri','Yukarıdakilerden hiçbiri'])if(out.length<4&&!out.includes(x)&&String(answer)!==x)out.push(x);
  return mix(out);
 };
 const numberOptions=answer=>{const a=Number(answer);return makeOptions(String(a),[a-1,a+1,a-2,a+2,a-3,a+3,a*2,Math.round(a*1.5)].filter(x=>Number.isFinite(x)&&x>=0&&x!==a))};
 const analogy=[
  [['Kuş','yavru kuş'],['Kedi','yavru kedi'],['Köpek','yavru köpek'],['At','tay'],['Koyun','kuzu'],['İnek','buzağı'],['Keçi','oğlak']],
  [['Köpek','havlamak'],['Kedi','miyavlamak'],['Kuş','ötmek'],['Aslan','kükremek'],['Eşek','anırmak'],['Arı','vızıldamak'],['Yılan','tıslamak']],
  [['Makas','kesmek'],['Kalem','yazmak'],['Süpürge','süpürmek'],['Anahtar','kilidi açmak'],['Cetvel','ölçmek'],['Fırça','boyamak'],['Rende','rendelemek']],
  [['Doktor','hastane'],['Öğretmen','okul'],['Pilot','uçak'],['Aşçı','mutfak'],['Hakim','mahkeme'],['Çiftçi','tarla'],['Kütüphaneci','kütüphane']],
  [['Kitap','sayfa'],['Ağaç','dal'],['Ev','oda'],['Araba','tekerlek'],['Bisiklet','pedal'],['Bilgisayar','klavye'],['Gömlek','düğme']]
 ];
 const names=[['Ece','Mert','Can'],['Ada','Bora','Deniz'],['Elif','Kerem','Selin'],['Arda','Duru','Emir'],['Zeynep','Ali','Mina'],['Eylül','Kaan','Lara'],['Aslı','Eren','Nil'],['Mira','Tuna','Defne']];
 const groups=[
  {a:'elma',b:'meyve',c:'besin',wrong:['içecek','taş','giysi']},
  {a:'serçe',b:'kuş',c:'canlı',wrong:['taşıt','eşya','bitki']},
  {a:'kare',b:'dikdörtgen',c:'çokgen',wrong:['daire','sayı','renk']},
  {a:'gül',b:'çiçek',c:'bitki',wrong:['hayvan','maden','alet']},
  {a:'somon',b:'balık',c:'hayvan',wrong:['bitki','mineral','eşya']}
 ];
 const conditional=[
  ['Yağmur yağarsa sokaklar ıslanır. Bugün yağmur yağıyor.','Sokaklar ıslanır.',['Sokaklar kurur.','Yağmur yağmaz.','Hava mutlaka soğur.']],
  ['Bir etkinliğe katılmak için önceden kayıt yaptırmak gerekir. Ece etkinliğe katıldı.','Ece kayıt yaptırmıştır.',['Ece etkinliği düzenlemiştir.','Etkinlik iptal edilmiştir.','Ece kayıt yaptırmamıştır.']],
  ['Bir cihazın çalışması için prize takılması gerekir. Cihaz şu anda çalışıyor.','Cihaz prize takılmıştır.',['Elektrik kesilmiştir.','Cihaz bozuktur.','Cihazın pili kesinlikle bitmiştir.']],
  ['Bir ürün indirimdeyse etiketinde indirim işareti bulunur. Ürün indirimdedir.','Etiketinde indirim işareti bulunur.',['Ürün tükenmiştir.','Ürünün fiyatı artmıştır.','Etiketi yoktur.']],
  ['Kütüphaneye girmek için üye kartı gerekir. Ali kütüphaneye girdi.','Ali’nin üye kartı vardır.',['Ali kütüphanenin sahibidir.','Kütüphane kapalıdır.','Ali kitap satın almıştır.']]
 ];
 const schedules=[['kütüphane','sinema','akşam yemeği'],['kahvaltı','alışveriş','film'],['toplantı','öğle yemeği','spor'],['ders','ödev','oyun'],['otobüs yolculuğu','otele giriş','akşam yemeği']];
 const comparisons=[['Kırmızı kutu','Mavi kutu','Sarı kutu'],['Büyük çanta','Orta çanta','Küçük çanta'],['A tankı','B tankı','C tankı'],['Birinci paket','İkinci paket','Üçüncü paket'],['X taşı','Y taşı','Z taşı']];
 for(let d=1;d<=5;d++)for(let c=0;c<5;c++)for(let n=0;n<20;n++){
  const s=n+(d-1)*20;let q,opts,ans;
  if(c===0){
   const t=n%6;let base,steps;
   if(t===0){base=3+(s%4);steps=[1,1,1,1]}
   else if(t===1){base=9+(s%3);steps=[-1,-1,-1,-1]}
   else if(t===2){base=3+(s%2);steps=[2,2,2,2]}
   else if(t===3){base=3+(s%3);steps=[1,2,1,2]}
   else if(t===4){base=10+(s%2);steps=[-1,-2,-1,-2]}
   else {base=4+(s%3);steps=[2,1,2,1]}
   let vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k]);
   if(vals.some(x=>x<3||x>12)){base=t===1||t===4?11:3;vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k])}
   ans=String(vals[4]);opts=makeOptions(ans,[ans-1,ans+1,ans-2,ans+2,ans-3,ans+3].filter(x=>x>=3&&x<=12));
   q={prompt:'Şekillerin köşe sayılarına bak. Aynı değişim kuralı sürerse sıradaki şekil kaç köşeli olur?',v:'',a:ans,opts,visualSequence:vals.slice(0,4),optionSides:true,ex:['Her adımda bir köşe ekleniyor.','Her adımda bir köşe eksiliyor.','Her adımda iki köşe ekleniyor.','Bir ve iki köşelik artış sırayla tekrarlanıyor.','Bir ve iki köşelik azalış sırayla tekrarlanıyor.','İki ve bir köşelik artış sırayla tekrarlanıyor.'][t]};
  }else if(c===1){
   const t=n%6;let base,steps;
   if(t===0){base=1+(s%4);steps=[1,1,1,1]}
   else if(t===1){base=8+(s%2);steps=[-1,-1,-1,-1]}
   else if(t===2){base=1+(s%2);steps=[2,2,2,2]}
   else if(t===3){base=1+(s%3);steps=[1,2,1,2]}
   else if(t===4){base=8+(s%2);steps=[-1,-2,-1,-2]}
   else {base=1+(s%3);steps=[2,1,2,1]}
   let vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k]);
   if(vals.some(x=>x<1||x>9)){base=t===1||t===4?9:1;vals=[base];for(let k=0;k<4;k++)vals.push(vals[k]+steps[k])}
   ans=String(vals[4]);opts=makeOptions(ans,[ans-2,ans-1,ans+1,ans+2,ans+3].filter(x=>x>=1&&x<=9));
   q={prompt:'Kartlardaki noktaları say. Aynı kural sürerse sonraki kartta kaç nokta olmalı?',v:'',a:ans,opts,visualCounts:vals.slice(0,4),optionDots:true,ex:['Her kartta bir nokta artıyor.','Her kartta bir nokta azalıyor.','Her kartta iki nokta artıyor.','Bir ve iki nokta ekleme sırayla tekrarlanıyor.','Bir ve iki nokta çıkarma sırayla tekrarlanıyor.','İki ve bir nokta ekleme sırayla tekrarlanıyor.'][t]};
  }else if(c===2){
   const t=n%6;let vals;
   if(t===0){const base=3+(s%17),step=2+(d%3)+(s%4);vals=[base,base+step,base+2*step,base+3*step];ans=base+4*step}
   else if(t===1){const base=24+(s%12),step=2+(s%4);vals=[base,base-step,base-2*step,base-3*step];ans=base-4*step}
   else if(t===2){const x=1+(s%5),y=2+(s%4);vals=[x,x+y,x+y+x,x+y+x+y];ans=vals[3]+x}
   else if(t===3){const base=2+(s%3);vals=[base,base*2,base*4,base*8];ans=base*16}
   else if(t===4){const k=2+(s%8);vals=[k*k,(k+1)**2,(k+2)**2,(k+3)**2];ans=(k+4)**2}
   else {const x=1+(s%3),y=2+(s%4);vals=[x,y,x+y,x+2*y];ans=2*x+3*y}
   opts=numberOptions(ans);
   q={prompt:'Sayı dizisindeki değişimi bul ve sıradaki sayıyı seç.',v:vals.join('　·　')+'　·　 ?',a:String(ans),opts,ex:['Sayılar her adımda aynı miktarda artıyor.','Sayılar her adımda aynı miktarda azalıyor.','Artış miktarı sırayla iki değer arasında değişiyor.','Her sayı bir öncekinin iki katı.','Ardışık tam kare sayılar kullanılmış.','Her yeni sayı önceki iki sayının toplamıyla oluşuyor.'][t]};
  }else if(c===3){
   const g=(n+Math.floor((d-1)/2))%analogy.length,group=analogy[g];
   const pi=(n*3+d)%group.length,ti=(pi+1+(s%5))%group.length,p=group[pi],target=group[ti];
   ans=target[1];opts=makeOptions(ans,group.filter((x,i)=>i!==ti).map(x=>x[1]));
   q={prompt:'İlk eşleştirmedeki ilişkiyi bul ve aynı ilişkiyi ikinci satıra uygula.',v:p[0]+' : '+p[1]+'\n'+target[0]+' : ?',a:ans,opts,ex:['Hayvan ile yavrusu eşleştirilmiş.','Hayvan ile çıkardığı ses eşleştirilmiş.','Araç ile yaptığı iş eşleştirilmiş.','Meslek ile çalıştığı yer eşleştirilmiş.','Bütün ile onun bir parçası eşleştirilmiş.'][g]};
  }else{
   const t=n%5;
   if(t===0){
    const nm=names[(s+d)%names.length],a=nm[0],b=nm[1],z=nm[2],oldest=s%2===1;
    ans=oldest?a:z;
    const v=a+' , '+b+'’den daha yaşlıdır. '+b+' de '+z+'’den daha yaşlıdır.';
    opts=makeOptions(ans,[a,b,z,'Kesin olarak belirlenemez']);
    q={prompt:oldest?'En yaşlı kimdir?':'En genç kimdir?',v,a:ans,opts,ex:'Yaş sırası büyükten küçüğe '+a+', '+b+', '+z+' şeklindedir.'};
   }else if(t===1){
    const g=groups[(s+d)%groups.length];ans=g.c;opts=makeOptions(ans,[g.b,...g.wrong]);
    q={prompt:'Verilen iki bilgiye göre ilk gruptakiler kesinlikle hangi gruptadır?',v:'Bütün '+g.a+'lar '+g.b+'dır.\nBütün '+g.b+'lar '+g.c+'dır.\n'+g.a+'lar hangi gruptadır?',a:ans,opts,ex:'İlk grup ikinci grubun, ikinci grup da üçüncü grubun içindedir. İlk grup üçüncü grubun da içindedir.'};
   }else if(t===2){
    const item=conditional[(s+d)%conditional.length];ans=item[1];opts=makeOptions(ans,item[2]);
    q={prompt:'Verilen bilgiye göre kesin olarak hangi sonuç çıkar?',v:item[0],a:ans,opts,ex:'Verilen kural ile gerçekleşen durumu birlikte değerlendir.'};
   }else if(t===3){
    const x=schedules[(s+d)%schedules.length];ans=x[2];opts=makeOptions(ans,[x[0],x[1],'Sıralama belirlenemez']);
    q={prompt:'Etkinliklerin sırasını verilen bilgilere göre belirle. En son hangisi yapılır?',v:x[0]+', '+x[1]+'den önce yapılacak.\n'+x[1]+', '+x[2]+'den önce yapılacak.',a:ans,opts,ex:'İlk etkinlik ikinci etkinlikten, ikinci de üçüncüden önce gelir. Bu nedenle üçüncü en sondadır.'};
   }else{
    const x=comparisons[(s+d)%comparisons.length];ans=x[2];opts=makeOptions(ans,[x[0],x[1],'Kesin olarak belirlenemez']);
    q={prompt:'İki karşılaştırmayı birlikte değerlendir. En hafif olan hangisidir?',v:x[0]+', '+x[1]+'dan daha ağırdır.\n'+x[1]+' da '+x[2]+'dan daha ağırdır.',a:ans,opts,ex:'Birinci nesne ikinciden, ikinci de üçüncüden ağırsa en hafif üçüncü nesnedir.'};
   }
  }
  bank.push({id:id++,d,c,...q});
 }
}
function show(name){['home','quiz','result','history'].forEach(x=>$(x).classList.toggle('hidden',x!==name))}
function toIQ(score){return Math.round(70+(score/100)*60)}
function iqRank(iq){if(iq<85)return 'Ortalamanın altında';if(iq<115)return 'Ortalama aralığı';if(iq<130)return 'Ortalamanın üstünde';return 'Çok yüksek aralık'}
function iqComment(score){if(score<20)return 'Bugün beyin biraz tasarruf modunda. Sorun değil, en iyi fikirler bazen geç açılır.';if(score<40)return 'Mantık motoru çalışıyor; sadece vites henüz büyütülmemiş. Bir tur daha denemeye değer.';if(score<60)return 'Gayet dengeli! Beyin görevini yaptı, kahve molasını da hak etti.';if(score<80)return 'Güzel performans. Nöronlar toplantıyı yapmış, kararları da zamanında almış.';return 'Tebrikler! Bugün beyin mesaiye erken başlamış, çıkış saatini de unutmuş.'}
function updateHistory(){ $('recent').innerHTML=history.slice(0,3).map(x=>'<p>NEUROIQ '+(x.iq||toIQ(x.score))+' · '+iqRank(x.iq||toIQ(x.score))+' · '+x.date+'</p>').join('')||'Henüz test yok.'}
function home(){clearInterval(timer);show('home');updateHistory()}
function startTest(m){
 mode=m;level=2;idx=0;answers=[];
 const seen=new Set(JSON.parse(localStorage.getItem('nq-seen-v3')||'[]'));
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
 $('question').textContent=q.prompt||'Soruyu dikkatlice incele ve doğru cevabı seç.';
 if(q.visualSequence){
  $('visual').innerHTML='<div class="shape-sequence">'+q.visualSequence.map((n,i)=>'<div class="shape-step">'+polygonMarkup(n,54)+'<small>'+(i+1)+'.</small></div>').join('<span class="shape-arrow">→</span>')+'<span class="shape-missing">?</span></div>';
 }else if(q.visualCounts){
  $('visual').innerHTML='<div class="shape-sequence">'+q.visualCounts.map((n,i)=>'<div class="shape-step">'+dotsMarkup(n,54)+'<small>'+(i+1)+'.</small></div>').join('<span class="shape-arrow">→</span>')+'<span class="shape-missing">?</span></div>';
 }else{$('visual').textContent=q.v}
 $('options').innerHTML=q.opts.map((x,i)=>optionMarkup(q,x,i)).join('');$('next').disabled=true;$('next').textContent=idx===19?'TESTİ BİTİR':'CEVABI ONAYLA';
}
function choose(i){if(chosen!==-1)return;if(!test[idx]||!test[idx].opts||i<0||i>=test[idx].opts.length)return;chosen=i;document.querySelectorAll('.option').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.disabled=true});next()}
function next(){if(chosen<0)return;let q=test[idx],ok=q.opts[chosen]===q.a;answers.push({c:q.c,ok});let seen=new Set(JSON.parse(localStorage.getItem('nq-seen')||'[]'));seen.add(q.id);localStorage.setItem('nq-seen-v3',JSON.stringify([...seen]));if(mode==='adaptive')level=Math.max(1,Math.min(5,level+(ok?1:-1)));idx++;if(idx===20)finish();else render()}
function finish(){clearInterval(timer);let n=answers.filter(x=>x.ok).length,secs=Math.floor((Date.now()-start)/1000),score=n*5,iq=toIQ(score);$('score').textContent=iq;$('scoreSmall').textContent=score+'%';$('iqRank').textContent=iqRank(iq);$('iqMarker').style.left=((iq-70)/60*100)+'%';$('correct').textContent=n+'/20';$('duration').textContent=Math.floor(secs/60)+' dk '+secs%60+' sn';$('analysis').innerHTML=cats.map((c,i)=>'<p>'+c+' <b>'+answers.filter(x=>x.c===i&&x.ok).length+'/4</b></p>').join('');$('feedback').textContent=iqComment(score)+' Gösterilen değer, 70–130 aralığına ölçeklenmiş deneysel NEUROIQ endeksidir; standartlaştırılmış veya klinik IQ puanı değildir.';history.unshift({score,iq,rank:iqRank(iq),date:new Date().toLocaleDateString('tr-TR')});history=history.slice(0,50);localStorage.setItem('nq-history',JSON.stringify(history));show('result')}
function quit(){if(confirm('Testten çıkmak istiyor musun?'))home()}
function showHistory(){show('history');$('historyList').innerHTML=history.map(x=>'<p>NEUROIQ '+(x.iq||toIQ(x.score))+' · '+(x.rank||iqRank(x.iq||toIQ(x.score)))+' · '+x.date+'</p>').join('')||'Kayıt yok.'}
build();$('count').textContent=bank.length+' SORU';updateHistory();
// Inline HTML controls are explicitly exposed for mobile browsers.
window.startTest=startTest;window.choose=choose;window.next=next;window.quit=quit;window.home=home;window.showHistory=showHistory;
