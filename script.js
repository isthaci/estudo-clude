/* =========================================================
   CONFIGURAÇÕES GERAIS — ALTERE AQUI
   ========================================================= */

// ALTERE AQUI: número de WhatsApp do salão (com DDI + DDD, somente números)
// Exemplo: 55 (Brasil) + 81 (DDD) + número
const WHATSAPP_NUMBER = "5581999999999";

// ALTERE AQUI: nome do salão (usado na mensagem enviada pelo WhatsApp)
const SALON_NAME = "Espaço Rosé";

/* =========================================================
   MENU MOBILE
   ========================================================= */
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  const icon = navToggle.querySelector("i");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-xmark");
});

// Fecha o menu ao clicar em um link (mobile)
document.querySelectorAll(".nav__link, .nav__cta").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
    const icon = navToggle.querySelector("i");
    icon.classList.add("fa-bars");
    icon.classList.remove("fa-xmark");
  });
});

/* =========================================================
   MONTAGEM AUTOMÁTICA DOS CHECKBOXES DE ORÇAMENTO
   (lê os cards da seção de Serviços para não duplicar dados)
   ========================================================= */
const serviceCards = document.querySelectorAll(".service-card");
const checkboxesContainer = document.getElementById("budgetCheckboxes");

const services = [];

serviceCards.forEach((card, index) => {
  const name = card.dataset.service;
  const price = parseFloat(card.dataset.price);

  // Serviço "Alongamento de unhas" ainda não tem preço definido — não entra no orçamento
  if (!price || price <= 0) return;

  services.push({ name, price });

  const id = `service-${index}`;
  const label = document.createElement("label");
  label.classList.add("budget__checkbox");
  label.setAttribute("for", id);
  label.innerHTML = `
    <input type="checkbox" id="${id}" value="${name}" data-price="${price}">
    <span>${name}</span>
    <small>R$ ${price.toFixed(2).replace(".", ",")}</small>
  `;
  checkboxesContainer.appendChild(label);
});

/* =========================================================
   BOTÃO "QUERO ESTE SERVIÇO" NOS CARDS
   Marca o checkbox correspondente e rola até o orçamento
   ========================================================= */
document.querySelectorAll(".btn-add-service").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".service-card");
    const serviceName = card.dataset.service;

    const checkbox = [...checkboxesContainer.querySelectorAll("input[type=checkbox]")]
      .find(input => input.value === serviceName);

    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));
    }

    document.getElementById("orcamento").scrollIntoView({ behavior: "smooth" });
  });
});

/* =========================================================
   CÁLCULO DO ORÇAMENTO EM TEMPO REAL
   ========================================================= */
const budgetTotalEl = document.getElementById("budgetTotal");
const budgetHint = document.getElementById("budgetHint");
const sendWhatsappBtn = document.getElementById("sendWhatsapp");

function formatCurrency(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

function getSelectedServices() {
  return [...checkboxesContainer.querySelectorAll("input[type=checkbox]:checked")]
    .map(input => ({ name: input.value, price: parseFloat(input.dataset.price) }));
}

function updateBudget() {
  const selected = getSelectedServices();
  const total = selected.reduce((sum, item) => sum + item.price, 0);

  budgetTotalEl.textContent = formatCurrency(total);
  budgetHint.textContent = selected.length
    ? `${selected.length} serviço(s) selecionado(s).`
    : "Selecione ao menos um serviço para continuar.";
}

checkboxesContainer.addEventListener("change", (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    e.target.closest(".budget__checkbox").classList.toggle("checked", e.target.checked);
    updateBudget();
  }
});

/* =========================================================
   ENVIO DO ORÇAMENTO PELO WHATSAPP
   ========================================================= */
sendWhatsappBtn.addEventListener("click", () => {
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const date = document.getElementById("clientDate").value;
  const time = document.getElementById("clientTime").value;
  const notes = document.getElementById("clientNotes").value.trim();

  const selected = getSelectedServices();

  if (!name) {
    alert("Por favor, informe o nome da cliente.");
    document.getElementById("clientName").focus();
    return;
  }
  if (!phone) {
    alert("Por favor, informe o telefone/WhatsApp para contato.");
    document.getElementById("clientPhone").focus();
    return;
  }
  if (selected.length === 0) {
    alert("Selecione pelo menos um serviço para solicitar o orçamento.");
    return;
  }

  const total = selected.reduce((sum, item) => sum + item.price, 0);

  const dateFormatted = date
    ? new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
    : "Não informada";
  const timeFormatted = time || "Não informado";

  const servicesList = selected.map(s => `• ${s.name} (${formatCurrency(s.price)})`).join("\n");

  const message =
`Olá, ${SALON_NAME}! 💅
Gostaria de solicitar um orçamento:

*Nome:* ${name}
*Telefone:* ${phone}

*Serviços escolhidos:*
${servicesList}

*Data desejada:* ${dateFormatted}
*Horário desejado:* ${timeFormatted}
*Valor estimado:* ${formatCurrency(total)}

*Observações:* ${notes || "Nenhuma"}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
});

/* =========================================================
   LINKS DE WHATSAPP (topo, contato, botão flutuante)
   ========================================================= */
function setWhatsappLinks() {
  const defaultMessage = encodeURIComponent(`Olá, ${SALON_NAME}! Gostaria de mais informações.`);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`;

  const contactWhatsapp = document.getElementById("contactWhatsapp");
  const floatingWhatsapp = document.getElementById("floatingWhatsapp");

  if (contactWhatsapp) contactWhatsapp.href = url;
  if (floatingWhatsapp) floatingWhatsapp.href = url;
}
setWhatsappLinks();

/* =========================================================
   DATA MÍNIMA NO CAMPO "DATA DESEJADA" (não permite datas passadas)
   ========================================================= */
const dateInput = document.getElementById("clientDate");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}

/* =========================================================
   ANO ATUAL NO RODAPÉ
   ========================================================= */
document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================================
   DESTAQUE DO LINK ATIVO NO MENU CONFORME O SCROLL
   ========================================================= */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle("active-link", link.getAttribute("href") === `#${current}`);
  });
});

// Inicializa o total do orçamento
updateBudget();
