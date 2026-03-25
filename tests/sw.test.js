import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const swSource = await readFile(new URL('../sw.js', import.meta.url), 'utf-8');

describe('Service Worker', () => {
    it('defines a cache name', () => {
        assert.ok(swSource.includes('CACHE_NAME'));
    });

    it('caches core static assets', () => {
        const required = ['index.html', 'variables.css', 'styles.css', 'app.js'];
        for (const asset of required) {
            assert.ok(swSource.includes(asset), `missing cached asset: ${asset}`);
        }
    });

    it('handles install event', () => {
        assert.ok(swSource.includes("addEventListener('install'"));
    });

    it('handles activate event', () => {
        assert.ok(swSource.includes("addEventListener('activate'"));
    });

    it('handles fetch event', () => {
        assert.ok(swSource.includes("addEventListener('fetch'"));
    });

    it('uses network-first for apps.json', () => {
        assert.ok(swSource.includes('apps.json'));
    });

    it('calls skipWaiting on install', () => {
        assert.ok(swSource.includes('skipWaiting'));
    });

    it('calls clients.claim on activate', () => {
        assert.ok(swSource.includes('clients.claim'));
    });
});
