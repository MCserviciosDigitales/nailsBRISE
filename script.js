  const services = [
  { id: "semi", name: "Semipermanente", price: 15000 },
  { id: "kapping-gel", name: "Kapping de Gel", price: 17000 },
  { id: "kapping-polygel", name: "Kapping Polygel", price: 19000 },
  { id: "esculpidas-polygel", name: "Esculpidas Polygel", price: 23000 },
  { id: "esculpidas-acrilico", name: "Esculpidas Acrílico", price: 24000 },
  { id: "soft-gel", name: "Sof Gel", price: 22000 }
];

const withdrawals = [
  { id: "retiro-propio", name: "Retiro de mi trabajo", price: 3000 },
  { id: "retiro-ajeno", name: "Retiro ajeno", price: 6000 }
];

const decorations = [
  { id: "polvo", name: "Polvo", price: 200 }, { id: "cromado", name: "Cromado", price: 500 },
  { id: "sueter", name: "Suéter", price: 250 }, { id: "french", name: "French", price: 450 },
  { id: "dijes", name: "Dijes", price: 350 }, { id: "strass", name: "Strass / Perlas", price: 100 },
  { id: "carey", name: "Carey", price: 300 }, { id: "baby-boomer", name: "Baby Boomer", price: 600 },
  { id: "blooming", name: "Blooming", price: 300 }, { id: "cat-eye", name: "Cat Eye", price: 500 },
  { id: "relieve", name: "Relieve", price: 300 }, { id: "three-d", name: "3D", price: 700 },
  { id: "nail-art", name: "Nail Art", price: 500 }
];

let selectedService = "";
let selectedWithdrawal = "";
let activeModalMode = "services";

const quantities = Object.fromEntries(decorations.map(item => [item.id, 0]));
const money = value => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

function renderServices() {
  const serviceCard = (service, groupName, selectedVal, isCheckbox = false) => `
    <div>
      <input class="service-option sr-only" type="${isCheckbox ? 'checkbox' : 'radio'}" name="${groupName}" id="${service.id}" value="${service.id}" ${selectedVal === service.id ? "checked" : ""}>
      <label for="${service.id}" class="block cursor-pointer rounded-2xl border border-[#f2dce4] p-4 transition bg-white hover:border-[#df95af]">
        <span class="block font-semibold text-[#55313f]">${service.name}</span>
        <span class="block text-sm text-[#b05077] font-bold mt-1">${money(service.price)}</span>
      </label>
    </div>`;

  document.getElementById("service-grid").innerHTML = services.map(s => serviceCard(s, "service", selectedService)).join("");
  document.getElementById("withdrawal-grid").innerHTML = withdrawals.map(w => serviceCard(w, "withdrawal", selectedWithdrawal, true)).join("");

  document.querySelectorAll("#service-grid input").forEach(input => input.addEventListener("change", () => {
    selectedService = input.value;
    updateInvoice();
  }));

  document.querySelectorAll("#withdrawal-grid input").forEach(input => input.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.querySelectorAll("#withdrawal-grid input").forEach(i => { if (i !== e.target) i.checked = false; });
      selectedWithdrawal = e.target.value;
    } else {
      selectedWithdrawal = "";
    }
    updateInvoice();
  }));
}

function renderDecorations() {
  document.getElementById("decoration-list").innerHTML = decorations.map((item, index) => `
    <tr class="${index % 2 === 0 ? "bg-[#fffafd]" : "bg-white"} border-t border-[#f7e8ee]">
      <td class="px-5 py-3 text-sm font-bold text-[#aa5376]">${money(item.price)}</td>
      <td class="px-5 py-3 font-medium">${item.name}</td>
      <td class="px-5 py-3">
        <div class="number-control flex items-center justify-center gap-3">
          <button type="button" class="w-7 h-7 rounded-full bg-[#fde6ee] text-[#ad5073] font-bold" data-action="minus" data-id="${item.id}" aria-label="Restar una uña con ${item.name}">−</button>
          <output id="quantity-${item.id}" class="w-5 text-center font-bold" aria-live="polite">${quantities[item.id] || 0}</output>
          <button type="button" class="w-7 h-7 rounded-full bg-[#f6cddd] text-[#8f365a] font-bold" data-action="plus" data-id="${item.id}" aria-label="Sumar una uña con ${item.name}">+</button>
        </div>
      </td>
    </tr>`).join("");

  document.getElementById("decoration-list").onclick = event => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const id = button.dataset.id;
    quantities[id] = Math.max(0, Math.min(10, (quantities[id] || 0) + (button.dataset.action === "plus" ? 1 : -1)));
    document.getElementById("quantity-" + id).textContent = quantities[id];
    updateInvoice();
  };
}

