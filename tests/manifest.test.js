import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../apps.json', import.meta.url), 'utf-8'));

describe('apps.json manifest', () => {
    it('has a name', () => {
        assert.ok(typeof manifest.name === 'string' && manifest.name.length > 0);
    });

    it('has a positive integer build number', () => {
        assert.ok(Number.isInteger(manifest.build) && manifest.build > 0);
    });

    it('has an apps array', () => {
        assert.ok(Array.isArray(manifest.apps));
    });

    it('has at least one app', () => {
        assert.ok(manifest.apps.length > 0);
    });

    it('every app has all required fields', () => {
        const required = ['id', 'name', 'version', 'build', 'date', 'icon', 'url', 'type'];
        for (const app of manifest.apps) {
            for (const field of required) {
                assert.ok(field in app, `app "${app.id || '?'}" missing field "${field}"`);
            }
        }
    });

    it('every app id is a non-empty string', () => {
        for (const app of manifest.apps) {
            assert.ok(typeof app.id === 'string' && app.id.length > 0);
        }
    });

    it('app ids are unique', () => {
        const ids = manifest.apps.map((a) => a.id);
        assert.strictEqual(new Set(ids).size, ids.length, 'duplicate app ids found');
    });

    it('every app has a positive integer build number', () => {
        for (const app of manifest.apps) {
            assert.ok(Number.isInteger(app.build) && app.build > 0, `app "${app.id}" has invalid build`);
        }
    });

    it('every app type is valid', () => {
        const validTypes = ['pwa', 'testflight', 'website', 'url-scheme'];
        for (const app of manifest.apps) {
            assert.ok(validTypes.includes(app.type), `app "${app.id}" has invalid type "${app.type}"`);
        }
    });

    it('every app has a non-empty url', () => {
        for (const app of manifest.apps) {
            assert.ok(typeof app.url === 'string' && app.url.length > 0);
        }
    });
});
