/* ===== 02-courses.js  The 21 courses, four tiers, and the extra lessons they need. ===== */
/* ---------- course catalogue: 21 courses in 4 tiers ----------
   Each lesson ("unit") is {id,title,yo,tip,items:[[yorùbá,english,note]]}.
   Special lesson types:  build:true  -> tap-the-words sentence builder
                          read:{...}  -> reading passage with questions
                          oneway:true -> only "Yorùbá -> English" questions (uses ask)
   Courses list their lesson ids, and may link to a feature page (link). */
const TIERS=[
 {id:'b',name:'Beginner',goal:'Foundations and survival Yorùbá: greetings, tones and a core vocabulary.'},
 {id:'i',name:'Intermediate',goal:'Move from single words to real, flowing everyday conversations.'},
 {id:'h',name:'Hard',goal:'Longer sentences, nuance and deeper grammar control.'},
 {id:'x',name:'Beyond',goal:'Cultural depth, dialects and real-world practice.'}];

UNITS.push(
/* Course 1: tones and orthography */
{id:'t1',title:'Tone marks',yo:'Àmì ohùn',tip:'Yorùbá has three tones. A grave mark ( ̀ ) is low, no mark is mid, and an acute mark ( ´ ) is high. The same letters with different tones are different words.',items:[
 ['à','low tone (grave mark)','Think “do.”'],['a','mid tone (no mark)','Think “re.”'],['á','high tone (acute mark)','Think “mi.”'],
 ['ọkọ','husband','Both syllables are mid.'],['ọkọ̀','vehicle','Mid, then low.'],['ọkọ́','hoe','Mid, then high.']]},
{id:'t2',title:'Special letters and nasal vowels',yo:'Àwọn lẹ́tà',tip:'Dots under ẹ, ọ and ṣ change the sound. A vowel followed by n is nasal: the n colors the vowel instead of being a separate sound.',items:[
 ['ẹ','sounds like “e” in bed',''],['ọ','sounds like “aw” in law',''],['ṣ','sounds like “sh”',''],['gb','one sound: g and b together',''],['p','said like “kp”',''],
 ['ọkùnrin','man','The “in” at the end is a nasal vowel.'],['obìnrin','woman','Also has a nasal vowel.'],['ìrẹsì','rice','Practise ẹ and the low tones.']]},
{id:'t3',title:'Same letters, new meaning',yo:'Ohùn yàtọ̀',tip:'Tone is part of the spelling. Read the marks carefully.',items:[
 ['igba','two hundred',''],['ìgbà','time',''],['igbá','calabash',''],['ilé','house',''],['ilẹ̀','ground / land',''],
 ['kọ','write',''],['kọ́','learn',''],['ọkọ̀','vehicle',''],['ọkọ','husband','']]},
/* Course 2 */
{id:'resp',title:'Respect and manners',yo:'Ìwà ọmọlúàbí',tip:'Many Yorùbá greetings fit what the person is doing. Starting with “Ẹ” shows respect.',items:[
 ['Ẹ kú iṣẹ́','Well done on your work','Said to someone working or who has just finished.'],['Ẹ kú àbọ̀','Welcome back','Said to someone who has returned.'],
 ['Ẹ kú ilé','Greetings to the people at home',''],['Ẹ kú ọdún','Happy festival / holiday',''],['Ẹ kú ọjọ́ ìbí','Happy birthday',''],
 ['Ẹ jọ̀ọ́','Please / excuse me',''],['Ẹ má bínú','Do not be offended / sorry',''],['Ẹ ṣé púpọ̀','Thank you very much','']]},
/* Course 3 */
{id:'house',title:'Around the house',yo:'Nínú ilé',tip:'Say “ilé” for house. Many house words start with “i.”',items:[
 ['ilẹ̀kùn','door',''],['fèrèsé','window',''],['tábìlì','table',''],['àga','chair',''],['ibùsùn','bed',''],['ìkòkò','pot',''],['àwo','plate',''],['ṣíbí','spoon',''],['iná','fire / light','']]},
{id:'food',title:'Food',yo:'Oúnjẹ',tip:'Food words you will hear at any Yorùbá table.',items:[
 ['iṣu','yam',''],['ẹ̀wà','beans',''],['ọ̀gẹ̀dẹ̀','banana',''],['ọsàn','orange',''],['ata','pepper',''],['iyọ̀','salt',''],['ẹran','meat',''],['àkàrà','bean cake',''],['ọbẹ̀','soup / stew','']]},
/* Course 4 */
{id:'num2',title:'Bigger numbers',yo:'Nọ́ńbà tó tóbi',tip:'Counting past 10 builds on “lá” (ten plus): ọ̀kanlá is 11. Tens have their own words.',items:[
 ['ọ̀kanlá','eleven (11)',''],['èjìlá','twelve (12)',''],['ẹ̀talá','thirteen (13)',''],['ẹ̀rinlá','fourteen (14)',''],['ogún','twenty (20)',''],
 ['ọgbọ̀n','thirty (30)',''],['ogójì','forty (40)',''],['àádọ́ta','fifty (50)',''],['ọgọ́rùn-ún','one hundred (100)',''],['igba','two hundred (200)','']]},
{id:'time',title:'Telling time',yo:'Àkókò',tip:'Time words: today, tomorrow, yesterday, and times of day.',items:[
 ['ìṣẹ́jú','minute',''],['wákàtí','hour',''],['oṣù','month',''],['ọdún','year',''],['òní','today',''],['ọ̀la','tomorrow',''],['àná','yesterday',''],
 ['òwúrọ̀','morning',''],['ọ̀sán','daytime / afternoon',''],['alẹ́','night / evening',''],['báyìí','now','']]},
/* Course 5 */
{id:'poss',title:'My, your, their',yo:'Ti èmi, ti ìwọ',tip:'Words for “my” and “your” come after the noun: ilé mi is “house my.”',items:[
 ['ilé mi','my house',''],['ilé rẹ','your house',''],['ilé rẹ̀','his / her house','The low tone on rẹ̀ matters.'],['ilé wa','our house',''],['ilé yín','your (many) house',''],['ilé wọn','their house','']]},
{id:'sent2',title:'More sentences',yo:'Àwọn gbólóhùn mìíràn',build:true,tip:'Order is subject, verb, object. Tap the words in order.',items:[
 ['Mo rí ajá','I see a dog',''],['O jẹ ẹja','You eat fish',''],['Ó mu omi','He drinks water',''],['A lọ sí ọjà','We go to the market',''],['Wọ́n kọ ìwé','They write a book',''],['Mo kà ìwé','I read a book',''],['Ó sùn','She sleeps','']]},
/* Course 6 */
{id:'dir',title:'Asking directions',yo:'Bíbèèrè ọ̀nà',tip:'Ask “Ibo ni … wà?” to say “Where is …?”',items:[
 ['Ibo ni ọjà wà?','Where is the market?',''],['ọ̀tún','right',''],['òsì','left',''],['tààrà','straight ahead',''],['nítòsí','near',''],['jìnnà','far',''],['dúró','stop / wait',''],['Mo sọnù','I am lost','']]},
{id:'shop',title:'Shopping and money',yo:'Ríra nǹkan',tip:'“Èló ni?” is the question you will use most in a market.',items:[
 ['Èló ni èyí?','How much is this?',''],['owó','money',''],['Mo fẹ́ ra èyí','I want to buy this',''],['ra','buy',''],['tà','sell',''],['Ó wọ́n jù','It is too expensive',''],['kékeré','small',''],['ńlá','big','']]},
{id:'help',title:'Getting help',yo:'Bíbèèrè ìrànlọ́wọ́',tip:'Handy phrases for when you need a hand.',items:[
 ['Ràn mí lọ́wọ́','Help me',''],['Ṣé o lè ràn mí lọ́wọ́?','Can you help me?',''],['Ibo ni ilé ìgbọ̀nsẹ̀ wà?','Where is the toilet?',''],['Mo ń kọ́ Yorùbá','I am learning Yorùbá',''],['Jọ̀wọ́ sọ̀rọ̀ díẹ̀díẹ̀','Please speak slowly','']]},
/* Course 7 */
{id:'asp1',title:'Tense and aspect markers',yo:'Àmì àsìkò',tip:'Yorùbá verbs do not change for tense. Small marker words and time words do the work.',items:[
 ['ń','marks an action in progress (is doing)','Mo ń jẹun means I am eating.'],['ti','marks “already” (has done)','Mo ti jẹun means I have eaten.'],['máa','marks the future (will)','Mo máa jẹun means I will eat.'],
 ['lánàá','yesterday','Used for past time. The verb does not change.'],['lónìí','today',''],['lọ́la','tomorrow','']]},
{id:'asp2',title:'Now, done and later',yo:'Báyìí, tán, àti lẹ́yìn',build:true,tip:'Build each sentence and notice which little word sets the time.',items:[
 ['Mo ń jẹun','I am eating',''],['Mo ti jẹun','I have eaten',''],['Mo máa jẹun','I will eat',''],['Ó ń sùn','He is sleeping',''],['Ó ti sùn','She has gone to sleep',''],['Wọ́n ń kọ ìwé','They are writing a book',''],['Mo lọ sí ọjà lánàá','I went to the market yesterday','']]},
/* Course 8 */
{id:'qw',title:'Question words',yo:'Àwọn ọ̀rọ̀ ìbéèrè',tip:'Most questions start with a question word. Yes-or-no questions often start with “Ṣé.”',items:[
 ['Kí ni èyí?','What is this?',''],['Ta ni yìí?','Who is this?',''],['Ibo ni o ń lọ?','Where are you going?',''],['Nígbà wo?','When?',''],['Kí ló dé?','Why? / What is wrong?',''],['Mélòó?','How many?',''],['Èwo ni?','Which one?',''],['Ṣé o fẹ́ omi?','Do you want water?','']]},
{id:'neg',title:'Saying no and not',yo:'Àìsí',tip:'“Ò” and “kò” go before the verb to mean not: mi ò is “I do not,” kò is “he, she or it does not.”',items:[
 ['Mi ò fẹ́ omi','I do not want water',''],['Kò sí omi','There is no water',''],['Kò dára','It is not good',''],['A ò lọ','We are not going',''],['Wọn kò wá','They did not come',''],['Mi ò jẹun','I am not eating / I have not eaten','']]},
/* Course 9 */
{id:'eat',title:'Ordering and eating',yo:'Jíjẹ oúnjẹ',tip:'Useful for the table and for ordering food.',items:[
 ['Mo fẹ́ jẹ àkàrà','I want to eat bean cake',''],['Ẹ jọ̀ọ́, mo fẹ́ omi','Please, I want water',''],['Ó dùn','It is sweet / tasty',''],['Mo yó','I am full',''],['Ebi ń pa mí','I am hungry',''],['Òùngbẹ ń gbẹ mí','I am thirsty','']]},
{id:'bargain',title:'Market bargaining',yo:'Ríra àti títà',tip:'Bargaining is friendly. Smile and keep it polite.',items:[
 ['Dín owó rẹ̀ kù','Reduce its price',''],['Ó wọ́n jù','It is too expensive',''],['Ṣé o lè dín in kù?','Can you reduce it?',''],['Mo máa san ẹgbẹ̀rún kan','I will pay one thousand',''],['Ó dára, mo ra','Okay, I will buy it','']]},
{id:'party',title:'Celebrations',yo:'Ayẹyẹ',tip:'Words you will hear at weddings and festivals.',items:[
 ['ayẹyẹ','celebration / party',''],['ìgbéyàwó','wedding',''],['aṣọ ìbílẹ̀','traditional clothes',''],['ìlù','drum',''],['ijó','dance',''],['orin','song',''],['ẹ̀bùn','gift',''],['Ẹ kú oríire','Congratulations',''],['Ẹ kú ayẹyẹ','Greetings on the celebration','']]},
/* Course 10 */
{id:'dverbs',title:'Daily action words',yo:'Ìṣe ojoojúmọ́',tip:'Verbs for a normal day.',items:[
 ['dìde','wake up / stand up',''],['wẹ̀','bathe / wash',''],['ṣiṣẹ́','work',''],['sinmi','rest',''],['ṣe oúnjẹ','cook',''],['padà','return',''],['fọ̀ aṣọ','wash clothes','']]},
{id:'routine',title:'My day',yo:'Ọjọ́ mi',build:true,tip:'Put a day together, one sentence at a time.',items:[
 ['Mo dìde ní òwúrọ̀','I wake up in the morning',''],['Mo wẹ̀ ní òwúrọ̀','I bathe in the morning',''],['Mo ṣiṣẹ́ ní ilé','I work at home',''],['Mo ń kàwé ní alẹ́','I study at night',''],['Mo sùn ní alẹ́','I sleep at night','']]},
/* Course 11 */
{id:'adj',title:'Describing words',yo:'Àwọn ọ̀rọ̀ àpèjúwe',tip:'Describing words follow the noun: ilé ńlá is “house big.”',items:[
 ['ńlá','big',''],['kékeré','small',''],['tuntun','new',''],['gíga','tall',''],['kúkúrú','short',''],['dára','good',''],['burú','bad',''],['gbóná','hot',''],['tútù','cold',''],['dùn','sweet',''],['funfun','white',''],['dúdú','black',''],['pupa','red',''],['lẹ́wà','beautiful','']]},
{id:'comp',title:'Comparing things',yo:'Fífi wé',build:true,tip:'“ju … lọ” means more than: A tóbi ju B lọ.',items:[
 ['Ilé yìí tóbi ju ilé yẹn lọ','This house is bigger than that house',''],['Mo ga ju Ayọ̀ lọ','I am taller than Ayọ̀',''],['Ó dára ju èyí lọ','It is better than this',''],['Ó rẹ̀ mí','I am tired',''],['Inú mi dùn','I am happy','']]},
/* Course 13 */
{id:'conj',title:'Joining words',yo:'Àwọn ọ̀rọ̀ àsopọ̀',tip:'These words join ideas into longer sentences.',items:[
 ['àti','and',''],['ṣùgbọ́n','but',''],['tàbí','or',''],['nítorí pé','because',''],['bí … bá','if',''],['nígbà tí','when',''],['pé','that',''],['nítorí náà','therefore','']]},
{id:'conj2',title:'Longer sentences',yo:'Gbólóhùn gígùn',build:true,tip:'Build sentences with because, but and if.',items:[
 ['Mo fẹ́ lọ, ṣùgbọ́n mi ò ní owó','I want to go, but I have no money',''],['Bí o bá wá, èmi yóò dúró','If you come, I will wait',''],['Mo sùn nítorí pé ó rẹ̀ mí','I slept because I was tired',''],['Ó sọ pé òun ń bọ̀','He said that he is coming','']]},
/* Course 14 */
{id:'idi',title:'Feelings and body words',yo:'Ọ̀rọ̀ inú àti ara',tip:'Yorùbá often talks about feelings through the body. The meaning is not word for word.',items:[
 ['Inú mi dùn','I am happy','Literally: “my inside is sweet.”'],['Inú mi bàjẹ́','I am upset','Literally: “my inside is spoiled.”'],['Ó ní ọkàn rere','He / she has a kind heart','Literally: “has a good heart.”'],
 ['Orí ń fọ́ mi','I have a headache','Literally: “my head is breaking me.”'],['Ikùn ń run mí','I have a stomach ache','Literally: “my stomach is hurting me.”'],['Ó rẹ̀ mí','I am tired','']]},
/* Course 15 */
{id:'opin',title:'Giving your opinion',yo:'Sísọ èrò rẹ',tip:'Phrases for explaining what you think.',items:[
 ['Mo rò pé…','I think that…',''],['Mo gbà','I agree',''],['Mi ò gbà','I disagree',''],['Ní èrò tèmi','In my opinion',''],['Ó ṣe pàtàkì','It is important',''],['ìròyìn','news',''],['ìjọba','government',''],['ìdìbò','election',''],['ọjọ́ iwájú','the future',''],['ètò','plan','']]},
/* Course 16 */
{id:'read1',title:'Read: Meet Ayọ̀',yo:'Ka èyí',read:{
 text:'Orúkọ mi ni Ayọ̀. Mo ń gbé ní Ìbàdàn. Mo ní àbúrò méjì. Mo lọ sí ilé-ìwé ní ọjọ́ Ajé. Mo fẹ́ràn láti kàwé.',
 en:'My name is Ayọ̀. I live in Ibadan. I have two younger siblings. I go to school on Monday. I like to read.',
 qs:[['Where does Ayọ̀ live?',['Ibadan','Lagos','Oyo','Abeokuta'],0],['How many younger siblings does Ayọ̀ have?',['One','Two','Three','None'],1],['What does Ayọ̀ like to do?',['Read','Cook','Sing','Dance'],0]]},
 tip:'Read the passage slowly, then answer the questions. Tap the speaker to hear it if your device has a Yorùbá voice.'},
{id:'read2',title:'Read: At the market',yo:'Ka èyí',read:{
 text:'Mo lọ sí ọjà lónìí. Mo fẹ́ ra ìrẹsì àti ẹja. Ìrẹsì wọ́n jù. Mo ra ẹja méjì. Mo dúpẹ́ lọ́wọ́ olùtà.',
 en:'I went to the market today. I want to buy rice and fish. The rice is too expensive. I bought two fish. I thanked the seller.',
 qs:[['What was too expensive?',['The rice','The fish','The market','The book'],0],['What did the writer buy?',['Two fish','Rice','Two rice','Nothing'],0],['Who did the writer thank?',['The seller','A teacher','A driver','A friend'],0]]},
 tip:'Look for words you know: ọjà, ìrẹsì, ẹja, owó.'},
/* Course 17 */
{id:'formal',title:'Work and school language',yo:'Èdè iṣẹ́ àti ilé-ìwé',tip:'More formal words for offices, classrooms and meetings.',items:[
 ['Ẹ káàbọ̀, ẹ jókòó','Welcome, please sit down',''],['ọ̀gá','boss / sir',''],['olùkọ́','teacher',''],['oníṣòwò','trader / businessperson',''],['iṣẹ́','work / job',''],['ìpàdé','meeting',''],['ìbéèrè','question',''],['Mo dúpẹ́','I give thanks',''],['owó oṣù','salary',''],['Ẹ ṣeun','Thank you (formal)','']]},
{id:'titles',title:'Titles and ceremony',yo:'Oyè àti ayẹyẹ',tip:'Ceremonial speech is learned from elders. These titles are a starting point.',items:[
 ['ọba','king',''],['Kábíyèsí','Your Majesty (title for a king)',''],['olóyè','chief / titleholder',''],['baálẹ̀','head of a village / town',''],['Aláàfin','title of the king of Ọ̀yọ́',''],['Ọ̀ọ̀ni','title of the king of Ilé-Ifẹ̀','']]},
/* Course 18 */
{id:'owe',title:'Proverbs (Òwe)',yo:'Òwe',tip:'Elders use proverbs to make a point gently. Learn what each one means, not just the words.',items:[
 ['Ìwà lẹ̀wà ọmọ ènìyàn','Character is a person’s beauty',''],['Bí ọmọdé bá mọ ọwọ́ wẹ̀, yóò bá àgbà jẹun','A child who washes their hands well may eat with elders','Good manners earn a seat at the table.'],
 ['Òwe lẹṣin ọ̀rọ̀','A proverb is the horse of speech','The full saying adds that proverbs help you find lost words.'],['Àgbájọ ọwọ́ la fi ń sọ̀yà','Working together gets things done','Unity is strength.']]},
{id:'folk',title:'Folktales',yo:'Ìtàn àti àlọ́',tip:'Folktales often begin with a call and a reply between the storyteller and the listeners.',items:[
 ['Àlọ́ o!','Storyteller’s call: “A story!”','The listeners answer “Àlọ́!”'],['Àlọ́!','The listeners’ reply',''],['Ìjàpá','Tortoise, the clever trickster of many tales',''],['ìtàn','story / history',''],['orin','song','']]},
/* Course 19 */
{id:'dial',title:'Where do they speak what?',yo:'Èdè àdúgbò',oneway:true,ask:'Which dialect area is this place in?',tip:'Standard Yorùbá is used at school and on radio. Hometown speech can differ in sounds and words. Scholars group the dialects into Northwest, Central, Southeast and Northeast.',items:[
 ['Ọ̀yọ́','Northwest',''],['Ìbàdàn','Northwest',''],['Abẹ́òkúta (Ẹ̀gbá)','Northwest',''],['Ilé-Ifẹ̀','Central',''],['Ìlẹ́sà (Ìjẹ̀ṣà)','Central',''],['Ìjẹ̀bú','Southeast',''],['Òndó','Southeast',''],['Ẹ̀kìtì','Northeast','']]}
);

