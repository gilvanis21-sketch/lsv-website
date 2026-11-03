# 05 — Direction artistique et maquettes (proposition)

## Palette (contrastes à vérifier AA)

| Rôle | Hex | Usage |
|------|-----|-------|
| Bleu pétrole (primaire) | `#0F4C5C` | Titres, header, boutons |
| Bleu pétrole foncé | `#0A3440` | Hover, footer |
| Turquoise (accent) | `#2BB3A8` | Détails, liens secondaires, schémas |
| Gris clair (fond) | `#F3F6F7` | Sections alternées |
| Blanc | `#FFFFFF` | Fond principal |
| Texte | `#1B2A30` | Corps |
| Alerte | `#B3261E` | Erreurs de formulaire |

Le turquoise sur blanc est insuffisant pour du texte courant : réservé aux éléments décoratifs ou graphiques, ou assombri (`#1E8C83`) pour les liens.

## Typographie
Titres : **Fraunces** ou **Manrope** semi-bold ; corps : **Inter**. Auto-hébergées (pas de Google Fonts, pour le RGPD et la performance). Base 17-18 px, interligne 1,6.

## Principes
Grandes marges, grille 12 colonnes, cartes fines (bordure 1 px), icônes linéaires, illustration centrale : **onde sonore / spectrogramme stylisé** en SVG léger. Animations discrètes (fondu, léger déplacement), désactivées avec `prefers-reduced-motion`. Mobile-first.

## Maquette — Accueil (wireframe)

```
┌────────────────────────────────────────────────────────────┐
│ LSV logo   Accueil  Laboratoire  Services  La voix         │
│            POLYMNIVOX  Actualités  Contact   [Rendez-vous] │
├────────────────────────────────────────────────────────────┤
│  HERO (fond blanc + onde SVG turquoise)                     │
│  « Comprendre la voix par la mesure »   [titre à valider]   │
│  Courte phrase sur l'approche scientifique                  │
│  [Prendre rendez-vous]  [Découvrir nos services]            │
├────────────────────────────────────────────────────────────┤
│  3 cartes : Bilan vocal | Consultation | Suivi vocal        │
├────────────────────────────────────────────────────────────┤
│  POLYMNIVOX (fond gris clair) : schéma  ·  texte  · [En savoir plus] │
├────────────────────────────────────────────────────────────┤
│  Praticien : photo [provisoire]  ·  présentation [À CONFIRMER] │
├────────────────────────────────────────────────────────────┤
│  Troubles de la voix : 3-4 tuiles vers /la-voix            │
├────────────────────────────────────────────────────────────┤
│  CTA final (bleu pétrole) : « Demander un rendez-vous »     │
├────────────────────────────────────────────────────────────┤
│  Footer : coordonnées [À CONFIRMER] · liens légaux · plan   │
└────────────────────────────────────────────────────────────┘
```

## Maquette — Contact / demande de rendez-vous

```
┌─────────────────────────────────────────────┐
│ H1 Demander un rendez-vous                  │
│ Encadré : « Ceci est une demande, pas une   │
│ réservation. Nous vous répondrons pour      │
│ confirmer le créneau. N'indiquez aucune     │
│ information médicale. »                     │
│ Nom* [____]  Prénom* [____]                 │
│ E-mail* [______________]  Téléphone* [____] │
│ Type : (•) Première consultation ( ) Suivi  │
│ Créneau souhaité [date] [plage horaire]     │
│ [x] J'ai lu la politique de confidentialité │
│     (information sur le traitement de ma    │
│     demande)                                │
│ [Envoyer ma demande]                        │
│ → Confirmation : réf. LSV-2026-XXXXXX       │
└─────────────────────────────────────────────┘
```

## Maquette — Admin (demandes)
Tableau filtrable par statut (pastilles : Nouvelle bleu, En attente ambre, Confirmée vert, Refusée rouge, Traitée gris), recherche par référence/nom, fiche détail avec changement de statut, notes internes, historique. Menu latéral : Demandes · Articles · Services · Paramètres · Utilisateurs · Journal.

## Prochaine étape
Après validation, je produirai des maquettes haute-fidélité (HTML/Figma) de l'accueil, des services, du contact et de l'admin, avant tout développement.
