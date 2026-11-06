const message =
  'Configure VITE_API_URL with the confirmed HTTPS backend origin, without credentials, path, query or fragment.';

let url;
try {
  url = new URL(process.env.VITE_API_URL);
} catch {
  throw new Error(message);
}

if (
  url.protocol !== 'https:' ||
  url.username ||
  url.password ||
  url.pathname !== '/' ||
  url.search ||
  url.hash ||
  ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(url.hostname)
) {
  throw new Error(message);
}

console.log('Vercel API origin validated.');
