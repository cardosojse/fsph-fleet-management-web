import type { QueryClient } from '@tanstack/react-query';

export async function invalidateData(client: QueryClient) {
  await client.invalidateQueries({ predicate: (query) => query.queryKey[0] !== 'session' });
}
