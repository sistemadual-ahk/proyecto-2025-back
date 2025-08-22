#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const http = require('http');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function waitForApi(url, timeoutMs = 60000, intervalMs = 1500) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          res.resume();
          resolve();
        } else {
          res.resume();
          schedule();
        }
      });
      req.on('error', () => schedule());
      req.setTimeout(5000, () => {
        req.destroy();
        schedule();
      });
    };
    const schedule = () => {
      if (Date.now() - start > timeoutMs) return reject(new Error('Timeout esperando a la API'));
      setTimeout(tryOnce, intervalMs);
    };
    tryOnce();
  });
}

function httpJson({ method = 'GET', url, body }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? Buffer.from(JSON.stringify(body)) : undefined;
    const opts = {
      method,
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + (parsed.search || ''),
      headers: data
        ? { 'Content-Type': 'application/json', 'Content-Length': data.length }
        : {}
    };

    const req = http.request(opts, (res) => {
      let chunks = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try {
          const json = chunks ? JSON.parse(chunks) : null;
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: chunks });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  try {
    // Detectar si ya estaba corriendo el servicio 'app'
    let wasRunning = false;
    try {
      const psOut = execSync('docker-compose ps', { stdio: ['ignore', 'pipe', 'ignore'], shell: true })
        .toString()
        .toLowerCase();
      wasRunning = psOut.includes('app') && psOut.includes('up');
    } catch {}

    console.log('🐳 Levantando stack con docker-compose...');
    await run('docker-compose', ['up', '--build', '-d']);

    console.log('⏳ Esperando a que la API responda...');
    await waitForApi('http://localhost:3000/api/saludos');
    console.log('✅ La API respondió OK');

    console.log('📋 Logs recientes de la app:');
    await run('docker-compose', ['logs', '--tail=50', 'app']);

    // Pruebas de API equivalentes al antiguo PS1
    const base = 'http://localhost:3000';
    console.log('🧪 GET /api/saludos');
    const r1 = await httpJson({ method: 'GET', url: `${base}/api/saludos` });
    console.log('   →', r1.status, JSON.stringify(r1.body));

    // Decidir si bajamos lo que levantamos
    if (!wasRunning) {
      console.log('🛑 Apagando stack (no estaba corriendo previamente)...');
      await run('docker-compose', ['down']);
      console.log('✅ Stack detenido.');
    } else {
      console.log('✅ Smoke test completado. Se deja el contenedor ejecutándose (ya estaba corriendo).');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en smoke test:', err.message || err);
    try {
      // En caso de error, intentamos no afectar si ya estaba corriendo
      const psOut = execSync('docker-compose ps', { stdio: ['ignore', 'pipe', 'ignore'], shell: true })
        .toString()
        .toLowerCase();
      const isUpNow = psOut.includes('app') && psOut.includes('up');
      if (isUpNow) {
        // No bajar si quedó arriba y no sabemos estado previo
        console.log('ℹ️  La app parece estar corriendo; no se baja automáticamente tras el error.');
      }
    } catch {}
    process.exit(1);
  }
})();


