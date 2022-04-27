# Dune II - The Building of A Dynasty

Dune II reimplementation written in HTML5 / JavaScript

## Play Online

- Browser: https://dune2js.com
- Keyboard / Mouse Controls

## Play Mobile

- Browser: https://dune2js.com
  - Use Landscape Mode (Single Tab, Disable Landscape Tab Bar in Browser Settings)
- Add to Home Screen to start as Fullscreen App
- Touch Controls (tap/drag area on screen)

## Play GitHub Version

- Browser: https://oklemenz.github.io/Dune2

## Play Locally

- Install [Node.js](https://nodejs.org)
- Clone: `https://github.com/oklemenz/Dune2.git`
- Terminal:
  - `npm install`
  - `npm start`
- Browser: `localhost:8080`

## Options

Url parameter is leveraged to save game state for a profile:

- `profile`: Profile identity (default: 'public')

## Auto-save

- `profile=public`: no auto-save
- `profile=<other>`: game is auto-saved: 
  - when going into background (visibility hidden)
  - every 5 minutes

## Credits

- https://github.com/caiiiycuk
