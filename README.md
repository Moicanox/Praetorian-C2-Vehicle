# Praetorian C2 Vehicle Website

Static multi-page website prepared for GitHub Pages.

## Publish

1. Copy all files and folders from this package into the repository root.
2. Commit and push to the `main` branch.
3. In GitHub: **Settings → Pages → Deploy from a branch → main → /(root)**.
4. The website will be published at:
   `https://moicanox.github.io/Praetorian-C2-Vehicle/`

## Configure placeholders

Edit `assets/js/config.js`:

- `manualUrl`: direct URL to the user manual.
- `dataSheetUrl`: direct URL to the data sheet.
- `trailerEmbedUrl`: YouTube/Vimeo embed URL.
- `paypalUrl`: PayPal donation link.
- `paypalQrImage`: local or remote QR image URL.

Use an **embed** URL for the trailer, for example:
`https://www.youtube.com/embed/VIDEO_ID`

## GitHub Releases

The Download and Changelog pages call the public GitHub API and automatically show:

- the latest release;
- attached installer and document assets;
- previous release notes.

Recommended asset names:

- `Praetorian-C2-Vehicle-Setup-v1.0.0.exe`
- `Praetorian-C2-Vehicle-Manual-IT-v1.0.0.pdf`
- `Praetorian-C2-Vehicle-Data-Sheet-v1.0.0.pdf`
- `Praetorian-C2-Vehicle-Configuration-v1.0.0.xlsx`
- `Praetorian-ATAK-Connector-v1.0.0.apk`
- `SHA256SUMS.txt`

## Local preview

From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- `.nojekyll` disables unnecessary Jekyll processing.
- The website has no external CSS or JavaScript dependencies.
- The repository source remains publicly visible, but only repository collaborators can modify the official site.