function updateInvoice() {
  const service = services.find(item => item.id === selectedService);
  const withdrawal = withdrawals.find(item => item.id === selectedWithdrawal);
  const servicePrice = service ? service.price : 0;
  const withdrawalPrice = withdrawal ? withdrawal.price : 0;
  
  const extras = decorations.filter(item => quantities[item.id] > 0);
  const extrasTotal = extras.reduce((sum, item) => sum + item.price * quantities[item.id], 0);

  document.getElementById("summary-service-price").textContent = money(servicePrice);
  document.getElementById("summary-service-name").textContent = service ? service.name : "Elegí un servicio para comenzar";

  let extrasHTML = "";
  if (withdrawal) {
    extrasHTML += `
      <div class="flex justify-between gap-3 text-[#764054] font-semibold">
        <span>${withdrawal.name}</span>
        <strong>${money(withdrawalPrice)}</strong>
      </div>`;
  }
  extrasHTML += extras.map(item => `
    <div class="flex justify-between gap-3 text-[#764054]">
      <span>${item.name} · ${quantities[item.id]} uña${quantities[item.id] !== 1 ? "s" : ""}</span>
      <strong>${money(item.price * quantities[item.id])}</strong>
    </div>`).join("");

  document.getElementById("extras-summary").innerHTML = extrasHTML;
  document.getElementById("no-extras-message").classList.toggle("hidden", extras.length > 0 || withdrawal);
  
  document.getElementById("grand-total").textContent = money(servicePrice + withdrawalPrice + extrasTotal);
}

