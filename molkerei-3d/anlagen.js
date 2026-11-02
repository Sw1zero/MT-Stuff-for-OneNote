// Daten der Molkerei. Einzige Quelle für Szene (script.js) und Grundriss (grundriss.html).
// Masse in Metern. x nach rechts (Osten), z nach unten im Grundriss (Süden).
// VORLÄUFIG: Grundriss-Vorschlag, wartet auf Philipps Korrektur.

const RAEUME = [
  // id, name, Rechteck x0/z0/x1/z1, Deckenhöhe, Bodenfarbe
  // wand: 'beton' statt Fliesen unten und Paneele oben
  { id: 'kaesekeller',    name: 'Käsekeller (Untergeschoss)', x0: 0, z0: 0, x1: 20, z1: 20, hoehe: 4, farbe: '#d9cbb5', wand: 'beton', boden: -5 }, // neben dem Salzbad
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
  { id: 'technik',        name: 'Technik (Untergeschoss)', x0: 40, z0: 20, x1: 60,  z1: 40, hoehe: 4.5, farbe: '#d0d0d0', wand: 'beton', boden: -5 },
  { id: 'salzbadraum',    name: 'Salzbad (Untergeschoss)', x0: 20, z0: 0,  x1: 40,  z1: 20, hoehe: 4.5, farbe: '#dfe6e8', boden: -5 }, // unter der Käserei
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
const MEDIEN = {
  milch: { name: 'Milch', farbe: '#ffffff', produkt: true },
  rahm: { name: 'Rahm', farbe: '#f2d54b', produkt: true },
  magermilch: { name: 'Magermilch', farbe: '#9aa3ab', produkt: true },
  bruch: { name: 'Bruch', farbe: '#f2d54b', produkt: true },
  molke: { name: 'Molke', farbe: '#4f9d5a', produkt: true },
  cip: { name: 'CIP-Reinigung', farbe: '#e8892b', produkt: true }, // Farbe vorläufig (Baukasten: «CIP später»), Vorlauf geht über den Bahnhof wie ein Produkt
  heisswasser: { name: 'Heisswasser', farbe: '#cc3333' },
  kuehlwasser: { name: 'Kühlwasser', farbe: '#3b7dd8' }
};
const LEITUNG_HOEHE = 3;      // m, unterste Leitung
const LEITUNG_ABSTAND = 0.08; // m, Höhenversatz pro Leitung, damit sich keine überlagern
const BAHNHOF = 'rohrbahnhof';

// Prozessschritte von Anlage zu Anlage. Der Umweg über den Bahnhof wird automatisch gezeichnet.
// Optional: ab/an = Name des Anschlusses an der Anlage (sonst das Medium), direkt = nicht über den Bahnhof,
// hoehe = Höhe der Leitung in m statt eigener Höhe ab LEITUNG_HOEHE (negativ = im Untergeschoss).
const LEITUNGEN = [
  // Käserei-Linie (Philipp, 01.11.2026)
  { von: 'annahmestation', nach: 'lagertank-1', medium: 'milch' },
  { von: 'lagertank-1', nach: 'milchpumpe', medium: 'milch', ab: 'auslauf', an: 'saug', direkt: true, hoehe: 0.75 },
  { von: 'milchpumpe', nach: 'plattenwaermetauscher', medium: 'milch', ab: 'druck' },
  { von: 'plattenwaermetauscher', nach: 'separator', medium: 'milch' },
  { von: 'separator', nach: 'rahmreifer', medium: 'rahm' },
  { von: 'separator', nach: 'kaesefertiger', medium: 'magermilch' },
  { von: 'plattenwaermetauscher', nach: 'kaesefertiger', medium: 'milch' },
  { von: 'kaesefertiger', nach: 'vorpresswanne', medium: 'bruch' },
  { von: 'vorpresswanne', nach: 'molketank', medium: 'molke' },
  // Versorgung
  { von: 'dampfkessel', nach: 'plattenwaermetauscher', medium: 'heisswasser' },
  { von: 'dampfkessel', nach: 'kaesefertiger', medium: 'heisswasser' },
  { von: 'kaelteanlage', nach: 'plattenwaermetauscher', medium: 'kuehlwasser' },
  // Eiswasser zum Lagertank: von unten aus dem Untergeschoss in den Doppelmantel, Vor- und Rücklauf
  { von: 'kaelteanlage', nach: 'lagertank-1', medium: 'kuehlwasser', hoehe: -1 },
  { von: 'lagertank-1', nach: 'kaelteanlage', medium: 'kuehlwasser', ab: 'ruecklauf', hoehe: -1.1 },
  // Reinigung
  { von: 'cip', nach: 'lagertank-1', medium: 'cip' }
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

const ANLAGEN = [
  // Milchannahme (a.1)
  { id: 'annahmestation', name: 'Annahmestation', raum: 'annahme', x: 4, z: 10, b: 2, t: 1.5 },
  // Liegender Käserei-Lagertank 10'000 L nach DeLaval DXCE, ohne eigene Kühlung (Eiswasser aus der Kälteanlage).
  // Modell: material/molkerei-3d/lagertank.blend (bzwu), Export modelle/lagertank.glb.
  { id: 'lagertank-1', name: 'Lagertank 1', raum: 'annahme', x: 12, z: 5, b: 4.6, t: 2.1, bau: 'lagertank',
    anschluesse: { milch: [-1.7, 2.35, -0.3], auslauf: [2.4, 0.75, 0], cip: [1.2, 2.35, 0],
      kuehlwasser: [-2.26, 0.83, -0.25], ruecklauf: [-2.26, 0.83, 0.25] }, ...LAGERTANK },
  {
    // Texte: Lehrmittel a.1 «Pumpen» (Legende 1-6), «Zentrifugalpumpe» und Pflege der Pumpen.
    // Modell nach Alfa Laval LKH-35: material/molkerei-3d/zentrifugalpumpe.blend (bzwu), Teil-ids = Gruppennamen dort.
    id: 'milchpumpe', name: 'Zentrifugalpumpe', raum: 'annahme', x: 15.6, z: 5, b: 0.95, t: 0.5, bau: 'pumpe',
    anschluesse: { saug: [-0.455, 0.274, 0, '-x'], druck: [-0.374, 0.524, 0.119] },
    oeffnen: { auf: 'Explosionsansicht', zu: 'Zusammenbauen', leitungenWeg: true },
    teile: [
      { id: 'laufrad', name: 'Laufrad', text: 'Das Laufrad versetzt die Milch in Rotation, die Zentrifugalkraft beschleunigt sie nach aussen. Mit einem speziellen Laufrad und Gehäuse kann die Zentrifugalpumpe auch Käsebruch fördern. Lassen Sie die Pumpe nie leer laufen, das schädigt das Laufrad.' },
      { id: 'gleitringdichtung', name: 'Gleitringdichtung', text: 'Die Gleitringdichtung dichtet das Pumpengehäuse dort ab, wo die Welle des Motors hineinführt. Lassen Sie die Pumpe nie leer laufen, das schädigt die Gleitringdichtung. Kontrollieren Sie die Dichtigkeit und ersetzen Sie immer alle Gleitringdichtungen, periodisch oder bei Undichtheit.' },
      { id: 'elektromotor', name: 'Elektromotor', text: 'Der Elektromotor treibt das Laufrad im Pumpengehäuse an.' },
      { id: 'saugstutzen', name: 'Saugstutzen', text: 'Durch den Saugstutzen in der Mitte des Gehäuses fliesst die Milch in Achsrichtung (axial) dem Laufrad zu. Die Zentrifugalpumpe ist nicht selbstansaugend: Die Milch muss ihr zufliessen. Darum steht die Pumpe tiefer als der Auslaufstutzen des Tanks.' },
      { id: 'pumpengehaeuse', name: 'Pumpengehäuse', text: 'Im Pumpengehäuse versetzt das Laufrad die Milch in Rotation, die Zentrifugalkraft beschleunigt sie nach aussen. Die Pumpe schöpft nur, wenn Gehäuse und Saugleitung vollständig mit Flüssigkeit gefüllt sind.' },
      { id: 'druckstutzen', name: 'Druckstutzen', text: 'Am Pumpengehäuse und vor allem beim Druckstutzen wird die Geschwindigkeitsenergie in Druckenergie umgewandelt. Die Milch verlässt die Pumpe mit höherem Druck Richtung Rohrbahnhof.' }
    ],
    text: 'Die Zentrifugalpumpe fördert die Milch aus dem Lagertank 1 zum Rohrbahnhof. ' +
      'Sie ist in Käsereien und Molkereien häufig: Sie fördert schonend, ist einfach und hygienisch gebaut und gut CIP-reinigbar. ' +
      'Sie ist aber nicht selbstansaugend und eignet sich nicht für Produkte mit hoher Viskosität.'
  },
  { id: 'lagertank-2', name: 'Lagertank 2', raum: 'annahme', x: 12, z: 15, b: 4.6, t: 2.1, bau: 'lagertank', ...LAGERTANK },

  // Milchbehandlung (a.2, a.4, a.5, b.6)
  {
    id: 'separator', name: 'Separator', raum: 'behandlung', x: 8, z: 6, b: 1.7, t: 0.8, bau: 'separator',
    // Nach Fotos SPX, gut 1.6 m hoch. Alle Texte: Lehrmittel a.2 (Aufbau, Funktion, Trommelbestandteile, Bedienen).
    oeffnen: { auf: 'Haube öffnen', zu: 'Haube schliessen' },
    // Betrieb: Schnitt durch Haube und Trommel, Trommel dreht (bauten.js separatorbetrieb).
    // Wie es fliesst, zeigt das Schnittbild (schnittbild.js).
    betrieb: { an: 'Betrieb zeigen', aus: 'Betrieb beenden',
      hinweis: 'Die Trommel dreht rund 100-mal langsamer als in Wirklichkeit. Wie Milch, Rahm und Magermilch fliessen, zeigt das Schnittbild.' },
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
  { id: 'plattenwaermetauscher', name: 'Plattenwärmetauscher', raum: 'behandlung', x: 20, z: 6, b: 3, t: 1 },
  { id: 'heisshalter', name: 'Heisshalter', raum: 'behandlung', x: 20, z: 10, b: 2, t: 1 },
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
  { id: 'quarkseparator', name: 'Quarkseparator', raum: 'frischkaeserei', x: 14, z: 6, b: 1.5, t: 1.5 },
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
    text: 'In der Schulenburg-Wanne stellen Sie Quark gewerblich her (Schulenburgverfahren). Die Quarkmilch gerinnt in der unteren Wanne, die abgesenkte obere Wanne presst die Molke ab.'
  },
  { id: 'mozzarella', name: 'Kneten und Filieren (Mozzarella)', raum: 'frischkaeserei', x: 10, z: 13, b: 3, t: 1.5 },

  // Sauermilch und Dessert (a.6, b.7, b.9)
  { id: 'bebruetungstank', name: 'Bebrütungstank', raum: 'sauermilch', x: 6, z: 6, b: 2.5, t: 2.5 },
  { id: 'mischer', name: 'Mischer', raum: 'sauermilch', x: 14, z: 6, b: 2, t: 2 },
  { id: 'schaberwaermetauscher', name: 'Schaberwärmetauscher', raum: 'sauermilch', x: 10, z: 13, b: 2, t: 1 },

  // Butterei (b.10)
  { id: 'rahmreifer', name: 'Rahmreifer', raum: 'butterei', x: 6, z: 7, b: 3, t: 3 },
  { id: 'butterfertiger', name: 'Butterungsmaschine', raum: 'butterei', x: 13, z: 7, b: 5, t: 1.5 },
  { id: 'ausformmaschine', name: 'Ausformmaschine', raum: 'butterei', x: 13, z: 13, b: 3, t: 1.5 },

  // Speiseeis (b.8)
  { id: 'freezer', name: 'Freezer', raum: 'speiseeis', x: 6, z: 7, b: 2.5, t: 1.2 },
  { id: 'haertetunnel', name: 'Härtetunnel', raum: 'speiseeis', x: 12, z: 14, b: 8, t: 2.5 },

  // Membrantechnik (a.3)
  { id: 'mikrofiltration', name: 'Mikrofiltration', raum: 'membran', x: 10, z: 5, b: 4, t: 1.5 },
  { id: 'ultrafiltration', name: 'Ultrafiltration', raum: 'membran', x: 10, z: 10, b: 4, t: 1.5 },
  { id: 'umkehrosmose', name: 'Umkehrosmose', raum: 'membran', x: 10, z: 15, b: 4, t: 1.5 },

  // Trocknerei (b.11)
  { id: 'eindampfer', name: 'Eindampfer', raum: 'trocknerei', x: 5, z: 10, b: 3, t: 3 },
  { id: 'spruehturm', name: 'Sprühturm', raum: 'trocknerei', x: 13, z: 10, b: 7, t: 7 },

  // Abfüllung und Kühlraum (alle b)
  { id: 'abfuellanlage', name: 'Abfüllanlage', raum: 'abfuellung', x: 8, z: 5, b: 8, t: 2 },
  { id: 'kuehlraum', name: 'Kühlraum', raum: 'abfuellung', x: 10, z: 14, b: 8, t: 6 },

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
