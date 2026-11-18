// Dados fictícios: substitua por dados de API quando integrar ao backend.
const initialOrders = [
    { id: 'OS-2026-0201', team: 'Equipe Alfa', vehicle: 'SVO-0001', request: '2026-11-18T08:00', collection: '2026-11-18T09:15', delivery: '2026-11-18T10:05' },
    { id: 'OS-2026-0202', team: 'Equipe Beta', vehicle: 'SVO-0002', request: '2026-11-18T07:40', collection: '2026-11-18T10:20', delivery: '2026-11-18T12:05' },
    { id: 'OS-2026-0203', team: 'Equipe Alfa', vehicle: 'SVO-0001', request: '2026-11-18T09:00', collection: '2026-11-18T09:55', delivery: '2026-11-18T11:00' },
    { id: 'OS-2026-0204', team: 'Equipe Gama', vehicle: 'SVO-0003', request: '2026-11-18T06:00', collection: '2026-11-18T08:20', delivery: '2026-11-18T09:50' },
    { id: 'OS-2026-0205', team: 'Equipe Beta', vehicle: 'SVO-0002', request: '2026-11-18T10:30', collection: '2026-11-18T11:40', delivery: null },
    { id: 'OS-2026-0206', team: 'Equipe Gama', vehicle: 'SVO-0003', request: '2026-11-18T11:15', collection: null, delivery: null }
];

let orders = structuredClone(initialOrders);
const byId = id => document.getElementById(id);

function minutesBetween(start, end) {
    if (!start || !end) return null;
    return Math.round((new Date(end) - new Date(start)) / 60000);
}

function formatMinutes(minutes) {
    if (minutes === null || !Number.isFinite(minutes)) return '—';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours ? `${hours}h ${String(remainder).padStart(2, '0')}min` : `${remainder}min`;
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function average(values) {
    const valid = values.filter(value => value !== null && value >= 0);
    if (!valid.length) return null;
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function getTarget() {
    return Math.max(1, Number(byId('targetMinutes').value) || 180);
}

function getDurations(order) {
    return {
        collection: minutesBetween(order.request, order.collection),
        transport: minutesBetween(order.collection, order.delivery),
        total: minutesBetween(order.request, order.delivery)
    };
}

function filteredOrders() {
    const team = byId('teamFilter').value;
    const vehicle = byId('vehicleFilter').value;
    const start = byId('startDate').value;
    const end = byId('endDate').value;

    return orders.filter(order => {
        const date = order.request.slice(0, 10);
        return (!team || order.team === team) &&
            (!vehicle || order.vehicle === vehicle) &&
            (!start || date >= start) &&
            (!end || date <= end);
    });
}

function populateFilters() {
    const selectedTeam = byId('teamFilter').value;
    const selectedVehicle = byId('vehicleFilter').value;

    for (const [id, property, firstLabel, previous] of [
        ['teamFilter', 'team', 'Todas as equipes', selectedTeam],
        ['vehicleFilter', 'vehicle', 'Todos os veículos', selectedVehicle]
    ]) {
        const select = byId(id);
        select.replaceChildren(new Option(firstLabel, ''));
        const values = [...new Set(orders.map(order => order[property]))].sort();
        values.forEach(value => select.add(new Option(value, value)));
        select.value = values.includes(previous) ? previous : '';
    }
}

function renderSummary(data) {
    const durations = data.map(getDurations);
    byId('avgCollection').textContent = formatMinutes(average(durations.map(d => d.collection)));
    byId('avgTransport').textContent = formatMinutes(average(durations.map(d => d.transport)));
    byId('avgTotal').textContent = formatMinutes(average(durations.map(d => d.total)));

    const target = getTarget();
    const late = data.filter(order => {
        const total = getDurations(order).total;
        return total !== null && total > target;
    });
    byId('lateCount').textContent = late.length;
    byId('lateDescription').textContent = `Entregues acima de ${target} minutos`;
}

function renderBars(containerId, entries, secondary = false) {
    const container = byId(containerId);
    container.replaceChildren();
    const valid = entries.filter(entry => entry.value !== null);

    if (!valid.length) {
        container.innerHTML = '<div class="empty">Ainda não há dados suficientes.</div>';
        return;
    }

    const maximum = Math.max(...valid.map(entry => entry.value), 1);
    valid.forEach(entry => {
        const row = document.createElement('div');
        const label = document.createElement('div');
        label.className = 'bar-label';
        const name = document.createElement('span');
        name.textContent = entry.name;
        const value = document.createElement('strong');
        value.textContent = formatMinutes(entry.value);
        label.append(name, value);

        const track = document.createElement('div');
        track.className = 'bar-track';
        const fill = document.createElement('div');
        fill.className = `bar-fill ${secondary ? 'secondary' : ''}`;
        fill.style.width = `${Math.max(2, entry.value / maximum * 100)}%`;
        track.append(fill);
        row.append(label, track);
        container.append(row);
    });
}

function renderCharts(data) {
    const durations = data.map(getDurations);
    renderBars('stageChart', [
        { name: 'Solicitação até coleta', value: average(durations.map(d => d.collection)) },
        { name: 'Coleta até entrega', value: average(durations.map(d => d.transport)) },
        { name: 'Solicitação até entrega', value: average(durations.map(d => d.total)) }
    ]);

    const teams = [...new Set(data.map(order => order.team))].sort();
    renderBars('teamChart', teams.map(team => ({
        name: team,
        value: average(data.filter(order => order.team === team)
            .map(order => getDurations(order).total))
    })), true);
}

function renderTable(data) {
    const body = byId('ordersBody');
    body.replaceChildren();
    const target = getTarget();

    data.forEach(order => {
        const duration = getDurations(order);
        const status = duration.total === null ? 'Em andamento' :
            duration.total > target ? 'Acima da meta' : 'Dentro da meta';
        const statusClass = duration.total === null ? 'pending' :
            duration.total > target ? 'late' : 'good';

        const row = document.createElement('tr');
        const cells = [
            order.id, `${order.team} / ${order.vehicle}`,
            formatDate(order.request), formatDate(order.collection),
            formatDate(order.delivery), formatMinutes(duration.collection),
            formatMinutes(duration.transport), formatMinutes(duration.total)
        ];

        cells.forEach((value, index) => {
            const cell = document.createElement('td');
            if (index === 0) {
                const strong = document.createElement('strong');
                strong.textContent = value;
                cell.append(strong);
            } else {
                cell.textContent = value;
            }
            row.append(cell);
        });

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `pill ${statusClass}`;
        badge.textContent = status;
        statusCell.append(badge);
        row.append(statusCell);
        body.append(row);
    });

    if (!data.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 9;
        cell.className = 'empty';
        cell.textContent = 'Nenhuma ordem encontrada para os filtros selecionados.';
        row.append(cell);
        body.append(row);
    }
    byId('resultSummary').textContent = `${data.length} ordem(ns) exibida(s). Tempos calculados a partir dos registros de cada etapa.`;
}

function renderAlerts(data) {
    const target = getTarget();
    const now = Date.now();
    const alerts = data.flatMap(order => {
        const duration = getDurations(order);
        const elapsed = Math.floor((now - new Date(order.request).getTime()) / 60000);

        if (duration.total !== null && duration.total > target) {
            return [{ order, message: `Atendimento concluído em ${formatMinutes(duration.total)}; meta de ${formatMinutes(target)}.` }];
        }
        if (duration.total === null && elapsed > target) {
            return [{ order, message: `Ordem ainda aberta há ${formatMinutes(elapsed)}; verificar andamento com a equipe.` }];
        }
        return [];
    });

    const list = byId('alertsList');
    list.replaceChildren();
    if (!alerts.length) {
        list.innerHTML = '<div class="empty">Nenhum alerta de desempenho no filtro atual.</div>';
        return;
    }

    alerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = 'alert-item';
        const title = document.createElement('strong');
        title.textContent = `${alert.order.id} — ${alert.order.team}`;
        const description = document.createElement('p');
        description.textContent = alert.message;
        item.append(title, description);
        list.append(item);
    });
}

