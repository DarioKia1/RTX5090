# RTX5090

## Run locally

The page uses browser ES modules, so open it through a local HTTP server rather than `file://`:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`. An internet connection is required for Preact, Three.js, web fonts, and NVIDIA-hosted product images.

## Visual assets

- RTX 5090 and RTX 5080 product photography is served from NVIDIA's GeForce product pages.
- The PC configurator uses a Three.js scene with distinct GPU, case, and component variants; selecting a part animates that component into the build.

This is an independent concept experience, not an official NVIDIA website. Performance chart values are illustrative estimates, not official benchmarks.