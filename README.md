# Cricket Manager Auction Room

Local-first IPL-style franchise auction and season game built as a static web app.

## What is in this build

- 10 franchise owners start with the same `120 cr` purse.
- Real current IPL player pool used in a fantasy equal-purse reset.
- Live timed auction with AI rivals that react to scarcity, roster needs, and market heat.
- Strategy-driven rival behavior such as star chasing, price inflation, value hunting, and role hoarding.
- Local season simulation after the auction with league table, playoffs, and a final.
- Local-only saves through `localStorage`, plus JSON export/import.
- Power rankings that update as squads take shape.

## Run locally

You can open [index.html](/Users/macbookair/Desktop/desktop-subfolder/personal/cricket-manager/index.html) directly in a browser.

If you prefer a local server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Controls

- `B` places the next live bid.
- `Proxy cap` lets the app auto-bid up to your walk-away price for the current lot.
- `Pause Auction` freezes the live hammer clock.
- `Sim Next Match`, `Sim Round`, and `Sim Season` advance the local tournament once the auction ends.
- `Save Local` writes the current campaign to browser storage on this device.

## Notes

- This is a real-player IPL sandbox, not an exact recreation of one official auction purse sheet or retention list.
- The game stays fully local. There is no backend or online multiplayer yet.
