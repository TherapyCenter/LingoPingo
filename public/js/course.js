// Kursinhalte. Spanisch, Englisch und Kroatisch stehen direkt bei den Wörtern,
// weitere Sprachen kommen aus lang/xx.js. Mehrere akzeptierte Antworten mit "|"
// trennen – die erste wird angezeigt.
import IT from './lang/it.js';
import FR from './lang/fr.js';
import TR from './lang/tr.js';
import ZH from './lang/zh.js';
import JA from './lang/ja.js';

export const LANGS = {
  de: { name: 'Deutsch', native: 'Deutsch', flag: '🇩🇪', tts: 'de-DE', accents: 'äöüß' },
  es: { name: 'Spanisch', native: 'Español', flag: '🇪🇸', tts: 'es-ES', accents: 'áéíóúñü¿¡' },
  en: { name: 'Englisch', native: 'English', flag: '🇬🇧', tts: 'en-GB', accents: '' },
  hr: { name: 'Kroatisch', native: 'Hrvatski', flag: '🇭🇷', tts: 'hr-HR', accents: 'čćšžđ' },
  it: { name: 'Italienisch', native: 'Italiano', flag: '🇮🇹', tts: 'it-IT', accents: 'àèéìòù' },
  fr: { name: 'Französisch', native: 'Français', flag: '🇫🇷', tts: 'fr-FR', accents: 'àâçéèêëîïôùûœ' },
  tr: { name: 'Türkisch', native: 'Türkçe', flag: '🇹🇷', tts: 'tr-TR', accents: 'çğıİöşü' },
  zh: { name: 'Chinesisch', native: '中文', flag: '🇨🇳', tts: 'zh-CN', accents: '', cjk: true },
  ja: { name: 'Japanisch', native: '日本語', flag: '🇯🇵', tts: 'ja-JP', accents: '', cjk: true },
};

