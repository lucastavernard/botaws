# 🤖 Bot Contextual Inteligente (Typebot) + Rastreamento de Conversão GA4 / GTM

Este repositório reúne a implementação do **Assistente Virtual Contextual (Typebot)** e do **Motor de Rastreamento de Cliques no WhatsApp (Google Analytics 4 & Google Tag Manager)** desenvolvidos para o portal da **AWS Water (Amazon Water Solutions)**.

---

## 🎯 Objetivo do Projeto

Aumentar a taxa de conversão de visitantes em leads qualificados no WhatsApp através de **abordagem proativa contextual**, medindo de ponta a ponta o impacto antes e depois da implantação do bot diretamente no **Google Analytics 4 (`G-8B4BWLRWDP`)**.

---

## ⚙️ Arquitetura e Funcionamento

### 1. Abordagem Proativa por Seção (`IntersectionObserver` + Dwell Time)
Arquivo: [`bot-contextual.js`](./bot-contextual.js)

Em vez de exibir apenas uma saudação genérica, o script monitora em tempo real em qual seção da página o visitante está navegando usando a API nativa `IntersectionObserver`:
- **Critério de Visibilidade (`threshold: 0.3`)**: A seção precisa estar com pelo menos **30% da sua área visível** na tela.
- **Tempo de Permanência (`Dwell Time: 8000ms`)**: Se o usuário permanecer lendo aquela seção por **8 segundos**, o bot exibe automaticamente um balão de mensagem (`Typebot.showPreviewMessage`) com uma pergunta técnica específica daquele setor.
- **Controle de Não-Repetição (`Set`)**: Cada mensagem setorial é exibida apenas uma vez por sessão (`shownSections`), evitando poluição visual.

#### Mapa de Mensagens Contextuais:
| ID da Seção (`#id`) | Contexto Técnico | Mensagem Disparada pelo Bot |
| :--- | :--- | :--- |
| `#produtos` | Sistemas de Tratamento | *"Olá! Precisa de ajuda para dimensionar ou escolher o sistema de tratamento ideal?"* |
| `#servicos` | Engenharia & Automação | *"Olá! Tem dúvidas sobre projetos, reformas de ETE/ETA ou automação industrial?"* |
| `#hospitalar` | Água Ultrapura / Anvisa | *"Olá! Precisa de água ultrapura para hemodiálise ou esterilização (RDC Anvisa)?"* |
| `#laboratorio` | Análises Físico-Químicas | *"Olá! Precisa de laudo técnico ou análise físico-química da água para sua empresa?"* |
| `#pecas` | Reposição e Insumos | *"Olá! Procurando membranas, válvulas ou peças de reposição a pronta-entrega?"* |

---

### 2. Rastreamento Automático de Cliques e Leads no WhatsApp (GA4 + GTM)
Arquivo: [`tracking-whatsapp-ga4.js`](./tracking-whatsapp-ga4.js)

Um listener global (`document.addEventListener('click', ...)`) intercepta cliques em qualquer botão ou link (`<a>`, `<button>`) do site e identifica automaticamente:
1. **Se é uma conversão de WhatsApp**: verifica atributos `href` (`wa.me`, `whatsapp`) e `onclick` (`openWapModal`).
2. **Qual Unidade Regional foi acionada**: classifica automaticamente entre:
   - `SC - Joinville` (Sul / Sudeste)
   - `PA - Belém` (Norte / Nordeste)
   - `GO - Goiânia` (Centro-Oeste)
   - `Geral`
3. **Disparo Duplo (`dataLayer` + `gtag`)**: envia os eventos diretamente para o Google Tag Manager e para o Google Analytics 4.

---

## 📊 Eventos Auditados no Google Analytics 4

| Nome do Evento GA4 | Quando é Disparado | Parâmetros Enviados |
| :--- | :--- | :--- |
| `typebot_preview_sector_shown` | Quando o visitante fica 8s em uma seção e o bot exibe a chamada contextual | `secao`, `mensagem` |
| `typebot_chat_opened` | Quando o visitante clica para abrir a janela de conversa do bot | `secao` (`secao_ativa`) |
| `click_whatsapp` | Quando o visitante clica em qualquer botão de redirecionamento para o WhatsApp | `unidade`, `nome_botao`, `link_destino`, `pagina` |
| `generate_lead` | Disparado junto ao clique de WhatsApp para contabilização oficial de conversão no GA4 | `event_category`, `event_label`, `value`, `currency` |

---

## 📂 Estrutura de Arquivos deste Repositório

```text
├── README.md                  # Documentação técnica e arquitetura do experimento
├── bot-contextual.js          # Módulo do Typebot + IntersectionObserver (gatilhos de 8s por seção)
├── tracking-whatsapp-ga4.js   # Módulo de rastreamento de cliques no WhatsApp e eventos GA4/GTM
├── index.html                 # Exemplo completo de integração HTML das seções + Bot + GA4
└── assets/
    └── botaws.jpg             # Avatar do assistente virtual AWS Water
```