function render() {
    const data = filteredOrders();
    renderSummary(data);
    renderCharts(data);
    renderTable(data);
    renderAlerts(data);
}

function closeModal() {
    byId('modalBackdrop').classList.add('hidden');
    byId('orderForm').reset();
    byId('formError').textContent = '';
}

byId('addOrderButton').addEventListener('click', () => {
    byId('modalBackdrop').classList.remove('hidden');
    byId('newId').focus();
});
byId('closeModal').addEventListener('click', closeModal);
byId('cancelModal').addEventListener('click', closeModal);
byId('modalBackdrop').addEventListener('click', event => {
    if (event.target === byId('modalBackdrop')) closeModal();
});

byId('orderForm').addEventListener('submit', event => {
    event.preventDefault();
    const order = {
        id: byId('newId').value.trim(),
        team: byId('newTeam').value.trim(),
        vehicle: byId('newVehicle').value.trim(),
        request: byId('newRequest').value,
        collection: byId('newCollection').value || null,
        delivery: byId('newDelivery').value || null
    };
    const error = byId('formError');

    if (orders.some(existing => existing.id.toLowerCase() === order.id.toLowerCase())) {
        error.textContent = 'Já existe uma ordem com esse número.';
        return;
    }
    if (order.delivery && !order.collection) {
        error.textContent = 'Informe a coleta antes de registrar a entrega.';
        return;
    }
    if ((order.collection && order.collection < order.request) ||
        (order.delivery && order.delivery < order.collection)) {
        error.textContent = 'Os horários precisam estar na sequência: solicitação, coleta e entrega.';
        return;
    }

    orders.unshift(order);
    populateFilters();
    render();
    closeModal();
});

for (const id of ['teamFilter', 'vehicleFilter', 'startDate', 'endDate', 'targetMinutes']) {
    byId(id).addEventListener('change', render);
}

byId('clearFilters').addEventListener('click', () => {
    for (const id of ['teamFilter', 'vehicleFilter', 'startDate', 'endDate']) {
        byId(id).value = '';
    }
    render();
});

byId('resetData').addEventListener('click', () => {
    if (!confirm('Restaurar as ordens fictícias originais?')) return;
    orders = structuredClone(initialOrders);
    populateFilters();
    render();
});

populateFilters();
render();
setInterval(render, 30000);