export const UNITS = [
  {
    id: 'basics', title: 'Erste Worte', icon: '👋', color: '#58cc02',
    tip: 'Begrüßungen sind der beste Start – damit kommst du überall ins Gespräch!',
    words: [
      { e: '👋', de: 'Hallo', es: 'hola', en: 'hello|hi', hr: 'bok|zdravo' },
      { e: '🚶', de: 'Tschüss', es: 'adiós|chao', en: 'goodbye|bye', hr: 'doviđenja|zbogom' },
      { e: '🙏', de: 'Danke', es: 'gracias', en: 'thank you|thanks', hr: 'hvala' },
      { e: '🤲', de: 'Bitte', es: 'por favor', en: 'please', hr: 'molim' },
      { e: '👍', de: 'Ja', es: 'sí', en: 'yes', hr: 'da' },
      { e: '👎', de: 'Nein', es: 'no', en: 'no', hr: 'ne' },
      { e: '🌅', de: 'Guten Morgen', es: 'buenos días', en: 'good morning', hr: 'dobro jutro' },
      { e: '🌙', de: 'Gute Nacht', es: 'buenas noches', en: 'good night', hr: 'laku noć' },
    ],
    sentences: [
      { de: 'Hallo, wie geht es dir?', es: 'Hola, ¿cómo estás?|Hola, ¿qué tal?', en: 'Hello, how are you?|Hi, how are you?', hr: 'Bok, kako si?|Zdravo, kako si?' },
      { de: 'Ich heiße Ana.', es: 'Me llamo Ana.', en: 'My name is Ana.', hr: 'Zovem se Ana.' },
      { de: 'Gut, danke.', es: 'Bien, gracias.', en: 'Fine, thank you.|Good, thanks.|Fine, thanks.', hr: 'Dobro, hvala.' },
      { de: 'Freut mich.', es: 'Mucho gusto.|Encantado.', en: 'Nice to meet you.', hr: 'Drago mi je.' },
    ],
  },
  {
    id: 'food', title: 'Essen & Trinken', icon: '🍎', color: '#ff9600',
    tip: 'Mit diesen Wörtern verhungerst du im Urlaub garantiert nicht.',
    words: [
      { e: '💧', de: 'Wasser', es: 'agua', en: 'water', hr: 'voda' },
      { e: '🍞', de: 'Brot', es: 'pan', en: 'bread', hr: 'kruh' },
      { e: '🍎', de: 'Apfel', es: 'manzana', en: 'apple', hr: 'jabuka' },
      { e: '🥛', de: 'Milch', es: 'leche', en: 'milk', hr: 'mlijeko' },
      { e: '☕', de: 'Kaffee', es: 'café', en: 'coffee', hr: 'kava' },
      { e: '🧀', de: 'Käse', es: 'queso', en: 'cheese', hr: 'sir' },
      { e: '🥚', de: 'Ei', es: 'huevo', en: 'egg', hr: 'jaje' },
      { e: '🍌', de: 'Banane', es: 'plátano|banana', en: 'banana', hr: 'banana' },
    ],
    sentences: [
      { de: 'Ich trinke Wasser.', es: 'Bebo agua.|Yo bebo agua.', en: 'I drink water.', hr: 'Pijem vodu.|Ja pijem vodu.' },
      { de: 'Ich esse einen Apfel.', es: 'Como una manzana.|Yo como una manzana.', en: 'I eat an apple.|I am eating an apple.', hr: 'Jedem jabuku.|Ja jedem jabuku.' },
      { de: 'Der Kaffee ist heiß.', es: 'El café está caliente.', en: 'The coffee is hot.', hr: 'Kava je vruća.' },
      { de: 'Brot und Käse, bitte.', es: 'Pan y queso, por favor.', en: 'Bread and cheese, please.', hr: 'Kruh i sir, molim.' },
    ],
  },
  {
    id: 'animals', title: 'Tiere', icon: '🐶', color: '#1cb0f6',
    tip: 'Tiere sind perfekt zum Üben – sie kommen in jeder Geschichte vor.',
    words: [
      { e: '🐶', de: 'Hund', es: 'perro', en: 'dog', hr: 'pas' },
      { e: '🐱', de: 'Katze', es: 'gato', en: 'cat', hr: 'mačka' },
      { e: '🐦', de: 'Vogel', es: 'pájaro', en: 'bird', hr: 'ptica' },
      { e: '🐟', de: 'Fisch', es: 'pez', en: 'fish', hr: 'riba' },
      { e: '🐴', de: 'Pferd', es: 'caballo', en: 'horse', hr: 'konj' },
      { e: '🐮', de: 'Kuh', es: 'vaca', en: 'cow', hr: 'krava' },
      { e: '🐭', de: 'Maus', es: 'ratón', en: 'mouse', hr: 'miš' },
      { e: '🐻', de: 'Bär', es: 'oso', en: 'bear', hr: 'medvjed' },
    ],
    sentences: [
      { de: 'Der Hund ist groß.', es: 'El perro es grande.', en: 'The dog is big.', hr: 'Pas je velik.' },
      { de: 'Die Katze schläft.', es: 'El gato duerme.|La gata duerme.', en: 'The cat sleeps.|The cat is sleeping.', hr: 'Mačka spava.' },
      { de: 'Ich habe einen Hund.', es: 'Tengo un perro.|Yo tengo un perro.', en: 'I have a dog.', hr: 'Imam psa.|Ja imam psa.' },
      { de: 'Der Vogel singt.', es: 'El pájaro canta.', en: 'The bird sings.|The bird is singing.', hr: 'Ptica pjeva.' },
    ],
  },
  {
    id: 'colors', title: 'Farben', icon: '🎨', color: '#ce82ff',
    tip: 'Im Spanischen und Kroatischen passen sich Farben dem Nomen an (rojo/roja, crven/crvena).',
    words: [
      { e: '🔴', de: 'rot', es: 'rojo', en: 'red', hr: 'crven' },
      { e: '🔵', de: 'blau', es: 'azul', en: 'blue', hr: 'plav' },
      { e: '🟢', de: 'grün', es: 'verde', en: 'green', hr: 'zelen' },
      { e: '🟡', de: 'gelb', es: 'amarillo', en: 'yellow', hr: 'žut' },
      { e: '⚫', de: 'schwarz', es: 'negro', en: 'black', hr: 'crn' },
      { e: '⚪', de: 'weiß', es: 'blanco', en: 'white', hr: 'bijel' },
      { e: '🟠', de: 'orange', es: 'naranja', en: 'orange', hr: 'narančast' },
      { e: '🟤', de: 'braun', es: 'marrón', en: 'brown', hr: 'smeđ' },
    ],
    sentences: [
      { de: 'Der Apfel ist rot.', es: 'La manzana es roja.', en: 'The apple is red.', hr: 'Jabuka je crvena.' },
      { de: 'Das Meer ist blau.', es: 'El mar es azul.', en: 'The sea is blue.', hr: 'More je plavo.' },
      { de: 'Die Katze ist schwarz.', es: 'El gato es negro.', en: 'The cat is black.', hr: 'Mačka je crna.' },
      { de: 'Ich mag die Farbe Grün.', es: 'Me gusta el color verde.', en: 'I like the color green.|I like the colour green.', hr: 'Volim zelenu boju.' },
    ],
  },
  {
    id: 'numbers', title: 'Zahlen', icon: '🔢', color: '#ff4b4b',
    tip: 'Zahlen brauchst du beim Einkaufen, für die Uhrzeit und dein Alter.',
    words: [
      { e: '1️⃣', de: 'eins', es: 'uno', en: 'one', hr: 'jedan' },
      { e: '2️⃣', de: 'zwei', es: 'dos', en: 'two', hr: 'dva' },
      { e: '3️⃣', de: 'drei', es: 'tres', en: 'three', hr: 'tri' },
      { e: '4️⃣', de: 'vier', es: 'cuatro', en: 'four', hr: 'četiri' },
      { e: '5️⃣', de: 'fünf', es: 'cinco', en: 'five', hr: 'pet' },
      { e: '6️⃣', de: 'sechs', es: 'seis', en: 'six', hr: 'šest' },
      { e: '7️⃣', de: 'sieben', es: 'siete', en: 'seven', hr: 'sedam' },
      { e: '🔟', de: 'zehn', es: 'diez', en: 'ten', hr: 'deset' },
    ],
    sentences: [
      { de: 'Ich habe zwei Katzen.', es: 'Tengo dos gatos.', en: 'I have two cats.', hr: 'Imam dvije mačke.' },
      { de: 'Drei Äpfel, bitte.', es: 'Tres manzanas, por favor.', en: 'Three apples, please.', hr: 'Tri jabuke, molim.' },
      { de: 'Ich bin zehn Jahre alt.', es: 'Tengo diez años.', en: 'I am ten years old.|I\'m ten years old.', hr: 'Imam deset godina.' },
      { de: 'Eins, zwei, drei!', es: '¡Uno, dos, tres!', en: 'One, two, three!', hr: 'Jedan, dva, tri!' },
    ],
  },
  {
    id: 'family', title: 'Familie & Freunde', icon: '👨‍👩‍👧', color: '#2b70c9',
    tip: '„Mein/meine“ heißt auf Spanisch einfach „mi“ – egal ob Mutter oder Vater.',
    words: [
      { e: '👩', de: 'Mutter', es: 'madre|mamá', en: 'mother|mom|mum', hr: 'majka|mama' },
      { e: '👨', de: 'Vater', es: 'padre|papá', en: 'father|dad', hr: 'otac|tata' },
      { e: '👦', de: 'Bruder', es: 'hermano', en: 'brother', hr: 'brat' },
      { e: '👧', de: 'Schwester', es: 'hermana', en: 'sister', hr: 'sestra' },
      { e: '🧒', de: 'Kind', es: 'niño', en: 'child|kid', hr: 'dijete' },
      { e: '🤝', de: 'Freund', es: 'amigo', en: 'friend', hr: 'prijatelj' },
      { e: '👵', de: 'Oma', es: 'abuela', en: 'grandmother|grandma', hr: 'baka' },
      { e: '👴', de: 'Opa', es: 'abuelo', en: 'grandfather|grandpa', hr: 'djed' },
    ],
    sentences: [
      { de: 'Das ist meine Mutter.', es: 'Esta es mi madre.|Ella es mi madre.', en: 'This is my mother.|This is my mom.', hr: 'Ovo je moja majka.|Ovo je moja mama.' },
      { de: 'Mein Bruder ist groß.', es: 'Mi hermano es alto.', en: 'My brother is tall.', hr: 'Moj brat je visok.' },
      { de: 'Ich liebe meine Familie.', es: 'Quiero a mi familia.|Amo a mi familia.', en: 'I love my family.', hr: 'Volim svoju obitelj.|Volim moju obitelj.' },
      { de: 'Wir sind Freunde.', es: 'Somos amigos.', en: 'We are friends.|We\'re friends.', hr: 'Mi smo prijatelji.|Prijatelji smo.' },
    ],
  },
  {
    id: 'travel', title: 'Unterwegs', icon: '✈️', color: '#00cd9c',
    tip: 'Die wichtigste Frage auf Reisen: „Wo ist …?“',
    words: [
      { e: '🏠', de: 'Haus', es: 'casa', en: 'house', hr: 'kuća' },
      { e: '🚗', de: 'Auto', es: 'coche|carro', en: 'car', hr: 'auto' },
      { e: '🚆', de: 'Zug', es: 'tren', en: 'train', hr: 'vlak' },
      { e: '🛣️', de: 'Straße', es: 'calle', en: 'street|road', hr: 'ulica' },
      { e: '🏨', de: 'Hotel', es: 'hotel', en: 'hotel', hr: 'hotel' },
      { e: '🏖️', de: 'Strand', es: 'playa', en: 'beach', hr: 'plaža' },
      { e: '🏙️', de: 'Stadt', es: 'ciudad', en: 'city|town', hr: 'grad' },
      { e: '🛫', de: 'Flughafen', es: 'aeropuerto', en: 'airport', hr: 'zračna luka|aerodrom' },
    ],
    sentences: [
      { de: 'Wo ist der Bahnhof?', es: '¿Dónde está la estación?', en: 'Where is the station?|Where is the train station?', hr: 'Gdje je kolodvor?' },
      { de: 'Ich fahre mit dem Zug.', es: 'Voy en tren.', en: 'I go by train.|I am going by train.', hr: 'Idem vlakom.' },
      { de: 'Der Strand ist schön.', es: 'La playa es bonita.', en: 'The beach is beautiful.|The beach is nice.', hr: 'Plaža je lijepa.' },
      { de: 'Ich suche ein Hotel.', es: 'Busco un hotel.', en: 'I am looking for a hotel.|I\'m looking for a hotel.', hr: 'Tražim hotel.' },
    ],
  },
  {
    id: 'verbs', title: 'Alltag', icon: '⚽', color: '#ff86d0',
    tip: 'Im Spanischen und Kroatischen lässt man „ich“ meist weg – die Verbform verrät schon, wer es ist.',
    words: [
      { e: '🍽️', de: 'essen', es: 'comer', en: 'eat|to eat', hr: 'jesti' },
      { e: '🥤', de: 'trinken', es: 'beber|tomar', en: 'drink|to drink', hr: 'piti' },
      { e: '😴', de: 'schlafen', es: 'dormir', en: 'sleep|to sleep', hr: 'spavati' },
      { e: '🚶‍♀️', de: 'gehen', es: 'ir|caminar', en: 'go|to go|walk', hr: 'ići|hodati' },
      { e: '🗣️', de: 'sprechen', es: 'hablar', en: 'speak|to speak|talk', hr: 'govoriti' },
      { e: '📖', de: 'lesen', es: 'leer', en: 'read|to read', hr: 'čitati' },
      { e: '✍️', de: 'schreiben', es: 'escribir', en: 'write|to write', hr: 'pisati' },
      { e: '🎮', de: 'spielen', es: 'jugar', en: 'play|to play', hr: 'igrati' },
    ],
    sentences: [
      { de: 'Ich lerne eine neue Sprache.', es: 'Aprendo un idioma nuevo.|Aprendo una lengua nueva.', en: 'I am learning a new language.|I learn a new language.', hr: 'Učim novi jezik.' },
      { de: 'Wir spielen Fußball.', es: 'Jugamos al fútbol.|Jugamos fútbol.', en: 'We play football.|We play soccer.', hr: 'Igramo nogomet.' },
      { de: 'Sie liest ein Buch.', es: 'Ella lee un libro.|Lee un libro.', en: 'She reads a book.|She is reading a book.', hr: 'Ona čita knjigu.|Čita knjigu.' },
      { de: 'Ich schlafe gern.', es: 'Me gusta dormir.', en: 'I like to sleep.|I like sleeping.', hr: 'Volim spavati.' },
    ],
  },
  {
    id: 'feelings', title: 'Wie geht\'s?', icon: '😊', color: '#ffc800',
    tip: 'Spanisch: „estar“ für Zustände (cansado), „ser“ für Eigenschaften (grande).',
    words: [
      { e: '😊', de: 'glücklich', es: 'feliz|contento', en: 'happy', hr: 'sretan' },
      { e: '😢', de: 'traurig', es: 'triste', en: 'sad', hr: 'tužan' },
      { e: '🥱', de: 'müde', es: 'cansado', en: 'tired', hr: 'umoran' },
      { e: '🤒', de: 'krank', es: 'enfermo', en: 'sick|ill', hr: 'bolestan' },
      { e: '🏔️', de: 'groß', es: 'grande', en: 'big|large', hr: 'velik|veliki' },
      { e: '🐜', de: 'klein', es: 'pequeño', en: 'small|little', hr: 'malen|mali' },
      { e: '🌸', de: 'schön', es: 'bonito|hermoso', en: 'beautiful|pretty', hr: 'lijep' },
      { e: '✨', de: 'neu', es: 'nuevo', en: 'new', hr: 'nov|novi' },
    ],
    sentences: [
      { de: 'Ich bin müde.', es: 'Estoy cansado.|Estoy cansada.', en: 'I am tired.|I\'m tired.', hr: 'Umoran sam.|Umorna sam.|Ja sam umoran.' },
      { de: 'Bist du glücklich?', es: '¿Eres feliz?|¿Estás contento?', en: 'Are you happy?', hr: 'Jesi li sretan?|Jesi li sretna?' },
      { de: 'Das Haus ist klein.', es: 'La casa es pequeña.', en: 'The house is small.', hr: 'Kuća je mala.' },
      { de: 'Mein Auto ist neu.', es: 'Mi coche es nuevo.', en: 'My car is new.', hr: 'Moj auto je nov.|Moj auto je novi.' },
    ],
  },
  {
    id: 'weather', title: 'Zeit & Wetter', icon: '🌦️', color: '#7a5af8',
    tip: 'Spanisch „mañana“ heißt „morgen“ – und „la mañana“ der Morgen!',
    words: [
      { e: '📍', np: 1, de: 'heute', es: 'hoy', en: 'today', hr: 'danas' },
      { e: '⏭️', np: 1, de: 'morgen', es: 'mañana', en: 'tomorrow', hr: 'sutra' },
      { e: '⏮️', np: 1, de: 'gestern', es: 'ayer', en: 'yesterday', hr: 'jučer' },
      { e: '☀️', de: 'Sonne', es: 'sol', en: 'sun', hr: 'sunce' },
      { e: '🌧️', de: 'Regen', es: 'lluvia', en: 'rain', hr: 'kiša' },
      { e: '❄️', de: 'Schnee', es: 'nieve', en: 'snow', hr: 'snijeg' },
      { e: '📅', de: 'Tag', es: 'día', en: 'day', hr: 'dan' },
      { e: '🗓️', de: 'Woche', es: 'semana', en: 'week', hr: 'tjedan' },
    ],
    sentences: [
      { de: 'Heute ist es warm.', es: 'Hoy hace calor.', en: 'Today it is warm.|It is warm today.|It\'s warm today.', hr: 'Danas je toplo.' },
      { de: 'Die Sonne scheint.', es: 'Hace sol.|El sol brilla.', en: 'The sun is shining.|The sun shines.', hr: 'Sunce sja.' },
      { de: 'Morgen regnet es.', es: 'Mañana llueve.|Mañana va a llover.', en: 'It will rain tomorrow.|Tomorrow it will rain.', hr: 'Sutra pada kiša.|Sutra će padati kiša.' },
      { de: 'Bis morgen!', es: '¡Hasta mañana!', en: 'See you tomorrow!', hr: 'Vidimo se sutra!|Do sutra!' },
    ],
  },
  {
    id: 'restaurant', title: 'Im Restaurant', icon: '🍝', color: '#e5484d',
    tip: 'Höflich bestellen: einfach „…, bitte“ anhängen – das klappt in jeder Sprache.',
    words: [
      { e: '📋', de: 'Speisekarte', es: 'carta|menú', en: 'menu', hr: 'jelovnik' },
      { e: '🧾', de: 'Rechnung', es: 'cuenta', en: 'bill|check', hr: 'račun' },
      { e: '🤵', de: 'Kellner', es: 'camarero|mesero', en: 'waiter', hr: 'konobar' },
      { e: '🍲', de: 'Suppe', es: 'sopa', en: 'soup', hr: 'juha' },
      { e: '🥩', de: 'Fleisch', es: 'carne', en: 'meat', hr: 'meso' },
      { e: '🥗', de: 'Salat', es: 'ensalada', en: 'salad', hr: 'salata' },
      { e: '🍷', de: 'Wein', es: 'vino', en: 'wine', hr: 'vino' },
      { e: '🍺', de: 'Bier', es: 'cerveza', en: 'beer', hr: 'pivo' },
    ],
    sentences: [
      { de: 'Die Rechnung, bitte.', es: 'La cuenta, por favor.', en: 'The bill, please.|The check, please.', hr: 'Račun, molim.' },
      { de: 'Eine Suppe, bitte.', es: 'Una sopa, por favor.', en: 'A soup, please.', hr: 'Jednu juhu, molim.|Juhu, molim.' },
      { de: 'Das Essen ist lecker.', es: 'La comida está rica.|La comida está deliciosa.', en: 'The food is delicious.|The food is tasty.', hr: 'Hrana je ukusna.' },
      { de: 'Ein Bier und ein Wein.', es: 'Una cerveza y un vino.', en: 'A beer and a wine.|One beer and one wine.', hr: 'Jedno pivo i jedno vino.|Pivo i vino.' },
    ],
  },
  {
    id: 'clothes', title: 'Kleidung', icon: '👕', color: '#0ea5e9',
    tip: 'Spanisch „llevar“ heißt tragen (Kleidung) – und auch mitnehmen.',
    words: [
      { e: '👕', de: 'T-Shirt', es: 'camiseta', en: 'T-shirt|tshirt|t shirt', hr: 'majica' },
      { e: '👖', de: 'Hose', es: 'pantalones|pantalón', en: 'trousers|pants', hr: 'hlače' },
      { e: '👗', de: 'Kleid', es: 'vestido', en: 'dress', hr: 'haljina' },
      { e: '👞', de: 'Schuhe', es: 'zapatos', en: 'shoes', hr: 'cipele' },
      { e: '🧥', de: 'Jacke', es: 'chaqueta', en: 'jacket', hr: 'jakna' },
      { e: '🎩', de: 'Hut', es: 'sombrero', en: 'hat', hr: 'šešir' },
      { e: '🧦', de: 'Socken', es: 'calcetines', en: 'socks', hr: 'čarape' },
      { e: '🧣', de: 'Schal', es: 'bufanda', en: 'scarf', hr: 'šal' },
    ],
    sentences: [
      { de: 'Ich trage eine Jacke.', es: 'Llevo una chaqueta.', en: 'I am wearing a jacket.|I wear a jacket.|I\'m wearing a jacket.', hr: 'Nosim jaknu.' },
      { de: 'Das Kleid ist sehr schön.', es: 'El vestido es muy bonito.', en: 'The dress is very beautiful.|The dress is very pretty.', hr: 'Haljina je vrlo lijepa.|Haljina je jako lijepa.' },
      { de: 'Wo sind meine Schuhe?', es: '¿Dónde están mis zapatos?', en: 'Where are my shoes?', hr: 'Gdje su moje cipele?' },
      { de: 'Im Winter brauche ich einen Schal.', es: 'En invierno necesito una bufanda.', en: 'In winter I need a scarf.|I need a scarf in winter.', hr: 'Zimi mi treba šal.|Zimi trebam šal.' },
    ],
  },
  {
    id: 'body', title: 'Der Körper', icon: '🖐️', color: '#f97316',
    tip: '„Mir tut … weh“: Spanisch „me duele …“, Kroatisch „boli me …“.',
    words: [
      { e: '👁️', de: 'Auge', es: 'ojo', en: 'eye', hr: 'oko' },
      { e: '👂', de: 'Ohr', es: 'oreja', en: 'ear', hr: 'uho' },
      { e: '👃', de: 'Nase', es: 'nariz', en: 'nose', hr: 'nos' },
      { e: '👄', de: 'Mund', es: 'boca', en: 'mouth', hr: 'usta' },
      { e: '✋', de: 'Hand', es: 'mano', en: 'hand', hr: 'ruka|šaka' },
      { e: '🦶', de: 'Fuß', es: 'pie', en: 'foot', hr: 'stopalo' },
      { e: '🦵', de: 'Bein', es: 'pierna', en: 'leg', hr: 'noga' },
      { e: '💇', de: 'Haare', es: 'pelo|cabello', en: 'hair', hr: 'kosa' },
    ],
    sentences: [
      { de: 'Mein Kopf tut weh.', es: 'Me duele la cabeza.', en: 'My head hurts.|I have a headache.', hr: 'Boli me glava.' },
      { de: 'Sie hat blaue Augen.', es: 'Tiene los ojos azules.|Ella tiene los ojos azules.', en: 'She has blue eyes.', hr: 'Ona ima plave oči.|Ima plave oči.' },
      { de: 'Wasch dir die Hände!', es: '¡Lávate las manos!', en: 'Wash your hands!', hr: 'Operi ruke!' },
      { de: 'Er hat lange Haare.', es: 'Tiene el pelo largo.|Él tiene el pelo largo.', en: 'He has long hair.', hr: 'On ima dugu kosu.|Ima dugu kosu.' },
    ],
  },
  {
    id: 'home', title: 'Zuhause', icon: '🛋️', color: '#a16207',
    tip: 'Kroatisch „vrata“ (Tür) ist immer Mehrzahl – wie im Deutschen „die Ferien“.',
    words: [
      { e: '🛏️', de: 'Bett', es: 'cama', en: 'bed', hr: 'krevet' },
      { e: '🪑', de: 'Stuhl', es: 'silla', en: 'chair', hr: 'stolica' },
      { e: '🚪', de: 'Tür', es: 'puerta', en: 'door', hr: 'vrata' },
      { e: '🪟', de: 'Fenster', es: 'ventana', en: 'window', hr: 'prozor' },
      { e: '🛋️', de: 'Sofa', es: 'sofá', en: 'sofa|couch', hr: 'kauč|sofa' },
      { e: '🍳', de: 'Küche', es: 'cocina', en: 'kitchen', hr: 'kuhinja' },
      { e: '🛁', de: 'Badezimmer', es: 'baño|cuarto de baño', en: 'bathroom', hr: 'kupaonica' },
      { e: '🔑', de: 'Schlüssel', es: 'llave', en: 'key', hr: 'ključ' },
    ],
    sentences: [
      { de: 'Die Küche ist groß.', es: 'La cocina es grande.', en: 'The kitchen is big.|The kitchen is large.', hr: 'Kuhinja je velika.' },
      { de: 'Mach bitte das Fenster auf.', es: 'Abre la ventana, por favor.', en: 'Open the window, please.|Please open the window.', hr: 'Otvori prozor, molim.|Molim te, otvori prozor.' },
      { de: 'Ich kann meinen Schlüssel nicht finden.', es: 'No encuentro mi llave.|No puedo encontrar mi llave.', en: 'I can\'t find my key.|I cannot find my key.', hr: 'Ne mogu naći svoj ključ.|Ne mogu pronaći svoj ključ.|Ne mogu naći ključ.' },
      { de: 'Die Katze schläft auf dem Sofa.', es: 'El gato duerme en el sofá.', en: 'The cat is sleeping on the sofa.|The cat sleeps on the sofa.|The cat is sleeping on the couch.', hr: 'Mačka spava na kauču.' },
    ],
  },
  {
    id: 'shopping', title: 'Einkaufen', icon: '🛒', color: '#16a34a',
    tip: 'Die wichtigste Frage beim Einkaufen: „Wie viel kostet das?“',
    words: [
      { e: '🛒', de: 'Supermarkt', es: 'supermercado', en: 'supermarket', hr: 'supermarket|dućan' },
      { e: '💶', de: 'Geld', es: 'dinero', en: 'money', hr: 'novac' },
      { e: '🏷️', de: 'Preis', es: 'precio', en: 'price', hr: 'cijena' },
      { e: '👜', de: 'Tasche', es: 'bolso', en: 'bag', hr: 'torba' },
      { e: '🛍️', de: 'kaufen', es: 'comprar', en: 'buy|to buy', hr: 'kupiti|kupovati' },
      { e: '💳', de: 'Karte', es: 'tarjeta', en: 'card', hr: 'kartica' },
      { e: '🍅', de: 'Tomate', es: 'tomate', en: 'tomato', hr: 'rajčica' },
      { e: '🧂', de: 'Salz', es: 'sal', en: 'salt', hr: 'sol' },
    ],
    sentences: [
      { de: 'Wie viel kostet das?', es: '¿Cuánto cuesta?|¿Cuánto cuesta esto?', en: 'How much does it cost?|How much is it?|How much is this?|How much does this cost?', hr: 'Koliko ovo košta?|Koliko to košta?|Koliko košta?' },
      { de: 'Kann ich mit Karte zahlen?', es: '¿Puedo pagar con tarjeta?', en: 'Can I pay by card?|Can I pay with a card?|Can I pay with card?', hr: 'Mogu li platiti karticom?' },
      { de: 'Ich brauche Tomaten und Salz.', es: 'Necesito tomates y sal.', en: 'I need tomatoes and salt.', hr: 'Trebam rajčice i sol.|Trebaju mi rajčice i sol.' },
      { de: 'Das ist zu teuer.', es: 'Es demasiado caro.|Esto es demasiado caro.', en: 'That is too expensive.|This is too expensive.|It is too expensive.|That\'s too expensive.', hr: 'To je preskupo.|Ovo je preskupo.' },
    ],
  },
  {
    id: 'jobs', title: 'Berufe', icon: '👩‍⚕️', color: '#4f46e5',
    tip: 'Spanisch und Kroatisch haben für viele Berufe eine männliche und weibliche Form (profesor/profesora, učitelj/učiteljica).',
    words: [
      { e: '🧑‍🏫', de: 'Lehrer', es: 'profesor|maestro', en: 'teacher', hr: 'učitelj' },
      { e: '👩‍⚕️', de: 'Krankenschwester', es: 'enfermera', en: 'nurse', hr: 'medicinska sestra' },
      { e: '👨‍🍳', de: 'Koch', es: 'cocinero', en: 'cook|chef', hr: 'kuhar' },
      { e: '👮', de: 'Polizist', es: 'policía', en: 'police officer|policeman', hr: 'policajac' },
      { e: '🧑‍🚒', de: 'Feuerwehrmann', es: 'bombero', en: 'firefighter|fireman', hr: 'vatrogasac' },
      { e: '🧑‍🌾', de: 'Bauer', es: 'agricultor|granjero', en: 'farmer', hr: 'poljoprivrednik|seljak' },
      { e: '👩‍💻', de: 'Programmiererin', es: 'programadora', en: 'programmer|developer', hr: 'programerka' },
      { e: '🧑‍🎓', de: 'Student', es: 'estudiante', en: 'student', hr: 'student' },
    ],
    sentences: [
      { de: 'Meine Mutter ist Ärztin.', es: 'Mi madre es médica.|Mi madre es doctora.', en: 'My mother is a doctor.|My mom is a doctor.|My mum is a doctor.', hr: 'Moja majka je liječnica.|Moja mama je liječnica.' },
      { de: 'Was bist du von Beruf?', es: '¿A qué te dedicas?|¿Cuál es tu profesión?', en: 'What do you do for a living?|What is your job?|What\'s your job?', hr: 'Čime se baviš?|Što si po zanimanju?' },
      { de: 'Ich arbeite in einem Büro.', es: 'Trabajo en una oficina.', en: 'I work in an office.', hr: 'Radim u uredu.' },
      { de: 'Der Koch kocht sehr gut.', es: 'El cocinero cocina muy bien.', en: 'The cook cooks very well.|The chef cooks very well.', hr: 'Kuhar kuha vrlo dobro.|Kuhar kuha jako dobro.|Kuhar jako dobro kuha.' },
    ],
  },
  {
    id: 'days', title: 'Wochentage', icon: '📆', color: '#0891b2',
    tip: 'Im Spanischen werden Wochentage kleingeschrieben – im Englischen groß.',
    words: [
      { e: '1️⃣', np: 1, de: 'Montag', es: 'lunes', en: 'Monday', hr: 'ponedjeljak' },
      { e: '2️⃣', np: 1, de: 'Dienstag', es: 'martes', en: 'Tuesday', hr: 'utorak' },
      { e: '3️⃣', np: 1, de: 'Mittwoch', es: 'miércoles', en: 'Wednesday', hr: 'srijeda' },
      { e: '4️⃣', np: 1, de: 'Donnerstag', es: 'jueves', en: 'Thursday', hr: 'četvrtak' },
      { e: '5️⃣', np: 1, de: 'Freitag', es: 'viernes', en: 'Friday', hr: 'petak' },
      { e: '6️⃣', np: 1, de: 'Samstag', es: 'sábado', en: 'Saturday', hr: 'subota' },
      { e: '7️⃣', np: 1, de: 'Sonntag', es: 'domingo', en: 'Sunday', hr: 'nedjelja' },
      { e: '🎉', np: 1, de: 'Wochenende', es: 'fin de semana', en: 'weekend', hr: 'vikend' },
    ],
    sentences: [
      { de: 'Heute ist Montag.', es: 'Hoy es lunes.', en: 'Today is Monday.|It is Monday today.|It\'s Monday today.', hr: 'Danas je ponedjeljak.' },
      { de: 'Am Samstag gehen wir an den Strand.', es: 'El sábado vamos a la playa.', en: 'On Saturday we are going to the beach.|We are going to the beach on Saturday.|On Saturday we go to the beach.', hr: 'U subotu idemo na plažu.' },
      { de: 'Ich arbeite von Montag bis Freitag.', es: 'Trabajo de lunes a viernes.', en: 'I work from Monday to Friday.|I work Monday to Friday.', hr: 'Radim od ponedjeljka do petka.' },
      { de: 'Schönes Wochenende!', es: '¡Buen fin de semana!', en: 'Have a nice weekend!|Have a good weekend!', hr: 'Ugodan vikend!|Lijep vikend!' },
    ],
  },
  {
    id: 'questions', title: 'Fragen stellen', icon: '❓', color: '#db2777',
    tip: 'Spanische Fragewörter tragen immer einen Akzent: qué, quién, dónde, cuándo …',
    words: [
      { e: '🧑', np: 1, de: 'wer', es: 'quién', en: 'who', hr: 'tko' },
      { e: '❔', np: 1, de: 'was', es: 'qué', en: 'what', hr: 'što|šta' },
      { e: '📍', np: 1, de: 'wo', es: 'dónde', en: 'where', hr: 'gdje' },
      { e: '⏰', np: 1, de: 'wann', es: 'cuándo', en: 'when', hr: 'kada|kad' },
      { e: '🤔', np: 1, de: 'warum', es: 'por qué', en: 'why', hr: 'zašto' },
      { e: '🛠️', np: 1, de: 'wie', es: 'cómo', en: 'how', hr: 'kako' },
      { e: '🔢', np: 1, de: 'wie viel', es: 'cuánto', en: 'how much|how many', hr: 'koliko' },
      { e: '👉', np: 1, de: 'welcher', es: 'cuál', en: 'which', hr: 'koji' },
    ],
    sentences: [
      { de: 'Wer ist das?', es: '¿Quién es?|¿Quién es ese?|¿Quién es esa?', en: 'Who is that?|Who is this?', hr: 'Tko je to?' },
      { de: 'Warum bist du traurig?', es: '¿Por qué estás triste?', en: 'Why are you sad?', hr: 'Zašto si tužan?|Zašto si tužna?' },
      { de: 'Wann beginnt der Film?', es: '¿Cuándo empieza la película?|¿Cuándo comienza la película?', en: 'When does the film start?|When does the movie start?', hr: 'Kada počinje film?|Kad počinje film?' },
      { de: 'Wie alt bist du?', es: '¿Cuántos años tienes?', en: 'How old are you?', hr: 'Koliko imaš godina?' },
    ],
  },
  {
    id: 'nature', title: 'Natur', icon: '🌳', color: '#15803d',
    tip: 'Kroatisch „more“ (Meer) – und die Adria ist „Jadransko more“.',
    words: [
      { e: '🌳', de: 'Baum', es: 'árbol', en: 'tree', hr: 'drvo|stablo' },
      { e: '🌷', de: 'Blume', es: 'flor', en: 'flower', hr: 'cvijet' },
      { e: '⛰️', de: 'Berg', es: 'montaña', en: 'mountain', hr: 'planina' },
      { e: '🌊', de: 'Meer', es: 'mar', en: 'sea', hr: 'more' },
      { e: '🏞️', de: 'Fluss', es: 'río', en: 'river', hr: 'rijeka' },
      { e: '🌲', de: 'Wald', es: 'bosque', en: 'forest|woods', hr: 'šuma' },
      { e: '⭐', de: 'Stern', es: 'estrella', en: 'star', hr: 'zvijezda' },
      { e: '🌕', de: 'Mond', es: 'luna', en: 'moon', hr: 'mjesec' },
    ],
    sentences: [
      { de: 'Der Wald ist grün.', es: 'El bosque es verde.', en: 'The forest is green.', hr: 'Šuma je zelena.' },
      { de: 'Wir wandern in den Bergen.', es: 'Hacemos senderismo en las montañas.|Caminamos por las montañas.', en: 'We are hiking in the mountains.|We hike in the mountains.', hr: 'Hodamo po planinama.|Pješačimo po planinama.|Planinarimo.' },
      { de: 'Heute Nacht sieht man viele Sterne.', es: 'Esta noche se ven muchas estrellas.', en: 'Tonight you can see many stars.|You can see many stars tonight.|Tonight you can see a lot of stars.', hr: 'Večeras se vidi puno zvijezda.|Večeras se vidi mnogo zvijezda.|Noćas se vidi puno zvijezda.' },
      { de: 'Der Fluss fließt ins Meer.', es: 'El río fluye al mar.|El río desemboca en el mar.', en: 'The river flows into the sea.', hr: 'Rijeka teče u more.|Rijeka se ulijeva u more.' },
    ],
  },
  {
    id: 'hobbies', title: 'Freizeit', icon: '🎸', color: '#9333ea',
    tip: 'Instrument spielen: Spanisch „tocar“, Englisch „play“, Kroatisch „svirati“ – Sport spielen ist dagegen „jugar“ bzw. „igrati“.',
    words: [
      { e: '🎸', de: 'Gitarre', es: 'guitarra', en: 'guitar', hr: 'gitara' },
      { e: '🏊', de: 'schwimmen', es: 'nadar', en: 'swim|to swim', hr: 'plivati' },
      { e: '🎬', de: 'Kino', es: 'cine', en: 'cinema|movies|movie theater', hr: 'kino' },
      { e: '🎵', de: 'Musik', es: 'música', en: 'music', hr: 'glazba' },
      { e: '📚', de: 'Buch', es: 'libro', en: 'book', hr: 'knjiga' },
      { e: '🚲', de: 'Fahrrad', es: 'bicicleta|bici', en: 'bicycle|bike', hr: 'bicikl' },
      { e: '🎨', de: 'malen', es: 'pintar', en: 'paint|to paint', hr: 'slikati' },
      { e: '💃', de: 'tanzen', es: 'bailar', en: 'dance|to dance', hr: 'plesati' },
    ],
    sentences: [
      { de: 'Ich spiele gern Gitarre.', es: 'Me gusta tocar la guitarra.', en: 'I like playing the guitar.|I like to play the guitar.|I like playing guitar.', hr: 'Volim svirati gitaru.' },
      { de: 'Gehen wir heute Abend ins Kino?', es: '¿Vamos al cine esta noche?', en: 'Shall we go to the cinema tonight?|Are we going to the cinema tonight?|Shall we go to the movies tonight?', hr: 'Idemo li večeras u kino?|Hoćemo li večeras u kino?' },
      { de: 'Am Wochenende fahre ich Fahrrad.', es: 'El fin de semana monto en bicicleta.|Los fines de semana monto en bici.', en: 'At the weekend I ride my bike.|On the weekend I ride my bike.|I ride my bike at the weekend.', hr: 'Vikendom vozim bicikl.|Za vikend vozim bicikl.' },
      { de: 'Welche Musik hörst du gern?', es: '¿Qué música te gusta escuchar?', en: 'What music do you like to listen to?|What music do you like listening to?|What kind of music do you like?', hr: 'Koju glazbu voliš slušati?' },
    ],
  },
  {
    id: 'health', title: 'Beim Arzt', icon: '🩺', color: '#dc2626',
    tip: 'Im Notfall: Spanisch „¡Ayuda!“, Englisch „Help!“, Kroatisch „Upomoć!“ – europaweite Notrufnummer 112.',
    words: [
      { e: '🩺', de: 'Arzt', es: 'médico|doctor', en: 'doctor', hr: 'liječnik|doktor' },
      { e: '💊', de: 'Tablette', es: 'pastilla', en: 'pill|tablet', hr: 'tableta' },
      { e: '🏥', de: 'Krankenhaus', es: 'hospital', en: 'hospital', hr: 'bolnica' },
      { e: '🤧', de: 'Erkältung', es: 'resfriado', en: 'cold', hr: 'prehlada' },
      { e: '🌡️', de: 'Fieber', es: 'fiebre', en: 'fever', hr: 'temperatura|groznica' },
      { e: '🤕', de: 'Kopfschmerzen', es: 'dolor de cabeza', en: 'headache', hr: 'glavobolja' },
      { e: '🦷', de: 'Zahn', es: 'diente', en: 'tooth', hr: 'zub' },
      { e: '🆘', de: 'Hilfe', es: 'ayuda', en: 'help', hr: 'pomoć' },
    ],
    sentences: [
      { de: 'Ich brauche einen Arzt.', es: 'Necesito un médico.', en: 'I need a doctor.', hr: 'Trebam liječnika.|Treba mi liječnik.' },
      { de: 'Ich habe Fieber und Kopfschmerzen.', es: 'Tengo fiebre y dolor de cabeza.', en: 'I have a fever and a headache.|I have fever and a headache.', hr: 'Imam temperaturu i glavobolju.' },
      { de: 'Wo ist das nächste Krankenhaus?', es: '¿Dónde está el hospital más cercano?', en: 'Where is the nearest hospital?', hr: 'Gdje je najbliža bolnica?' },
      { de: 'Nimm zweimal am Tag eine Tablette.', es: 'Toma una pastilla dos veces al día.', en: 'Take one pill twice a day.|Take a pill twice a day.|Take one tablet twice a day.', hr: 'Uzimaj jednu tabletu dvaput dnevno.|Uzmi jednu tabletu dva puta dnevno.|Uzimaj tabletu dva puta dnevno.' },
    ],
  },
  {
    id: 'time', title: 'Tagesablauf', icon: '⏰', color: '#ff9600',
    tip: 'Uhrzeiten sagt man fast überall mit „um … Uhr“ – auf Spanisch „a las siete“, auf Kroatisch „u sedam“.',
    words: [
      { e: '⏰', de: 'Uhr', es: 'reloj', en: 'clock|watch', hr: 'sat' },
      { e: '⏱️', de: 'Minute', es: 'minuto', en: 'minute', hr: 'minuta' },
      { e: '🥐', de: 'Frühstück', es: 'desayuno', en: 'breakfast', hr: 'doručak' },
      { e: '🥪', de: 'Mittagessen', es: 'almuerzo|comida', en: 'lunch', hr: 'ručak' },
      { e: '🍛', de: 'Abendessen', es: 'cena', en: 'dinner|supper', hr: 'večera' },
      { e: '🌆', de: 'Abend', es: 'tarde|noche', en: 'evening', hr: 'večer' },
      { e: '🕛', de: 'Mittag', es: 'mediodía', en: 'noon|midday', hr: 'podne' },
      { e: '🌄', de: 'aufwachen', es: 'despertarse|despertar', en: 'wake up|to wake up', hr: 'probuditi se|buditi se' },
    ],
    sentences: [
      { de: 'Wie spät ist es?', es: '¿Qué hora es?', en: 'What time is it?', hr: 'Koliko je sati?' },
      { de: 'Ich stehe um sieben Uhr auf.', es: 'Me levanto a las siete.', en: "I get up at seven o'clock.|I get up at seven.", hr: 'Ustajem u sedam sati.|Ustajem u sedam.' },
      { de: 'Das Frühstück ist fertig.', es: 'El desayuno está listo.', en: 'Breakfast is ready.|The breakfast is ready.', hr: 'Doručak je gotov.' },
      { de: 'Wir essen um acht Uhr zu Abend.', es: 'Cenamos a las ocho.', en: "We have dinner at eight o'clock.|We have dinner at eight.|We eat dinner at eight.", hr: 'Večeramo u osam sati.|Večeramo u osam.' },
    ],
  },
  {
    id: 'city', title: 'In der Stadt', icon: '🏙️', color: '#1cb0f6',
    tip: 'Nach dem Weg fragen klappt immer: „Wie komme ich zu …?“ – und dann gut auf „links“ und „rechts“ hören.',
    words: [
      { e: '🚉', de: 'Bahnhof', es: 'estación', en: 'station|train station', hr: 'kolodvor|stanica' },
      { e: '🏦', de: 'Bank', es: 'banco', en: 'bank', hr: 'banka' },
      { e: '⛪', de: 'Kirche', es: 'iglesia', en: 'church', hr: 'crkva' },
      { e: '🏛️', de: 'Museum', es: 'museo', en: 'museum', hr: 'muzej' },
      { e: '🌉', de: 'Brücke', es: 'puente', en: 'bridge', hr: 'most' },
      { e: '⛲', de: 'Park', es: 'parque', en: 'park', hr: 'park' },
      { e: '🚌', de: 'Bus', es: 'autobús|bus', en: 'bus', hr: 'autobus' },
      { e: '🚦', de: 'Ampel', es: 'semáforo', en: 'traffic light|traffic lights', hr: 'semafor' },
    ],
    sentences: [
      { de: 'Wie komme ich zum Bahnhof?', es: '¿Cómo llego a la estación?', en: 'How do I get to the station?|How do I get to the train station?', hr: 'Kako da dođem do kolodvora?|Kako doći do kolodvora?' },
      { de: 'Geh geradeaus und dann links.', es: 'Ve todo recto y luego a la izquierda.|Sigue recto y luego a la izquierda.', en: 'Go straight ahead and then left.|Go straight on and then left.|Go straight and then left.', hr: 'Idi ravno pa lijevo.|Idi ravno i onda lijevo.' },
      { de: 'Der Bus kommt in fünf Minuten.', es: 'El autobús llega en cinco minutos.', en: 'The bus is coming in five minutes.|The bus comes in five minutes.', hr: 'Autobus dolazi za pet minuta.' },
      { de: 'Das Museum ist neben der Kirche.', es: 'El museo está al lado de la iglesia.', en: 'The museum is next to the church.', hr: 'Muzej je pokraj crkve.|Muzej je kraj crkve.' },
    ],
  },
  {
    id: 'school', title: 'Schule', icon: '🎒', color: '#58cc02',
    tip: 'Lernen hört nie auf – und mit diesen Wörtern kannst du sogar darüber reden.',
    words: [
      { e: '🏫', de: 'Schule', es: 'escuela|colegio', en: 'school', hr: 'škola' },
      { e: '✏️', de: 'Bleistift', es: 'lápiz', en: 'pencil', hr: 'olovka' },
      { e: '📓', de: 'Heft', es: 'cuaderno', en: 'notebook|exercise book', hr: 'bilježnica' },
      { e: '🎒', de: 'Rucksack', es: 'mochila', en: 'backpack|rucksack|schoolbag', hr: 'ruksak' },
      { e: '📝', de: 'Prüfung', es: 'examen', en: 'exam|test', hr: 'ispit' },
      { e: '📄', de: 'Hausaufgaben', es: 'deberes|tarea', en: 'homework', hr: 'zadaća|domaća zadaća' },
      { e: '🧠', de: 'lernen', es: 'aprender|estudiar', en: 'learn|to learn|study', hr: 'učiti' },
      { e: '📏', de: 'Lineal', es: 'regla', en: 'ruler', hr: 'ravnalo' },
    ],
    sentences: [
      { de: 'Ich gehe zur Schule.', es: 'Voy a la escuela.|Voy al colegio.', en: 'I go to school.|I am going to school.', hr: 'Idem u školu.' },
      { de: 'Hast du deine Hausaufgaben gemacht?', es: '¿Has hecho los deberes?|¿Hiciste la tarea?', en: 'Did you do your homework?|Have you done your homework?', hr: 'Jesi li napravio zadaću?|Jesi li napisao zadaću?' },
      { de: 'Morgen habe ich eine Prüfung.', es: 'Mañana tengo un examen.', en: 'I have an exam tomorrow.|Tomorrow I have an exam.|I have a test tomorrow.', hr: 'Sutra imam ispit.' },
      { de: 'Kann ich deinen Bleistift leihen?', es: '¿Me prestas tu lápiz?|¿Puedo usar tu lápiz?', en: 'Can I borrow your pencil?', hr: 'Mogu li posuditi tvoju olovku?' },
    ],
  },
  {
    id: 'tech', title: 'Technik', icon: '📱', color: '#ce82ff',
    tip: 'Viele Technik-Wörter sind international – aber nicht alle: Handy heißt auf Englisch „phone“!',
    words: [
      { e: '📱', de: 'Handy', es: 'móvil|teléfono', en: 'mobile phone|phone|cell phone|smartphone', hr: 'mobitel' },
      { e: '💻', de: 'Computer', es: 'ordenador|computadora', en: 'computer|laptop', hr: 'računalo' },
      { e: '📺', de: 'Fernseher', es: 'televisión|tele|televisor', en: 'television|TV', hr: 'televizor' },
      { e: '📷', de: 'Kamera', es: 'cámara', en: 'camera', hr: 'fotoaparat|kamera' },
      { e: '🔋', de: 'Batterie', es: 'batería', en: 'battery', hr: 'baterija' },
      { e: '📧', de: 'E-Mail', es: 'correo electrónico|correo|email', en: 'email|e-mail', hr: 'e-mail|e-pošta|mail' },
      { e: '🌐', de: 'Internet', es: 'internet', en: 'internet', hr: 'internet' },
      { e: '🕹️', de: 'Videospiel', es: 'videojuego', en: 'video game|game', hr: 'videoigra|igrica' },
    ],
    sentences: [
      { de: 'Mein Handy ist kaputt.', es: 'Mi móvil está roto.', en: 'My phone is broken.', hr: 'Mobitel mi je pokvaren.|Moj mobitel je pokvaren.' },
      { de: 'Gibt es hier WLAN?', es: '¿Hay wifi aquí?', en: 'Is there wifi here?|Is there Wi-Fi here?', hr: 'Ima li ovdje wifi?|Ima li ovdje Wi-Fi?' },
      { de: 'Der Akku ist fast leer.', es: 'La batería está casi vacía.', en: 'The battery is almost empty.|The battery is almost dead.', hr: 'Baterija je skoro prazna.|Baterija je gotovo prazna.' },
      { de: 'Ich schicke dir eine E-Mail.', es: 'Te envío un correo electrónico.|Te mando un correo.', en: 'I will send you an email.|I am sending you an email.|I send you an email.', hr: 'Poslat ću ti e-mail.|Šaljem ti e-mail.' },
    ],
  },
  {
    id: 'sports', title: 'Sport', icon: '⚽', color: '#ff4b4b',
    tip: 'Achtung: Was in Europa „football“ heißt, nennen Amerikaner „soccer“.',
    words: [
      { e: '⚽', de: 'Fußball', es: 'fútbol', en: 'football|soccer', hr: 'nogomet' },
      { e: '🏀', de: 'Basketball', es: 'baloncesto|básquet', en: 'basketball', hr: 'košarka' },
      { e: '🎾', de: 'Tennis', es: 'tenis', en: 'tennis', hr: 'tenis' },
      { e: '🏃', de: 'laufen', es: 'correr', en: 'run|to run', hr: 'trčati' },
      { e: '👥', de: 'Mannschaft', es: 'equipo', en: 'team', hr: 'momčad|ekipa' },
      { e: '🏆', de: 'gewinnen', es: 'ganar', en: 'win|to win', hr: 'pobijediti' },
      { e: '⛷️', de: 'Ski fahren', es: 'esquiar', en: 'ski|to ski', hr: 'skijati' },
      { e: '🥅', de: 'Tor', es: 'gol|portería', en: 'goal', hr: 'gol' },
    ],
    sentences: [
      { de: 'Wir haben gewonnen!', es: '¡Hemos ganado!|¡Ganamos!', en: 'We won!|We have won!', hr: 'Pobijedili smo!' },
      { de: 'Ich laufe jeden Morgen.', es: 'Corro todas las mañanas.|Corro cada mañana.', en: 'I run every morning.|I go running every morning.', hr: 'Trčim svako jutro.' },
      { de: 'Spielst du Tennis?', es: '¿Juegas al tenis?|¿Juegas tenis?', en: 'Do you play tennis?', hr: 'Igraš li tenis?' },
      { de: 'Unsere Mannschaft hat ein Tor geschossen.', es: 'Nuestro equipo ha marcado un gol.|Nuestro equipo marcó un gol.', en: 'Our team scored a goal.|Our team has scored a goal.', hr: 'Naša momčad je zabila gol.|Naša ekipa je zabila gol.' },
    ],
  },
  {
    id: 'party', title: 'Feiern', icon: '🎉', color: '#ffc800',
    tip: 'Glückwünsche sind kurze, feste Formeln – lern sie einfach als Ganzes auswendig.',
    words: [
      { e: '🎂', de: 'Geburtstag', es: 'cumpleaños', en: 'birthday', hr: 'rođendan' },
      { e: '🎁', de: 'Geschenk', es: 'regalo', en: 'present|gift', hr: 'poklon|dar' },
      { e: '🍰', de: 'Kuchen', es: 'pastel|tarta', en: 'cake', hr: 'torta|kolač' },
      { e: '🥳', de: 'Party', es: 'fiesta', en: 'party', hr: 'zabava|tulum' },
      { e: '🕯️', de: 'Kerze', es: 'vela', en: 'candle', hr: 'svijeća' },
      { e: '🎄', de: 'Weihnachten', es: 'Navidad', en: 'Christmas', hr: 'Božić' },
      { e: '🎈', de: 'Luftballon', es: 'globo', en: 'balloon', hr: 'balon' },
      { e: '🎊', de: 'feiern', es: 'celebrar|festejar', en: 'celebrate|to celebrate', hr: 'slaviti|proslaviti' },
    ],
    sentences: [
      { de: 'Alles Gute zum Geburtstag!', es: '¡Feliz cumpleaños!', en: 'Happy birthday!', hr: 'Sretan rođendan!' },
      { de: 'Frohe Weihnachten!', es: '¡Feliz Navidad!', en: 'Merry Christmas!', hr: 'Sretan Božić!' },
      { de: 'Ich habe ein Geschenk für dich.', es: 'Tengo un regalo para ti.', en: 'I have a present for you.|I have a gift for you.', hr: 'Imam poklon za tebe.' },
      { de: 'Kommst du am Samstag zu meiner Party?', es: '¿Vienes a mi fiesta el sábado?', en: 'Are you coming to my party on Saturday?|Will you come to my party on Saturday?', hr: 'Dolaziš li u subotu na moju zabavu?|Dolaziš li na moju zabavu u subotu?' },
    ],
  },
  {
    id: 'produce', title: 'Obst & Gemüse', icon: '🥕', color: '#58cc02',
    tip: 'Auf dem Markt kannst du diese Wörter sofort ausprobieren.',
    words: [
      { e: '🍓', de: 'Erdbeere', es: 'fresa', en: 'strawberry', hr: 'jagoda' },
      { e: '🍇', de: 'Traube', es: 'uva', en: 'grape|grapes', hr: 'grožđe' },
      { e: '🍋', de: 'Zitrone', es: 'limón', en: 'lemon', hr: 'limun' },
      { e: '🍒', de: 'Kirsche', es: 'cereza', en: 'cherry', hr: 'trešnja' },
      { e: '🥔', de: 'Kartoffel', es: 'patata|papa', en: 'potato', hr: 'krumpir' },
      { e: '🥕', de: 'Karotte', es: 'zanahoria', en: 'carrot', hr: 'mrkva' },
      { e: '🧅', de: 'Zwiebel', es: 'cebolla', en: 'onion', hr: 'luk' },
      { e: '🥒', de: 'Gurke', es: 'pepino', en: 'cucumber', hr: 'krastavac' },
    ],
    sentences: [
      { de: 'Ich mag Erdbeeren.', es: 'Me gustan las fresas.', en: 'I like strawberries.', hr: 'Volim jagode.' },
      { de: 'Die Zitrone ist sauer.', es: 'El limón es ácido.|El limón está ácido.', en: 'The lemon is sour.', hr: 'Limun je kiseo.' },
      { de: 'Wir kochen eine Suppe mit Karotten und Kartoffeln.', es: 'Cocinamos una sopa con zanahorias y patatas.|Hacemos una sopa con zanahorias y patatas.', en: 'We are cooking a soup with carrots and potatoes.|We cook a soup with carrots and potatoes.|We make a soup with carrots and potatoes.', hr: 'Kuhamo juhu s mrkvom i krumpirom.' },
      { de: 'Obst ist gesund.', es: 'La fruta es sana.|La fruta es saludable.', en: 'Fruit is healthy.', hr: 'Voće je zdravo.' },
    ],
  },
  {
    id: 'zoo', title: 'Im Zoo', icon: '🦁', color: '#ff9600',
    tip: 'Tiernamen sind oft international – aber nicht immer!',
    words: [
      { e: '🐘', de: 'Elefant', es: 'elefante', en: 'elephant', hr: 'slon' },
      { e: '🦁', de: 'Löwe', es: 'león', en: 'lion', hr: 'lav' },
      { e: '🐒', de: 'Affe', es: 'mono', en: 'monkey', hr: 'majmun' },
      { e: '🦒', de: 'Giraffe', es: 'jirafa', en: 'giraffe', hr: 'žirafa' },
      { e: '🐍', de: 'Schlange', es: 'serpiente', en: 'snake', hr: 'zmija' },
      { e: '🐅', de: 'Tiger', es: 'tigre', en: 'tiger', hr: 'tigar' },
      { e: '🐧', de: 'Pinguin', es: 'pingüino', en: 'penguin', hr: 'pingvin' },
      { e: '🐢', de: 'Schildkröte', es: 'tortuga', en: 'turtle|tortoise', hr: 'kornjača' },
    ],
    sentences: [
      { de: 'Der Elefant ist sehr groß.', es: 'El elefante es muy grande.', en: 'The elephant is very big.', hr: 'Slon je jako velik.|Slon je vrlo velik.' },
      { de: 'Der Löwe schläft unter einem Baum.', es: 'El león duerme debajo de un árbol.', en: 'The lion is sleeping under a tree.|The lion sleeps under a tree.', hr: 'Lav spava ispod drveta.|Lav spava pod drvetom.' },
      { de: 'Affen essen gern Bananen.', es: 'A los monos les gustan los plátanos.|A los monos les gusta comer plátanos.', en: 'Monkeys like eating bananas.|Monkeys like bananas.|Monkeys like to eat bananas.', hr: 'Majmuni vole jesti banane.|Majmuni vole banane.' },
      { de: 'Gehen wir am Sonntag in den Zoo?', es: '¿Vamos al zoo el domingo?|¿Vamos al zoológico el domingo?', en: 'Shall we go to the zoo on Sunday?', hr: 'Idemo li u nedjelju u zoološki vrt?|Idemo li u zoo u nedjelju?' },
    ],
  },
  {
    id: 'vacation', title: 'Urlaub', icon: '🧳', color: '#1cb0f6',
    tip: 'Pass, Ticket, Koffer – mit diesen Wörtern geht die Reise los.',
    words: [
      { e: '🧳', de: 'Koffer', es: 'maleta', en: 'suitcase', hr: 'kofer' },
      { e: '🛂', de: 'Reisepass', es: 'pasaporte', en: 'passport', hr: 'putovnica' },
      { e: '✈️', de: 'Flugzeug', es: 'avión', en: 'plane|airplane|aeroplane', hr: 'avion' },
      { e: '🎫', de: 'Fahrkarte', es: 'billete', en: 'ticket', hr: 'karta|vozna karta' },
      { e: '🗺️', de: 'Landkarte', es: 'mapa', en: 'map', hr: 'zemljovid' },
      { e: '⛺', de: 'Zelt', es: 'tienda de campaña|tienda', en: 'tent', hr: 'šator' },
      { e: '🕶️', de: 'Sonnenbrille', es: 'gafas de sol', en: 'sunglasses', hr: 'sunčane naočale' },
      { e: '🌴', de: 'Urlaub', es: 'vacaciones', en: 'holiday|vacation|holidays', hr: 'odmor|godišnji odmor' },
    ],
    sentences: [
      { de: 'Mein Koffer ist zu schwer.', es: 'Mi maleta pesa demasiado.|Mi maleta es demasiado pesada.', en: 'My suitcase is too heavy.', hr: 'Moj kofer je pretežak.|Kofer mi je pretežak.' },
      { de: 'Vergiss deinen Reisepass nicht!', es: '¡No olvides tu pasaporte!', en: "Don't forget your passport!|Do not forget your passport!", hr: 'Ne zaboravi putovnicu!|Ne zaboravi svoju putovnicu!' },
      { de: 'Das Flugzeug fliegt um zehn Uhr ab.', es: 'El avión sale a las diez.', en: "The plane leaves at ten o'clock.|The plane leaves at ten.|The plane departs at ten.", hr: 'Avion polijeće u deset sati.|Avion polijeće u deset.' },
      { de: 'Wir machen Urlaub am Meer.', es: 'Pasamos las vacaciones en el mar.|Estamos de vacaciones en la playa.', en: 'We are on holiday by the sea.|We are on vacation by the sea.|We are going on holiday to the sea.', hr: 'Ljetujemo na moru.|Idemo na odmor na more.' },
    ],
  },
  {
    id: 'opposites', title: 'Gegensätze', icon: '↔️', color: '#ce82ff',
    tip: 'Lerne Wörter immer paarweise: heiß und kalt merkt man sich zusammen leichter.',
    words: [
      { e: '🐇', de: 'schnell', es: 'rápido', en: 'fast|quick', hr: 'brz' },
      { e: '🐌', de: 'langsam', es: 'lento', en: 'slow', hr: 'spor' },
      { e: '🔥', de: 'heiß', es: 'caliente', en: 'hot', hr: 'vruć' },
      { e: '🧊', de: 'kalt', es: 'frío', en: 'cold', hr: 'hladan' },
      { e: '🏚️', de: 'alt', es: 'viejo', en: 'old', hr: 'star' },
      { e: '🐣', de: 'jung', es: 'joven', en: 'young', hr: 'mlad' },
      { e: '💎', de: 'teuer', es: 'caro', en: 'expensive', hr: 'skup' },
      { e: '👛', de: 'billig', es: 'barato', en: 'cheap', hr: 'jeftin' },
    ],
    sentences: [
      { de: 'Das Auto ist schnell.', es: 'El coche es rápido.|El carro es rápido.', en: 'The car is fast.', hr: 'Auto je brz.' },
      { de: 'Die Suppe ist zu heiß.', es: 'La sopa está demasiado caliente.', en: 'The soup is too hot.', hr: 'Juha je prevruća.' },
      { de: 'Mein Opa ist alt, aber mein Bruder ist jung.', es: 'Mi abuelo es mayor, pero mi hermano es joven.|Mi abuelo es viejo, pero mi hermano es joven.', en: 'My grandpa is old, but my brother is young.|My grandfather is old, but my brother is young.', hr: 'Moj djed je star, ali moj brat je mlad.' },
      { de: 'Der Zug ist langsam, aber billig.', es: 'El tren es lento, pero barato.', en: 'The train is slow, but cheap.|The train is slow but cheap.', hr: 'Vlak je spor, ali jeftin.' },
    ],
  },
  {
    id: 'seasons', title: 'Jahreszeiten', icon: '🍂', color: '#ff4b4b',
    tip: 'Sag jeden Monat einmal das Datum in deiner neuen Sprache.',
    words: [
      { e: '🌱', de: 'Frühling', es: 'primavera', en: 'spring', hr: 'proljeće' },
      { e: '🌻', de: 'Sommer', es: 'verano', en: 'summer', hr: 'ljeto' },
      { e: '🍂', de: 'Herbst', es: 'otoño', en: 'autumn|fall', hr: 'jesen' },
      { e: '⛄', de: 'Winter', es: 'invierno', en: 'winter', hr: 'zima' },
      { e: '📅', np: 1, de: 'Monat', es: 'mes', en: 'month', hr: 'mjesec' },
      { e: '🗓️', np: 1, de: 'Jahr', es: 'año', en: 'year', hr: 'godina' },
      { e: '❄️', np: 1, de: 'Januar', es: 'enero', en: 'January', hr: 'siječanj' },
      { e: '🎅', de: 'Dezember', es: 'diciembre', en: 'December', hr: 'prosinac' },
    ],
    sentences: [
      { de: 'Im Frühling blühen die Blumen.', es: 'En primavera florecen las flores.', en: 'In spring the flowers bloom.|The flowers bloom in spring.', hr: 'U proljeće cvjeta cvijeće.' },
      { de: 'Im Sommer gehen wir schwimmen.', es: 'En verano vamos a nadar.', en: 'In summer we go swimming.|We go swimming in summer.', hr: 'Ljeti idemo plivati.' },
      { de: 'Mein Geburtstag ist im Dezember.', es: 'Mi cumpleaños es en diciembre.', en: 'My birthday is in December.', hr: 'Moj rođendan je u prosincu.|Rođendan mi je u prosincu.' },
      { de: 'Ein Jahr hat zwölf Monate.', es: 'Un año tiene doce meses.', en: 'A year has twelve months.|There are twelve months in a year.', hr: 'Godina ima dvanaest mjeseci.' },
    ],
  },
];

