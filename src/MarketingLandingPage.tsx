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
  confirmedCount?: number;
  onNavigateToAuth: () => void;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  inviteToken,
  confirmedCount = 0,
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
            <span style={{ color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>EXPERIENCE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {inviteToken && (
              <span className="hide-mobile" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                Convite Ativo: {inviteToken.substring(0, 8)}…
              </span>
            )}
            <button
              onClick={handleActionClick}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.8rem',
                background: 'linear-gradient(135deg, var(--neon-purple) 0%, var(--electric-blue) 100%)',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
              }}
            >
              Garantir Minha Vaga <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mkt-hero">
        <div className="mkt-badge-host mkt-animate delay-1">
          Eduardo Both & Gabriel Müller Apresentam
        </div>
        <div className="mkt-title-stack mkt-animate delay-2" style={{ marginBottom: '32px' }}>
          <h1 className="mkt-title-line mkt-title-solid">AI EXPERIENCE</h1>
          <h1 className="mkt-title-line mkt-title-outlined">ESTÂNCIA VELHA</h1>
        </div>
        <p className="mkt-subtitle mkt-animate delay-3">
          Construa sistemas, aplicativos e automações corporativas reais ao vivo, usando inteligência artificial. Sem teoria morta, 100% hands-on.
        </p>
        
        <div className="mkt-animate delay-4" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleActionClick}
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, var(--neon-purple) 0%, var(--electric-blue) 100%)',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)'
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
        <div className="mkt-animate delay-5" style={{ display: 'flex', gap: '40px', marginTop: '60px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <Clock size={20} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>DATA</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>15 de Agosto</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <MapPin size={20} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>LOCAL</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Auditório Müller</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <Users size={20} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>VAGAS</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', flexDirection: 'column' }}>
                <span>{confirmedCount} de 60 preenchidas</span>
                <div style={{ width: '100px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((confirmedCount / 60) * 100, 100)}%`, height: '100%', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP & LOCATION SECTION (1º Print Requirement) */}
      <section className="mkt-section mkt-geo-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', minHeight: '450px' }}>
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '550px' }}>
            <span className="mkt-section-label">[ 01 ] · GEO TRACE</span>
            <h2 className="mkt-section-title" style={{ fontSize: '3rem', lineHeight: '1.1', fontWeight: 900 }}>
              ROTA DE INOVAÇÃO.
            </h2>
            <h2 style={{ fontSize: '3rem', lineHeight: '1.1', fontWeight: 900, marginBottom: '24px', color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0, 242, 254, 0.35)' }}>
              PRÓXIMA PARADA: RS.
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: '1.6', marginBottom: '28px' }}>
              O AI Experience está cruzando regiões estratégicas de empreendedorismo de alta tecnologia. Trazemos a imersão diretamente para o ecossistema do Vale do Sinos, pousando estrategicamente em **Estância Velha**.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(8px)', borderLeft: '3px solid var(--neon-cyan)', padding: '20px', borderRadius: '0 12px 12px 0', border: '1px solid rgba(255, 255, 255, 0.05)', borderLeftWidth: '3px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '6px' }}>
                Auditório Müller Centro Empresarial
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                Infraestrutura corporativa de altíssimo nível projetada para receber empreendedores de ponta, com tomadas dedicadas e conectividade extrema.
              </div>
            </div>
          </div>
        </div>

        {/* Absolute Background Map */}
        <div className="mkt-geo-map-bg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img 
            src="/tech_map.png" 
            alt="Mapa Rota de Inovação RS" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '24px',
              opacity: 0.75,
              mixBlendMode: 'screen',
              filter: 'brightness(0.95) contrast(1.15) saturate(1.1)' 
            }} 
          />
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

            <div style={{ background: 'rgba(5, 8, 22, 0.4)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
              <div style={{ color: 'var(--neon-purple)', fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            <img src="/event_auditorium.png" alt="Check-in no Auditório Müller" className="mkt-step-img" style={{ filter: 'hue-rotate(180deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label" style={{ color: 'var(--neon-cyan)' }}>STEP 01</span>
              <h3 className="mkt-step-title">CHECK-IN</h3>
              <p className="mkt-step-desc">
                Bancada montada, kit do builder na mão, conexão dedicada e o café pronto para dar a partida nas atividades do dia.
              </p>
            </div>
          </div>

          <div className="mkt-step-card" style={{ border: '1px solid rgba(124, 58, 237, 0.2)', boxShadow: '0 0 20px rgba(124, 58, 237, 0.05)' }}>
            <img src="/event_auditorium.png" alt="Live Build ao Vivo" className="mkt-step-img" style={{ filter: 'hue-rotate(270deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label" style={{ color: 'var(--neon-purple)' }}>STEP 02</span>
              <h3 className="mkt-step-title">LIVE BUILD</h3>
              <p className="mkt-step-desc">
                Thiago Diaz programa um aplicativo real ao vivo no telão, expondo as integrações de banco de dados e lógica com IA.
              </p>
            </div>
          </div>

          <div className="mkt-step-card" style={{ border: '1px solid rgba(236, 72, 153, 0.2)', boxShadow: '0 0 20px rgba(236, 72, 153, 0.05)' }}>
            <img src="/event_auditorium.png" alt="Instant Deploy de Apps" className="mkt-step-img" style={{ filter: 'hue-rotate(320deg) brightness(0.8)' }} />
            <div className="mkt-step-info">
              <span className="mkt-step-label" style={{ color: 'var(--neon-pink)' }}>STEP 03</span>
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
              <div style={{ fontFamily: 'monospace', color: 'var(--neon-cyan)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
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
              { duration: '1h', title: 'After', desc: 'Comunidade, conexões e encerramento do evento.' }
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

      {/* MENTOR DEDICADO - THIAGO DIAZ */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '100px 20px', position: 'relative' }}>
        <div className="mkt-mentor-layout">
          {/* Left Column: Portrait */}
          <div className="mkt-mentor-photo-wrapper">
            <div className="mkt-mentor-tag">MENTOR_01</div>
            <img src="/thiago_diaz.png" alt="Thiago Diaz" className="mkt-mentor-photo" />
          </div>

          {/* Right Column: Info & Stats */}
          <div className="mkt-mentor-info">
            <span className="mkt-section-label" style={{ color: 'var(--neon-purple)' }}>[ 05 ] · QUEM TE GUIA</span>
            <h2 className="mkt-mentor-name-primary">THIAGO</h2>
            <h2 className="mkt-mentor-name-secondary">DIAZ.</h2>
            
            <p className="mkt-mentor-lead-text">
              Founder da Builderz. Já guiou milhares de builders do "tenho uma ideia" para o "está no ar". Engenheiro por formação, criador por ofício. Estará conduzindo presencialmente toda a imersão em Estância Velha — sem stand-in.
            </p>

            <div className="mkt-mentor-stats-grid">
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">LIVES</span>
                <span className="mkt-mentor-stat-value">85+</span>
              </div>
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">BUILDERS</span>
                <span className="mkt-mentor-stat-value">12k</span>
              </div>
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">APPS LANÇADOS</span>
                <span className="mkt-mentor-stat-value">230+</span>
              </div>
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">PAÍSES</span>
                <span className="mkt-mentor-stat-value">07</span>
              </div>
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">ANOS NO JOGO</span>
                <span className="mkt-mentor-stat-value">11</span>
              </div>
              <div className="mkt-mentor-stat-item">
                <span className="mkt-mentor-stat-label">CAFÉS/DIA</span>
                <span className="mkt-mentor-stat-value">∞</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORGANIZADORES LOCAIS */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 06 ] · REALIZAÇÃO LOCAL</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">HOSTS E ORGANIZAÇÃO</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Conheça quem está organizando a edição regional em Estância Velha e promovendo a inovação local.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* ORGANIZERS CARD */}
          <div className="mkt-person-card" style={{ border: '1px solid rgba(124, 58, 237, 0.2)' }}>
            <div className="mkt-person-header">
              <div className="mkt-person-avatar" style={{ background: 'linear-gradient(135deg, var(--neon-purple) 0%, var(--neon-pink) 100%)' }}>EB</div>
              <div className="mkt-person-meta">
                <h3 className="mkt-person-name">Eduardo Both & Gabriel Müller</h3>
                <span className="mkt-person-title" style={{ color: 'var(--neon-purple)' }}>Idealizadores & Hosts Locais</span>
              </div>
            </div>
            <p className="mkt-person-bio" style={{ marginTop: '16px' }}>
              Empresários e líderes de tecnologia atuantes no ecossistema de Estância Velha e região do Vale do Sinos. São os promotores oficiais e anfitriões responsáveis por trazer o formato prático da Builderz para o público regional.
              <br /><br />
              Seu foco é criar pontes entre a inovação tecnológica da IA e as oportunidades de mercado locais, proporcionando um ambiente propício para conexões corporativas de alto nível, aprendizado prático e novos negócios no Vale do Sinos.
            </p>
          </div>
        </div>
      </section>

      {/* AUDIENCE / TARGET (Para quem é) */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 07 ] · COMPATIBILIDADE</span>
        <div className="mkt-section-header" style={{ marginBottom: '60px' }}>
          <h2 className="mkt-section-title">PARA QUEM É A IMERSÃO?</h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            A comunidade é voltada para quem constrói e coloca projetos no ar, independentemente da sua formação.
          </p>
        </div>

        <div className="mkt-audience-grid">
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: 'var(--neon-purple)' }}>//</span> Iniciantes
            </h3>
            <p className="mkt-audience-desc">
              Curiosos que possuem uma grande ideia de projeto ou produto, mas que não têm conhecimento em programação.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: 'var(--neon-purple)' }}>//</span> Vibecoders
            </h3>
            <p className="mkt-audience-desc">
              Criadores e curiosos que já tiveram contato prévio com IA e desejam dominar o stack técnico para criar produtos completos.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: 'var(--neon-purple)' }}>//</span> Devs
            </h3>
            <p className="mkt-audience-desc">
              Programadores profissionais que buscam triplicar a sua velocidade de trabalho em até 10x utilizando ferramentas de IA.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: 'var(--neon-purple)' }}>//</span> Designers
            </h3>
            <p className="mkt-audience-desc">
              Profissionais visuais que transformam pixels em layouts no Figma e querem aprender a criar aplicativos interativos reais.
            </p>
          </div>
          <div className="mkt-audience-card">
            <h3 className="mkt-audience-title">
              <span style={{ color: 'var(--neon-purple)' }}>//</span> Empresários do Futuro
            </h3>
            <p className="mkt-audience-desc">
              Líderes de negócios que desejam desenhar e implementar automações, CRMs e fluxos operacionais próprios na empresa.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mkt-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span className="mkt-section-label" style={{ textAlign: 'center' }}>[ 08 ] · DÚVIDAS FREQUENTES</span>
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
            <InstagramIcon size={28} style={{ color: 'var(--neon-purple)' }} />
            <div>
              <span className="mkt-section-label" style={{ margin: 0 }}>[ 09 ] · ÁREA CRIATIVA</span>
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
