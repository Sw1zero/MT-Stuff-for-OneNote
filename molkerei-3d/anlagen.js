// Daten der Molkerei. Einzige Quelle für Szene (script.js) und Grundriss (grundriss.html).
// Masse in Metern. x nach rechts (Osten), z nach unten im Grundriss (Süden).
// VORLÄUFIG: Grundriss-Vorschlag, wartet auf Philipps Korrektur.

const RAEUME = [
  // id, name, Rechteck x0/z0/x1/z1, Deckenhöhe, Bodenfarbe
  // wand: 'beton' statt Fliesen unten und Paneele oben. belag: Bodenmuster statt weisser Fliesen. farbe nur noch im Grundriss.
  { id: 'kaesekeller',    name: 'Käsekeller (Untergeschoss)', x0: 0, z0: 0, x1: 20, z1: 20, hoehe: 4, farbe: '#d9cbb5', wand: 'beton', belag: 'kiesbeton', boden: -5 }, // neben dem Salzbad
  { id: 'annahme',        name: 'Milchannahme',            x0: 0,  z0: 20, x1: 20,  z1: 40, hoehe: 6,   farbe: '#cfd8dc' },
  { id: 'labor',          name: 'Kulturen und Labor',      x0: 0,  z0: 40, x1: 20,  z1: 60, hoehe: 3.5, farbe: '#e3e8ef' },
  { id: 'kaeserei',       name: 'Käserei',                 x0: 20, z0: 0,  x1: 40,  z1: 20, hoehe: 5,   farbe: '#e8dcc0' },
  { id: 'frischkaeserei', name: 'Frischkäserei',           x0: 40, z0: 0,  x1: 60,  z1: 20, hoehe: 5,   farbe: '#efe6d2' },
  { id: 'sauermilch',     name: 'Sauermilch und Dessert',  x0: 60, z0: 0,  x1: 80,  z1: 20, hoehe: 6,   farbe: '#e6dce8' },
  { id: 'behandlung',     name: 'Milchbehandlung',         x0: 20, z0: 20, x1: 80,  z1: 40, hoehe: 6,   farbe: '#d6e4ea' },
  { id: 'butterei',       name: 'Butterei',                x0: 20, z0: 40, x1: 40,  z1: 60, hoehe: 5,   farbe: '#f1e5b8' },
  { id: 'speiseeis',      name: 'Speiseeis',               x0: 40, z0: 40, x1: 60,  z1: 60, hoehe: 5,   farbe: '#dcecf0' },
  { id: 'membran',        name: 'Membrantechnik',          x0: 60, z0: 40, x1: 80,  z1: 60, hoehe: 5,   farbe: '#d4e6dc' },
  // boden: Höhe des Bodens in m (Standard 0). Technik im Untergeschoss unter der Milchbehandlung, vorerst nur über die Raumliste erreichbar.
  { id: 'technik',        name: 'Technik (Untergeschoss)', x0: 40, z0: 20, x1: 60,  z1: 40, hoehe: 4.5, farbe: '#d0d0d0', wand: 'beton', belag: 'kiesbeton', boden: -5 },
  { id: 'salzbadraum',    name: 'Salzbad (Untergeschoss)', x0: 20, z0: 0,  x1: 40,  z1: 20, hoehe: 4.5, farbe: '#dfe6e8', belag: 'kiesbeton', boden: -5 }, // unter der Käserei
  { id: 'abfuellung',     name: 'Abfüllung und Kühlraum',  x0: 80, z0: 20, x1: 100, z1: 40, hoehe: 5,   farbe: '#dfe3e6' },
  { id: 'trocknerei',     name: 'Trocknerei',              x0: 80, z0: 40, x1: 100, z1: 60, hoehe: 14,  farbe: '#e9e4dc' } // Sprühturm braucht Höhe
];

// Durchgänge: je zwei Räume mit gemeinsamer Wand. Der erste Durchgang eines Raums ist sein Eingang (Raumliste).
const TUEREN = [
  ['behandlung', 'annahme'],
  ['annahme', 'labor'],
  ['kaeserei', 'behandlung'],
  ['kaesekeller', 'salzbadraum'], // Untergeschoss
  ['frischkaeserei', 'behandlung'],
  ['sauermilch', 'behandlung'],
  ['butterei', 'behandlung'],
  ['speiseeis', 'behandlung'],
  ['membran', 'behandlung'],
  ['abfuellung', 'behandlung'],
  ['trocknerei', 'abfuellung'],
  ['membran', 'trocknerei']
];

// Leitungen: rechtwinklig (erst entlang x, dann entlang z), jede auf eigener Höhe ab LEITUNG_HOEHE.
// Farbcode wie beim 3D-Baukasten (Log 26.10.2026).
// produkt: true = läuft immer über den Rohrbahnhof (BAHNHOF). Versorgung geht direkt.
// r = Rohrradius in m (sonst ROHR_R), isoliert = matter Isoliermantel in der Medienfarbe statt Chromstahl.
// Versorgung (isoliert): farbe = Vorlauf dunkel, ruecklauf = Rücklauf hell (Leitung mit ab '…ruecklauf').
// Sie läuft immer im Untergeschoss und kommt direkt an der Anlage durch den Boden (geometrie.js anschluesse).
const MEDIEN = {
  milch: { name: 'Milch', farbe: '#ffffff', produkt: true },
  rahm: { name: 'Rahm', farbe: '#f2d54b', produkt: true },
  magermilch: { name: 'Magermilch', farbe: '#9aa3ab', produkt: true },
  bruch: { name: 'Bruch', farbe: '#f2d54b', produkt: true },
  molke: { name: 'Molke', farbe: '#4f9d5a', produkt: true },
  cip: { name: 'CIP-Reinigung', farbe: '#e8892b', produkt: true }, // Farbe vorläufig (Baukasten: «CIP später»), Vorlauf geht über den Bahnhof wie ein Produkt
  heisswasser: { name: 'Heisswasser', farbe: '#9e1f1f', ruecklauf: '#e58a8a', r: 0.045, isoliert: true },
  kuehlwasser: { name: 'Kühlwasser', farbe: '#1d4f9e', ruecklauf: '#8dbbf0', r: 0.045, isoliert: true },
  quark: { name: 'Quark', farbe: '#f4efe1', produkt: true }
};
const LEITUNG_HOEHE = 3;      // m, unterste Leitung
const LEITUNG_ABSTAND = 0.015; // m, Luft zwischen zwei übereinanderliegenden Leitungen
const ROHR_R = 0.0265;        // m, Produktleitung DN 50 (Ø 53 mm, DIN 11850). Isolierte Versorgung Ø 9 cm (MEDIEN.r).
const BAHNHOF = 'rohrbahnhof';

// Prozessschritte von Anlage zu Anlage. Der Umweg über den Bahnhof wird automatisch gezeichnet.
// Optional: ab/an = Name des Anschlusses an der Anlage (sonst das Medium), direkt = nicht über den Bahnhof,
// hoehe = Höhe der Leitung in m statt eigener Höhe ab LEITUNG_HOEHE (negativ = im Untergeschoss).
const LEITUNGEN = [
  // Käserei-Linie (Philipp, 01.11.2026)
  { von: 'annahmestation', nach: 'lagertank-1', medium: 'milch' },
  { von: 'lagertank-1', nach: 'milchpumpe', medium: 'milch', ab: 'auslauf', an: 'saug', direkt: true, hoehe: 0.75 },
  { von: 'milchpumpe', nach: 'vorlaufgefaess-pasteur', medium: 'milch', ab: 'druck' },
  // Plattenpasteur (a.4): Vorlaufgefäss, Pumpe, PWT, Heisshalter. Rückführung vom Umschaltventil ins Vorlaufgefäss.
  { von: 'pasteurpumpe', nach: 'plattenwaermetauscher', medium: 'milch', ab: 'druck', direkt: true, hoehe: 1.15 },
  { von: 'plattenwaermetauscher', nach: 'heisshalter', medium: 'milch', ab: 'erhitzt', direkt: true, hoehe: 1.7 },
  { von: 'heisshalter', nach: 'plattenwaermetauscher', medium: 'milch', ab: 'heisshalter', an: 'heisshalter', direkt: true, hoehe: 1.85 },
  { von: 'heisshalter', nach: 'vorlaufgefaess-pasteur', medium: 'milch', ab: 'rueckfuehrung', an: 'rueckfuehrung', direkt: true, hoehe: 2 },
  { von: 'plattenwaermetauscher', nach: 'separator', medium: 'milch', ab: 'pasteurisiert' },
  { von: 'separator', nach: 'rahmreifer', medium: 'rahm' },
  { von: 'separator', nach: 'kaesefertiger', medium: 'magermilch' },
  { von: 'plattenwaermetauscher', nach: 'kaesefertiger', medium: 'milch', ab: 'pasteurisiert' },
  { von: 'kaesefertiger', nach: 'vorpresswanne', medium: 'bruch' },
  { von: 'vorpresswanne', nach: 'molketank', medium: 'molke' },
  // Versorgung
  { von: 'dampfkessel', nach: 'plattenwaermetauscher', medium: 'heisswasser' },
  { von: 'dampfkessel', nach: 'kaesefertiger', medium: 'heisswasser' },
  { von: 'plattenwaermetauscher', nach: 'dampfkessel', medium: 'heisswasser', ab: 'heisswasser_ruecklauf' },
  { von: 'kaelteanlage', nach: 'plattenwaermetauscher', medium: 'kuehlwasser' },
  { von: 'plattenwaermetauscher', nach: 'kaelteanlage', medium: 'kuehlwasser', ab: 'kuehlwasser_ruecklauf' },
  // Eiswasser zum Lagertank: von unten aus dem Untergeschoss in den Doppelmantel, Vor- und Rücklauf
  { von: 'kaelteanlage', nach: 'lagertank-1', medium: 'kuehlwasser' },
  { von: 'lagertank-1', nach: 'kaelteanlage', medium: 'kuehlwasser', ab: 'ruecklauf' },
  { von: 'kaelteanlage', nach: 'lagertank-2', medium: 'kuehlwasser' },
  { von: 'lagertank-2', nach: 'kaelteanlage', medium: 'kuehlwasser', ab: 'ruecklauf' },
  // Reinigung
  { von: 'cip', nach: 'lagertank-1', medium: 'cip' }
];

