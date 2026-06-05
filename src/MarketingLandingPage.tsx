import React, { useState } from 'react';
import {
  Clock,
  Users,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ArrowRight
} from 'lucide-react';

const InstagramIcon = ({ size = 20, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface MarketingLandingPageProps {
  inviteToken: string | null;
  onNavigateToAuth: () => void;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  inviteToken,
  onNavigateToAuth
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCopyCaption = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleActionClick = () => {
    if (inviteToken) {
      // Navigate to signup with token
      window.location.search = `?invite=${inviteToken}`;
    } else {
      onNavigateToAuth();
    }
  };

  const faqs = [
    {
      q: 'Preciso saber programar para participar do evento?',
      a: 'De forma alguma! O Método Guide foi feito justamente para que empresários, profissionais liberais e mentes criativas consigam construir automações e aplicativos do zero sem escrever uma única linha de código tradicional. A IA cuida da escrita, e você gerencia o produto.'
    },
    {
      q: 'O que preciso levar no dia da imersão?',
      a: 'Seu notebook e o respectivo carregador são itens obrigatórios. Toda a imersão é hands-on: você estará com o computador aberto construindo suas próprias soluções ao longo de todo o dia.'
    },
    {
      q: 'Onde será realizado o evento e como faço para chegar?',
      a: 'O evento acontecerá no Auditório Müller Centro Empresarial, em Estância Velha, RS. É um ambiente corporativo premium com infraestrutura completa de conectividade, tomadas dedicadas e espaço lounge para o networking.'
    },
    {
      q: 'O ticket do evento inclui alimentação?',
      a: 'Sim! Teremos um coffee break completo incluso na programação, desenhado para recarregar as energias e maximizar a interação e o networking direto entre os participantes e palestrantes.'
    },
    {
      q: 'Por que o cadastro é restrito por convites?',
      a: 'Como nossa proposta é 100% prática e conta com mentoria individual e em bancadas corporativas, as vagas são extremamente limitadas para garantir o alto nível do networking e da entrega. Por isso, a entrada é controlada apenas via convites nominais ou tokens gerais rotacionados.'
    }
  ];

  const instagramPosts = [
    {
      category: 'Atração / Gancho',
      title: '❌ Chega de pagar caro por softwares prontos',
      visual: 'Carrossel Estilo Hacker: Slide 1 com fundo escuro e letras verdes em destaque "Crie seus próprios apps". Slide 2 mostrando ferramentas tradicionais vs criação ágil com IA.',
      caption: `Você já parou para calcular quanto sua empresa gasta por ano em assinaturas de softwares que não fazem exatamente o que você precisa? 💸

A era de ficar refém de ferramentas prontas acabou. Na imersão AI EXPERIENCE, vamos provar que você pode construir seu próprio ecossistema de ferramentas corporativas em poucas horas utilizando IA.

No dia 15 de Agosto, no Auditório Müller Centro Empresarial, vamos tirar a teoria do papel e fazer acontecer.

👉 Garanta sua vaga com seu link de convite VIP.
#AIExperience #EstanciaVelha #InteligenciaArtificial #Tecnologia #HackerVibe`
    },
    {
      category: 'Autoridade / Método',
      title: '⚙️ O que é o Método Guide?',
      visual: 'Imagem Premium: Thiago Diaz no palco programando no telão, com gráficos brilhantes e sobreposições em neon azul/verde mostrando os 3 pilares.',
      caption: `10x mais rápido. 100% hands-on. 1 App real publicado antes do final do dia. 🚀

Isso não é uma promessa teórica, é o Método Guide ensinado por Thiago Diaz. Um framework simplificado em 3 etapas:
1️⃣ Arquitetura Visual (esboce sua interface como pensa)
2️⃣ Logic Injection (IA gera a lógica de banco em segundos)
3️⃣ Instant Deploy (aplicativo publicado com domínio próprio)

Construído para quem quer resultado, sem rodeios e sem teoria morta.

Quer aprender a construir na prática? Nos vemos no dia 15 de Agosto!
#MetodoGuide #VibeCoding #Builderz #EstanciaVelha #ImersaoPratica`
    },
    {
      category: 'Prova Social / Prova Local',
      title: '📍 Estância Velha na rota da IA',
      visual: 'Carrossel Dinâmico: Slide 1 com mapa de Estância Velha brilhando no radar de inovação. Slide 2 com foto dos organizadores locais Eduardo Both e Gabriel Müller ao lado de Thiago Diaz.',
      caption: `Quem disse que inovação tecnológica de ponta só acontece em capitais? 🗺️

Estância Velha foi selecionada como parada oficial do AI Experience! Uma iniciativa promovida pelos empresários locais Eduardo Both e Gabriel Müller para conectar o ecossistema de negócios do Vale do Sinos com o que há de mais moderno na criação de software com IA.

Traga seu notebook e prepare-se para 8 horas de pura imersão no Auditório Müller Centro Empresarial.

Apenas para quem possui o convite exclusivo. Acesse o painel e confirme sua inscrição!
#EstanciaVelha #ValeDoSinos #Networking #Empreendedorismo #IA`
    }
  ];

  return (
    <div className="mkt-container">
      {/* Decorative Glows */}
      <div className="ambient-glow-1" style={{ opacity: 0.5 }}></div>
      <div className="ambient-glow-2" style={{ opacity: 0.5 }}></div>

      {/* Floating Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '70px', background: 'rgba(5, 8, 22, 0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', zIndex: 100, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#fff' }}>AI</span>
            <span style={{ color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>EXPERIENCE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {inviteToken && (
              <span className="hide-mobile" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                Convite Ativo: {inviteToken.substring(0, 8)}...
              </span>
            )}
            <button
              onClick={handleActionClick}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
              }}
            >
              Garantir Minha Vaga <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mkt-hero">
        <div className="mkt-badge-host">
          Eduardo Both & Gabriel Müller Apresentam
        </div>
        <h1 className="mkt-h1">AI EXPERIENCE</h1>
        <h1 className="mkt-h1-accent">ESTÂNCIA VELHA</h1>
        <p className="mkt-subtitle">
          Construa sistemas, aplicativos e automações corporativas reais ao vivo, usando inteligência artificial. Sem teoria morta, 100% hands-on.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleActionClick}
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            Inscrever-se com Token <ArrowRight size={16} />
          </button>
          <a
            href="#cronograma"
            className="btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            Ver Cronograma
          </a>
        </div>

        {/* Small details */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '60px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <Clock size={20} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>DATA</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>15 de Agosto</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <MapPin size={20} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>LOCAL</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Auditório Müller</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <Users size={20} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>VAGAS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Altamente Limitadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP & LOCATION SECTION (1º Print Requirement) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="mkt-geo-grid">
          <div>
            <span className="mkt-section-label">[ 01 ] · GEO TRACE</span>
            <h2 className="mkt-section-title" style={{ fontSize: '2.8rem', lineHeight: '1' }}>
              ROTA DE INOVAÇÃO.
            </h2>
            <h2 className="builderz-outlined-text" style={{ fontSize: '2.8rem', lineHeight: '1', marginBottom: '24px' }}>
              PRÓXIMA PARADA: RS.
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              O AI Experience está cruzando regiões estratégicas de empreendedorismo de alta tecnologia. Trazemos a imersão diretamente para o ecossistema do Vale do Sinos, pousando estrategicamente em **Estância Velha**.
            </p>
            <div style={{ background: 'rgba(16, 185, 129, 0.03)', borderLeft: '3px solid #10B981', padding: '16px', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                Auditório Müller Centro Empresarial
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.4' }}>
                Infraestrutura corporativa projetada para receber empreendedores de ponta, tomadas dedicadas e conectividade extrema.
              </div>
            </div>
          </div>

          <div className="mkt-map-container">
            {/* Brazil Map Stylized Vector (High Tech Grid Style) */}
            <svg viewBox="0 0 500 500" style={{ width: '100%', height: 'auto', maxHeight: '380px' }}>
              {/* Simplified Brazil Outline path */}
              <path 
                d="M 230 50 L 290 60 L 330 90 L 370 80 L 410 120 L 430 160 L 410 180 L 390 200 L 410 230 L 400 260 L 370 280 L 350 310 L 355 330 L 330 360 L 310 350 L 300 370 L 280 390 L 260 380 L 270 410 L 250 440 L 260 460 L 230 460 L 235 440 L 220 410 L 230 385 L 210 375 L 205 345 L 180 340 L 160 320 L 140 280 L 125 285 L 110 260 L 95 240 L 90 215 L 115 190 L 125 155 L 155 140 L 175 160 L 210 150 L 220 100 Z" 
                fill="none" 
                stroke="rgba(255,255,255,0.06)" 
                strokeWidth="1.5"
              />
              <path 
                d="M 230 50 L 290 60 L 330 90 L 370 80 L 410 120 L 430 160 L 410 180 L 390 200 L 410 230 L 400 260 L 370 280 L 350 310 L 355 330 L 330 360 L 310 350 L 300 370 L 280 390 L 260 380 L 270 410 L 250 440 Z" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="2" 
                strokeDasharray="6 4"
                opacity="0.3"
              />
              
              {/* Highlight Pins on Route */}
              <circle cx="370" cy="280" r="4" fill="rgba(255,255,255,0.3)" /> {/* SP */}
              <circle cx="330" cy="360" r="4" fill="rgba(255,255,255,0.3)" /> {/* Curitiba */}
              <circle cx="300" cy="370" r="4" fill="rgba(255,255,255,0.3)" /> {/* Florianópolis */}
              <circle cx="270" cy="410" r="4" fill="rgba(255,255,255,0.3)" /> {/* Porto Alegre */}

              {/* ACTIVE TARGET: ESTÂNCIA VELHA (RS) */}
              <g>
                <circle cx="250" cy="440" r="14" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1">
                  <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="250" cy="440" r="5" fill="#10B981" />
                <path d="M 250 440 L 170 420" stroke="#10B981" strokeWidth="1" opacity="0.6" strokeDasharray="3 2" />
                
                {/* Text Pointer */}
                <rect x="70" y="390" width="105" height="40" rx="6" fill="#06091e" stroke="#10B981" strokeWidth="1" />
                <text x="122" y="408" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Estância Velha</text>
                <text x="122" y="422" fill="#10B981" fontSize="8" textAnchor="middle" fontFamily="monospace">15 DE AGOSTO</text>
              </g>

              {/* Grid dots overlay */}
              <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.03)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-dots)" pointerEvents="none" />
            </svg>
          </div>
        </div>
      </section>

      {/* METHOD SECTION (2º Print Requirement) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 02 ] · THE METHOD</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">O MÉTODO GUIDE</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            A gente largou o ensino tradicional. No palco, do zero ao deploy, expondo todos os atalhos do stack mais rápido do mercado. Você sai com seu app no ar - não com uma apostila.
          </p>
        </div>

        <div className="mkt-method-grid">
          <div>
            <div className="mkt-method-step">
              <span className="mkt-method-step-num">01 / ARQUITETURA VISUAL</span>
              <h3 className="mkt-method-step-title">Brief vira tela em minutos</h3>
              <p className="mkt-method-step-desc">
                Chega de mockups estáticos e burocracia. Você aprende a esboçar e estruturar as interfaces da sua aplicação de forma visual, gerando telas completas como pensa.
              </p>
            </div>
            <div className="mkt-method-step">
              <span className="mkt-method-step-num">02 / LOGIC INJECTION</span>
              <h3 className="mkt-method-step-title">A IA escreve, você decide</h3>
              <p className="mkt-method-step-desc">
                Cada componente desenhado se conecta instantaneamente a uma base de dados real. A IA traduz suas instruções de negócio em códigos funcionais, integrando cadastros, regras e relatórios.
              </p>
            </div>
            <div className="mkt-method-step">
              <span className="mkt-method-step-num">03 / INSTANT DEPLOY</span>
              <h3 className="mkt-method-step-title">Publicado ao vivo com domínio próprio</h3>
              <p className="mkt-method-step-desc">
                Nada de executar apenas localmente. Seu projeto vai para nuvem em tempo de execução, pronto para ser utilizado no seu notebook ou smartphone antes do café da tarde acabar.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="mkt-stats-grid">
              <div className="mkt-stat-card">
                <span className="mkt-stat-label">MAIS RÁPIDO</span>
                <span className="mkt-stat-val">10x</span>
              </div>
              <div className="mkt-stat-card">
                <span className="mkt-stat-label">PRÁTICO</span>
                <span className="mkt-stat-val">100%</span>
              </div>
              <div className="mkt-stat-card">
                <span className="mkt-stat-label">APP PUBLICADO</span>
                <span className="mkt-stat-val">01</span>
              </div>
              <div className="mkt-stat-card">
                <span className="mkt-stat-label">IDEIAS</span>
                <span className="mkt-stat-val">∞</span>
              </div>
            </div>

            <div style={{ background: 'rgba(5, 8, 22, 0.4)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
              <div style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> QUOTE DO MENTOR
              </div>
              <p style={{ color: '#f3f4f6', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.5', margin: 0, fontFamily: 'monospace' }}>
                "A gente não ensina ferramenta. A gente ensina uma forma nova de pensar a criação de software – menos fricção, mais lançamento."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS & AUDITORIUM IMAGES (3º Print Requirement) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 03 ] · A EXPERIÊNCIA</span>
        <div className="mkt-section-header" style={{ marginBottom: '48px' }}>
          <h2 className="mkt-section-title">UM DIA DE EVENTO</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            A atmosfera de uma bancada de desenvolvimento com foco em entrega real.
          </p>
        </div>

        <div className="mkt-steps-grid">
          <div className="mkt-step-card">
            <img src="/event_auditorium.png" alt="Check-in no Auditório Müller" className="mkt-step-img" style={{ filter: 'hue-rotate(280deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label">STEP 01</span>
              <h3 className="mkt-step-title">CHECK-IN</h3>
              <p className="mkt-step-desc">
                Bancada montada, kit do builder na mão, conexão dedicada e o café pronto para dar a partida nas atividades do dia.
              </p>
            </div>
          </div>

          <div className="mkt-step-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.05)' }}>
            <img src="/event_auditorium.png" alt="Live Build ao Vivo" className="mkt-step-img" style={{ filter: 'hue-rotate(90deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label" style={{ color: '#10B981' }}>STEP 02</span>
              <h3 className="mkt-step-title">LIVE BUILD</h3>
              <p className="mkt-step-desc">
                Thiago Diaz programa um aplicativo real ao vivo no telão, expondo as integrações de banco de dados e lógica com IA.
              </p>
            </div>
          </div>

          <div className="mkt-step-card">
            <img src="/event_auditorium.png" alt="Instant Deploy de Apps" className="mkt-step-img" style={{ filter: 'hue-rotate(200deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label">STEP 03</span>
              <h3 className="mkt-step-title">DEPLOY</h3>
              <p className="mkt-step-desc">
                Projetos individuais publicados online com link de acesso funcional. Comunidade de novos builders formada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICIAL TIMELINE / SCHEDULE (4º, 5º e 6º Prints Requirement) */}
      <span id="cronograma"></span>
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="builderz-timeline-container" style={{ background: 'transparent !important', border: 'none', padding: 0, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '20px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontFamily: 'monospace', color: '#10B981', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                [ 04 ] · CRONOGRAMA
              </div>
              <h2 className="builderz-main-title">8 HORAS.</h2>
              <h2 className="builderz-main-title builderz-outlined-text">SEM TEORIA MORTA.</h2>
            </div>
            <div style={{ maxWidth: '300px', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', lineHeight: '1.4' }} className="hide-mobile">
              8 horas de imersão de conteúdo na prática. A sequência de blocos é otimizada para o máximo aprendizado.
            </div>
          </div>

          <div className="builderz-timeline" style={{ marginTop: '32px' }}>
            {[
              { duration: '30min', title: 'Check-in', desc: 'Café, kit do builder, setup da máquina e ice-breaker.' },
              { duration: '20min', title: 'IA First', desc: 'Como a IA virou o motor da evolução do software.' },
              { duration: '20min', title: 'A Era do Selfware', desc: 'DIY com IA: ao invés de contratar serviços, construa sob medida. Scripts e automações que otimizam o seu dia.' },
              { duration: '20min', title: 'IA Criadora de Apps', desc: 'Panorama das plataformas que constroem apps por IA.' },
              { duration: '40min', title: 'Design é Tudo', desc: 'Design System, skills e dicas para interfaces que vendem.' },
              { duration: '20min', title: 'O Método', desc: 'LLM, Guide, Janela de Contexto, Discovery Driven.' },
              { duration: '30min', title: 'Intervalo', desc: 'Café, networking, respira.' },
              { duration: '1h', title: 'Live Build I — UI & Telas', desc: 'Do brief à interface funcional, gerada ao vivo.' },
              { duration: '1h', title: 'Live Build II — Banco & Lógica', desc: 'RLS, auth, integrações. Sem mistério.' },
              { duration: '2h', title: 'Hands-on: Seu App', desc: 'Bancada, mentoria 1:1, você constrói o seu.' },
              { duration: '1h', title: 'After', desc: 'Comunidade, conexões e a tour continua.' }
            ].map((item, idx) => (
              <div className="builderz-timeline-item" key={idx} style={{ paddingBottom: '32px' }}>
                <div className="builderz-timeline-duration">{item.duration}</div>
                <div className="builderz-timeline-content">
                  <h4 className="builderz-timeline-title">{item.title}</h4>
                  <p className="builderz-timeline-desc" style={{ color: '#9ca3af' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="builderz-timeline-footer" style={{ paddingLeft: '32px' }}>
            [ Σ 8H · 11 BLOCOS ]
          </div>
        </div>
      </section>

      {/* SPEAKERS & ORGANIZERS */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 05 ] · QUEM ESTÁ NO PALCO E BASTIDORES</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">MENTOR E REALIZAÇÃO</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Conheça quem trará todo o ecossistema prático de desenvolvimento e quem está organizando a edição local.
          </p>
        </div>

        <div className="mkt-people-grid">
          {/* MENTOR THIAGO DIAZ */}
          <div className="mkt-person-card" style={{ border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div className="mkt-person-header">
              <div className="mkt-person-avatar">TD</div>
              <div className="mkt-person-meta">
                <h3 className="mkt-person-name">Thiago Diaz</h3>
                <span className="mkt-person-title">Palestrante & Mentor</span>
              </div>
            </div>
            <p className="mkt-person-bio">
              Fundador da **Builderz** e mentor em desenvolvimento ágil acelerado por Inteligência Artificial. Engenheiro por formação e criador de softwares por ofício, atua capacitando centenas de criadores ("builders") no Brasil. É o desenvolvedor do **Método Guide**, focado em acelerar o processo criativo e de programação hands-on para colocar produtos e apps em produção sem fricção.
            </p>
          </div>

          {/* ORGANIZERS */}
          <div className="mkt-person-card">
            <div className="mkt-person-header">
              <div className="mkt-person-avatar" style={{ background: 'linear-gradient(135deg, var(--neon-cyan) 0%, var(--electric-blue) 100%)' }}>EB</div>
              <div className="mkt-person-meta">
                <h3 className="mkt-person-name">Eduardo Both & Gabriel Müller</h3>
                <span className="mkt-person-title">Idealizadores & Hosts Locais</span>
              </div>
            </div>
            <p className="mkt-person-bio">
              Empresários e líderes de tecnologia atuantes no ecossistema de Estância Velha e região do Vale do Sinos. São os promotores oficiais e anfitriões responsáveis por trazer o formato prático da Builderz para o público regional. 
              <br /><br />
              Seu foco é criar pontes entre a inovação tecnológica da IA e as oportunidades de mercado locais, proporcionando um ambiente propício para conexões corporativas de alto escalão, aprendizado prático e novos negócios regionais.
            </p>
          </div>
        </div>
      </section>

      {/* AUDIENCE / TARGET (Para quem é) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 06 ] · COMPATIBILIDADE</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">PARA QUEM É A IMERSÃO?</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            A comunidade é voltada para quem constrói e coloca projetos no ar, independentemente da sua formação.
          </p>
        </div>

        <div className="mkt-audience-grid">
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: '#10B981' }}>//</span> Iniciantes
            </h3>
            <p className="mkt-audience-desc">
              Curiosos que possuem uma grande ideia de projeto ou produto, mas que não têm conhecimento em programação.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: '#10B981' }}>//</span> Vibecoders
            </h3>
            <p className="mkt-audience-desc">
              Criadores e curiosos que já tiveram contato prévio com IA e desejam dominar o stack técnico para criar produtos completos.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: '#10B981' }}>//</span> Devs
            </h3>
            <p className="mkt-audience-desc">
              Programadores profissionais que buscam triplicar a sua velocidade de trabalho em até 10x utilizando ferramentas de IA.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: '#10B981' }}>//</span> Designers
            </h3>
            <p className="mkt-audience-desc">
              Profissionais visuais que transformam pixels em layouts no Figma e querem aprender a criar aplicativos interativos reais.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: '#10B981' }}>//</span> Empresários do Futuro
            </h3>
            <p className="mkt-audience-desc">
              Líderes de negócios que desejam desenhar e implementar automações, CRMs e fluxos operacionais próprios na empresa.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 07 ] · DÚVIDAS FREQUENTES</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">FAQ DO EVENTO</h2>
        </div>

        <div className="mkt-faq-list">
          {faqs.map((faq, index) => (
            <div className="mkt-faq-item" key={index}>
              <button className="mkt-faq-question-btn" onClick={() => toggleFaq(index)}>
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === index && (
                <div className="mkt-faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DESIGNERS CORNER (Aba para designer com ideias de posts) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="mkt-designer-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <InstagramIcon size={28} style={{ color: '#10B981' }} />
            <div>
              <span className="mkt-section-label" style={{ margin: 0 }}>ÁREA CRIATIVA</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Marketing de Afiliados & Designers
              </h3>
            </div>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, maxWidth: '700px' }}>
            Está promovendo o evento ou desenhando materiais de divulgação? Utilize estes roteiros estruturados, ganchos visuais e sugestões de copy prontos para seu Instagram para capturar a atenção de possíveis participantes.
          </p>

          <div className="mkt-post-grid">
            {instagramPosts.map((post, index) => (
              <div className="mkt-post-card" key={index}>
                <div className="mkt-post-header">
                  <span className="mkt-post-category">{post.category}</span>
                  <InstagramIcon size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <h4 className="mkt-post-title">{post.title}</h4>
                
                <div>
                  <h5 className="mkt-post-section-title">Direção Visual:</h5>
                  <div className="mkt-post-visual">{post.visual}</div>
                </div>

                <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h5 className="mkt-post-section-title" style={{ marginBottom: '6px' }}>Legenda Recomendada:</h5>
                  <div className="mkt-caption-box">
                    <button 
                      className="mkt-copy-btn" 
                      onClick={() => handleCopyCaption(post.caption, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={10} /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={10} /> Copiar Copy
                        </>
                      )}
                    </button>
                    {post.caption}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '40px 20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>
        <p style={{ margin: '0 0 12px' }}>
          AI EXPERIENCE © 2026. Realização por Eduardo Both & Gabriel Müller em parceria com a Builderz.
        </p>
        <p style={{ margin: 0 }}>
          Todos os direitos reservados. Auditório Müller Centro Empresarial, Estância Velha - RS.
        </p>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={onNavigateToAuth}
            className="btn-secondary" 
            style={{ padding: '6px 16px', fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            Acessar Painel Restrito
          </button>
        </div>
      </footer>
    </div>
  );
};