/* Modal de Edición */
function openModal(mode) {
  activeModalMode = mode;
  const title = document.getElementById("price-modal-title");
  const desc = document.getElementById("price-modal-description");
  const container = document.getElementById("price-inputs");

  if (mode === "services") {
    title.textContent = "Editar Servicios y Retiros";
    desc.textContent = "Ajustá los precios de tus servicios principales:";
    const allItems = [...services, ...withdrawals];
    container.innerHTML = allItems.map(service => `
      <div>
        <label for="price-${service.id}" class="block text-sm font-semibold mb-2 text-[#704054]">${service.name}</label>
        <div class="relative">
          <span class="absolute left-4 top-3 text-[#a9466c] font-bold">$</span>
          <input id="price-${service.id}" data-id="${service.id}" type="number" min="0" step="100" value="${service.price}" class="w-full rounded-xl border border-[#edcad7] bg-white px-8 py-3 text-[#56313f] font-semibold">
        </div>
      </div>`).join("");
  } else {
    title.textContent = "Editar Decoraciones y Nail Art";
    desc.textContent = "Modificá el nombre de la técnica y el precio por uña:";
    container.innerHTML = decorations.map(item => `
      <div class="bg-[#fff8fa] p-3 rounded-xl border border-[#f5dde6] space-y-2">
        <div>
          <label class="block text-xs font-semibold text-[#704054] mb-1">Nombre Técnica</label>
          <input id="name-${item.id}" data-id="${item.id}" type="text" value="${item.name}" class="w-full rounded-lg border border-[#edcad7] px-3 py-1.5 text-sm font-semibold text-[#56313f]">
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#704054] mb-1">Precio x uña ($)</label>
          <input id="price-${item.id}" data-id="${item.id}" type="number" min="0" step="50" value="${item.price}" class="w-full rounded-lg border border-[#edcad7] px-3 py-1.5 text-sm font-semibold text-[#56313f]">
        </div>
      </div>`).join("");
  }

  const modal = document.getElementById("price-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  const modal = document.getElementById("price-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

/* Modal de Comprobante Dibujado */
function openInvoiceModal() {
  const service = services.find(item => item.id === selectedService);
  const withdrawal = withdrawals.find(item => item.id === selectedWithdrawal);
  const extras = decorations.filter(item => quantities[item.id] > 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit', year: 'numeric' }) + " - " + now.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });
  document.getElementById("invoice-date").textContent = "Fecha: " + dateStr;

  let itemsHTML = "";
  if (service) {
    itemsHTML += `
      <div class="flex justify-between font-semibold text-[#442a35]">
        <span>${service.name}</span>
        <span>${money(service.price)}</span>
      </div>`;
  } else {
    itemsHTML += `<div class="italic text-[#a57083]">Sin servicio principal seleccionado</div>`;
  }

  if (withdrawal) {
    itemsHTML += `
      <div class="flex justify-between text-[#55313f]">
        <span>${withdrawal.name}</span>
        <span>${money(withdrawal.price)}</span>
      </div>`;
  }

  extras.forEach(item => {
    itemsHTML += `
      <div class="flex justify-between text-[#55313f]">
        <span>${item.name} (${quantities[item.id]} uña${quantities[item.id] !== 1 ? 's' : ''})</span>
        <span>${money(item.price * quantities[item.id])}</span>
      </div>`;
  });

  document.getElementById("invoice-items-list").innerHTML = itemsHTML;

  const total = (service ? service.price : 0) + (withdrawal ? withdrawal.price : 0) + extras.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
  document.getElementById("invoice-modal-total").textContent = money(total);

  const modal = document.getElementById("invoice-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeInvoiceModal() {
  const modal = document.getElementById("invoice-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

/* Descargar Comprobante como Imagen PNG */
function downloadInvoicePNG() {
  const card = document.getElementById("invoice-card-content");
  const button = document.getElementById("download-png-button");
  button.disabled = true;
  button.innerText = "Generando PNG...";

  html2canvas(card, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = `Comprobante_Nails_Briseida_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    button.disabled = false;
    button.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i> <span>Descargar PNG</span>`;
    lucide.createIcons();
  }).catch(err => {
    console.error(err);
    button.disabled = false;
    button.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i> <span>Descargar PNG</span>`;
    lucide.createIcons();
  });
}

function setStatus(message, success = true) {
  const status = document.getElementById("status-message");
  status.textContent = message;
  status.className = "text-center text-sm font-medium min-h-5 mt-4 " + (success ? "text-[#a9466c]" : "text-red-600");
  window.setTimeout(() => { if (status.textContent === message) status.textContent = ""; }, 3500);
}

/* Event Listeners */
document.getElementById("edit-prices-button").addEventListener("click", () => openModal("services"));
document.getElementById("edit-decorations-button").addEventListener("click", () => openModal("decorations"));
document.getElementById("close-modal-button").addEventListener("click", closeModal);
document.getElementById("cancel-prices-button").addEventListener("click", closeModal);
document.getElementById("price-modal").addEventListener("click", event => { if (event.target.id === "price-modal") closeModal(); });

document.getElementById("view-invoice-button").addEventListener("click", openInvoiceModal);
document.getElementById("close-invoice-x").addEventListener("click", closeInvoiceModal);
document.getElementById("close-invoice-button").addEventListener("click", closeInvoiceModal);
document.getElementById("download-png-button").addEventListener("click", downloadInvoicePNG);
document.getElementById("invoice-modal").addEventListener("click", event => { if (event.target.id === "invoice-modal") closeInvoiceModal(); });

document.getElementById("price-form").addEventListener("submit", event => {
  event.preventDefault();
  if (activeModalMode === "services") {
    const allItems = [...services, ...withdrawals];
    document.querySelectorAll("#price-inputs input").forEach(input => {
      const item = allItems.find(i => i.id === input.dataset.id);
      if (item) item.price = Math.max(0, Number(input.value) || 0);
    });
    renderServices();
  } else {
    decorations.forEach(item => {
      const nameInput = document.getElementById("name-" + item.id);
      const priceInput = document.getElementById("price-" + item.id);
      if (nameInput) item.name = nameInput.value.trim() || item.name;
      if (priceInput) item.price = Math.max(0, Number(priceInput.value) || 0);
    });
    renderDecorations();
  }
  updateInvoice();
  closeModal();
  setStatus("Datos actualizados correctamente.");
});

document.getElementById("reset-button").addEventListener("click", () => {
  selectedService = "";
  selectedWithdrawal = "";
  decorations.forEach(item => { quantities[item.id] = 0; });
  renderServices();
  renderDecorations();
  updateInvoice();
  setStatus("La calculadora se ha reiniciado.");
});

renderServices();
renderDecorations();
updateInvoice();
lucide.createIcons();