const COURSES=[
 {id:1,tier:'b',title:'Yorùbá Tones and Orthography',blurb:'Low, mid and high tones, special letters, nasal vowels and the alphabet.',units:['t1','t2','t3'],link:{page:'tones',label:'Practise in the Tone Lab'}},
 {id:2,tier:'b',title:'Greetings, Etiquette and Respect',blurb:'Morning and afternoon greetings, respecting elders, polite expressions.',units:['greet','resp']},
 {id:3,tier:'b',title:'Essential Nouns and Everyday Objects',blurb:'Family members, food and common household items.',units:['fam','things','house','food']},
 {id:4,tier:'b',title:'Numbers, Time and Days',blurb:'Counting, telling time and the days of the week.',units:['num','num2','days','time']},
 {id:5,tier:'b',title:'Sentence Structure and Pronouns',blurb:'Subject-verb-object, I, you, he, she, we and they.',units:['me','poss','sent','sent2']},
 {id:6,tier:'b',title:'Survival Phrases and Travel',blurb:'Asking directions, shopping and market conversations.',units:['dir','shop','help']},
 {id:7,tier:'i',title:'Tenses and Aspect',blurb:'Past, present and future markers in Yorùbá.',units:['asp1','asp2']},
 {id:8,tier:'i',title:'Questions and Negation',blurb:'Who, what, where, why, and how to say no and not.',units:['qw','neg']},
 {id:9,tier:'i',title:'Food, Culture and Social Life',blurb:'Ordering local dishes, ceremonies and market bargaining.',units:['eat','bargain','party']},
 {id:10,tier:'i',title:'Action Verbs and Daily Routines',blurb:'Describe what you do at work, home and school.',units:['verbs','dverbs','routine']},
 {id:11,tier:'i',title:'Adjectives and Comparisons',blurb:'Describe people, places, feelings and objects.',units:['adj','comp']},
 {id:12,tier:'i',title:'Intermediate Listening and Audio Drills',blurb:'Train your ear with real recordings: pick the sentence or type what you hear.',units:[],link:{page:'audio',label:'Open the Audio Lab'}},
 {id:13,tier:'h',title:'Complex Sentences and Conjunctions',blurb:'Because, although, if and then, and longer sentences.',units:['conj','conj2'],draft:true},
 {id:14,tier:'h',title:'Idioms, Metaphors and Cultural Context',blurb:'Meanings that are not word for word.',units:['idi'],draft:true},
 {id:15,tier:'h',title:'Debating, Opinions and Abstract Topics',blurb:'Express feelings, opinions, news and plans.',units:['opin'],draft:true},
 {id:16,tier:'h',title:'Reading and Writing Graded Texts',blurb:'Read short passages and answer questions, then write your own.',units:['read1','read2'],link:{page:'write',label:'Try the Writing Lab'},draft:true},
 {id:17,tier:'h',title:'Professional and Formal Yorùbá',blurb:'Work and school language, and the titles used in ceremonies.',units:['formal','titles'],draft:true},
 {id:18,tier:'x',title:'Proverbs (Òwe) and Folklore',blurb:'The wisdom traditions at the center of Yorùbá speech.',units:['owe','folk'],draft:true},
 {id:19,tier:'x',title:'Regional Dialect Variations',blurb:'How speech shifts across Egba, Ọ̀yọ́, Ìjẹ̀bú, Òndó and beyond.',units:['dial'],draft:true},
 {id:20,tier:'x',title:'Real-World Conversation Practicum',blurb:'Chat and phone-call role plays at three levels, with fixes and a rating.',units:[],link:{page:'chat',label:'Open Chat practice'}},
 {id:21,tier:'x',title:'Creative Writing and Composition',blurb:'Write notes, stories and letters, and get your orthography checked.',units:[],link:{page:'write',label:'Open the Writing Lab'}}
];
COURSES.forEach(c=>c.units.forEach((id,k)=>{const u=UNITS.find(x=>x.id===id);if(u){u.n=k+1;u.course=c.id}}));

/* normalise every lesson into {yo,en,note,unit} items, then build the global word list */
UNITS.forEach(u=>u.items=(u.items||[]).map(a=>({yo:a[0],en:a[1],note:a[2],unit:u.id})));
const ALL=UNITS.flatMap(u=>u.items);