// Merge the per-language packs (lang/xx.js) into the units
const PACKS = { it: IT, fr: FR, tr: TR, zh: ZH, ja: JA };
for (const [k, pack] of Object.entries(PACKS)) {
  for (const u of UNITS) {
    const p = pack[u.id];
    if (!p) continue;
    u.words.forEach((w, i) => { if (p[i]) w[k] = p[i]; });
    u.sentences.forEach((s, i) => { if (p[8 + i]) s[k] = p[8 + i]; });
  }
}

export const LESSONS_PER_UNIT = 5; // die 5. Lektion ist die Meisterprüfung (mit Timer)

// Hilfsfunktionen
export const main = (s) => (s || '').split('|')[0];
export const alts = (s) => (s || '').split('|');

// Chinese is stored with spaces between words (for the tiles); hide them for display.
const CJK = '\\u2E80-\\u9FFF\\u3000-\\u303F\\uFF00-\\uFFEF';
const CJK_GAP = new RegExp(`(?<=[${CJK}])\\s+(?=[${CJK}])`, 'g');
export const HAS_CJK = new RegExp(`[${CJK}]`);
export const joinCjk = (s) => (s || '').replace(CJK_GAP, '');
export const disp = (s) => joinCjk(main(s));
// Reading aid (pinyin/romaji): the first alternative without CJK characters
export const reading = (s, lang) => (LANGS[lang]?.cjk ? alts(s).slice(1).find((a) => a && !HAS_CJK.test(a)) || '' : '');

