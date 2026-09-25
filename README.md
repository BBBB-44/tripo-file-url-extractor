# 3D File Monitor

DevTools console script that lists all `.glb`, `.fbx`, and other 3D model URLs seen in the network.

## File

- `3d-file-monitor.js` — paste into the browser console

## How to use

1. Open DevTools (`F12` / `Ctrl+Shift+I` / `Cmd+Option+I`)
2. Go to the **Console** tab
3. Paste the contents of `3d-file-monitor.js` and press Enter
4. Reload the page or browse normally
5. Matching URLs log live as they appear
6. Run `list3DFiles()` anytime to print the full list

## What it catches

- `.glb` / `.gltf`
- `.fbx`
- `.obj`, `.stl`, `.dae`, `.ply`
- `.usd` / `.usda` / `.usdc` / `.usdz`
- `.vrm`, `.babylon`, and other common 3D formats

It watches:

- Already-loaded resources (Performance API)
- New network requests via `fetch` and `XMLHttpRequest`

## Helpers

| Command        | Description                  |
|----------------|------------------------------|
| `list3DFiles()`| Dump all found URLs          |
| `_3dFiles`     | Raw `Map` of url → metadata  |

## Notes

- Run the script **before** the page loads the models (or reload after pasting).
- WebSocket / custom binary loaders may not appear.
- One-shot alternative (no monitoring):

```js
performance.getEntriesByType('resource')
  .filter(e => /\.(glb|gltf|fbx|obj|stl|dae|usd[azc]?|vrm|babylon)(\?|$)/i.test(e.name))
  .map(e => e.name);
```


# useful 
https://optimizeglb.com/dashboard
