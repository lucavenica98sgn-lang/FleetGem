# FleetCore — Gestione Flotta Aziendale

App per la gestione completa del parco veicoli aziendale.

## Funzionalità
- Dashboard con stato flotta a colpo d'occhio
- Scadenze lavaggi e cambio gomme in evidenza
- Abbinamento veicolo fermo ↔ vettura sostitutiva
- Registro eventi: tagliando, revisione, gomme, ispezione pneumatici, lavaggio, sinistro, collaudo, manutenzione, sostitutiva
- Registro chilometri mensile con media automatica
- Dati in tempo reale condivisi tra tutti gli utenti (Firebase)

## Installazione locale

```bash
npm install
npm run dev
```

## Deploy su Vercel

### Metodo 1 — Via GitHub (consigliato)
1. Crea un repo su github.com e carica questi file
2. Vai su vercel.com → "Add New Project"
3. Importa il repo GitHub
4. Vercel rileva Vite automaticamente
5. Clicca "Deploy"

### Metodo 2 — Via Vercel CLI
```bash
npm install -g vercel
vercel
```

## Struttura
```
src/
  firebase/
    config.js      # Configurazione Firebase
    service.js     # CRUD + listeners realtime
  components/
    UI.jsx         # Componenti riutilizzabili
    Dashboard.jsx  # Pagina principale
    VehiclesList.jsx
    VehicleDetail.jsx
    FleetStatusGrid.jsx
    VehicleForm.jsx
    EventForm.jsx
    KmForm.jsx
  App.jsx
  constants.js
  index.css
```