// Eindeutige Item-Keys für Wiederholung/Spaced Repetition
export function itemsOfUnit(ui) {
  const u = UNITS[ui];
  return [
    ...u.words.map((w, i) => ({ key: `${u.id}:w${i}`, kind: 'word', unit: ui, ...w })),
    ...u.sentences.map((s, i) => ({ key: `${u.id}:s${i}`, kind: 'sentence', unit: ui, ...s })),
  ];
}

// SVG-Flaggen (Flaggen-Emojis fehlen unter Windows)
const FLAGS = {
  es: '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>',
  en: '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.5"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6"/><path d="M15 0V20M0 10H30" stroke="#c8102e" stroke-width="3.5"/>',
  hr: '<rect width="30" height="20" fill="#171796"/><rect width="30" height="13.3" fill="#fff"/><rect width="30" height="6.7" fill="#f00"/><path d="M12 5.5h6v6.5a3 3 0 0 1-6 0z" fill="#fff" stroke="#f00" stroke-width=".4"/><path d="M12 5.5h1.5v1.5H12zM15 5.5h1.5v1.5H15zM13.5 7h1.5v1.5h-1.5zM16.5 7H18v1.5h-1.5zM12 8.5h1.5V10H12zM15 8.5h1.5V10H15zM13.5 10h1.5v1.5h-1.5zM16.5 10H18v1.5h-1.5zM12 11.5h1.5V13H12zM15 11.5h1.5V13H15zM13.5 13h1.5v1.5h-1.5z" fill="#f00"/>',
  de: '<rect width="30" height="20" fill="#ffce00"/><rect width="30" height="13.4" fill="#dd0000"/><rect width="30" height="6.7" fill="#000"/>',
  ja: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>',
  it: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#009246"/><rect x="20" width="10" height="20" fill="#ce2b37"/>',
  fr: '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#0055a4"/><rect x="20" width="10" height="20" fill="#ef4135"/>',
  tr: `<rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#e30a17"/>${star(17.6, 10, 2.3, '#fff', 36)}`,
  zh: `<rect width="30" height="20" fill="#ee1c25"/>${star(5, 5, 3, '#ffde00')}${star(10, 2, 1, '#ffde00')}${star(12, 4, 1, '#ffde00')}${star(12, 7, 1, '#ffde00')}${star(10, 9, 1, '#ffde00')}`,
};
function star(cx, cy, r, fill, rot = -90) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180, rr = i % 2 ? r * 0.382 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}
export const flag = (k, w = 30) => `<svg class="flag-svg" width="${w}" height="${Math.round(w * 2 / 3)}" viewBox="0 0 30 20" aria-label="${LANGS[k]?.name || k}"><clipPath id="fc-${k}-${w}"><rect width="30" height="20" rx="3"/></clipPath><g clip-path="url(#fc-${k}-${w})">${FLAGS[k] || '<rect width="30" height="20" fill="#ccc"/>'}</g></svg>`;
