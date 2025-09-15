const fs = require('fs');
const path = require('path');
const conceptosPath = path.join(__dirname, 'conceptos.json');
const http = require('http');
const url = require('url');

let idCounter = 1;

// Leer conceptos al iniciar
let conceptos = [];
try {
  const data = fs.readFileSync(conceptosPath, 'utf8');
  conceptos = JSON.parse(data);
} catch (err) {
  conceptos = [];
}

// Guardar conceptos en archivo
function guardarConceptos() {
  fs.writeFileSync(conceptosPath, JSON.stringify(conceptos, null, 2));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  const method = req.method;

  res.setHeader('Content-Type', 'application/json');

  // Servir archivos estáticos desde /public
if (method === 'GET' && (parsedUrl.pathname === '/' || parsedUrl.pathname.endsWith('.html') || parsedUrl.pathname.endsWith('.css') || parsedUrl.pathname.endsWith('.js'))) {
  const filePath = path.join(__dirname, 'public', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Archivo no encontrado');
    } else {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript'
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
      res.end(data);
    }
  });
  return;
}

  // GET /conceptos
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'conceptos') {
    res.end(JSON.stringify(conceptos));
    return;
  }

  // GET /conceptos/:id
  if (method === 'GET' && pathParts.length === 2 && pathParts[0] === 'conceptos') {
    const concepto = conceptos.find(c => c.id == pathParts[1]);
    if (concepto) {
      res.end(JSON.stringify(concepto));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Concepto no encontrado' }));
    }
    return;
  }

  // DELETE /conceptos
  if (method === 'DELETE' && pathParts.length === 1 && pathParts[0] === 'conceptos') {
    conceptos = [];
    guardarConceptos();
    res.end(JSON.stringify({ mensaje: 'Todos los conceptos eliminados' }));
    return;
  }

  // DELETE /conceptos/:id
  if (method === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'conceptos') {
    const id = parseInt(pathParts[1]);
    const index = conceptos.findIndex(c => c.id === id);
    if (index !== -1) {
      conceptos.splice(index, 1);
      guardarConceptos();
      res.end(JSON.stringify({ mensaje: 'Concepto eliminado' }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Concepto no encontrado' }));
    }
    return;
  }

  // POST /conceptos
  if (method === 'POST' && pathParts.length === 1 && pathParts[0] === 'conceptos') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { nombre, descripcion } = JSON.parse(body);
        const nuevo = { id: idCounter++, nombre, descripcion };
        conceptos.push(nuevo);
        guardarConceptos();
        res.statusCode = 201;
        res.end(JSON.stringify(nuevo));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Datos inválidos' }));
      }
    });
    return;
  }

  // Ruta no encontrada
  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Ruta no válida' }));
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});