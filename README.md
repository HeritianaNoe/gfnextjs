# Fanorona (Next.js)

Lalao Fanorona feno — mizara amin'ny ordinatera (AI) — natao tamin'ny **Next.js 15 (App Router) + TypeScript + Tailwind CSS**.

## Fandehanana haingana

```bash
npm install
npm run dev
```

Avy eo sokafy `http://localhost:3000`.

Handrafitra ho an'ny "production":

```bash
npm run build
npm run start
```

Fitsapana ny fitsipiky ny lalao (unit tests fototra):

```bash
npm test
```

> Raha misy fanovana ataonao amin'ny `lib/fanorona.ts`, mba alefaso `npm test` foana mba hijerena raha mbola marina ny fitsipika.

## Rafitry ny projet

```
app/
  layout.tsx        – "root layout", font (Fraunces + Karla)
  page.tsx           – pejy fototra
  globals.css         – Tailwind + styles fanampiny
components/
  Board.tsx           – ny sahan-tsipika (SVG)
  FanoronaGame.tsx    – ny "state" sy ny fitantanana ny tour (olona + AI)
lib/
  fanorona.ts         – ny "engine": sahandrafitra, fihetsehana, fisamborana
  ai.ts               – AI (minimax + alpha-beta pruning)
tests/
  engine.test.ts      – fitsapana ny fitsipiky ny lalao
```

## Ny fitsipika nampiharina

- Sahan-tsipika 5×9 (45 teboka), miaraka amin'ny tsipika mivantana, mitsangana, ary miolikolika (izay mifamadika isaky ny sela — mahatonga ny endrika telozoro mahazatra amin'ny sahan-tsipika Fanorona).
- **Fisamborana amin'ny fanatonana** (*approach*): rehefa mankeo akaikin'ny fahavalo ny bilazanao ary misy elanelana foana na sisin-tsaha eo aoriany.
- **Fisamborana amin'ny fisintahana** (*withdrawal*): rehefa miala amin'ny fahavalo ny bilazanao.
- **Tsy maintsy misambotra** raha misy fomba hisamborana azo atao — tsy azo atao ny mihetsika tsotra raha mbola misy izany.
- **Rojo fisamborana** (*chain capture*): azonao atao ny manohy misambotra amin'ny bilaza iray, kanefa:
  - tsy azo averina amin'ny toerana efa nalehany tamin'io tour io,
  - tsy azo atao ny miverina amin'ny lalana (*direction*) nalehany farany,
  - ary azo atsahatra rehefa te-hijanona ianao (tsy voatery hanohy).
- Resy ny mpilalao raha tsy manana bilaza intsony, na raha tsy manana fihetsehana azo atao intsony amin'ny tourny.

## AI

Mampiasa **minimax + alpha-beta pruning** ny AI, mijery ny isan'ny bilaza sy ny fahaleovan-tena (*mobility*) amin'ny fanombanana ny sahan-tsipika. Misy haran-tsakafo telo:

| Haranstsafo | Halalin'ny fikarohana |
| --- | --- |
| Mora | 1 (misy kisendrasendra 35%) |
| Antonony | 2 |
| Sarotra | 4 |

Azonao ovaina mora foana ny `DEPTH` ao amin'ny `lib/ai.ts` raha te hanamafy na hanamora bebe kokoa ny AI ianao.

## Fanamarihana

- `npm audit` dia mety hampiseho "vulnerability" avy amin'ny `postcss` ao anaty `next` (fandavorariana anaty, tsy misy antony hatahorana amin'ny "dev" eo an-toerana); azonao atao ny `npm audit fix --force` raha te hiakatra amin'ny Next.js 16 ianao, saingy mety hitaky fanovana kely (React 19).
"# gfnextjs" 