// Begehbare Metallpodeste neben Anlagen. x/z = Mitte des Podests relativ zum Raum wie bei den Anlagen, b = Länge (x), t = Tiefe (z),
// hoehe = Höhe der Lauffläche. treppe = Seite der Treppe (geht von dort nach unten), offen = Seite zur Anlage ohne Geländer.
// Masse geschätzt: Wannenrand der Schulenburg-Wanne auf 1.8 m, Tankoberkante auf 2.15 m.
const PODESTE = [
  { id: 'podest-lagertank', raum: 'annahme', x: 12, z: 3.5, b: 4, t: 0.8, hoehe: 1.2, treppe: '-x', offen: '+z' },
  { id: 'podest-schulenburg', raum: 'frischkaeserei', x: 15.5, z: 12.7, b: 2.8, t: 0.8, hoehe: 1, treppe: '-x', offen: '+z' }
];

// Startpunkt in der Milchannahme, Blickrichtung als x/z-Vektor (hier nach Osten in die Milchbehandlung).
const START = { x: 5, z: 30, blick: [1, 0] };

// Anlagen. x/z = Mitte, relativ zur Ecke x0/z0 ihres Raums. b = Breite (x), t = Tiefe (z).
// bau: 'separator' | 'kaesefertiger' | 'lagertank' | 'pumpe' | 'bahnhof' = in 3D gebaut, sonst nur Umriss am Boden ("Anlage folgt").
// anschluesse: name: [x, y, z (relativ zur Anlage), Richtung des Stutzens bei waagrechten Stutzen: '-x' | '+x' | '-z' | '+z'].
// Alle Masse ohne Quelle sind geschätzt.
// Lagertank: Texte aus Lehrmittel a.1 «Milch lagern» (Lagergefässe, Tankinstallationen, Kühlung).
// Teil-ids = Gruppennamen in material/molkerei-3d/lagertank.blend (bzwu).
const LAGERTANK = {
  teile: [
    { id: 'mannloch', name: 'Mannloch', text: 'Das Mannloch ermöglicht den Einstieg in den Tank.' },
    { id: 'einlauf', name: 'Einlaufbogen', text: 'Über den Einlaufbogen befüllen Sie den Tank schonend und schaumfrei. Grosse Tanks werden aus den gleichen Gründen oft von unten über den Auslaufstutzen befüllt.' },
    { id: 'ruehrwerk', name: 'Rührwerk', text: 'Das Rührwerk rührt die Milch schonend und verhindert, dass sie sich während der Lagerung entmischt. Je grösser der Rührwerkdurchmesser ist, umso kleiner kann die Umdrehungszahl sein.' },
    { id: 'thermometer', name: 'Temperaturfühler', text: 'Der Temperaturfühler informiert Sie über die Temperatur der Milch. Die Kühlung auf 1 bis 5 °C vermindert die Aktivität der meisten Mikroorganismen deutlich.' },
    { id: 'cip', name: 'CIP-Vorrichtung', text: 'Die CIP-Vorrichtung ermöglicht die Kreislaufreinigung des Tanks.' },
    { id: 'auslauf', name: 'Auslaufstutzen', text: 'Über den Auslaufstutzen fliesst die Milch aus dem Tank weiter zur Verarbeitung. Grosse Tanks werden oft auch von unten über den Auslaufstutzen befüllt, weil das schonend und schaumfrei ist.' },
    { id: 'licht', name: 'Licht', text: 'Das Licht beleuchtet das Tankinnere.' },
    { id: 'entlueftung', name: 'Be- und Entlüftungsstutzen', text: 'Der Be- und Entlüftungsstutzen sorgt für den Druckausgleich, wenn Sie den Tank füllen oder leeren.' },
    { id: 'vollsonde', name: 'Vollsonde', text: 'Die Vollsonde meldet, wenn der Tank voll ist.' },
    { id: 'leersonde', name: 'Leersonde', text: 'Die Leersonde meldet, wenn der Tank leer ist.' },
    { id: 'fuellstand', name: 'Füllstandsmessung', text: 'Die Füllstandsmessung informiert Sie über die Füllmenge im Tank.' },
    { id: 'kuehlwasser', name: 'Doppelmantel mit Eiswasser', text: 'Lagertanks haben einen Doppelmantel. Darin wird mit Eiswasser gekühlt oder mit Warmwasser geheizt, damit sich die Milch während der Lagerung weder erwärmt noch zu stark abkühlt. Das Eiswasser kommt hier von der Kälteanlage im Untergeschoss.' }
  ],
  text: 'Im Lagertank lagern Sie die Rohmilch bis zur Verarbeitung, höchstens 48 Stunden. ' +
    'Der Tank ist aus Chromstahl und schützt die Milch vor Licht. Licht verursacht den Geschmacksfehler «talgig, metallisch». ' +
    'Die Temperatur entscheidet: Bei 4.5 °C steigt die Keimzahl in 48 Stunden von 10 000 auf 50 000 pro ml, bei 10 °C auf 5 000 000.'
};

// Kühlwasserstutzen am Ende des Doppelmantels zeigen nach -x: Die Leitung kommt waagrecht heraus und biegt nach unten ab.
// Milch: Clamp-Ende des Einlaufbogens, der waagrecht nach -x zeigt.
const TANK_ANSCHLUESSE = { milch: [-1.895, 2.383, -0.3, '-x'],auslauf: [2.4, 0.75, 0], cip: [1.2, 2.35, 0],
  kuehlwasser: [-2.22, 0.8, -0.25, '-x'], ruecklauf: [-2.22, 0.8, 0.25, '-x'] };

// Zentrifugalpumpe (Milchpumpe und Pasteurpumpe): Texte aus Lehrmittel a.1 «Pumpen», Teil-ids = Gruppennamen in zentrifugalpumpe.blend.
const PUMPE_TEILE = [
  { id: 'laufrad', name: 'Laufrad', text: 'Das Laufrad versetzt die Milch in Rotation, die Zentrifugalkraft beschleunigt sie nach aussen. Mit einem speziellen Laufrad und Gehäuse kann die Zentrifugalpumpe auch Käsebruch fördern. Lassen Sie die Pumpe nie leer laufen, das schädigt das Laufrad.' },
  { id: 'gleitringdichtung', name: 'Gleitringdichtung', text: 'Die Gleitringdichtung dichtet das Pumpengehäuse dort ab, wo die Welle des Motors hineinführt. Lassen Sie die Pumpe nie leer laufen, das schädigt die Gleitringdichtung. Kontrollieren Sie die Dichtigkeit und ersetzen Sie immer alle Gleitringdichtungen, periodisch oder bei Undichtheit.' },
  { id: 'elektromotor', name: 'Elektromotor', text: 'Der Elektromotor treibt das Laufrad im Pumpengehäuse an.' },
  { id: 'saugstutzen', name: 'Saugstutzen', text: 'Durch den Saugstutzen in der Mitte des Gehäuses fliesst die Milch in Achsrichtung (axial) dem Laufrad zu. Die Zentrifugalpumpe ist nicht selbstansaugend: Die Milch muss ihr zufliessen. Darum steht die Pumpe tiefer als der Auslaufstutzen des Tanks.' },
  { id: 'pumpengehaeuse', name: 'Pumpengehäuse', text: 'Im Pumpengehäuse versetzt das Laufrad die Milch in Rotation, die Zentrifugalkraft beschleunigt sie nach aussen. Die Pumpe schöpft nur, wenn Gehäuse und Saugleitung vollständig mit Flüssigkeit gefüllt sind.' },
  { id: 'druckstutzen', name: 'Druckstutzen', text: 'Am Pumpengehäuse und vor allem beim Druckstutzen wird die Geschwindigkeitsenergie in Druckenergie umgewandelt. Die Milch verlässt die Pumpe mit höherem Druck Richtung Rohrbahnhof.' }
];

