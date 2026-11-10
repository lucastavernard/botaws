/**
 * ============================================================================
 * RASTREAMENTO AUTOMÁTICO DE CLIQUES NO WHATSAPP (GTM & GA4)
 * Projeto: AWS Water (Amazon Water Solutions)
 * ============================================================================
 * Descrição:
 * Monitora todos os cliques em botões e links da página, identifica intenções
 * de contato via WhatsApp, classifica a unidade regional correspondente e
 * envia os eventos `click_whatsapp` e `generate_lead` para o GA4.
 */

document.addEventListener('click', function(e) {
  const btn = e.target.closest('button, a');
  if (!btn) return;

  const texto = (btn.innerText || btn.getAttribute('aria-label') || btn.title || 'Botão sem texto')
    .trim()
    .replace(/\s+/g, ' ');
  const link = btn.getAttribute('href') || '';
  const onclickAttr = btn.getAttribute('onclick') || '';

  // Verifica se o clique aciona um link ou modal de WhatsApp
  const isWhatsApp =
    link.includes('wa.me') ||
    link.includes('whatsapp') ||
    onclickAttr.includes('Wap') ||
    onclickAttr.includes('WhatsApp');

  // Identifica automaticamente a unidade regional da AWS Water
  let unidade = 'Geral';
  const checkStr = (texto + ' ' + link + ' ' + (btn.id || '')).toLowerCase();

  if (checkStr.includes('sc') || checkStr.includes('joinville') || checkStr.includes('992116018')) {
    unidade = 'SC - Joinville';
  } else if (checkStr.includes('pa') || checkStr.includes('belém') || checkStr.includes('belem') || checkStr.includes('981425152')) {
    unidade = 'PA - Belém';
  } else if (checkStr.includes('go') || checkStr.includes('goiânia') || checkStr.includes('goiania') || checkStr.includes('998373196')) {
    unidade = 'GO - Goiânia';
  }

  // 1. Envia para a camada de dados do Google Tag Manager (GTM)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: isWhatsApp ? 'click_whatsapp' : 'click_botao_geral',
    nome_botao: texto,
    link_destino: link,
    unidade: isWhatsApp ? unidade : undefined,
    pagina: window.location.pathname
  });

  // 2. Envio direto para o Google Analytics 4 (GA4)
  if (typeof gtag === 'function' && isWhatsApp) {
    gtag('event', 'click_whatsapp', {
      'unidade': unidade,
      'nome_botao': texto,
      'link_destino': link,
      'pagina': window.location.pathname
    });

    gtag('event', 'generate_lead', {
      'event_category': 'WhatsApp Lead',
      'event_label': `${unidade} - ${texto}`,
      'value': 1.0,
      'currency': 'BRL'
    });
  }
});

