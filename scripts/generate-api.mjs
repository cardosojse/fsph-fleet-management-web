import { spawnSync } from 'node:child_process';

const openApiUrl = process.env.OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs';
const output = 'src/shared/api/generated/schema.d.ts';

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const result = spawnSync(command, ['exec', 'openapi-typescript', openApiUrl, '--output', output], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
