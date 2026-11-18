const $ = id => document.getElementById(id);
const statuses = ['Alocada', 'A caminho', 'Coletado', 'Em transporte', 'Entregue'];
const offset = minutes => new Date(Date.now() + minutes * 60000).toISOString();
let orders = [
    { id: 'OS-2026-0201', type: 'Coleta de corpo', address: 'Rua das Flores, 120 · Aracaju/SE', team: 'Equipe Alfa', vehicle: 'SVO-0002', due: offset(-48), status: 'A caminho', history: [{ at: new Date(Date.now() - 65 * 60000).toISOString(), text: 'Equipe Alfa iniciou o deslocamento' }], notes: [] },
    { id: 'OS-2026-0202', type: 'Material biológico', address: 'Av. Central, 540 · Aracaju/SE', team: 'Equipe Beta', vehicle: 'SVO-0003', due: offset(70), status: 'Coletado', history: [{ at: offset(-20), text: 'Material coletado pela Equipe Beta' }], notes: [] },
    { id: 'OS-2026-0203', type: 'Coleta de corpo', address: 'Rua São João, 85 · Aracaju/SE', team: 'Equipe Gama', vehicle: 'SVO-0004', due: offset(-20), status: 'Alocada', history: [{ at: offset(-90), text: 'Ordem alocada à Equipe Gama' }], notes: [] },
    { id: 'OS-2026-0204', type: 'Outra coleta', address: 'Praça da Saúde, 30 · Aracaju/SE', team: 'Equipe Alfa', vehicle: 'SVO-0002', due: offset(-60), status: 'Entregue', history: [{ at: offset(-75), text: 'Entrega concluída' }], notes: [] },
    { id: 'OS-2026-0205', type: 'Material biológico', address: 'Av. Beira Mar, 890 · Aracaju/SE', team: 'Equipe Beta', vehicle: 'SVO-0003', due: offset(110), status: 'Em transporte', history: [{ at: offset(-12), text: 'Equipe iniciou transporte' }], notes: [] }
];
let current = null;
const formatDate = iso => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const isLate = o => o.status !== 'Entregue' && new Date(o.due).getTime() < Date.now();
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function render() {
    $('total').textContent = orders.length;
    $('pending').textContent = orders.filter(o => ['Alocada', 'A caminho'].includes(o.status)).length;
    $('progress').textContent = orders.filter(o => ['Coletado', 'Em transporte'].includes(o.status)).length;
    $('done').textContent = orders.filter(o => o.status === 'Entregue').length;
    const late = orders.filter(isLate);
    $('late').textContent = late.length;
    $('alertCount').textContent = `${late.length} alerta${late.length === 1 ? '' : 's'}`;
    $('alertList').innerHTML = late.length ? late.map(o => `<div class="alert"><div><strong>⚠ ${escapeHtml(o.id)} — ${escapeHtml(o.team)}</strong><p>${escapeHtml(o.address)} · Prazo: ${formatDate(o.due)} · Status: ${escapeHtml(o.status)}</p></div><button class="outline" data-open="${o.id}">Intervir</button></div>`).join('') : '<div class="no-alert">Nenhuma ordem atrasada no momento.</div>';
    const q = $('search').value.trim().toLowerCase(), s = $('statusFilter').value, d = $('delayFilter').value;
    const filtered = orders.filter(o => (!s || o.status === s) && (!d || (d === 'late' ? isLate(o) : !isLate(o))) && (!q || [o.id, o.type, o.address, o.team].join(' ').toLowerCase().includes(q)));
    $('results').textContent = `${filtered.length} ordens`;
    $('tbody').innerHTML = filtered.map(o => `<tr><td><strong>${escapeHtml(o.id)}</strong><small>${escapeHtml(o.type)}</small></td><td>${escapeHtml(o.address)}</td><td>${escapeHtml(o.team)}<small>${escapeHtml(o.vehicle)}</small></td><td>${formatDate(o.due)}</td><td><span class="pill ${o.status === 'Entregue' ? 'done' : ''}">${escapeHtml(o.status)}</span></td><td><span class="pill ${isLate(o) ? 'late' : 'wait'}">${isLate(o) ? 'Atrasada' : o.status === 'Entregue' ? 'Concluída' : 'No prazo'}</span></td><td><button class="outline" data-open="${o.id}">Detalhes</button></td></tr>`).join('') || '<tr><td colspan="7">Nenhuma ordem encontrada.</td></tr>';
}
function openOrder(id) { current = orders.find(o => o.id === id); if (!current)
    return; $('modalTitle').textContent = current.id; $('details').innerHTML = `<div class="details-grid"><div><small>TIPO DE COLETA</small>${escapeHtml(current.type)}</div><div><small>STATUS ATUAL</small>${escapeHtml(current.status)}</div><div><small>LOCAL</small>${escapeHtml(current.address)}</div><div><small>EQUIPE / VEÍCULO</small>${escapeHtml(current.team)} · ${escapeHtml(current.vehicle)}</div><div><small>PRAZO PREVISTO</small>${formatDate(current.due)}</div><div><small>SITUAÇÃO</small>${isLate(current) ? 'Atrasada' : 'No prazo / concluída'}</div></div><div class="history"><h3>Histórico e intervenções</h3>${[...current.history.map(h => ({ at: h.at, text: h.text })), ...current.notes.map(n => ({ at: n.at, text: 'Intervenção: ' + n.text }))].sort((a, b) => new Date(b.at) - new Date(a.at)).map(h => `<p>${formatDate(h.at)} — ${escapeHtml(h.text)}</p>`).join('')}</div>`; $('intervention').value = ''; $('overlay').classList.remove('hidden'); }
function close() { current = null; $('overlay').classList.add('hidden'); }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2500); }
document.addEventListener('click', e => { const btn = e.target.closest('[data-open]'); if (btn)
    openOrder(btn.dataset.open); });
$('close').onclick = close;
$('cancel').onclick = close;
$('overlay').addEventListener('click', e => { if (e.target === $('overlay'))
    close(); });
$('save').onclick = () => { if (!current)
    return; const note = $('intervention').value.trim(); if (!note) {
    toast('Descreva a providência antes de registrar.');
    return;
} current.notes.push({ at: new Date().toISOString(), text: note }); close(); render(); toast('Intervenção registrada nesta sessão.'); };
['search', 'statusFilter', 'delayFilter'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
$('addDemo').onclick = () => { const id = 'OS-2026-' + String(206 + orders.length - 5).padStart(4, '0'); orders.unshift({ id, type: 'Coleta de corpo', address: 'Rua Nova Esperança, 215 · Aracaju/SE', team: 'Equipe Delta', vehicle: 'SVO-0005', due: offset(45), status: 'Alocada', history: [{ at: new Date().toISOString(), text: 'Ordem criada para demonstração' }], notes: [] }); render(); toast('Ordem demonstrativa adicionada.'); };
setInterval(render, 15000);
render();

