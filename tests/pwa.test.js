import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const root = new URL('../', import.meta.url);
const pwaManifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf-8'));
const indexHtml = await readFile(new URL('index.html', root), 'utf-8');

describe('PWA manifest.json', () => {
    it('has required fields', () => {
        const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
        for (const field of required) {
            assert.ok(field in pwaManifest, `missing field "${field}"`);
        }
    });

    it('display is standalone', () => {
        assert.strictEqual(pwaManifest.display, 'standalone');
    });

    it('has dark theme colors', () => {
        assert.strictEqual(pwaManifest.background_color, '#000000');
        assert.strictEqual(pwaManifest.theme_color, '#000000');
    });

    it('has icons at required sizes', () => {
        const sizes = pwaManifest.icons.map((i) => i.sizes);
        assert.ok(sizes.includes('192x192'), 'missing 192x192 icon');
        assert.ok(sizes.includes('512x512'), 'missing 512x512 icon');
    });

    it('icon files exist', async () => {
        for (const icon of pwaManifest.icons) {
            const iconPath = new URL(icon.src, root);
            await assert.doesNotReject(access(iconPath, constants.R_OK), `icon missing: ${icon.src}`);
        }
    });
});

describe('index.html PWA meta tags', () => {
    it('has apple-mobile-web-app-capable', () => {
        assert.ok(indexHtml.includes('apple-mobile-web-app-capable'));
    });

    it('has apple-mobile-web-app-status-bar-style', () => {
        assert.ok(indexHtml.includes('apple-mobile-web-app-status-bar-style'));
    });

    it('has theme-color meta', () => {
        assert.ok(indexHtml.includes('theme-color'));
    });

    it('has viewport-fit=cover', () => {
        assert.ok(indexHtml.includes('viewport-fit=cover'));
    });

    it('links to manifest.json', () => {
        assert.ok(indexHtml.includes('manifest.json'));
    });

    it('has apple-touch-icon', () => {
        assert.ok(indexHtml.includes('apple-touch-icon'));
    });

    it('loads app.js as module', () => {
        assert.ok(indexHtml.includes('type="module"'));
    });
});
