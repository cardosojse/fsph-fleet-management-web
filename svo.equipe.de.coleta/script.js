const orders = [
  {id:"OS-2026-0189",type:"Coleta de corpo",address:"Rua das Flores, 120",district:"Centro · Aracaju/SE",date:"11/11/2026",time:"19:30",team:"Equipe Alfa",vehicle:"QWE-2A34",status:"Alocada",history:[{status:"Alocada",time:"11/11/2026 às 18:42",user:"Central SVO"}]},
  {id:"OS-2026-0188",type:"Material biológico",address:"Av. Central, 540",district:"Jardins · Aracaju/SE",date:"11/11/2026",time:"18:50",team:"Equipe Alfa",vehicle:"QWE-2A34",status:"A caminho",history:[{status:"Alocada",time:"11/11/2026 às 17:50",user:"Central SVO"},{status:"A caminho",time:"11/11/2026 às 18:05",user:"Equipe Alfa"}]},
  {id:"OS-2026-0185",type:"Outra coleta",address:"Rua São João, 85",district:"São José · Aracaju/SE",date:"11/11/2026",time:"17:20",team:"Equipe Alfa",vehicle:"QWE-2A34",status:"Em transporte",history:[{status:"Alocada",time:"11/11/2026 às 16:10",user:"Central SVO"},{status:"A caminho",time:"11/11/2026 às 16:20",user:"Equipe Alfa"},{status:"Coletado",time:"11/11/2026 às 16:55",user:"Equipe Alfa"},{status:"Em transporte",time:"11/11/2026 às 17:00",user:"Equipe Alfa"}]},
  {id:"OS-2026-0179",type:"Coleta de corpo",address:"Praça da Saúde, 30",district:"Salgado Filho · Aracaju/SE",date:"11/11/2026",time:"15:00",team:"Equipe Alfa",vehicle:"QWE-2A34",status:"Entregue",history:[{status:"Alocada",time:"11/11/2026 às 14:00",user:"Central SVO"},{status:"Entregue",time:"11/11/2026 às 15:45",user:"Equipe Alfa"}]}
];
let notifications = [{title:"Nova ordem alocada!",message:"A ordem OS-2026-0189 foi atribuída à sua equipe. Coleta de corpo — Rua das Flores, 120.",time:"Agora mesmo",read:false,id:1},{title:"Status atualizado",message:"A ordem OS-2026-0188 está com status A caminho.",time:"Há 25 minutos",read:true,id:2}];
let selectedOrder = null;
const statusSequence = ["Alocada","A caminho","Coletado","Em transporte","Entregue"];
const $ = id => document.getElementById(id);
const statusClass = status => "status-" + status.toLowerCase().replaceAll(" ","-");
function renderOrders(){
  const query=$("searchInput").value.toLowerCase(), status=$("statusFilter").value, type=$("typeFilter").value;
  const filtered=orders.filter(o=>(!status||o.status===status)&&(!type||o.type===type)&&`${o.id} ${o.type} ${o.address} ${o.district}`.toLowerCase().includes(query));
  $("ordersTable").innerHTML=filtered.map(o=>`<tr>
    <td><span class="order-id">${o.id}</span><span class="cell-sub">${o.type}</span></td>
    <td><span class="location-main">${o.address}</span><span class="cell-sub">${o.district}</span></td>
    <td>${o.date}<span class="cell-sub">${o.time}</span></td>
    <td>${o.team}<span class="cell-sub">Veículo: ${o.vehicle}</span></td>
    <td><span class="status-pill ${statusClass(o.status)}">${o.status}</span></td>
    <td><button class="table-action" data-open="${o.id}">Detalhes / atualizar</button></td>
  </tr>`).join("");
  $("emptyState").classList.toggle("hidden",filtered.length!==0);
  $("resultCount").textContent=`Exibindo ${filtered.length} ${filtered.length===1?"ordem":"ordens"}`;
  $("totalCount").textContent=orders.length;
  $("pendingCount").textContent=orders.filter(o=>["Alocada","A caminho"].includes(o.status)).length;
  $("progressCount").textContent=orders.filter(o=>["Coletado","Em transporte"].includes(o.status)).length;
  $("deliveredCount").textContent=orders.filter(o=>o.status==="Entregue").length;
  $("menuCount").textContent=orders.length;
}
function renderNotifications(){
  $("notificationList").innerHTML=notifications.map(n=>`<div class="notice ${n.read?"":"unread"}"><div class="notice-icon">${n.read?"✓":"♧"}</div><div class="notice-content"><strong>${n.title} ${n.read?"":'<span class="unread-tag">NOVA</span>'}</strong><p>${n.message}</p><small>${n.time}</small></div></div>`).join("") || '<p class="cell-sub">Nenhuma notificação no momento.</p>';
  const unread=notifications.some(n=>!n.read);
  $("bellIndicator").classList.toggle("hidden",!unread);
  $("menuDot").classList.toggle("hidden",!unread);
}
function openOrder(id){
  selectedOrder=orders.find(o=>o.id===id); if(!selectedOrder)return;
  $("modalTitle").textContent=selectedOrder.id;
  $("modalBody").innerHTML=`<div class="detail-grid">
    <div class="detail-item"><label>Tipo de coleta</label><strong>${selectedOrder.type}</strong></div>
    <div class="detail-item"><label>Agendamento</label><strong>${selectedOrder.date} às ${selectedOrder.time}</strong></div>
    <div class="detail-item"><label>Endereço</label><strong>${selectedOrder.address}</strong><span class="cell-sub">${selectedOrder.district}</span></div>
    <div class="detail-item"><label>Equipe / veículo</label><strong>${selectedOrder.team}</strong><span class="cell-sub">${selectedOrder.vehicle}</span></div>
  </div>
  <div class="status-editor"><label for="newStatus">Atualizar status da ordem</label><select id="newStatus">${statusSequence.map(s=>`<option ${s===selectedOrder.status?"selected":""}>${s}</option>`).join("")}</select></div>
  ${selectedOrder.notes ? `<div class="detail-item"><label>Observações</label><strong>${selectedOrder.notes}</strong></div>` : ""}
  <div class="history-title">Histórico de atualizações</div>
  <div>${selectedOrder.history.slice().reverse().map(h=>`<div class="history-entry">• <strong>${h.status}</strong> — ${h.time} · ${h.user}</div>`).join("")}</div>`;
  $("orderModal").classList.remove("hidden");
}
function closeModal(){$("orderModal").classList.add("hidden");selectedOrder=null}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800)}
$("ordersTable").addEventListener("click",e=>{const button=e.target.closest("[data-open]");if(button)openOrder(button.dataset.open)});
["searchInput","statusFilter","typeFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderOrders));
$("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;
$("orderModal").addEventListener("click",e=>{if(e.target===$("orderModal"))closeModal()});
$("saveStatus").onclick=()=>{
  if(!selectedOrder)return;
  const next=$("newStatus").value;
  if(next===selectedOrder.status){closeModal();return}
  selectedOrder.status=next;
  const now=new Date().toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
  selectedOrder.history.push({status:next,time:now,user:"Equipe de coleta"});
  notifications.unshift({id:Date.now(),title:"Status atualizado",message:`A ordem ${selectedOrder.id} foi atualizada para "${next}".`,time:"Agora mesmo",read:false});
  renderOrders();renderNotifications();closeModal();toast("Status da ordem atualizado com sucesso.");
};
$("markRead").onclick=()=>{notifications.forEach(n=>n.read=true);renderNotifications();toast("Notificações marcadas como lidas.")};
$("notificationBell").onclick=()=>{document.querySelector("#notificacoes").scrollIntoView({behavior:"smooth"});notifications.forEach(n=>n.read=true);renderNotifications()};

$("simulateOrder").onclick = () => {
  $("createForm").reset();
  $("createModal").classList.remove("hidden");
};
function closeCreateModal(){ $("createModal").classList.add("hidden"); }
$("closeCreate").onclick = closeCreateModal;
$("cancelCreate").onclick = closeCreateModal;
$("createModal").addEventListener("click", e => {
  if(e.target === $("createModal")) closeCreateModal();
});
$("createForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const scheduled = new Date(data.get("scheduled"));
  if(Number.isNaN(scheduled.getTime())) { toast("Informe uma data válida."); return; }
  const nextNumber = Math.max(189, ...orders.map(o => Number(o.id.split("-").pop()) || 0)) + 1;
  const id = `OS-${scheduled.getFullYear()}-${String(nextNumber).padStart(4,"0")}`;
  const address = `${data.get("street").trim()}, ${data.get("number").trim()}`;
  const district = `${data.get("district").trim()} · ${data.get("city").trim()}/${data.get("state").trim().toUpperCase()}`;
  const order = {
    id, type:data.get("type"), address, district,
    date:scheduled.toLocaleDateString("pt-BR"),
    time:scheduled.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),
    team:data.get("team").trim(), vehicle:data.get("vehicle").trim(),
    notes:data.get("notes").trim(), status:"Alocada",
    history:[{status:"Alocada",time:new Date().toLocaleString("pt-BR"),user:"Central SVO (simulação)"}]
  };
  orders.unshift(order);
  notifications.unshift({id:Date.now(),title:"Nova ordem alocada!",message:`A ordem ${id} foi atribuída à ${order.team}. ${order.type} — ${address}.`,time:"Agora mesmo",read:false});
  $("searchInput").value = "";
  $("statusFilter").value = "";
  $("typeFilter").value = "";
  renderOrders(); renderNotifications(); closeCreateModal();
  toast("Ordem criada com sucesso!");
  openOrder(id);
});
$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>$("sidebar").classList.remove("open")));
$("currentDate").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"long",year:"numeric"});
renderOrders();renderNotifications();
