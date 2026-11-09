/* ===== 01-content.js  Base lessons (v3 units), alphabet and tone data. Edit here to change lesson words. ===== */
const UNITS=[
{id:'greet',n:1,title:'Greetings',yo:'Ìkíni',tip:'Greetings matter a lot in Yoruba culture. Starting with “Ẹ” shows respect, so use it with elders and with groups.',items:[
 ['Ẹ káàárọ̀','Good morning','Said before noon. The “Ẹ” at the start is the respectful form.'],
 ['Ẹ káàsán','Good afternoon','Used from around midday until late afternoon.'],
 ['Ẹ kú ìrọ̀lẹ́','Good evening','Used as the day winds down.'],
 ['Báwo ni?','How are you?','Friendly and works any time of day.'],
 ['Mo wà dáadáa','I am fine','A common answer to “Báwo ni?”'],
 ['Ẹ ṣé','Thank you','Say “Ẹ ṣé gan-an” for “thank you very much.”'],
 ['Ẹ káàbọ̀','Welcome','Said to someone arriving.'],
 ['Ó dàbọ̀','Goodbye',''],
 ['Bẹ́ẹ̀ ni','Yes',''],
 ['Rárá','No',''],
 ['Jọ̀wọ́','Please',''],
 ['Ẹ pẹ̀lẹ́','Sorry / take it easy','Said to show sympathy, or to someone who is working.']]},
{id:'me',n:2,title:'Me, You, Them',yo:'Èmi àti ìwọ',tip:'Yoruba pronouns are short, and tone changes them: “o” means you, “ó” means he, she or it.',items:[
 ['mo','I',''],['o','you (one person)','Compare with “ó” (he / she / it).'],['ó','he / she / it','Yoruba has no he/she split.'],
 ['a','we',''],['ẹ','you (many people, or an elder)','Also the respectful “you.”'],['wọ́n','they',''],
 ['orúkọ','name',''],['mi','my / me',''],
 ['Orúkọ mi ni Ṣọlá','My name is Shola','Swap in your own name after “ni.”'],
 ['Kí ni orúkọ rẹ?','What is your name?','']]},
{id:'num',n:3,title:'Numbers 1–10',yo:'Nọ́ńbà',tip:'Past 10, Yoruba adds and subtracts. 11 is ọ̀kanlá (10+1), 15 is ẹ̀ẹ́dógún (20−5), and 25 is ẹ̀ẹ́dọ́gbọ̀n (30−5). Sources spell a few tone marks slightly differently.',items:[
 ['ọ̀kan','one (1)',''],['èjì','two (2)',''],['ẹ̀ta','three (3)',''],['ẹ̀rin','four (4)',''],['àrún','five (5)',''],
 ['ẹ̀fà','six (6)',''],['èje','seven (7)',''],['ẹ̀jọ','eight (8)',''],['ẹ̀sán','nine (9)',''],['ẹ̀wá','ten (10)','']]},
{id:'fam',n:4,title:'Family and Friends',yo:'Ẹbí',tip:'Yoruba has separate words for older and younger siblings, because age and respect matter.',items:[
 ['ẹbí','family',''],['bàbá','father',''],['ìyá','mother',''],['ọmọ','child',''],
 ['ẹ̀gbọ́n','older brother or sister','Used for anyone older than you in the family.'],['àbúrò','younger brother or sister',''],
 ['bàbá àgbà','grandfather',''],['ìyá àgbà','grandmother',''],['ọ̀rẹ́','friend',''],['ọkọ','husband','Compare ọkọ̀ (vehicle). Tone changes the meaning.'],['ìyàwó','wife','']]},
{id:'things',n:5,title:'Everyday Things',yo:'Nǹkan ojoojúmọ́',tip:'“ilé” is house and “ìwé” is book. Put them together as ilé-ìwé and you get school, literally “house of books.”',items:[
 ['omi','water',''],['oúnjẹ','food',''],['ìrẹsì','rice',''],['ẹja','fish',''],['ẹyin','egg',''],
 ['ilé','house / home',''],['ilé-ìwé','school','Literally “house of books.”'],['ìwé','book',''],['ọjà','market',''],['aṣọ','clothes',''],
 ['ajá','dog',''],['ológbò','cat',''],['òjò','rain',''],['oòrùn','sun','']]},
{id:'days',n:6,title:'Days of the Week',yo:'Àwọn ọjọ́',tip:'“ọjọ́” means day and “ọ̀sẹ̀” means week. Most day names start with Ọjọ́.',items:[
 ['ọjọ́','day',''],['ọ̀sẹ̀','week',''],['Ọjọ́ Àìkú','Sunday',''],['Ọjọ́ Ajé','Monday',''],['Ọjọ́ Ìṣẹ́gun','Tuesday',''],
 ['Ọjọ́rú','Wednesday',''],['Ọjọ́bọ̀','Thursday',''],['Ọjọ́ Ẹtì','Friday',''],['Ọjọ́ Àbámẹ́ta','Saturday','']]},
{id:'verbs',n:7,title:'Action Words',yo:'Ìṣe',tip:'Yoruba verbs do not change for who is doing them. “jẹ” is eat whether it is I, you or they. Watch tone: kọ means write, kọ́ means learn.',items:[
 ['jẹun','eat',''],['mu','drink',''],['sùn','sleep',''],['kà','read',''],['kọ','write','Compare kọ́ (learn).'],['kọ́','learn','Compare kọ (write).'],
 ['sọ̀rọ̀','speak',''],['wá','come',''],['lọ','go',''],['ṣeré','play',''],['rí','see',''],['gbọ́','hear','']]},
{id:'sent',n:8,title:'Build Sentences',yo:'Gbólóhùn',build:true,tip:'Basic order is subject, verb, object, like English. Tap the words in the right order.',items:[
 ['Mo lọ sí ilé-ìwé','I go to school',''],['Mo jẹ ìrẹsì','I eat rice',''],['Mo wà dáadáa','I am fine',''],
 ['Mo fẹ́ omi','I want water',''],['Ó lọ sí ọjà','She goes to the market','Ó can also mean he. Context decides.'],['Orúkọ mi ni Ṣọlá','My name is Shola','']]}
];

