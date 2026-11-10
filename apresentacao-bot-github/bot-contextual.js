/**
 * ============================================================================
 * BOT CONTEXTUAL INTELIGENTE (TYPEBOT + INTERSECTION OBSERVER)
 * Projeto: AWS Water (Amazon Water Solutions)
 * ============================================================================
 * Descrição:
 * Inicializa o widget flutuante do Typebot e utiliza a API IntersectionObserver
 * para detectar em qual seção do site o usuário permaneceu por 8 segundos,
 * disparando abordagens proativas personalizadas e registrando eventos no GA4.
 */

import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';
window.Typebot = Typebot;

// Mensagem inicial padrão e imagem de avatar do assistente
const defaultMessage = "Olá! Posso ajudar com seu orçamento ou dúvida técnica?";
const avatarUrl = "assets/botaws.jpg";

// Dicionário de mensagens contextuais mapeadas pelo ID de cada seção (<section id="...">)
const sectorMessages = {
  'produtos': 'Olá! Precisa de ajuda para dimensionar ou escolher o sistema de tratamento ideal?',
  'servicos': 'Olá! Tem dúvidas sobre projetos, reformas de ETE/ETA ou automação industrial?',
  'hospitalar': 'Olá! Precisa de água ultrapura para hemodiálise ou esterilização (RDC Anvisa)?',
  'laboratorio': 'Olá! Precisa de laudo técnico ou análise físico-química da água para sua empresa?',
  'pecas': 'Olá! Procurando membranas, válvulas ou peças de reposição a pronta-entrega?'
};

let dwellTimer = null;
let currentActiveSection = null;
const shownSections = new Set(); // Garante que cada seção só dispare o preview 1 vez por visita

// 1. Inicialização do Bubble (Botão Flutuante) do Typebot
Typebot.initBubble({
  typebot: "my-typebot-fkyr9vq",
  previewMessage: {
    message: defaultMessage,
    autoShowDelay: 8000,
    avatarUrl: avatarUrl,
  },
  theme: {
    button: { backgroundColor: "#0042DA", iconColor: "#FFFFFF" },
    chatWindow: { backgroundColor: "#FFFFFF" },
  },
  // Callback acionado quando o visitante abre o chat do bot
  onOpen: () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'typebot_chat_opened',
      secao_ativa: currentActiveSection || 'geral'
    });

    if (typeof gtag === 'function') {
      gtag('event', 'typebot_chat_opened', {
        'secao': currentActiveSection || 'geral'
      });
    }
  }
});

// 2. Observer de Seções (Dwell Time de 8 segundos com 30% da seção visível)
function setupSectorObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.id;

      // Se pelo menos 30% da seção está visível na tela do usuário
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        clearTimeout(dwellTimer);
        currentActiveSection = sectionId;

        // Inicia contagem de 8 segundos de leitura na seção
        dwellTimer = setTimeout(() => {
          if (sectorMessages[sectionId] && !shownSections.has(sectionId)) {
            shownSections.add(sectionId);

            // Exibe a mensagem contextual da seção no balão do bot
            Typebot.showPreviewMessage({
              message: sectorMessages[sectionId],
              avatarUrl: avatarUrl
            });

            // Registra o disparo no Google Tag Manager (dataLayer) e Google Analytics 4 (gtag)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'typebot_preview_sector_shown',
              secao: sectionId,
              mensagem: sectorMessages[sectionId]
            });

            if (typeof gtag === 'function') {
              gtag('event', 'typebot_preview_sector_shown', {
                'secao': sectionId,
                'mensagem': sectorMessages[sectionId]
              });
            }
          }
        }, 8000);
      } else if (currentActiveSection === sectionId) {
        // Se o usuário saiu da seção antes dos 8 segundos, cancela o timer
        clearTimeout(dwellTimer);
      }
    });
  }, { threshold: [0.3] });

  // Conecta o observer a todas as seções mapeadas no dicionário
  Object.keys(sectorMessages).forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// Inicializa assim que o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSectorObserver);
} else {
  setupSectorObserver();
}

