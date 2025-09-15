document.getElementById('conceptForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;

  const res = await fetch('/conceptos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, descripcion })
  });

  if (res.ok) {
    alert("Concepto agregado con éxito");
  } else {
    alert("Hubo un error al agregar el concepto");
  }

  document.getElementById('nombre').value = '';
  document.getElementById('descripcion').value = '';
  cargarConceptos();
});

async function cargarConceptos() {
  const res = await fetch('/conceptos');
  const conceptos = await res.json();
  const lista = document.getElementById('conceptList');
  lista.innerHTML = '';

  conceptos.forEach((c) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${c.nombre}</strong>: ${c.descripcion}
      <button onclick="eliminarConcepto(${c.id})">Eliminar</button>
    `;
    lista.appendChild(item);
  });
}

async function eliminarConcepto(id) {
  const confirmar = window.confirm("¿Estás seguro de que querés eliminar este concepto?");
  if (!confirmar) return;

  const res = await fetch(`/conceptos/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert("Concepto eliminado");
  } else {
    alert("No se pudo eliminar el concepto");
  }

  cargarConceptos();
}

async function eliminarTodos() {
  const confirmar = window.confirm("¿Seguro que querés eliminar TODOS los conceptos?");
  if (!confirmar) return;

  const res = await fetch('/conceptos', {
    method: 'DELETE'
  });

  if (res.ok) {
    alert("Todos los conceptos fueron eliminados");
  } else {
    alert("No se pudieron eliminar los conceptos");
  }

  cargarConceptos();
}

cargarConceptos();