const ALPHA=[
['A','ah, like “father”','ajá','dog'],['B','b as in “boy”','bàbá','father'],['D','d as in “dog”','dúdú','black'],['E','ay as in “day,” but shorter','èdè','language'],
['Ẹ','eh as in “bed”','ẹja','fish'],['F','f as in “fun”','fẹ́','want'],['G','g as in “go”'],['Gb','g and b said together in one quick pop, not two sounds','gbọ́','hear'],
['H','h as in “hat”'],['I','ee as in “see”','ilé','house'],['J','j as in “jump”','jẹun','eat'],['K','k as in “kite”','kà','read'],
['L','l as in “lamp”','lọ','go'],['M','m as in “moon”','mu','drink'],['N','n as in “net”'],['O','oh as in “oat,” but shorter','oúnjẹ','food'],
['Ọ','aw as in “law”','ọmọ','child'],['P','kp: lips and back of the throat close at once, like a “k” and “p” together','pẹ̀lẹ́','gently / sorry'],['R','a light rolled r, close to the Spanish r','rárá','no'],
['S','s as in “sun”','sùn','sleep'],['Ṣ','sh as in “shoe”','ṣé','thanks'],['T','t as in “top”'],['U','oo as in “moon”'],['W','w as in “water”','wá','come'],['Y','y as in “yes”','yàrá','room']];
const SPECIAL=['Ẹ','Ọ','Ṣ','Gb','P'];

const TONES={L:{mark:'à',nm:'Low',solf:'do',hz:220,y:72},M:{mark:'a',nm:'Mid',solf:'re',hz:294,y:45},H:{mark:'á',nm:'High',solf:'mi',hz:392,y:18}};
const PAIRS=[
 {w:'ọkọ',en:'husband',t:'MM'},{w:'ọkọ̀',en:'vehicle',t:'ML'},{w:'ọkọ́',en:'hoe',t:'MH'},
 {w:'igba',en:'200',t:'MM'},{w:'ìgbà',en:'time',t:'LL'},{w:'igbá',en:'calabash',t:'MH'}];
