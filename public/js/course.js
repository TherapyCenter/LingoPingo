// Kursinhalte. Eine neue Sprache = neuer Eintrag in LANGS + ein weiterer Schlüssel
// (z. B. "it") bei jedem Wort/Satz. Mehrere akzeptierte Antworten mit "|" trennen –
// die erste wird angezeigt.

export const LANGS = {
  es: { name: 'Spanisch', native: 'Español', flag: '🇪🇸', tts: 'es-ES', accents: 'áéíóúñü¿¡' },
  en: { name: 'Englisch', native: 'English', flag: '🇬🇧', tts: 'en-GB', accents: '' },
  hr: { name: 'Kroatisch', native: 'Hrvatski', flag: '🇭🇷', tts: 'hr-HR', accents: 'čćšžđ' },
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
      { e: '🐘', de: 'groß', es: 'grande', en: 'big|large', hr: 'velik|veliki' },
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
];

export const LESSONS_PER_UNIT = 5; // die 5. Lektion ist die Meisterprüfung (mit Timer)

// Hilfsfunktionen
export const main = (s) => (s || '').split('|')[0];
export const alts = (s) => (s || '').split('|');

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
};
export const flag = (k, w = 30) => `<svg class="flag-svg" width="${w}" height="${Math.round(w * 2 / 3)}" viewBox="0 0 30 20" aria-label="${LANGS[k]?.name || k}"><clipPath id="fc-${k}-${w}"><rect width="30" height="20" rx="3"/></clipPath><g clip-path="url(#fc-${k}-${w})">${FLAGS[k] || '<rect width="30" height="20" fill="#ccc"/>'}</g></svg>`;
