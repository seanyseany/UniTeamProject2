import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const certDirectory = path.join(process.cwd(), 'certs');
const keyPath = process.env.TLS_KEY_PATH ?? path.join(certDirectory, 'localhost-key.pem');
const certPath = process.env.TLS_CERT_PATH ?? path.join(certDirectory, 'localhost-cert.pem');

app.prepare().then(() => {
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('Missing TLS certificate files.');
    console.error(`Expected key: ${keyPath}`);
    console.error(`Expected cert: ${certPath}`);
    console.error('Generate them first with scripts/generate-dev-cert.sh or provide TLS_KEY_PATH/TLS_CERT_PATH.');
    process.exit(1);
  }

  const server = https.createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      minVersion: 'TLSv1.2',
    },
    (request, response) => {
      handle(request, response);
    },
  );

  server.listen(port, () => {
    console.log(`HTTPS server ready on https://${hostname}:${port}`);
  });
});
