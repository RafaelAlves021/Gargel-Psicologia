/**
 * GARGEL PSICOLOGIA - SCRIPT PRINCIPAL
 * Funcionalidades: Horário em tempo real, animações no scroll, validação e envio WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. CONFIGURAÇÕES GERAIS EDITÁVEIS =================
  const CLINIC_CONFIG = {
    whatsappNumber: "5521976658813", // DDI + DDD + Telefone sem traços
    closingHour: 22,                  // Horário limite (22:00)
    openingHour: 8,                   // Horário início (08:00)
    openDays: [1, 2, 3, 4, 5],        // Segunda (1) a Sexta (5)
    saturdayOpen: 8,                  // Sábado início
    saturdayClose: 14                 // Sábado término
  };

  // ================= 2. STATUS EM TEMPO REAL (ABERTO / FECHADO) =================
  const updateBusinessStatus = () => {
    const statusHeroElement = document.getElementById('businessStatusBadge');
    const statusDetailElement = document.getElementById('statusPillDetail');
    if (!statusHeroElement && !statusDetailElement) return;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const currentHour = now.getHours();

    let isOpen = false;

    // Regra de Segunda a Sexta
    if (CLINIC_CONFIG.openDays.includes(currentDay)) {
      if (currentHour >= CLINIC_CONFIG.openingHour && currentHour < CLINIC_CONFIG.closingHour) {
        isOpen = true;
      }
    } 
    // Regra de Sábado
    else if (currentDay === 6) {
      if (currentHour >= CLINIC_CONFIG.saturdayOpen && currentHour < CLINIC_CONFIG.saturdayClose) {
        isOpen = true;
      }
    }

    const statusText = isOpen ? "Aberto agora" : "Fechado no momento";
    const statusClass = isOpen ? "status-open" : "status-closed";

    if (statusHeroElement) {
      statusHeroElement.textContent = statusText;
      statusHeroElement.className = `d-block fw-bold small ${isOpen ? 'text-success' : 'text-muted'}`;
    }

    if (statusDetailElement) {
      statusDetailElement.textContent = `${statusText} (Atendimento até 22h)`;
      statusDetailElement.className = `badge status-pill ${statusClass}`;
    }
  };

  updateBusinessStatus();

  // ================= 3. NAVBAR E ROLAGEM SUAVE =================
  const navbar = document.getElementById('mainNavbar');
  const btnBackToTop = document.getElementById('btnBackToTop');
  const navbarCollapse = document.getElementById('navbarContent');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Efeito de sombra e blur na navbar
    if (scrollPos > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Botão Voltar ao Topo
    if (scrollPos > 400) {
      btnBackToTop.classList.add('show');
    } else {
      btnBackToTop.classList.remove('show');
    }
  });

  // Fechamento automático da navbar no mobile ao clicar em link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  // Ação do botão voltar ao topo
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= 4. ANIMAÇÕES REVEAL NO SCROLL (INTERSECTION OBSERVER) =================
  const animatedElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target); // Anima uma única vez
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback para navegadores legados
    animatedElements.forEach(el => el.classList.add('is-revealed'));
  }

  // ================= 5. FORMULÁRIO COM ROTEAMENTO PARA WHATSAPP =================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const nameInput = document.getElementById('formName');
      const phoneInput = document.getElementById('formPhone');
      const modalityInput = document.getElementById('formModality');
      const messageInput = document.getElementById('formMessage');

      // Validação nativa do Bootstrap
      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated');
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const modality = modalityInput.value;
      const notes = messageInput.value.trim();

      // Monta texto formatado e codificado para a URL do WhatsApp
      let text = `Olá, Carlos! Vim pelo site da Gargel Psicologia e gostaria de informações sobre atendimento.%0A%0A`;
      text += `*Nome:* ${encodeURIComponent(name)}%0A`;
      text += `*Telefone:* ${encodeURIComponent(phone)}%0A`;
      text += `*Modalidade:* ${encodeURIComponent(modality)}`;

      if (notes.length > 0) {
        text += `%0A*Observação:* ${encodeURIComponent(notes)}`;
      }

      const whatsappUrl = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${text}`;
      
      // Abre a conversa no WhatsApp em uma nova aba
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      // Limpeza do formulário
      contactForm.reset();
      contactForm.classList.remove('was-validated');
    });
  }

});