const ANLAGEN = [
  // Milchannahme (a.1)
  { id: 'annahmestation', name: 'Annahmestation', raum: 'annahme', x: 4, z: 10, b: 2, t: 1.5 },
  // Liegender Käserei-Lagertank 10'000 L nach DeLaval DXCE, ohne eigene Kühlung (Eiswasser aus der Kälteanlage).
  // Modell: material/molkerei-3d/lagertank.blend (bzwu), Export modelle/lagertank.glb.
  { id: 'lagertank-1', name: 'Lagertank 1', raum: 'annahme', x: 12, z: 5, b: 4.6, t: 2.1, bau: 'lagertank',
    anschluesse: TANK_ANSCHLUESSE, ...LAGERTANK },
  {
    // Texte: Lehrmittel a.1 «Pumpen» (Legende 1-6), «Zentrifugalpumpe» und Pflege der Pumpen.
    // Modell nach Alfa Laval LKH-35: material/molkerei-3d/zentrifugalpumpe.blend (bzwu), Teil-ids = Gruppennamen dort.
    id: 'milchpumpe', name: 'Zentrifugalpumpe', raum: 'annahme', x: 15.6, z: 5, b: 0.95, t: 0.5, bau: 'pumpe',
    anschluesse: { saug: [-0.455, 0.274, 0, '-x'], druck: [-0.374, 0.524, 0.119] },
    oeffnen: { auf: 'Explosionsansicht', zu: 'Zusammenbauen', leitungenWeg: true },
    teile: PUMPE_TEILE,
    text: 'Die Zentrifugalpumpe fördert die Milch aus dem Lagertank 1 zum Rohrbahnhof. ' +
      'Sie ist in Käsereien und Molkereien häufig: Sie fördert schonend, ist einfach und hygienisch gebaut und gut CIP-reinigbar. ' +
      'Sie ist aber nicht selbstansaugend und eignet sich nicht für Produkte mit hoher Viskosität.'
  },
  { id: 'lagertank-2', name: 'Lagertank 2', raum: 'annahme', x: 12, z: 15, b: 4.6, t: 2.1, bau: 'lagertank', anschluesse: TANK_ANSCHLUESSE, ...LAGERTANK },

  // Milchbehandlung (a.2, a.4, a.5, b.6)
  {
    id: 'separator', name: 'Separator', raum: 'behandlung', x: 8, z: 6, b: 1.7, t: 0.8, bau: 'separator',
    // Nach Fotos SPX, gut 1.6 m hoch. Alle Texte: Lehrmittel a.2 (Aufbau, Funktion, Trommelbestandteile, Bedienen).
    oeffnen: { auf: 'Haube öffnen', zu: 'Haube schliessen' },
    // Betrieb: Schnitt durch Haube und Trommel, Trommel dreht (bauten.js separatorbetrieb).
    // Wie es fliesst, zeigt das Schnittbild (schnittbild.js).
    betrieb: { an: 'Betrieb zeigen', aus: 'Betrieb beenden' },
    schnittbild: true,
    // Wo die Leitungen andocken, je Medium [x, y, z] relativ zur Anlagenmitte (sonst Mitte auf 1 m)
    anschluesse: { milch: [0.23, 1.76, 0], rahm: [0.63, 1.47, 0], magermilch: [-0.17, 1.47, 0] },
    teile: [
      { id: 'getriebe', name: 'Getriebe', text: 'Das Getriebe ist Teil 1 im Aufbau des Separators. Das Getriebeöl und alle Dichtungen wechseln Sie mindestens jährlich nach Vorschrift.' },
      { id: 'elektromotor', name: 'Elektromotor', text: 'Der Elektromotor ist Teil 2 im Aufbau des Separators. Bevor Sie Milch zuführen, muss die Trommeldrehzahl erreicht sein.' },
      { id: 'gestellunterteil', name: 'Gestellunterteil', text: 'Das Gestellunterteil ist Teil 3 im Aufbau des Separators. Der Separator muss sauber sein und möglichst vibrationsfrei laufen.' },
      { id: 'gestelloberteil', name: 'Gestelloberteil (Trommelgehäuse)', text: 'Das Gestelloberteil, auch Trommelgehäuse genannt, ist Teil 5 im Aufbau des Separators.' },
      { id: 'gestellhaube', name: 'Gestellhaube', text: 'Die Gestellhaube ist Teil 6 im Aufbau des Separators. Für die Demontage muss die Trommel absolut stillstehen. Wer diese Vorschrift nicht beachtet, begibt sich in Lebensgefahr!' },
      { id: 'milchzulauf', name: 'Milchzulauf', text: 'Die Milch fliesst durch den Einlauf in den Verteiler, der sich mit einer grossen Umdrehungszahl dreht. Die Milch wird dadurch beschleunigt und gleichmässig auf die Steiglöcher des Tellerpaketes verteilt.' },
      { id: 'rahmauslauf', name: 'Rahmauslauf', text: 'Der Rahm wird entlang dem Verteiler nach oben verdrängt und mit Hilfe des Rahmgreifers aus dem Separator gefördert.' },
      { id: 'magermilchauslauf', name: 'Magermilchauslauf', text: 'Die Magermilch wird zwischen Scheideteller und Trommeldeckel in die Greiferkammer verdrängt. Der Magermilchgreifer fördert sie über den Magermilchableiter aus dem Separator.' },
      { id: 'rahmschraube', name: 'Rahmschraube', text: 'Mit der Rahmschraube regulieren Sie den Fettgehalt im Rahm. Drosseln Sie die Rahmmenge durch Zuschrauben, sinkt der Anteil Magermilch im austretenden Rahm und der Fettgehalt steigt. Öffnen Sie die Rahmschraube stärker, steigt die Rahmmenge und der Fettgehalt sinkt.' },
      { id: 'magermilchschraube', name: 'Magermilchschraube', text: 'Mit der Magermilchschraube regulieren Sie den Gegendruck im Separator. Für die optimale Entrahmung muss er ca. 0,5 bar unterhalb des Überlaufdruckes liegen. Ist der Druck zu hoch, drehen Sie die Magermilchschraube auf. Ist er zu tief, drehen Sie sie zu.' },
      { id: 'manometer', name: 'Manometer', text: 'Das Manometer zeigt den Druck auf der Magermilchseite an.' },
      { id: 'steuerwasser', name: 'Steuerwasseranschluss', text: 'In der rotierenden Trommel erzeugt das eingeleitete Steuerwasser einen hohen Zentrifugaldruck. Damit bewegt sich der Schieberboden und öffnet oder schliesst die Schlammaustrittsöffnungen. Das Steuerwasser muss teilenthärtet sein und einen konstanten Druck aufweisen.' },
      // Trommelbestandteile 1-12 nach Lehrmittel a.2, sichtbar bei offener Haube. Bilder wie im Memory a.2.
      { id: 'greiferkammerverschlussring', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_01_Greiferkammerverschluss.png', name: 'Greiferkammerverschlussring', text: 'Der Greiferkammerverschlussring ist Teil 1 der Trommel. Er hält den Greiferkammerdeckel fest.' },
      { id: 'greiferkammerdeckel', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_02_Greiferkammerdeckel.png', name: 'Greiferkammerdeckel', text: 'Der Greiferkammerdeckel ist Teil 2 der Trommel. Er schliesst die Greiferkammer, in der die Magermilch einen Flüssigkeitsring bildet.' },
      { id: 'magermilchgreifer', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_03_Magermilchgreifer.png', name: 'Magermilchgreifer', text: 'Der Magermilchgreifer ist Teil 3 der Trommel. Er steht still und ragt in den rotierenden Flüssigkeitsring. Seine sichelförmigen Kanäle bremsen die Magermilch ab: Geschwindigkeitsenergie wird in Druckenergie umgewandelt. So wird die Magermilch schaumfrei aus dem Separator gefördert.' },
      { id: 'trommelverschlussring', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_04_Trommelverschlussring.png', name: 'Trommelverschlussring', text: 'Der Trommelverschlussring ist Teil 4 der Trommel. Er hält Trommeldeckel und Trommelunterteil zusammen. Für die Demontage muss die Trommel absolut stillstehen. Wer diese Vorschrift nicht beachtet, begibt sich in Lebensgefahr!' },
      { id: 'trommeldeckel', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_05_06_Trommeldeckel_mit_Dichtring.png', name: 'Trommeldeckel', text: 'Der Trommeldeckel ist Teil 5 der Trommel. Zwischen Scheideteller und Trommeldeckel wird die Magermilch in die Greiferkammer verdrängt.' },
      { id: 'dichtring', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_05_06_Trommeldeckel_mit_Dichtring.png', name: 'Dichtring', text: 'Der Dichtring ist Teil 6 der Trommel. Er dichtet zwischen Trommeldeckel und Trommelunterteil. Alle Dichtungen wechseln Sie mindestens jährlich nach Vorschrift.' },
      { id: 'scheideteller', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_07_Scheideteller.png', name: 'Scheideteller', text: 'Der Scheideteller ist Teil 7 der Trommel. Zwischen Scheideteller und Trommeldeckel wird die Magermilch in die Greiferkammer verdrängt.' },
      { id: 'einlaufrohr', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_08_Rahmgreifer.png', name: 'Einlaufrohr mit Rahmgreifer', text: 'Das Einlaufrohr mit Rahmgreifer ist Teil 8 der Trommel. Die Milch fliesst durch den Einlauf in den Verteiler. Der Rahm wird entlang dem Verteiler nach oben verdrängt und mit Hilfe des Rahmgreifers aus dem Separator gefördert.' },
      { id: 'tellerpaket', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_09_Tellerpaket.png', name: 'Teller', text: 'Die Teller sind Teil 9 der Trommel. Im Tellerpaket wird die Milch in viele kleine Schichten aufgeteilt (ca. 70 bis 130, Schichthöhe 0,3 bis 0,5 mm). Die schwerere Magermilch und die Schmutzstoffe werden nach aussen gegen die Trommelwand gedrückt, der leichtere Rahm wird nach innen verdrängt.' },
      { id: 'verteiler', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_10_Verteiler.png', name: 'Verteiler', text: 'Der Verteiler ist Teil 10 der Trommel. Er dreht sich mit fünf- bis siebentausend Umdrehungen pro Minute und verteilt die Milch gleichmässig auf die Steiglöcher des Tellerpaketes.' },
      { id: 'kolbenschieber', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_11_Kolbenschieber.png', name: 'Kolbenschieber (Schieberboden)', text: 'Der Kolbenschieber ist Teil 11 der Trommel. Das Steuerwasser drückt ihn mit der Zentrifugalkraft nach oben: Die Trommel ist geschlossen. Fliesst das Wasser aus der Schliesskammer ab, bewegt er sich ein wenig nach unten und gibt die Schlammaustrittsöffnungen frei.' },
      { id: 'trommelunterteil', bild: '../a2-rohstoffe-trennen/images/trommelbestandteile/a.2_12_Trommelunterteil.png', name: 'Trommelunterteil', text: 'Das Trommelunterteil ist Teil 12 der Trommel. Die Trommel ist Teil 4 im Aufbau des Separators und dreht mit fünf- bis siebentausend Umdrehungen pro Minute. Die Schmutzstoffe bilden an der Trommelwand ein Schlammdepot. Beim selbstreinigenden Separator wird der Schlamm durch die Schlammaustrittsöffnungen rundum in die Auffanghaube ausgeschleudert.' }
    ],
    text: 'Der Separator trennt Vollmilch mit der Zentrifugalkraft in Rahm und Magermilch. ' +
      'Die Trommel dreht mit fünf- bis siebentausend Umdrehungen pro Minute. ' +
      'Im Tellerpaket wird die Milch in 70 bis 130 dünne Schichten aufgeteilt. ' +
      'Die schwerere Magermilch und die Schmutzstoffe werden nach aussen gegen die Trommelwand gedrückt, der leichtere Rahm wird nach innen verdrängt. ' +
      'Mit der Rahmschraube stellen Sie den Fettgehalt des Rahms ein: Drosseln Sie die Rahmmenge, steigt der Fettgehalt.'
  },
  {
    // Kein Text: Lehrmittel EFZ beschreibt den Rohrbahnhof nicht (nur Schwenkbogen in b.6).
    id: 'rohrbahnhof', name: 'Rohrbahnhof', raum: 'behandlung', x: 0.5, z: 4, b: 0.4, t: 2.4, bau: 'bahnhof'
  },
  { id: 'baktofuge', name: 'Baktofuge', raum: 'behandlung', x: 8, z: 13, b: 1.5, t: 1.5 },
  {
    // Plattenpasteur mit drei Paketen, Masse nach Alfa Laval Front 6 (Datenblatt), Eigenbau: material/molkerei-3d/plattenwaermetauscher_bau.py (bzwu).
    // Texte aus Lehrmittel a.4 «Plattenapparat», «Plattenpasteur». Eigene Sätze: anschlussplatte_1/2, fuehrungsstange, Dichtungsfarben im Anlagentext.
    id: 'plattenwaermetauscher', name: 'Plattenwärmetauscher', raum: 'behandlung', x: 19.355, z: 6, b: 1.3, t: 0.8, bau: 'plattenwaermetauscher', schnittbild: 'pwt', // Gegenstromprinzip: schnittbild-pwt.js
    // Kühlpaket: Milch hinten (-z), Eiswasser vorne. Rohrschlaufen zwischen den Paketen sind im Modell (Gruppe rohrschlaufen).
    // Vorlauf oben über dem Rücklauf: 5. Wert = längere Gerade, damit beide senkrecht nach unten nebeneinander laufen.
    anschluesse: { milch: [-0.129, 0.4, 0.3, '+z'], pasteurisiert: [-0.456, 1.259, -0.065, '-x'], kuehlwasser: [-0.456, 1.259, 0.065, '-x', 0.45], kuehlwasser_ruecklauf: [-0.456, 0.4, 0.065, '-x'],
      erhitzt: [0.157, 1.259, 0.3, '+z'], heisshalter: [-0.129, 1.259, -0.3, '-z'],
      heisswasser: [0.157, 1.259, -0.3, '-z', 0.45], heisswasser_ruecklauf: [0.157, 0.4, -0.3, '-z'] },
    teile: [
      { id: 'stativplatte', name: 'Stativplatte', text: 'Auf einem Rahmen befinden sich zwischen der Stativ- und der Druckplatte ein oder mehrere Plattenpakete.' },
      { id: 'druckplatte', name: 'Druckplatte', text: 'Messen Sie vor dem Öffnen den Abstand (Spannung) zwischen der Stativ- und der Druckplatte und notieren Sie das Mass.' },
      { id: 'anschlussplatte_1', name: 'Anschlussplatte', text: 'Die Anschlussplatte trennt das Kühlpaket vom Wärmerückgewinnungspaket. Ihre vier Anschlüsse gehören zur Wärmerückgewinnung: vorne fliesst die kalte Rohmilch hinein und vorgewärmt zum Erhitzer hinaus, hinten kommt die heisse Milch vom Heisshalter zurück und fliesst vorgekühlt zum Kühlpaket.' },
      { id: 'anschlussplatte_2', name: 'Anschlussplatte', text: 'Die Anschlussplatte trennt das Wärmerückgewinnungspaket vom Erhitzerpaket. Ihre vier Anschlüsse gehören zum Erhitzer: vorne fliesst die vorgewärmte Milch hinein und heiss zum Heisshalter hinaus, hinten fliesst das Warmwasser zu und wieder ab.' },
      { id: 'spannbolzen', name: 'Spannbolzen', text: 'Durch die Spannbolzen werden die einzelnen Platten mit ihren Dichtungen gegeneinander gepresst, sodass der Plattenapparat dicht ist. Ziehen Sie die Schrauben der Spannbolzen beim Zusammenbauen gleichmässig fest, bis das ursprünglich gemessene Mass erreicht ist.' },
      { id: 'anschluesse', name: 'Anschlüsse', text: 'Über die Anschlüsse lassen sich die gewünschten Verbindungen herstellen. Jedes Paket hat vier Anschlüsse, je einen Zu- und Ablauf für die Milch und für das zweite Medium. Die Anschlüsse an der Stativplatte gehören zum Kühlpaket: Milch und Eiswasser.' },
      { id: 'tragstange', name: 'Tragstange', text: 'Auf der Tragstange können Sie die Platten verschieben, z.B. für Sichtkontrollen oder zum Auswechseln der Dichtungen.' },
      { id: 'fuehrungsstange', name: 'Führungsstange', text: 'Die Führungsstange hält die Platten unten in der Linie, wenn Sie sie auf der Tragstange verschieben.' },
      { id: 'paket_rueckgewinnung', name: 'Wärmerückgewinnungspaket', text: 'Hier wird die kalte Rohmilch von der schon pasteurisierten Milch vorgewärmt (Wärmerückgewinnung). Deshalb wird dieses Plattenpaket auch Milch/Milch-Wärmetauscher oder Wärmerückgewinnungspaket genannt.' },
      { id: 'paket_erhitzer', name: 'Erhitzerpaket', text: 'Mit Hilfe von Warmwasser wird die Milch auf die gewünschte Pasteurisationstemperatur erhitzt.' },
      { id: 'paket_kuehlung', name: 'Kühlpaket', text: 'Im Austauscherpaket gibt das Produkt Wärmeenergie ab, wodurch es vorgekühlt wird. Die Kühlung mit Eiswasser erfolgt anschliessend im Kühlpaket.' },
      { id: 'temperatursensor', name: 'Temperatursensor nach Erhitzer', text: 'Der Temperatursensor, der unmittelbar nach dem Erhitzer eingebaut ist, misst die aktuelle Temperatur und meldet diese dem Regler. Dieser vergleicht den Ist-Wert mit dem Soll-Wert (gewünschte Pasteurisationstemperatur). Ist der Ist-Wert tiefer als der Sollwert, lässt das Dampfregulierventil mehr Dampf durchströmen, dadurch wird das Warmwasser und als Folge davon das Produkt höher erhitzt.' }
    ],
    text: 'Im Plattenwärmetauscher wird eine Flüssigkeit im Durchlaufverfahren (kontinuierlich) erhitzt und/oder gekühlt. Je zwei gerippte Platten bilden einen wenige Millimeter breiten Fliessweg für das Produkt oder das Heiz- bzw. Kühlmedium. Die Dichtungen zeigen die drei Pakete: blau Kühlung, grün Wärmerückgewinnung in der Mitte, rot Erhitzer.'
  },
  {
    // Vorlaufgefäss des Plattenpasteurs (a.4 Nr. 1 und 2), Variante 'pasteur' von material/molkerei-3d/vorlaufgefaess_bau.py (bzwu).
    // Auslaufrohr endet am Saugstutzen der Pasteurpumpe (+x). Eigene Sätze: schwimmer (zweiter Satz).
    id: 'vorlaufgefaess-pasteur', name: 'Vorlaufgefäss', raum: 'behandlung', x: 18.975, z: 7.6, b: 0.62, t: 0.62, bau: 'vorlaufgefaess_pasteur',
    anschluesse: { milch: [0.17, 1.07, -0.1], rueckfuehrung: [-0.17, 1.07, -0.1] },
    teile: [
      { id: 'behaelter', name: 'Vorlaufgefäss', text: 'Ins Vorlaufgefäss fliesst die kalte Rohmilch. Fällt die Temperatur am Ende des Heisshalters unter 72 °C, wird die ungenügend pasteurisierte Milch in das Vorlaufgefäss zurückgeleitet.' },
      { id: 'schwimmer', name: 'Schwimmer', text: 'Der Zufluss der kalten Rohmilch in das Vorlaufbassin wird über den Schwimmer reguliert. Steigt der Milchspiegel, hebt die Kugel den Hebel und schliesst den Zulauf.' },
      { id: 'bodenventil', name: 'Bodenventil (Klappenventil)', text: 'Klappenventile sind nur als Absperrventil einsetzbar. Sie werden von Hand oder mit Luftdruck (pneumatisch) bedient. Die Dichtung müssen Sie nach betrieblichen Vorgaben kontrollieren und sofort auswechseln, wenn sie beschädigt ist.' }
    ],
    text: 'Der Zufluss der kalten Rohmilch in das Vorlaufbassin wird über den Schwimmer reguliert. Die Pumpe fördert die Milch in das erste Plattenwärmetauscherpaket.'
  },
  {
    // Zweite Zentrifugalpumpe (a.4 Nr. 3), gleiches Modell wie die Milchpumpe.
    id: 'pasteurpumpe', name: 'Zentrifugalpumpe', raum: 'behandlung', x: 19.85, z: 7.6, b: 0.95, t: 0.5, bau: 'pumpe',
    anschluesse: { saug: [-0.455, 0.274, 0, '-x'], druck: [-0.374, 0.524, 0.119] },
    oeffnen: { auf: 'Explosionsansicht', zu: 'Zusammenbauen', leitungenWeg: true },
    teile: PUMPE_TEILE.map(t => t.id === 'druckstutzen' ? { ...t, text: t.text.replace('Richtung Rohrbahnhof', 'zum Plattenwärmetauscher') } : t),
    text: 'Die Pumpe fördert die Milch aus dem Vorlaufgefäss in das erste Plattenwärmetauscherpaket, das Wärmerückgewinnungspaket.'
  },
  {
    // Rohrheisshalter nach Alfa-Laval-Prozesstafel Pasteurisation, Eigenbau: material/molkerei-3d/heisshalter_bau.py (bzwu).
    // 5000 l/h, 15 s, DN 50: 7 Läufe à 1.6 m. Texte: a.4 (Nr. 8, 9, 10). Eigene Sätze: rohrschlange (zweiter Satz), Anlagentext (letzter Satz), umschaltventil (Feder, Philipp 04.11.). Sitzventil: a.1, Funktionskontrolle: a.4.
    id: 'heisshalter', name: 'Heisshalter', raum: 'behandlung', x: 21.44, z: 6, b: 2.2, t: 0.5, bau: 'heisshalter',
    anschluesse: { milch: [-1.015, 0.3, 0.222, '+z'], heisshalter: [0.885, 1.33, 0.172, '+z'], rueckfuehrung: [1.085, 1.05, 0, '+x'] },
    teile: [
      { id: 'rohrschlange', name: 'Heisshalter', text: 'Der Heisshalter gewährleistet, dass die Milch die notwendige Zeit auf Pasteurisationstemperatur heiss gehalten wird. Die Milch fliesst unten hinein und steigt durch die Rohrschlange nach oben.' },
      { id: 'temperatursensor', name: 'Temperatursensor nach Heisshalter', text: 'Fällt die vom Temperatursensor gemessene Temperatur am Ende des Heisshalters unter 72 °C, sendet der Regler/die Steuerung ein Signal an das Umschaltventil. Bei der Pasteurisation von Konsummilch und Konsumrahm ist vorgeschrieben, dass die Erhitzungs- und Kühltemperatur sowie die Stellung des Umschaltventils kontinuierlich registriert werden.' },
      { id: 'umschaltventil', name: 'Umschaltventil', text: 'Die Milch gelangt über das Umschaltventil, das das Produkt bei zu tiefer Pasteurisationstemperatur zurück ins Vorlaufgefäss leiten würde, ins Austauscherpaket. Dadurch wird verhindert, dass ungenügend pasteurisierte Milch den Pasteur verlassen kann. Das Umschaltventil ist ein pneumatisches Sitzventil, gebaut als Wechselventil. Fällt die Druckluft aus, drückt die Feder im Antrieb das Ventil in die Stellung zum Vorlaufgefäss. Kontrollieren Sie die Funktion regelmässig, zum Beispiel vor dem Ausfahren: Reduzieren Sie die Wärmezufuhr. Wenn am Ende des Heisshalters 72 °C unterschritten werden, muss das Umschaltventil das Produkt ins Vorlaufgefäss leiten, und die Anlage muss einen Alarm ausgeben.' }
    ],
    text: 'Der Heisshalter gewährleistet, dass die Milch die notwendige Zeit auf Pasteurisationstemperatur heiss gehalten wird. Fällt die Temperatur am Ende des Heisshalters unter 72 °C, wird die ungenügend pasteurisierte Milch in das Vorlaufgefäss zurückgeleitet. Bei 5000 Litern pro Stunde und 15 Sekunden Heisshaltezeit braucht es rund 10 Meter Rohr.'
  },
  { id: 'homogenisator', name: 'Homogenisator', raum: 'behandlung', x: 30, z: 6, b: 2.5, t: 1.5 },
  { id: 'uht', name: 'UHT-Anlage', raum: 'behandlung', x: 44, z: 6, b: 6, t: 2.5 },

  // Käserei (b.1, b.2)
  {
    id: 'kaesefertiger', name: 'Käsefertiger', raum: 'kaeserei', x: 6, z: 7, b: 3, t: 3, bau: 'kaesefertiger',
    // Ø 3 m, Rand 1.5 m nach Philipps Fotos. Text: Lehrmittel b.1
    text: 'Im Käsefertiger wird aus Milch Käsebruch. ' +
      'Sie wärmen die Milch schonend auf etwa 30 bis 35 °C, Milch für Rohmilchkäse nie über 40 °C. ' +
      'So werden die Milchsäurebakterien aktiv, und das Kasein gerinnt mit dem Lab besser. ' +
      'Nach dem Dicklegen schneidet die Harfe die Gallerte in Bruchkörner. ' +
      'In runden Fertigern sorgt ein Planetengetriebe dafür, dass die Harfe schneidet und nicht nur rührt, Strömungsbleche sorgen für eine gleichmässige Durchmischung.'
  },
  { id: 'vorpresswanne', name: 'Vorpresswanne', raum: 'kaeserei', x: 14, z: 4, b: 8, t: 1.5 },
  { id: 'kaesepresse', name: 'Käsepresse', raum: 'kaeserei', x: 14, z: 9, b: 6, t: 2 },
  { id: 'salzbad', name: 'Salzbad', raum: 'salzbadraum', x: 10, z: 10, b: 8, t: 4 },
  { id: 'molketank', name: 'Molketank', raum: 'kaeserei', x: 17.5, z: 15.5, b: 2.5, t: 2.5 },

  // Käsekeller (b.1–b.3)
  { id: 'reifungsgestell-1', name: 'Reifungsgestell', raum: 'kaesekeller', x: 10, z: 5, b: 12, t: 1.5 },
  { id: 'reifungsgestell-2', name: 'Reifungsgestell', raum: 'kaesekeller', x: 10, z: 10, b: 12, t: 1.5 },
  { id: 'schmierroboter', name: 'Schmierroboter', raum: 'kaesekeller', x: 10, z: 15, b: 2, t: 2 },

  // Frischkäserei (b.3–b.5)
  { id: 'weichkaese-formen', name: 'Formtisch Weichkäse', raum: 'frischkaeserei', x: 6, z: 6, b: 6, t: 2 },
  {
    // Düsenseparator, Masse nach Westfalia KDA 30 (Prospekt 1978), Eigenbau: material/molkerei-3d/quarkseparator_bau.py (bzwu).
    // Texte: Lehrmittel b.5 «Separieren». Eigene Sätze (KDA-Prospekt): Manometer, Regulierventil, Schauglas, Anlagentext.
    // Steiglöcher bei 3/4 der Tellerbreite: Quark 25 % ist die schwere Phase und bekommt das äussere Viertel.
    id: 'quarkseparator', name: 'Quarkseparator', raum: 'frischkaeserei', x: 14, z: 6, b: 1.62, t: 1.12, bau: 'quarkseparator', schnittbild: 'quark',
    oeffnen: { auf: 'Haube öffnen', zu: 'Haube schliessen' },
    teile: [
      { id: 'zulauf', name: 'Zulauf', text: 'Die Quarkgallerte wird von oben dem Separator zugeführt, im Zentrum nach unten geleitet und steigt von unten durch die Löcher im Tellerpaket nach oben. Über einen Filter vor dem Separator halten Sie grössere Partikel zurück und verhindern so, dass die Düsen verstopfen.' },
      { id: 'schauglas', name: 'Schauglas', text: 'Im Schauglas beobachten Sie die zufliessende Quarkgallerte.' },
      { id: 'haube', name: 'Haube', text: 'Der Quark, welcher aus den Düsen austritt, prallt im Auffangraum auf die Separatorhülle.' },
      { id: 'tellerpaket', name: 'Tellerpaket', text: 'Durch die rotierende Trommel wirken Fliehkräfte. Weil der Quark und die Molke eine unterschiedliche Dichte aufweisen, können diese getrennt werden. Der Quark mit der grösseren Dichte verdrängt die Molke Richtung Zentrum.' },
      { id: 'duesen', name: 'Düsen', text: 'Der Quark verlässt die Trommel über Düsen. Die Düsen sind auf der Seite der Separatortrommel angebracht. Sie haben einen Durchmesser von einigen Zehntelmillimetern (z. B. 0,6 mm). Über die zugeführte Menge an Quarkgallerte können Sie die Ausbeute und damit auch die Quarktrockenmasse regulieren.' },
      { id: 'molkenablauf', name: 'Molkenablauf mit Greifer', text: 'Der Quark verdrängt die Molke Richtung Zentrum. Diese verlässt über einen Greifer den Separator.' },
      { id: 'regulierventil', name: 'Regulierventil', text: 'Mit dem Regulierventil in der Molkenleitung stellen Sie den Gegendruck ein.' },
      { id: 'manometer', name: 'Manometer', text: 'Das Manometer in der Molkenleitung zeigt den Druck, mit dem der Greifer die Molke aus dem Separator fördert.' },
      { id: 'quarkablauf', name: 'Quarkablauf', text: 'Der Quark verlässt den Separator und gelangt in ein Vorlaufgefäss. Von dort wird er mit einer Pumpe in den Kühler gefördert.' }
    ],
    text: 'Der Quarkseparator trennt die geronnene Quarkmilch in Quark und Molke. Im Separator dauert das nur wenige Sekunden.'
  },
  {
    // Eigene Masse (Ø 0.6 m, Oberkante 1.00 m), Eigenbau: material/molkerei-3d/vorlaufgefaess_bau.py (bzwu). Texte: b.5, a.1 (Klappenventil).
    // Steht auf der Achse des Separators (z 6.03): das Quarkrohr des Separators fällt in den Einlauf, das Auslaufrohr endet am Saugstutzen der Pumpe.
    id: 'vorlaufgefaess', name: 'Vorlaufgefäss', raum: 'frischkaeserei', x: 12.75, z: 6.03, b: 0.62, t: 0.62, bau: 'vorlaufgefaess',
    teile: [
      { id: 'behaelter', name: 'Vorlaufgefäss', text: 'Der Quark aus dem Separator gelangt in ein Vorlaufgefäss. Von dort wird er mit einer Pumpe in den Kühler gefördert.' },
      { id: 'bodenventil', name: 'Bodenventil (Klappenventil)', text: 'Klappenventile sind nur als Absperrventil einsetzbar. Sie werden von Hand oder mit Luftdruck (pneumatisch) bedient. Die Dichtung müssen Sie nach betrieblichen Vorgaben kontrollieren und sofort auswechseln, wenn sie beschädigt ist.' }
    ],
    text: 'Im Vorlaufgefäss sammelt sich der Quark aus dem Separator. Von dort wird er mit einer Pumpe in den Kühler gefördert.'
  },
  {
    // Kreiskolbenpumpe, Pumpenkopf nach Alfa Laval OptiLobe 43 (DN 80), Eigenbau: material/molkerei-3d/kreiskolbenpumpe_bau.py (bzwu).
    // Texte: Lehrmittel a.1 «Dreh- oder Kreiskolbenpumpe» und «Regulierung der Fördermengen». Eigene Sätze: Pumpendeckel, Saugstutzen, Grundrahmen, Anlagentext.
    // Saugstutzen +x zum Vorlaufgefäss, Druckstutzen -x mit Anschluss (Leitung folgt, wenn der Quarkkühler steht).
    id: 'quarkpumpe', name: 'Kreiskolbenpumpe', raum: 'frischkaeserei', x: 12.19, z: 5.64, b: 0.31, t: 1.0, bau: 'kreiskolbenpumpe', schnittbild: 'kreiskolben',
    oeffnen: { auf: 'Pumpendeckel öffnen', zu: 'Pumpendeckel schliessen' },
    anschluesse: { quark: [-0.138, 0.274, 0.39, '-x'] },
    teile: [
      { id: 'pumpenkopf', name: 'Pumpenkopf mit Drehkolben', text: 'Die Kreisbewegung der Drehkolben bewirkt auf der Saugseite eine Volumenvergrösserung und damit einen Unterdruck, womit das zu fördernde Produkt in die Pumpe gelangt. Zur Druckseite hin verkleinert sich das Volumen zwischen Drehkolben und Gehäuse, es entsteht ein Überdruck.' },
      { id: 'pumpendeckel', name: 'Frontdeckel', text: 'Nehmen Sie den Frontdeckel ab, sehen Sie die zwei Drehkolben im Pumpengehäuse.' },
      { id: 'saugstutzen', name: 'Saugstutzen', text: 'Durch den Unterdruck auf der Saugseite gelangt der Quark aus dem Vorlaufgefäss in die Pumpe.' },
      { id: 'druckstutzen', name: 'Druckstutzen', text: 'Das zu fördernde Produkt wird zwangsweise aus der Pumpe hinaus in die Druckleitung gepresst. Zwangsweise fördernde Pumpen dürfen Sie nicht drosseln.' },
      { id: 'getriebemotor', name: 'Getriebemotor', text: 'Die Fördermenge lässt sich stufenlos regulieren, indem die Umdrehungszahl des Elektromotors verändert wird. Dazu braucht es in der Pumpensteuerung einen Frequenzumformer.' },
      { id: 'grundrahmen', name: 'Grundrahmen', text: 'Pumpe und Getriebemotor sind auf dem Grundrahmen verschraubt. Mit den Stellfüssen richten Sie die Pumpe waagrecht aus.' }
    ],
    text: 'Die Kreiskolbenpumpe fördert hochviskose Produkte wie Quark schonend. Sie ermöglicht hohe Drücke und braucht keine Ventile.'
  },
  {
    // Texte: Lehrmittel b.5 «Gewerbliche Quarkproduktion in einer Wanne (Schulenburgverfahren)». Eigene Sätze: Hubzylinder, Anlagentext.
    // Masse nach Plevnik SLB 2000, Eigenbau: material/molkerei-3d/schulenburgwanne.blend (bzwu). Luke an der Stirnseite +x.
    id: 'schulenburgwanne', name: 'Schulenburg-Wanne', raum: 'frischkaeserei', x: 15.5, z: 14, b: 2.9, t: 1.55, bau: 'schulenburg',
    oeffnen: { auf: 'Molkenwanne absenken', zu: 'Molkenwanne anheben' },
    schnittbild: 'schulenburg', // Prinzip in fünf Schritten: schnittbild-schulenburg.js
    teile: [
      { id: 'quarkwanne', name: 'Quarkwanne', text: 'In der unteren Wanne füllen Sie die pasteurisierte Quarkmilch ein, säuern diese an und laben ein. Wenn der gewünschte pH-Wert erreicht ist, schneiden Sie die Gallerte in grobe Würfel.' },
      { id: 'molkenwanne', name: 'Molkenwanne', text: 'Nach dem Schneiden senken Sie die obere Wanne ab. Die abgepresste Molke wird in die obere Wanne gefördert. Mit zunehmender Pressdauer nimmt die Molkenmenge zu und damit wird auch der Pressdruck verstärkt. Ist genügend Molke abgepresst, so heben Sie die Molkenwanne wieder an.' },
      { id: 'lochsieb', name: 'Lochsieb', text: 'Auf der oberen Wanne ist aussen ein feines Lochsieb angebracht. Zwischen diesem Sieb und der Wannenwand sammelt sich die abgepresste Molke.' },
      { id: 'molkenpumpe', name: 'Molkenpumpe', text: 'Eine Pumpe fördert die abgepresste Molke in die obere Wanne.' },
      { id: 'entnahmeluke', name: 'Entnahmeluke', text: 'Ist genügend Molke abgepresst und die Molkenwanne angehoben, rühren Sie den Quark auf und schieben ihn mit einem Schaber durch eine Luke aus der Wanne.' },
      { id: 'hubzylinder', name: 'Hubzylinder', text: 'Die Hubzylinder heben und senken die Molkenwanne.' }
    ],
    text: 'In der Schulenburg-Wanne stellen Sie Quark gewerblich her (Schulenburgverfahren). Die Quarkmilch gerinnt in der unteren Wanne, die abgesenkte obere Wanne presst die Molke ab. Kleine Mengen lassen Sie im Sackverfahren abtropfen: Abtropfgestell im Kühlraum.'
  },
  { id: 'mozzarella', name: 'Kneten und Filieren (Mozzarella)', raum: 'frischkaeserei', x: 10, z: 13, b: 3, t: 1.5 },

  // Sauermilch und Dessert (a.6, b.7, b.9)
  { id: 'bebruetungstank', name: 'Bebrütungstank', raum: 'sauermilch', x: 6, z: 6, b: 2.5, t: 2.5 },
  { id: 'mischer', name: 'Mischer', raum: 'sauermilch', x: 14, z: 6, b: 2, t: 2 },
  { id: 'schaberwaermetauscher', name: 'Schaberwärmetauscher', raum: 'sauermilch', x: 10, z: 13, b: 2, t: 1 },
  {
    // Masse nach Plevnik SK Classic 200 (Ø 845, Rand 1060, Auslass 485), Eigenbau: material/molkerei-3d/mehrzweckerhitzer.blend (bzwu).
    // Rührertexte: Lehrmittel a.1 «Milch und Milchprodukte rühren», «Strömungsformen»; Harfe und Strömungsbleche: b.1.
    // Eigene Sätze: Anlagentext, kessel, steuerung, auslaufhahn, untergestell.
    id: 'mehrzweckerhitzer', name: 'Mehrzweckerhitzer', raum: 'sauermilch', x: 16, z: 14, b: 1.65, t: 1.2, bau: 'mehrzweck',
    betrieb: { an: 'Rührwerk einschalten', aus: 'Rührwerk ausschalten' },
    // Rührer wechseln: je Variante die sichtbaren Teile. Der Ankerrührer läuft wandnah, die Strömungsbrecher kommen heraus.
    wechsel: { text: 'Rührer wechseln', varianten: [['propellerruehrer', 'stroemungsbrecher'], ['scheibenruehrer', 'stroemungsbrecher'], ['ankerruehrer'], ['kaeseharfe', 'stroemungsbrecher']] },
    schnittbild: 'ruehrwerk', // Strömungsformen: schnittbild-ruehrwerk.js
    teile: [
      { id: 'kessel', name: 'Kessel mit Mantel', text: 'Der Kessel hat einen isolierten Mantel. Darin heizen Sie mit Heisswasser oder elektrisch bis 100 °C und kühlen mit Leitungswasser, unter 20 °C mit Eiswasser. So können Sie im gleichen Kessel Milch pasteurisieren, Joghurt bebrüten oder Käse herstellen.' },
      { id: 'ruehrwerk', name: 'Rührwerk', text: 'Der Antrieb der Rührwerke erfolgt über einen Elektromotor mit stufenloser Drehzahlregulierung. Die Rührgeschwindigkeit richtet sich nach dem Rührwerkdurchmesser, der Viskosität und der Empfindlichkeit des Produktes. Je grösser der Rührwerkdurchmesser ist, umso kleiner kann die Umdrehungszahl sein.' },
      { id: 'propellerruehrer', name: 'Propellerrührer', text: 'Der Propellerrührer erzeugt eine axiale Strömung, von oben nach unten und umgekehrt. Er gehört zu den Rührern für Flüssigkeiten mit niedriger Viskosität wie Vollmilch, Magermilch, Buttermilch oder Molke.' },
      { id: 'scheibenruehrer', name: 'Scheibenrührer', text: 'Der Scheibenrührer fördert die Flüssigkeit von innen nach aussen (radiale Strömung). Er gehört zu den Rührern für Flüssigkeiten mit niedriger Viskosität wie Vollmilch, Magermilch, Buttermilch oder Molke.' },
      { id: 'ankerruehrer', name: 'Ankerrührer', text: 'Der Ankerrührer bewegt das Produkt meist tangential mit niedriger Drehzahl. Er läuft wandnah, um das Produkt durch Abschaben zu erfassen. Dadurch ist auch ein verbesserter Wärmeübergang möglich, ohne dass das Rührgut anbrennt. Er eignet sich für Quark, Pudding, Schmelzkäsemassen oder sonstige teigige Massen.' },
      { id: 'kaeseharfe', name: 'Käseharfe', text: 'Nach dem Dicklegen schneidet die Harfe die Gallerte in Bruchkörner. In runden Kesseln ohne Planetengetriebe erreichen Sie nach den ersten paar Umdrehungen nur noch eine Rührwirkung: Der ganze Inhalt dreht sich im Kreis, ohne Schneidewirkung.' },
      { id: 'stroemungsbrecher', name: 'Strömungsbrecher', text: 'Eine unerwünschte Tangentialströmung können Sie durch den Einbau von Strömungsbrechern oder durch eine schräge, exzentrische oder seitliche Anordnung des Rührwerks weitgehend verhindern. Der Strömungsbrecher ermöglicht eine gute Durchmischung und erreicht damit eine gleichmässige Temperaturverteilung.' },
      { id: 'steuerung', name: 'Steuerung', text: 'In der Steuerung stellen Sie Temperatur, Zeit, Rührgeschwindigkeit und Drehrichtung ein. Programme für Pasteurisation, Joghurt oder Käse laufen danach automatisch ab.' },
      { id: 'auslaufhahn', name: 'Auslaufhahn', text: 'Über den Auslaufhahn entleeren Sie den Kessel, zum Beispiel die Käsemasse direkt auf den Abtropftisch.' },
      { id: 'untergestell', name: 'Untergestell mit Kippmechanismus', text: 'Mit dem Handrad kippen Sie den Kessel, damit er sich vollständig entleert.' }
    ],
    text: 'Im Mehrzweckerhitzer verarbeiten Sie kleine Mengen: Milch pasteurisieren, Joghurt herstellen oder Käse fabrizieren. Für jede Aufgabe setzen Sie den passenden Rührer ein. Vergleichen Sie die Rührer mit «Rührer wechseln». Bei eingeschaltetem Rührwerk zeigen die blauen Teilchen, wie die Milch strömt.'
  },

  // Butterei (b.10)
  { id: 'rahmreifer', name: 'Rahmreifer', raum: 'butterei', x: 6, z: 7, b: 3, t: 3 },
  { id: 'butterfertiger', name: 'Butterungsmaschine', raum: 'butterei', x: 13, z: 7, b: 5, t: 1.5 },
  { id: 'ausformmaschine', name: 'Ausformmaschine', raum: 'butterei', x: 13, z: 13, b: 3, t: 1.5 },

  // Speiseeis (b.8)
  { id: 'freezer', name: 'Freezer', raum: 'speiseeis', x: 6, z: 7, b: 2.5, t: 1.2 },
  { id: 'haertetunnel', name: 'Härtetunnel', raum: 'speiseeis', x: 12, z: 14, b: 8, t: 2.5 },

  // Membrantechnik (a.3)
  { id: 'mikrofiltration', name: 'Mikrofiltration', raum: 'membran', x: 10, z: 5, b: 4.6, t: 2.2 },
  {
    // Batch-Anlage nach a.3 «Membranfiltrationsanlage im Batchbetrieb», Proportionen nach Tetra Pak UF system P (nur Massreferenz).
    // Eigenbau: material/molkerei-3d/membrananlage_bau.py (bzwu), VARIANTE = 'uf'. Texte aus a.3.
    // Eigene Sätze: Anlagentext (letzte zwei Sätze), vorlauftank (Füllstandsrohr), permeataustritt (Schauglas), retentataustritt (ablassen).
    id: 'ultrafiltration', name: 'Ultrafiltration', raum: 'membran', x: 10, z: 10, b: 4.6, t: 2.2, bau: 'membran_uf',
    betrieb: { an: 'Filtration starten', aus: 'Filtration beenden' },
    schnittbild: 'membran', membran: 'uf',
    teile: [
      { id: 'vorlauftank', name: 'Vorlauftank', text: 'Mit der Speisepumpe wird die zu filtrierende Flüssigkeit vom Vorlauftank in den Filtrationskreislauf gepumpt. Am Füllstandsrohr sehen Sie, wie viel Produkt noch im Tank ist.' },
      { id: 'speisepumpe', name: 'Speisepumpe', text: 'Mit der Speisepumpe wird die zu filtrierende Flüssigkeit vom Vorlauftank in den Filtrationskreislauf gepumpt. Die abgetrennte Permeatmenge wird durch die Speisepumpe mit Flüssigkeit aus dem Vorlauftank ersetzt.' },
      { id: 'zirkulationspumpe', name: 'Zirkulationspumpe', text: 'Die Zirkulationspumpe erzeugt den für die Filtration benötigten Druck. Das zurückgehaltene Retentat wird wieder der Zirkulationspumpe zugeführt. Das Produkt wird so lange in der Anlage zirkuliert, bis die gewünschte Endkonzentration im Retentat erreicht ist. Während der Zirkulation erwärmt sich das Retentat. Überschüssige Wärme kann über einen Kühler abgeführt werden.' },
      { id: 'feststofffilter', name: 'Feststoff-Filter', text: 'Zum Schutz der Membran vor Beschädigung durch feste Partikel ist vor dem Membranmodul ein Feststoff-Filter eingebaut.' },
      { id: 'membranmodul', name: 'Membranmodul (Spiralwickelmodul)', text: 'Spiralwickelmembranen werden oft für Ultrafiltrations- und Umkehrosmoseprozesse eingesetzt. Die Membranen sind aus Kunststoff. Durch die spiralförmige Wickelung bieten sie bei kleinem Platzbedarf eine grosse Filterfläche. Bei der Ultrafiltration liegen die Porengrössen im Bereich von 0,01 bis 0,1 Mikrometer. Die Flüssigkeit strömt entlang der Membran. Dank dieser Fliessrichtung und der höheren Fliessgeschwindigkeit ist die Filterkuchenbildung viel geringer als bei der konventionellen Filtration.' },
      { id: 'druckhalteventil', name: 'Druckhalteventil', text: 'Eine Pumpe und ein Druckhalteventil erzeugen auf der inneren Seite der Membran einen höheren Druck. Dadurch können Produktbestandteile, die kleiner sind als die Porengrösse der Membran, und Wasser auf die andere Seite der Membran gelangen.' },
      { id: 'manometer', name: 'Manometer', text: 'Bei der Ultrafiltration beträgt der Druck zwischen einem und zehn bar. Der Druckunterschied zwischen der Produktezufuhr-/Retentatseite und der Permeatseite ist der eigentliche Motor des Trennprozesses. Mit zunehmendem Druckunterschied nimmt die Filtrationsleistung zu. Bei zu hohem Druck oder bei Druckschlägen können die Kunststoffmembranen beschädigt werden.' },
      { id: 'permeataustritt', name: 'Permeataustritt mit Schauglas', text: 'Die Teile, welche die Membran passiert haben, bilden das Permeat. Im Schauglas kontrollieren Sie, ob das Permeat klar ist. Reisst eine Membran, tritt das Produkt ungefiltert über den Permeataustritt aus der Anlage aus.' },
      { id: 'retentataustritt', name: 'Retentataustritt', text: 'Das Produkt wird entlang der Membran immer mehr aufkonzentriert. Das Konzentrat wird als Retentat bezeichnet. Ist die gewünschte Endkonzentration erreicht, lassen Sie das Retentat hier ab.' }
    ],
    text: 'Durch die Aufkonzentrierung von Proteinen ist die Ultrafiltration ein für die Milchwirtschaft sehr interessanter und verbreitet angewendeter Prozess. Damit können Sie zum Beispiel die Ausbeute von Quark oder Käse erhöhen. Diese Anlage arbeitet im Batchbetrieb, wie sie für kleinere Leistungen eingesetzt wird. Für grössere Leistungen kommen kontinuierliche, mehrstufige Anlagen zum Einsatz. Mit «Filtration starten» sehen Sie, wie sich der Vorlauftank leert und das Permeat durch das Schauglas fliesst. Das Schnittbild zeigt, welche Milchbestandteile durch die Membran gehen.'
  },
  { id: 'umkehrosmose', name: 'Umkehrosmose', raum: 'membran', x: 10, z: 15, b: 4.6, t: 2.2 },

  // Trocknerei (b.11)
  { id: 'eindampfer', name: 'Eindampfer', raum: 'trocknerei', x: 5, z: 10, b: 3, t: 3 },
  { id: 'spruehturm', name: 'Sprühturm', raum: 'trocknerei', x: 13, z: 10, b: 7, t: 7 },

  // Abfüllung und Kühlraum (alle b)
  { id: 'abfuellanlage', name: 'Abfüllanlage', raum: 'abfuellung', x: 8, z: 5, b: 8, t: 2 },
  { id: 'kuehlraum', name: 'Kühlraum', raum: 'abfuellung', x: 10, z: 14, b: 8, t: 6 },
  {
    // Sackverfahren, Texte: Lehrmittel b.5 «Abpressen und Abtropfen von Kleinmengen». Eigene Sätze: Anlagentext, gestell, auffangwanne.
    // Eigenbau ohne Vorlage, Masse geschätzt: material/molkerei-3d/abtropfgestell_bau.py (bzwu). Steht im Kühlraum, wie im Lehrmittel.
    id: 'abtropfgestell', name: 'Abtropfgestell (Sackverfahren)', raum: 'abfuellung', x: 12, z: 15.5, b: 2, t: 0.6, bau: 'sackverfahren',
    betrieb: { an: 'Abtropfen starten', aus: 'Säcke neu füllen' },
    teile: [
      { id: 'quarksack', name: 'Quarksack', text: 'Die Quarkgallerte füllen Sie nach dem Schneiden in abgebrühte Säcke ab. Zur Entsirtung hängen Sie die Säcke während einiger Stunden im Kühlraum auf. Je nach Volumen geht die Entsirtung langsamer oder schneller. Während dieser Zeit ist das Infektionsrisiko über die Luft oder über Spritzwasser hoch. Sie achten deshalb auf einwandfreie hygienische Bedingungen.' },
      { id: 'gestell', name: 'Abtropfgestell', text: 'Am Gestell hängen die Säcke frei, damit die Molke nach allen Seiten abtropfen kann.' },
      { id: 'auffangwanne', name: 'Auffangwanne', text: 'In der Auffangwanne sammelt sich die abtropfende Quarksirte. Über den Hahn lassen Sie sie ab.' }
    ],
    text: 'Kleine Mengen Quark lassen Sie im Sackverfahren abtropfen. Das dauert einige Stunden, im Separator nur wenige Sekunden. Mit «Abtropfen starten» sehen Sie, wie die Säcke schlanker werden und sich die Molke in der Wanne sammelt.'
  },

  // Technik (a.7, d.2, e.2)
  { id: 'dampfkessel', name: 'Dampfkessel', raum: 'technik', x: 6, z: 5, b: 5, t: 2.5 },
  { id: 'kaelteanlage', name: 'Kälteanlage', raum: 'technik', x: 14, z: 5, b: 4, t: 2 },
  { id: 'druckluft', name: 'Druckluft', raum: 'technik', x: 14, z: 12, b: 2, t: 1.5 },
  { id: 'cip', name: 'CIP-Zentrale', raum: 'technik', x: 6, z: 12, b: 4, t: 2 },

  // Kulturen und Labor (a.8, d.3)
  { id: 'labortisch', name: 'Labortisch', raum: 'labor', x: 10, z: 6, b: 6, t: 1 },
  { id: 'brutschrank', name: 'Brutschrank', raum: 'labor', x: 4, z: 14, b: 1, t: 0.8 },
  { id: 'autoklav', name: 'Autoklav', raum: 'labor', x: 8, z: 14, b: 1, t: 1 }
];
