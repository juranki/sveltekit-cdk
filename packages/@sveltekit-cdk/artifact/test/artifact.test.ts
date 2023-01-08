import { mkdirSync, readFileSync } from 'fs';
import { SvelteKitCDKArtifact } from '../src';

test('new artifact', () => {
  const artifact = new SvelteKitCDKArtifact('dummy');
  const subs = artifact.subdirectories;
  expect(subs.length).toBe(2);
  expect(subs).toContain('dummy/static');
  expect(subs).toContain('dummy/lambda');
});

test('write', () => {
  const artifact = new SvelteKitCDKArtifact('test-data');
  mkdirSync('test-data', {
    recursive: true,
  });
  artifact.staticGlobs = ['/', 'favicon.ico', '_app/*'];
  artifact.write();
  const json = readFileSync('test-data/meta.json', { encoding: 'utf-8' });
  expect(json).toMatchSnapshot();
});