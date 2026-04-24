const API_URL = 'https://mlp-app-backend.onrender.com/api/ponies';
// const API_URL = 'http://localhost:3000/api/ponies'; // dev local

const TYPE_EMOJI = { 'Earth Pony': '🐎', Pegasus: '🪁', Unicorn: '🦄', Alicorn: '✨' };
const ELEMENT_EMOJI = {
  Honesty: '🍎', Kindness: '🦋', Laughter: '🎈',
  Generosity: '💎', Loyalty: '⚡', Magic: '⭐', None: ''
};

// Elementos do DOM
const form = document.getElementById('pony-form');
const ponyId = document.getElementById('pony-id');
const ponyName = document.getElementById('pony-name');
const ponyType = document.getElementById('pony-type');
const ponyColor = document.getElementById('pony-color');
const ponyElement = document.getElementById('pony-element');
const ponyDesc = document.getElementById('pony-description');
const ponyCutie = document.getElementById('pony-cutie');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const messageEl = document.getElementById('message');
const listEl = document.getElementById('ponies-list');

function showMessage(text, error = false) {
  messageEl.textContent = text;
  messageEl.style.color = error ? '#c62828' : '#9c27b0';
}

function clearForm() {
  form.reset();
  ponyId.value = '';
  formTitle.textContent = 'Nova Pony';
  cancelBtn.classList.add('hidden');
  showMessage('');
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function loadPonies() {
  try {
    const res = await fetch(API_URL);
    const ponies = await res.json();

    if (!ponies.length) {
      listEl.innerHTML = '<div class="empty">🦄 Nenhuma pony cadastrada ainda.</div>';
      return;
    }

    listEl.innerHTML = ponies.map(p => `
      <div class="pony-item">
        <h3>${TYPE_EMOJI[p.type] || '🦄'} ${escHtml(p.name)}</h3>
        <div class="pony-badges">
          <span class="badge">${escHtml(p.type)}</span>
          ${p.element && p.element !== 'None' ? `<span class="badge">${ELEMENT_EMOJI[p.element]} ${p.element}</span>` : ''}
          <span class="badge">🎨 ${escHtml(p.color)}</span>
        </div>
        <p>${escHtml(p.description)}</p>
        ${p.cutieMarkDescription ? `<p>✨ ${escHtml(p.cutieMarkDescription)}</p>` : ''}
        <div class="item-actions">
          <button class="btn-edit" onclick="editPony('${p._id}')">✏️ Editar</button>
          <button class="btn-delete" onclick="deletePony('${p._id}')">🗑️ Excluir</button>
        </div>
      </div>
    `).join('');
  } catch {
    listEl.innerHTML = '<div class="empty">😔 Erro ao carregar. Verifique a API.</div>';
  }
}

window.editPony = async function (id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const p = await res.json();
    ponyId.value = p._id;
    ponyName.value = p.name;
    ponyType.value = p.type;
    ponyColor.value = p.color;
    ponyElement.value = p.element || 'None';
    ponyDesc.value = p.description;
    ponyCutie.value = p.cutieMarkDescription || '';
    formTitle.textContent = '✏️ Editar Pony';
    cancelBtn.classList.remove('hidden');
    showMessage('Editando pony...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    showMessage('Erro ao carregar pony.', true);
  }
};

window.deletePony = async function (id) {
  if (!confirm('Deseja excluir esta pony?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    showMessage('Pony removida!');
    loadPonies();
  } catch {
    showMessage('Erro ao excluir.', true);
  }
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = ponyId.value;
  const body = {
    name: ponyName.value,
    type: ponyType.value,
    color: ponyColor.value,
    element: ponyElement.value,
    description: ponyDesc.value,
    cutieMarkDescription: ponyCutie.value
  };
  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error();
    showMessage(id ? '✅ Pony atualizada!' : '✅ Pony criada!');
    clearForm();
    loadPonies();
  } catch {
    showMessage('Erro ao salvar.', true);
  }
});

cancelBtn.addEventListener('click', clearForm);
document.getElementById('reload-btn').addEventListener('click', loadPonies);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('./service-worker.js').catch(() => {})
  );
}

loadPonies();
