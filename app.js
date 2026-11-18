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
  const correct=String(answer),out=[correct];
  for(const raw of mix(others.map(String))){
   const x=String(raw).trim();
   if(x&&x!==correct&&!out.includes(x)){out.push(x);if(out.length===4)break}
  }
  if(out.length!==4)throw new Error('Dört geçerli şık üretilemedi: '+correct+' / '+out.length);
  return mix(out);
 };
 const visualOptions=(answer,min,max)=>{
  const correct=String(answer);
  return makeOptions(correct,Array.from({length:max-min+1},(_,i)=>String(min+i)).filter(x=>x!==correct));
 };
 const numberOptions=a=>makeOptions(String(a),[a-1,a+1,a-2,a+2,a-3,a+3,a*2,Math.round(a*1.5)].filter(x=>Number.isFinite(x)&&x>=0&&x!==a));
 const patterns=[[1,1,1,1],[2,2,2,2],[3,3,3,3],[-1,-1,-1,-1],[-2,-2,-2,-2],[-3,-3,-3,-3],[1,2,1,2],[2,1,2,1],[1,3,1,3],[3,1,3,1],[2,3,2,3],[3,2,3,2],[-1,-2,-1,-2],[-2,-1,-2,-1],[-1,-3,-1,-3],[-3,-1,-3,-1],[-2,-3,-2,-3],[-3,-2,-3,-2],[1,2,3,4],[4,3,2,1],[1,1,2,2],[1,2,2,1],[2,1,1,2],[2,2,1,1],[1,3,2,1],[3,1,2,1],[-1,-1,-2,-2],[-1,-2,-2,-1],[-2,-1,-1,-2],[-2,-2,-1,-1],[-1,-3,-2,-1],[-3,-1,-2,-1],[1,2,3,1],[2,3,1,2],[3,1,2,3],[1,3,2,3],[3,2,1,2],[2,1,3,2],[-1,-2,-3,-1],[-2,-3,-1,-2],[-3,-1,-2,-3],[-1,-3,-2,-3],[-3,-2,-1,-2],[-2,-1,-3,-2]];
 const makePool=(min,max)=>{const pool=[],seen=new Set();for(const st of patterns)for(let base=min;base<=max;base++){const vals=[base];for(const step of st)vals.push(vals[vals.length-1]+step);const key=vals.slice(0,4).join(',');if(vals.every(x=>x>=min&&x<=max)&&!seen.has(key)){seen.add(key);pool.push({vals,steps:st})}}return pool};
 const polyPool=makePool(3,12),dotPool=makePool(1,12);
 if(polyPool.length<100||dotPool.length<100)throw new Error('Görsel soru havuzu yetersiz.');
 const analogy=[
  [['Kuş','yavru kuş'],['Kedi','yavru kedi'],['Köpek','yavru köpek'],['At','tay'],['Koyun','kuzu'],['İnek','buzağı'],['Keçi','oğlak']],
  [['Köpek','havlamak'],['Kedi','miyavlamak'],['Kuş','ötmek'],['Aslan','kükremek'],['Eşek','anırmak'],['Arı','vızıldamak'],['Yılan','tıslamak']],
  [['Makas','kesmek'],['Kalem','yazmak'],['Süpürge','süpürmek'],['Anahtar','kilidi açmak'],['Cetvel','ölçmek'],['Fırça','boyamak'],['Rende','rendelemek']],
  [['Doktor','hastane'],['Öğretmen','okul'],['Pilot','uçak'],['Aşçı','mutfak'],['Hakim','mahkeme'],['Çiftçi','tarla'],['Kütüphaneci','kütüphane']],
  [['Kitap','sayfa'],['Ağaç','dal'],['Ev','oda'],['Araba','tekerlek'],['Bisiklet','pedal'],['Bilgisayar','klavye'],['Gömlek','düğme']]
 ];
 const names=['Ece','Mert','Can','Ada','Bora','Deniz','Elif','Kerem','Selin','Arda','Duru','Emir','Zeynep','Ali','Mina','Eylül','Kaan','Lara','Aslı','Eren','Nil','Mira','Tuna','Defne'];
 const inclusions=[
  ['elma','meyve','besin'],['armut','meyve','besin'],['kiraz','meyve','besin'],['muz','meyve','besin'],
  ['serçe','kuş','canlı'],['kartal','kuş','canlı'],['somon','balık','hayvan'],['alabalık','balık','hayvan'],
  ['kare','dikdörtgen','çokgen'],['eşkenar üçgen','üçgen','çokgen'],['gül','çiçek','bitki'],['lale','çiçek','bitki'],
  ['meşe','ağaç','bitki'],['çam','ağaç','bitki'],['otomobil','taşıt','araç'],['bisiklet','taşıt','araç'],
  ['keman','müzik aleti','eşya'],['piyano','müzik aleti','eşya'],['masa','mobilya','eşya'],['sandalye','mobilya','eşya']
 ];
 const conditionals=[
  ['Yağmur yağarsa sokaklar ıslanır. Bugün yağmur yağıyor.','Sokaklar ıslanır.',['Sokaklar kurur.','Yağmur yağmaz.','Hava mutlaka soğur.']],
  ['Bir etkinliğe katılmak için önceden kayıt yaptırmak gerekir. Ece etkinliğe katıldı.','Ece kayıt yaptırmıştır.',['Ece etkinliği düzenlemiştir.','Etkinlik iptal edilmiştir.','Ece kayıt yaptırmamıştır.']],
  ['Bir cihazın çalışması için prize takılması gerekir. Cihaz şu anda çalışıyor.','Cihaz prize takılmıştır.',['Elektrik kesilmiştir.','Cihaz bozuktur.','Cihazın pili kesinlikle bitmiştir.']],
  ['Bir ürün indirimdeyse etiketinde indirim işareti bulunur. Ürün indirimdedir.','Etiketinde indirim işareti bulunur.',['Ürün tükenmiştir.','Ürünün fiyatı artmıştır.','Etiketi yoktur.']],
  ['Kütüphaneye girmek için üye kartı gerekir. Ali kütüphaneye girdi.','Ali’nin üye kartı vardır.',['Ali kütüphanenin sahibidir.','Kütüphane kapalıdır.','Ali kitap satın almıştır.']],
  ['Bir sayı 10’dan büyükse çift basamaklıdır. 14 sayısı 10’dan büyüktür.','14 çift basamaklıdır.',['14 tek basamaklıdır.','14, 10’dan küçüktür.','14 mutlaka tek sayıdır.']],
  ['Bir takım maçı kazanırsa puan alır. Takım maçı kazandı.','Takım puan alır.',['Takım maçı kaybetti.','Maç oynanmadı.','Takım puan alamaz.']],
  ['Bir meyve olgunlaştığında rengi değişebilir. Bu meyvenin olgunlaştığı biliniyor.','Rengi değişmiş olabilir.',['Kesinlikle çürümüştür.','Hiç değişmemiştir.','Yenmesi imkânsızdır.']],
  ['Bir binaya girmek için güvenlik kontrolünden geçmek zorunludur. Duru binaya girdi.','Duru güvenlik kontrolünden geçmiştir.',['Duru binanın sahibidir.','Bina boşaltılmıştır.','Duru kontrolü yapmıştır.']],
  ['Bir kitap ödünç alınmışsa kütüphane kaydında görünür. Bu kitap ödünç alınmıştır.','Kitap kütüphane kaydında görünür.',['Kitap kaybolmuştur.','Kitap satılmıştır.','Kitap hiç kaydedilmemiştir.']]
  ,['Bir alarm çalarsa ders başlar. Alarm çalıyor.','Ders başlar.',['Ders iptal olur.','Alarm hiç çalmadı.','Okul kapanır.']],
  ['Bir tren gecikirse varış saati ertelenir. Tren gecikti.','Varış saati ertelenir.',['Tren erkenden gelir.','Yolculuk iptal olur.','Tren hiç hareket etmez.']],
  ['Sıfırın altındaki sıcaklıkta su donar. Hava sıcaklığı sıfırın altında.','Su donar.',['Su kaynar.','Hava mutlaka güneşlidir.','Sıcaklık sıfırın üstündedir.']],
  ['Bir öğrenci ödevini teslim ederse öğretmen ödevi kontrol eder. Öğrenci ödevini teslim etti.','Öğretmen ödevi kontrol eder.',['Öğrenci okula gitmedi.','Ödev hiç verilmedi.','Öğretmen izinlidir.']],
  ['Bir otobüs son durağa ulaştığında yolcular inebilir. Otobüs son durağa ulaştı.','Yolcular inebilir.',['Otobüs ilk durağa döner.','Yolcular binemez.','Otobüs hareket etmez.']],
  ['Bir bilet geçerliyse yolcu uçağa binebilir. Bilet geçerli.','Yolcu uçağa binebilir.',['Uçak iptal edilmiştir.','Bilet geçersizdir.','Yolcu uçağı kullanır.']],
  ['Bir mağaza kapalıysa müşteriler alışveriş yapamaz. Mağaza kapalı.','Müşteriler alışveriş yapamaz.',['Mağaza açıktır.','Müşteriler alışveriş yapar.','Ürünler ücretsizdir.']],
  ['Bir telefonun şarjı biterse kapanır. Telefonun şarjı bitti.','Telefon kapanır.',['Telefon şarj olmuştur.','Telefon yeni alınmıştır.','Telefonun ekranı büyür.']],
  ['Bir kişi yüzme bilmiyorsa derin havuza tek başına girmemelidir. Can yüzme bilmiyor.','Can derin havuza tek başına girmemelidir.',['Can mutlaka yüzme biliyordur.','Havuz boş olmalıdır.','Can havuzu temizlemelidir.']],
  ['Bir dosya kaydedilirse bilgisayarda saklanır. Dosya kaydedildi.','Dosya bilgisayarda saklanır.',['Dosya silinmiştir.','Bilgisayar kapalıdır.','Dosya yazdırılmıştır.']]
 ];
 const schedules=[
  ['kütüphane ziyareti','sinema','akşam yemeği'],['kahvaltı','alışveriş','film izleme'],['toplantı','öğle yemeği','spor'],['ders','ödev','oyun'],['otobüs yolculuğu','otele giriş','akşam yemeği'],
  ['dişçi randevusu','market alışverişi','eve dönüş'],['sabah yürüyüşü','kahvaltı','işe başlama'],['bilet alma','salona girme','gösteri'],['çantayı hazırlama','evden çıkma','otobüse binme'],['kitabı alma','sayfayı okuma','not çıkarma'],
  ['hamuru yoğurma','fırını ısıtma','ekmeği pişirme'],['tohum ekme','sulama','filizlenme'],['bilgisayarı açma','dosyayı düzenleme','dosyayı kaydetme'],['alışveriş listesi hazırlama','markete gitme','ürünleri yerleştirme'],['bavulu hazırlama','havaalanına gitme','uçağa binme'],
  ['konuyu öğrenme','alıştırma çözme','konu tekrarı'],['aracı çalıştırma','yola çıkma','hedefe varma'],['davetiye gönderme','misafirleri karşılama','kutlama'],['sebzeleri yıkama','doğrama','pişirme'],['sınava hazırlanma','sınava girme','sonucu öğrenme']
 ];
 const comparisons=[
  ['Kırmızı kutu','Mavi kutu','Sarı kutu'],['Büyük çanta','Orta çanta','Küçük çanta'],['A tankı','B tankı','C tankı'],['Birinci paket','İkinci paket','Üçüncü paket'],['X taşı','Y taşı','Z taşı'],
  ['Ahşap blok','Plastik blok','Sünger blok'],['Birinci kitap','İkinci kitap','Üçüncü kitap'],['Büyük şişe','Orta şişe','Küçük şişe'],['Kırmızı valiz','Siyah valiz','Gri valiz'],['A sepeti','B sepeti','C sepeti'],
  ['Uzun tahta','Orta tahta','Kısa tahta'],['Kalın dosya','Orta dosya','İnce dosya'],['A kabı','B kabı','C kabı'],['Büyük taş','Orta taş','Küçük taş'],['Birinci koli','İkinci koli','Üçüncü koli'],
  ['A çantası','B çantası','C çantası'],['Uzun ip','Orta ip','Kısa ip'],['Büyük kavanoz','Orta kavanoz','Küçük kavanoz'],['A kutusu','B kutusu','C kutusu'],['Birinci silindir','İkinci silindir','Üçüncü silindir']
 ];
 for(let d=1;d<=5;d++)for(let c=0;c<5;c++)for(let n=0;n<20;n++){
  const s=(d-1)*20+n;let q,opts,ans;
  if(c===0){
   const item=polyPool[s],v=item.vals;ans=String(v[4]);
   opts=visualOptions(ans,3,12);
   q={prompt:'Her şeklin köşe sayısını incele. Aynı değişim sürerse sıradaki şekil kaç köşeli olur?',v:'',a:ans,opts,visualSequence:v.slice(0,4),optionSides:true,ex:'Köşe sayıları arasındaki farkları karşılaştır.'};
  }else if(c===1){
   const item=dotPool[s],v=item.vals;ans=String(v[4]);
   opts=visualOptions(ans,1,12);
   q={prompt:'Her karttaki noktaları say. Aynı değişim sürerse sonraki kartta kaç nokta olmalı?',v:'',a:ans,opts,visualCounts:v.slice(0,4),optionDots:true,ex:'Kartlardaki nokta sayıları arasındaki farkları karşılaştır.'};
  }else if(c===2){
   const t=s%10,v=Math.floor(s/10);let vals;
   if(t===0){const base=3+v*2,step=2+v;vals=[base,base+step,base+2*step,base+3*step];ans=base+4*step}
   else if(t===1){const base=90+v*3,step=2+(v%4);vals=[base,base-step,base-2*step,base-3*step];ans=base-4*step}
   else if(t===2){const base=5+v*2,a=1+(v%3),b=3+(v%4);vals=[base,base+a,base+a+b,base+2*a+b];ans=base+2*a+2*b}
   else if(t===3){const base=2+v;vals=[base,base*2,base*4,base*8];ans=base*16}
   else if(t===4){const k=2+v;vals=[k*k,(k+1)**2,(k+2)**2,(k+3)**2];ans=(k+4)**2}
   else if(t===5){const a=1+v,b=2+v*2;vals=[a,b,a+b,a+2*b];ans=2*a+3*b}
   else if(t===6){const base=1+v;vals=[base,base*3,base*9,base*27];ans=base*81}
   else if(t===7){const base=100+v*5,a=1+(v%3),b=4+(v%4);vals=[base,base-a,base-a-b,base-2*a-b];ans=base-2*a-2*b}
   else if(t===8){const base=2+v*2,a=1+(v%2);vals=[base,base+a,base+a+2,base+a+2+3];ans=base+a+2+3+4}
   else {const k=1+v;vals=[k*k*k,(k+1)**3,(k+2)**3,(k+3)**3];ans=(k+4)**3}
   opts=numberOptions(ans);
   const explanations=['Sabit miktarda artış var.','Sabit miktarda azalış var.','Artış miktarı sırayla iki değer arasında değişiyor.','Her terim bir öncekinin iki katı.','Ardışık tam kare sayılar kullanılmış.','Her terim önceki iki sayının toplamı.','Her terim bir öncekinin üç katı.','Azalış miktarı dönüşümlü değişiyor.','Artış miktarı her adımda bir artıyor.','Ardışık tam küpler kullanılmış.'];
   q={prompt:'Sayı dizisindeki kuralı bul ve sıradaki sayıyı seç.',v:vals.join('　·　')+'　·　 ?',a:String(ans),opts,ex:explanations[t]};
  }else if(c===3){
   const g=Math.floor(s/20),group=analogy[g],pi=s%7,offset=1+(Math.floor(s/7)%5),ti=(pi+offset)%7,p=group[pi],target=group[ti];
   ans=target[1];opts=makeOptions(ans,group.filter((x,i)=>i!==ti).map(x=>x[1]));
   q={prompt:'İlk eşleştirmedeki ilişkiyi bul ve aynı ilişkiyi ikinci satıra uygula.',v:p[0]+' : '+p[1]+'\n'+target[0]+' : ?',a:ans,opts,ex:['Hayvan ile yavrusu eşleştirilmiş.','Hayvan ile çıkardığı ses eşleştirilmiş.','Araç ile yaptığı iş eşleştirilmiş.','Meslek ile çalıştığı yer eşleştirilmiş.','Bütün ile onun bir parçası eşleştirilmiş.'][g]};
  }else{
   const t=s%5,v=Math.floor(s/5);
   if(t===0){
    const a=names[v],b=names[(v+7)%names.length],z=names[(v+13)%names.length],oldest=v%2===1;
    ans=oldest?a:z;const statement=a+' , '+b+'’den daha yaşlıdır. '+b+' de '+z+'’den daha yaşlıdır.';
    opts=makeOptions(ans,[a,b,z,'Kesin olarak belirlenemez']);
    q={prompt:oldest?'En yaşlı kimdir?':'En genç kimdir?',v:statement,a:ans,opts,ex:'Yaş sırası büyükten küçüğe '+a+', '+b+', '+z+' şeklindedir.'};
   }else if(t===1){
    const g=inclusions[v];ans=g[2];opts=makeOptions(ans,[g[1],'eşya','canlı','madde'].filter(x=>x!==ans));
    q={prompt:'Verilen iki bilgiye göre ilk gruptakiler kesinlikle hangi gruba dahildir?',v:'Bütün '+g[0]+'lar '+g[1]+'dır.\nBütün '+g[1]+'lar '+g[2]+'dır.\n'+g[0]+'lar hangi gruptadır?',a:ans,opts,ex:'İlk grup ikinci grubun, ikinci grup da üçüncü grubun içindedir.'};
   }else if(t===2){
    const item=conditionals[v];ans=item[1];opts=makeOptions(ans,item[2]);
    q={prompt:'Verilen bilgiye göre kesin olarak hangi sonuç çıkar?',v:item[0],a:ans,opts,ex:'Verilen koşulu ve gerçekleşen durumu birlikte değerlendir.'};
   }else if(t===3){
    const x=schedules[v];ans=x[2];opts=makeOptions(ans,[x[0],x[1],'Sıralama belirlenemez']);
    q={prompt:'Etkinliklerin sırasını verilen bilgilere göre belirle. En son hangisi yapılır?',v:x[0]+', '+x[1]+'den önce yapılacak.\n'+x[1]+', '+x[2]+'den önce yapılacak.',a:ans,opts,ex:'İlk etkinlik ikinci etkinlikten, ikinci de üçüncüden önce gelir.'};
   }else{
    const x=comparisons[v];ans=x[2];opts=makeOptions(ans,[x[0],x[1],'Kesin olarak belirlenemez']);
    q={prompt:'İki karşılaştırmayı birlikte değerlendir. En hafif olan hangisidir?',v:x[0]+', '+x[1]+'dan daha ağırdır.\n'+x[1]+' da '+x[2]+'dan daha ağırdır.',a:ans,opts,ex:'Birinci nesne ikinciden, ikinci de üçüncüden ağırsa en hafif üçüncü nesnedir.'};
   }
  }
  bank.push({id:id++,d,c,...q});
 }
 for(const q of bank){
  if(!Array.isArray(q.opts)||q.opts.length!==4||new Set(q.opts.map(String)).size!==4||!q.opts.some(x=>String(x)===String(q.a)))throw new Error('Geçersiz şık: soru '+q.id);
  if((q.optionDots||q.optionSides)&&q.opts.some(x=>!Number.isInteger(Number(x))))throw new Error('Görsel şık sayısal değil: soru '+q.id);
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
function next(){if(chosen<0)return;let q=test[idx],ok=q.opts[chosen]===q.a;answers.push({c:q.c,ok});let seen=new Set(JSON.parse(localStorage.getItem('nq-seen-v3')||'[]'));seen.add(q.id);localStorage.setItem('nq-seen-v3',JSON.stringify([...seen]));if(mode==='adaptive')level=Math.max(1,Math.min(5,level+(ok?1:-1)));idx++;if(idx===20)finish();else render()}
function finish(){clearInterval(timer);let n=answers.filter(x=>x.ok).length,secs=Math.floor((Date.now()-start)/1000),score=n*5,iq=toIQ(score);$('score').textContent=iq;$('scoreSmall').textContent=score+'%';$('iqRank').textContent=iqRank(iq);$('iqMarker').style.left=((iq-70)/60*100)+'%';$('correct').textContent=n+'/20';$('duration').textContent=Math.floor(secs/60)+' dk '+secs%60+' sn';$('analysis').innerHTML=cats.map((c,i)=>'<p>'+c+' <b>'+answers.filter(x=>x.c===i&&x.ok).length+'/4</b></p>').join('');$('feedback').textContent=iqComment(score)+' Gösterilen değer, 70–130 aralığına ölçeklenmiş deneysel NEUROIQ endeksidir; standartlaştırılmış veya klinik IQ puanı değildir.';history.unshift({score,iq,rank:iqRank(iq),date:new Date().toLocaleDateString('tr-TR')});history=history.slice(0,50);localStorage.setItem('nq-history',JSON.stringify(history));show('result')}
function quit(){if(confirm('Testten çıkmak istiyor musun?'))home()}
function showHistory(){show('history');$('historyList').innerHTML=history.map(x=>'<p>NEUROIQ '+(x.iq||toIQ(x.score))+' · '+(x.rank||iqRank(x.iq||toIQ(x.score)))+' · '+x.date+'</p>').join('')||'Kayıt yok.'}
build();$('count').textContent=bank.length+' SORU';updateHistory();
// Inline HTML controls are explicitly exposed for mobile browsers.
window.startTest=startTest;window.choose=choose;window.next=next;window.quit=quit;window.home=home;window.showHistory=showHistory;
