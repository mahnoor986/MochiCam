# MochiCam ♡

A kawaii pastel photobooth camera for Android, starring **mochi** the bunny.
Take single shots or 4-cut strips, pick a filter and a frame, and keep everything in a cute gallery.

Built with Expo SDK 58 (React Native 0.88), TypeScript and Expo Router. The approved design lives in
[`design/mochicam.html`](design/mochicam.html); open it in a browser to compare.

## Run it on your phone with Expo Go

**You need:** Node.js 20+ on the laptop, and the **Expo Go** app from the Play Store on the phone.
Expo Go must support **SDK 58** (Expo Go → settings → "Supported SDK").

```bash
npm install
npx expo start
```

Then open **Expo Go** on the phone, tap **Scan QR code** and scan the QR in the terminal.
Scan from inside Expo Go: the phone's normal camera opens the link in Chrome, which fails with `ERR_UNKNOWN_SCHEME`.

**Windows tips (these all came up while building):**

| Problem | Fix |
| --- | --- |
| No QR code, only "Logs for your project will appear below" | You're in the MSYS2/UCRT64 bash terminal. Use PowerShell or Command Prompt instead. |
| `npx.ps1 cannot be loaded because running scripts is disabled` | Run `npx.cmd expo start`, or once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Phone can't connect (office Wi-Fi, firewall, different network) | Use a tunnel. Logged in to Expo (`npx.cmd expo login`, once): `npx.cmd expo start --tunnel`. No account: `npx.cmd expo start --tunnel ngrok` (press **Y** if it asks to install `@expo/ngrok`) |
| `Couldn't create a signed tunnel URL… You're not logged in` | Since SDK 58, plain `--tunnel` needs an Expo login. Run `npx.cmd expo login`, or use `--tunnel ngrok` |
| The DevTools "ERROR… using a fallback version" line | Harmless, ignore it |
| Expo Go stuck on the loading screen | The dev server was closed or is stale. Close Expo Go, run `npx.cmd expo start --clear` again, and keep the terminal open |
| Weird errors after installing packages | `npx.cmd expo start --clear` |

**To replay the first launch** (permissions + name): Android Settings → Apps → Expo Go → Storage → Clear storage.

### What Expo Go can't fully do

Expo Go is a shared app, so a few things only work properly in your own installed build (next section):

- **The "MochiCam" album.** Android limits media-library access inside Expo Go. If saving to the album fails,
  MochiCam keeps going: every photo and strip is still saved inside the app and shows in its gallery.
- The app name, icon and permission texts show as "Expo Go" instead of MochiCam.

## Preview on the laptop

For quick layout checks without the phone:

```bash
npx.cmd expo start --web --port 5173
```

Then open `http://localhost:5173` (the VS Code **Mobile Preview Simulator** extension uses this address by default).
This is only an approximation: there is no real camera, photo saving, haptics or filter baking on web, and the
permissions screen lets you through without granting anything.

## Build an installable APK with EAS

An APK installs straight onto the phone, with no Expo Go needed and full album access. EAS builds it in the cloud
(free account, no Android Studio needed).

1. Create a free account at <https://expo.dev/signup>.
2. Log in from the project folder:

   ```bash
   npx eas-cli@latest login
   ```

3. Build:

   ```bash
   npx eas-cli@latest build -p android --profile preview
   ```

   (Same as `eas build -p android --profile preview` if you install the CLI globally with `npm i -g eas-cli`.)

   - The first time, it asks to **create an EAS project**: answer **Y**. It adds a project id to `app.json`; commit that.
   - It asks to **generate a new Android keystore**: answer **Y**. Expo stores it for you.
   - The build runs on Expo's servers and takes about 10–20 minutes on the free tier.

4. When it finishes, the terminal and the expo.dev dashboard show a **link and QR code**. Open it on the phone,
   download the `.apk`, and tap it to install. Android will ask you to allow installing from your browser
   or files app the first time.

The `preview` profile in [`eas.json`](eas.json) is what makes this an APK:

```json
"preview": {
  "distribution": "internal",
  "android": { "buildType": "apk" }
}
```

The `production` profile builds an `.aab` for the Play Store instead, if you ever want that.

## Project map

```
src/
  app/                 screens (Expo Router: every file is a route)
    _layout.tsx        fonts, splash hold, app state, toast + hearts providers
    index.tsx          splash
    permissions.tsx    camera + photos permissions (first launch)
    name.tsx           "what should we call you? ♡" (also ?edit=1 from home)
    home.tsx           greeting, hero, booth mode, start booth, gallery card
    camera.tsx         live camera, filters, countdown, single + 4-cut capture
    strip/[id].tsx     strip result: frames, toggles, caption, auto-save, share
    gallery.tsx        grid, full view, delete sheet, empty state
  components/          Mochi, PillButton, IconButton, ModeToggle, FilterChip, ShutterButton,
                       Countdown, FlashOverlay, Toast, FloatingHearts, Card, Badge, Switch,
                       StripFrame, FrameBackground, BottomSheet, Sparkle, Cloud, Blob, …
  lib/                 storage (AsyncStorage), files + album, filters, frames, bake (Skia),
                       exportStrip (view-shot), share, haptics, dates
  state/AppState.tsx   name, first-launch flag, booth mode, gallery index
  theme.ts             design tokens: colors, type, radii, spacing, layout, shadows, motion
```

**Where things are stored**

- Photos and strips: `documentDirectory/mochicam/` (private to the app), plus a copy in the device's **MochiCam** album.
- Gallery index, name, first-launch flag and booth mode: AsyncStorage (`mochicam:*` keys).

**How filters work:** on the live preview each filter is a tint laid over the camera. When you take a photo, Skia
bakes the same tint (plus the color matrix for peachy, strawberry milk, soft b&w and sunset glow) into the saved JPEG.
Soft b&w can only show a grey wash on the live preview, since Android can't recolor the camera feed itself, but the
saved photo is true black and white.

## Scripts

```bash
npm run typecheck     # tsc --noEmit
npx expo-doctor       # checks dependency versions and config
npx expo install --fix   # realign package versions with the SDK
```
