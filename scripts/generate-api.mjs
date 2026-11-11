import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const openApiUrl = process.env.OPENAPI_URL ?? 'openapi/gestao-frotas.json';
const output = 'src/shared/api/generated/schema.d.ts';

const command = fileURLToPath(new URL('../bin/cli.js', import.meta.resolve('openapi-typescript')));
const result = spawnSync(process.execPath, [command, openApiUrl, '--output', output], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
