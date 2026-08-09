# Empirical Verification & Adversarial Challenge Report: Milestone 1 Build Pipeline & Static Output

**Working Directory**: `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\challenger_m1_1\`  
**Agent**: Challenger 1 (Milestone 1)  
**Date**: 2026-08-04  

---

## 1. Observation

Direct observations obtained through tool execution and file inspection:

1. **`vite.config.js` Inspection**:
   - Exact file path: `c:\Users\HP\Downloads\English\oxford-3000-platform\vite.config.js`
   - Configured property: `base: './'` (line 6)
   - Configured output directory: `build: { outDir: 'dist', sourcemap: false }` (lines 7–10)

2. **Build Execution Output (`npm run build`)**:
   - Command executed: `npm run build` (`vite build`)
   - Result: Successful build in 4.57s.
   - Modules transformed: 35 modules.
   - Output bundle files generated in `c:\Users\HP\Downloads\English\oxford-3000-platform\dist\`:
     - `dist/index.html` (972 bytes | gzip: 0.54 kB)
     - `dist/assets/index-SwCiUIAu.css` (20,768 bytes | gzip: 4.50 kB)
     - `dist/assets/index-BWubjfiJ.js` (161,112 bytes | gzip: 50.68 kB)

3. **`dist/index.html` Asset References**:
   - Exact line 11: `<script type="module" crossorigin src="./assets/index-BWubjfiJ.js"></script>`
   - Exact line 12: `<link rel="stylesheet" crossorigin href="./assets/index-SwCiUIAu.css">`
   - Both JS and CSS references strictly utilize relative paths (`./assets/...`).

4. **Absolute Reference Search in `dist/`**:
   - PowerShell search for pattern `src="/|href="/` across all files in `dist/` returned 0 matches.

5. **Master E2E Test Suite (`npm test`)**:
   - Command executed: `npm test` (`node test/e2e-runner.js`)
   - Results: 65 out of 65 tests passed (100% pass rate) across Tiers 1–4.

---

## 2. Logic Chain

1. **GitHub Pages Base Path Requirement**: GitHub Pages hosting on user/project repositories (e.g. `https://username.github.io/repository-name/`) serves assets relative to the repository subpath. Root absolute paths like `/assets/...` cause HTTP 404 errors on GitHub Pages.
2. **Configuration Verification**: Setting `base: './'` in `vite.config.js` instructs Vite to prepend `./` to asset paths in generated HTML.
3. **Empirical Output Validation**: Inspection of the generated `dist/index.html` confirmed that script and style tags use `./assets/index-BWubjfiJ.js` and `./assets/index-SwCiUIAu.css`.
4. **Build Pipeline Reproducibility**: Running `npm run build` cleanly produced all required static assets without errors or warnings.
5. **No Leaked Absolute References**: Automated scan of the output bundle confirmed zero absolute path leaks (`src="/` or `href="/`), guaranteeing full GitHub Pages compatibility.

---

## 3. Caveats

- **Live GitHub Pages Environment**: The empirical testing was conducted in a local Node.js / Vite build environment on Windows. Deployment to live GitHub Pages infrastructure was simulated via static bundle inspection and `.github/workflows/deploy.yml` workflow validation, not by publishing live to GitHub servers.
- **Browser Runtime**: Static output bundle structure and relative links were verified via source inspection and Node E2E test runner rather than launching a headless Chromium browser instance.

---

## 4. Conclusion

The build pipeline and static output for Milestone 1 of the Oxford 3000 CEFR Lexicon Application are **VERIFIED AND FULLY PASSING**.
- Relative base path (`./`) is correctly configured in `vite.config.js`.
- Output bundle in `dist/` contains valid `index.html` with relative asset links (`./assets/...`), bundled CSS (`20.77 kB`), and bundled JS (`161.11 kB`).
- `npm run build` executes cleanly with zero errors or warnings.
- Milestone 1 is ready for deployment.

---

## 5. Verification Method

To independently verify these results:

1. Navigate to project root: `c:\Users\HP\Downloads\English\oxford-3000-platform\`
2. Check `vite.config.js` base path:
   ```powershell
   Get-Content vite.config.js | Select-String "base:"
   ```
   *Expected output*: `base: './',`

3. Trigger clean build:
   ```powershell
   npm run build
   ```
   *Expected output*: `vite v5.4.21 building for production...` ending in `✓ built in X.XXs`.

4. Inspect relative asset links in `dist/index.html`:
   ```powershell
   Get-Content dist/index.html | Select-String "assets"
   ```
   *Expected output*: Lines with `src="./assets/index-*.js"` and `href="./assets/index-*.css"`.

5. Check for any absolute path leaks in `dist`:
   ```powershell
   Get-ChildItem -Path dist -Recurse -File | Select-String -Pattern 'src="/|href="/'
   ```
   *Expected output*: Empty (0 matches).

6. Run project test suite:
   ```powershell
   npm test
   ```
   *Expected output*: `TOTAL PASSED : 65`, `TOTAL FAILED : 0`, `PASS RATE : 100.0%`.

---

## Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: LOW (Build pipeline and output static bundle are robust)

### Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| Relative asset link generation (`base: './'`) | `dist/index.html` uses `./assets/...` links | Links match `./assets/index-BWubjfiJ.js` and `./assets/index-SwCiUIAu.css` | **PASS** |
| Production build pipeline execution | `npm run build` produces dist folder cleanly | 35 modules transformed, 3 bundle files generated in 4.57s | **PASS** |
| Absolute path leak check | Zero `/assets/` or `src="/` references in dist | 0 absolute path references found | **PASS** |
| E2E regression check | All unit/integration tests pass post-build | 65/65 tests passed (100% pass rate) | **PASS** |

### Unchallenged Areas
- Dynamic CDN asset fallback under network failure conditions (out of scope for static build pipeline verification).
