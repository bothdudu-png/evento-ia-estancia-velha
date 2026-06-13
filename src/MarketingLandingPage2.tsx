import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Clock,
  Users,
  MapPin,
  ChevronDown,
  Check,
  ArrowRight,
  Share2,
  Calendar
} from 'lucide-react';
import './MarketingLandingPage2.css';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

interface MarketingLandingPage2Props {
  inviteToken: string | null;
  confirmedCount?: number;
  onNavigateToAuth: () => void;
  onNavigateToCheckout: () => void;
}

export const MarketingLandingPage2: React.FC<MarketingLandingPage2Props> = ({
  inviteToken,
  confirmedCount = 0,
  onNavigateToAuth,
  onNavigateToCheckout
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Interactive Calculator State ---
  const [hoursSaved, setHoursSaved] = useState(8);
  const [automationRate, setAutomationRate] = useState(60);
  const [employees, setEmployees] = useState(5);

  // --- Countdown State ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  // --- Slides transition logic ---
  const slides = useMemo(() => [
    { label: "IA.",          article: "A", color: "#10E27A", image: "/ia-3d.png" },
    { label: "CLAUDE CODE.", article: "O", color: "#D97757", image: "/claude-3d.png" },
    { label: "LOVABLE.",     article: "O", color: "#FF4D8D", image: "/lovable-3d.png" },
    { label: "REPLIT.",      article: "O", color: "#F26207", image: "/replit-3d.png" },
    { label: "CURSOR.",      article: "O", color: "#E5E7EB", image: "/cursor-3d.png" },
    { label: "ANTIGRAVITY.", article: "O", color: "#4F8BFF", image: "/antigravity-3d.png" }
  ], []);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const isHeroVisible = useRef(true); // tracks visibility without re-render
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop slide cycling based on hero visibility
  const startCycling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (!isHeroVisible.current) return; // paused when hero is off-screen
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 3600);
  }, [slides.length]);

  // Intersection Observer — pause when hero leaves viewport
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 } // pauses when less than 10% of hero is visible
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    startCycling();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startCycling]);

  // ── ZOOM: faz o 100% do browser ter a mesma proporção do antigo 80% ──
  useEffect(() => {
    const html = document.documentElement;
    if (window.innerWidth > 992) {
      html.style.zoom = '0.8';
    }
    return () => {
      html.style.zoom = '';
    };
  }, []);

  const currentSlide = slides[currentSlideIndex];

  // --- Dynamic mentor photo color filter shifting ---
  const mentorPhotoFilter = useMemo(() => {
    switch (currentSlideIndex) {
      case 0: // IA. (Green: #10E27A) - default green image
        return 'none';
      case 1: // Claude Code (Orange/Coral: #D97757)
        return 'hue-rotate(240deg) saturate(1.2)';
      case 2: // Lovable (Pink: #FF4D8D)
        return 'hue-rotate(180deg) saturate(1.5)';
      case 3: // Replit (Orange: #F26207)
        return 'hue-rotate(250deg) saturate(1.8)';
      case 4: // Cursor (Light Grey: #E5E7EB)
        return 'grayscale(1) brightness(1.1)';
      case 5: // Antigravity (Blue: #4F8BFF)
        return 'hue-rotate(75deg) saturate(1.4)';
      default:
        return 'none';
    }
  }, [currentSlideIndex]);

  useEffect(() => {
    const targetDate = new Date('2026-08-15T09:00:00-03:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Calculator Calculations ---
  const calculatedSavings = useMemo(() => {
    const weeklyHours = hoursSaved * (automationRate / 100) * employees;
    const monthlyHours = Math.round(weeklyHours * 4.33);
    const annualHours = Math.round(weeklyHours * 52);
    const annualDays = Math.round(annualHours / 8); // Assumindo dia útil de 8h
    
    return {
      weekly: Math.round(weeklyHours),
      monthly: monthlyHours,
      annual: annualHours,
      days: annualDays
    };
  }, [hoursSaved, automationRate, employees]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleActionClick = () => {
    onNavigateToCheckout();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + (inviteToken ? `?invite=${inviteToken}` : ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'Preciso saber programar para participar do evento?',
      a: 'De forma alguma! O Método Guide foi estruturado exatamente para que empreendedores, líderes de negócio e mentes criativas consigam criar automações e sistemas reais com inteligência artificial sem codificar manualmente. A IA gera a lógica técnica, você define as regras e o produto.'
    },
    {
      q: 'O que preciso levar no dia da imersão?',
      a: 'Levar notebook e carregador é obrigatório. O evento é 100% hands-on: você construirá suas próprias soluções durante a imersão, participando das bancadas práticas.'
    },
    {
      q: 'Onde será realizado o evento?',
      a: 'No Auditório Müller Centro Empresarial, em Estância Velha, RS. O local possui infraestrutura premium com tomadas individuais dedicadas, sinal de internet de alta velocidade e lounges de networking corporativo.'
    },
    {
      q: 'Alimentação está inclusa?',
      a: 'Os coffee breaks dos intervalos da manhã estão inclusos na inscrição — haverá café, frutas e lanches de qualidade para recarregar as energias. O almoço (12:00–13:30) é por conta de cada participante, e há diversas opções próximas ao Auditório Müller.'
    },
    {
      q: 'Como funciona a restrição de vagas?',
      a: 'Por ser focado em bancadas de trabalho e mentoria prática individualizada, limitamos as vagas a apenas 60 pessoas. Por isso, a entrada é controlada nominalmente apenas via convites validados ou tokens ativos.'
    }
  ];

  return (
    <div 
      className="mkt2-container"
      style={{
        '--brand': currentSlide.color,
      } as React.CSSProperties}
    >
      {/* BACKGROUND GRAPHICS & TEXT (REF. GOBUILDERZ) */}
      <div 
        className="mkt2-circuit-grid"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${currentSlide.color}0c 1px, transparent 0)` }}
      ></div>
      <div className="mkt2-noise-overlay"></div>
      <div 
        className="mkt2-glow-radial-1"
        style={{ background: `radial-gradient(circle, ${currentSlide.color}08 0%, rgba(6, 9, 30, 0) 70%)` }}
      ></div>
      <div 
        className="mkt2-glow-radial-2"
        style={{ background: `radial-gradient(circle, ${currentSlide.color}05 0%, rgba(6, 9, 30, 0) 70%)` }}
      ></div>

      <div className="mkt2-hero-bg-media">
        <img 
          src="/hero-circuit.jpg" 
          alt="" 
          className="mkt2-hero-bg-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="mkt2-hero-bg-overlay"></div>
      </div>
      
      <div className="mkt2-hero-bg-text-wrap" aria-hidden="true">
        <div className="mkt2-hero-bg-text">EVENTS26</div>
      </div>

      {/* FIXED HEADER */}
      <header className="mkt2-header" style={{ borderBottomColor: `${currentSlide.color}15` }}>
        <div className="mkt2-header-wrap">
          <button
            className="mkt2-logo"
            onClick={() => {
              const hero = document.getElementById('hero');
              if (hero) hero.scrollIntoView({ behavior: 'smooth' });
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Voltar ao topo"
          >
            AI EXPERIENCE
            <span 
              className="mkt2-logo-sub"
              style={{ color: currentSlide.color, borderColor: `${currentSlide.color}30`, textShadow: `0 0 10px ${currentSlide.color}20` }}
            >
              ESTÂNCIA VELHA
            </span>
          </button>
          <nav className="mkt2-nav">
            <a href="#metodo" className="mkt2-nav-link">Método</a>
            <a href="#roi" className="mkt2-nav-link">Calculadora</a>
            <a href="#cronograma" className="mkt2-nav-link">Cronograma</a>
            <a href="#mentor" className="mkt2-nav-link">Mentor</a>
            <a href="#faq" className="mkt2-nav-link">FAQ</a>
          </nav>
          <div className="mkt2-header-actions">
            <button 
              onClick={handleActionClick} 
              className="mkt2-btn-primary mkt2-header-btn"
              style={{ background: currentSlide.color, color: '#06091e', boxShadow: `0 4px 15px ${currentSlide.color}30` }}
            >
              <span className="mkt2-header-btn-text-desktop">Garantir Minha Vaga</span>
              <span className="mkt2-header-btn-text-mobile">Garantir Vaga</span>
              <ArrowRight size={14} className="mkt2-header-btn-icon" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="mkt2-hero" ref={heroRef}>
        <div className="mkt2-hero-inner">
          <div className="mkt2-hero-info">
            <div className="mkt2-badge-host">
              <span className="mkt2-badge-live"></span>
              IMERSÃO IA · ESTÂNCIA VELHA · 2026
            </div>
          
            <h1 className="mkt2-title">
              <span className="mkt2-title-block">
                <span className="mkt2-title-inner animate-slide-up-word">CONSTRUA</span>
              </span>
              <span className="mkt2-title-block">
                <span className="mkt2-title-inner animate-slide-up-word" style={{ animationDelay: '0.1s' }}>
                  O <span className="mkt2-title-outline-bold">FUTURO</span>
                </span>
              </span>
              <span className="mkt2-title-block">
                <span className="mkt2-title-inner animate-slide-up-word" style={{ animationDelay: '0.2s' }}>
                  COM {currentSlide.article}
                </span>
              </span>
              <span className="mkt2-title-block mkt2-title-block--last">
                <span className="mkt2-title-inner animate-slide-up-word" style={{ animationDelay: '0.3s' }}>
                  <span className="mkt2-title-brand-wrap">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentSlideIndex}
                        className="mkt2-title-brand"
                        style={{ color: currentSlide.color }}
                        initial={{ y: '0.6em', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-0.6em', opacity: 0 }}
                        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {currentSlide.label}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
              </span>
            </h1>

          <p className="mkt2-subtitle">
            Um dia inteiro e presencial, hands-on, focado em ensinar você a construir e lançar sistemas, automações e softwares corporativos com Inteligência Artificial. Sem teoria inútil.
          </p>

          <div className="mkt2-hero-buttons">
            <button 
              onClick={handleActionClick} 
              className="mkt2-btn-primary"
              style={{ background: currentSlide.color, color: '#06091e', boxShadow: `0 4px 15px ${currentSlide.color}30` }}
            >
              Inscrever-se com Token <ArrowRight size={16} />
            </button>
            <button className="mkt2-btn-secondary" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check size={16} style={{ color: currentSlide.color }} /> Copiado!
                </>
              ) : (
                <>
                  <Share2 size={16} /> Compartilhar Convite
                </>
              )}
            </button>
          </div>

          <div className="mkt2-details-row">
            <div className="mkt2-detail-card">
              <Calendar size={20} className="mkt2-detail-icon" style={{ color: currentSlide.color }} />
              <div>
                <div className="mkt2-detail-label">Data</div>
                <div className="mkt2-detail-value">15 de Agosto</div>
              </div>
            </div>
            <div className="mkt2-detail-card">
              <MapPin size={20} className="mkt2-detail-icon" style={{ color: currentSlide.color }} />
              <div>
                <div className="mkt2-detail-label">Local</div>
                <div className="mkt2-detail-value">Auditório Müller</div>
              </div>
            </div>
            <div className="mkt2-detail-card">
              <Users size={20} className="mkt2-detail-icon" style={{ color: currentSlide.color }} />
              <div className="mkt2-countdown-mini">
                <div className="mkt2-detail-label">Inscrições</div>
                <div className="mkt2-detail-value">{confirmedCount} de 60 Confirmados</div>
                <div className="mkt2-countdown-bar-wrap">
                  <div
                    className="mkt2-countdown-bar-fill"
                    style={{ width: `${Math.min((confirmedCount / 60) * 100, 100)}%`, background: currentSlide.color, boxShadow: `0 0 8px ${currentSlide.color}` }}
                  ></div>
                </div>
              </div>
            </div>
            {!timeLeft.isOver && (
              <div className="mkt2-detail-card mkt2-detail-card--countdown">
                <Clock size={20} className="mkt2-detail-icon" style={{ color: currentSlide.color }} />
                <div>
                  <div className="mkt2-detail-label">Faltam</div>
                  <div className="mkt2-detail-value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem' }}>
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mkt2-hero-graphic">
          <div className="mkt2-graphic-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                className="mkt2-graphic-image-container"
                initial={{
                  opacity: 0,
                  scale: 0.85,
                  y: 20,
                }}
                animate={{
                  opacity: 0.95,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.1,
                  y: -20,
                }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <motion.img
                  src={currentSlide.image}
                  alt={currentSlide.label}
                  className="mkt2-graphic-image"
                  animate={{
                    y: [0, -14, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 6,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
      {/* MARQUEE DECORATIVO — cidade e data do evento */}
      <div className="mkt2-marquee-strip" aria-hidden="true">
        <motion.div
          className="mkt2-marquee-track"
          animate={{ x: [0, '-50%'] }}
          transition={{
            ease: "linear",
            duration: 75,
            repeat: Infinity,
          }}
        >
          {[...Array(8)].map((_, rep) => (
            <div className="mkt2-marquee-group" key={rep}>
              <span className="mkt2-marquee-city">ESTÂNCIA VELHA</span>
              <span className="mkt2-marquee-date" style={{ color: currentSlide.color }}>15.08.26</span>
              <span className="mkt2-marquee-dot">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* METODO GUIDE SECTION */}
      <span id="metodo"></span>
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label">// O Método GUIDE</span>
        <h2 className="mkt2-section-title">Construa e publique em tempo real</h2>
        <p className="mkt2-section-desc">
          Abandonamos a teoria tradicional dos cursos. Durante a imersão você acompanhará o fluxo prático e mentorado para desenhar, conectar e publicar um aplicativo completo.
        </p>

        <div className="mkt2-split-grid">
          <motion.div className="mkt2-steps-list" variants={containerVariants}>
            <motion.div className="mkt2-step-item" variants={cardVariants}>
              <div className="mkt2-step-num">01</div>
              <h3 className="mkt2-step-title">Arquitetura Visual</h3>
              <p className="mkt2-step-desc">
                Crie e esboce telas de forma intuitiva. Você aprende a modelar fluxos e layouts comerciais que engajam usuários, convertendo ideias em interfaces em poucos minutos.
              </p>
            </motion.div>
            <motion.div className="mkt2-step-item" variants={cardVariants}>
              <div className="mkt2-step-num">02</div>
              <h3 className="mkt2-step-title">Logic Injection</h3>
              <p className="mkt2-step-desc">
                A Inteligência Artificial atua como seu desenvolvedor dedicado. Suas regras e ideias operacionais são injetadas em bancos de dados reais de forma automatizada e segura.
              </p>
            </motion.div>
            <motion.div className="mkt2-step-item" variants={cardVariants}>
              <div className="mkt2-step-num">03</div>
              <h3 className="mkt2-step-title">Instant Deploy</h3>
              <p className="mkt2-step-desc">
                Publique seu app diretamente na nuvem em tempo real com link utilizável em computadores e celulares. Ao final do dia, seu projeto estará ativo e funcional.
              </p>
            </motion.div>
          </motion.div>

          <div className="mkt2-photo-panel">
            <img
              src="/method-coding.jpg"
              alt="Hands-on coding session"
              className="mkt2-photo-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/event_auditorium.png';
              }}
            />
          </div>
        </div>
      </motion.section>

      {/* CALCULADORA DE ROI E PRODUTIVIDADE */}
      <span id="roi"></span>
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label">// Calculadora de Tempo e Produtividade</span>
        <h2 className="mkt2-section-title">Quanto tempo você ainda desperdiça por semana?</h2>
        <p className="mkt2-section-desc">
          Seja você autônomo, profissional ou gestor de equipe — simule abaixo quanto tempo e energia você pode recuperar automatizando tarefas repetitivas com IA.
        </p>

        <div className="mkt2-calc-container">
          <div className="mkt2-calc-sliders">
            <div className="mkt2-slider-group">
              <div className="mkt2-slider-header">
                <span className="mkt2-slider-label">Horas gastas em tarefas repetitivas (por pessoa/semana)</span>
                <span className="mkt2-slider-val">{hoursSaved}h</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(Number(e.target.value))}
                className="mkt2-slider-input"
              />
            </div>

            <div className="mkt2-slider-group">
              <div className="mkt2-slider-header">
                <span className="mkt2-slider-label">Potencial de automação com IA</span>
                <span className="mkt2-slider-val">{automationRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={automationRate}
                onChange={(e) => setAutomationRate(Number(e.target.value))}
                className="mkt2-slider-input"
              />
            </div>

            <div className="mkt2-slider-group">
              <div className="mkt2-slider-header">
                <span className="mkt2-slider-label">Quantidade de pessoas impactadas</span>
                <span className="mkt2-slider-val">{employees}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="mkt2-slider-input"
              />
            </div>
            <p className="mkt2-calc-footer">
              * Estimativa de ganho de eficiência ao automatizar fluxos repetitivos, planilhas, relatórios, triagem de mensagens ou emails com agentes inteligentes de IA.
            </p>
          </div>

          <div className="mkt2-calc-results">
            <h4 className="mkt2-calc-headline">Foco & Tempo Recuperados</h4>
            <div className="mkt2-result-row">
              <div className="mkt2-result-card">
                <span className="mkt2-result-label">Horas Livres / Semana</span>
                <span className="mkt2-result-value">{calculatedSavings.weekly}h</span>
              </div>
              <div className="mkt2-result-card">
                <span className="mkt2-result-label">Horas Livres / Mês</span>
                <span className="mkt2-result-value brand">{calculatedSavings.monthly}h</span>
              </div>
            </div>
            <div className="mkt2-result-card accent">
              <span className="mkt2-result-label">Dias de Trabalho Recuperados / Ano (Base 8h/dia)</span>
              <span className="mkt2-result-value brand">{calculatedSavings.days} dias <span style={{ fontSize: '1rem', color: 'var(--muted-fg-b)', fontWeight: 500 }}>({calculatedSavings.annual}h/ano)</span></span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* BASTIDORES DA IMERSÃO (story-room, story-stage, story-launch) */}
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label">// A Experiência</span>
        <h2 className="mkt2-section-title">Um dia focado em entrega</h2>
        <p className="mkt2-section-desc">
          Veja a dinâmica prática desenvolvida nas imersões presenciais da Builderz.
        </p>

        <motion.div className="mkt2-gallery-grid" variants={containerVariants}>
          <motion.div className="mkt2-gallery-card" variants={cardVariants}>
            <img
              src="/auditorium_real_1.jpg"
              alt="Auditório do Evento"
              className="mkt2-gallery-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/event_auditorium.png';
              }}
            />
            <div className="mkt2-gallery-info">
              <span className="mkt2-gallery-badge">STEP 01</span>
              <h3 className="mkt2-gallery-title">O Espaço Físico</h3>
              <p className="mkt2-gallery-desc">
                Infraestrutura premium no Auditório Müller, preparado para focar no seu computador com conexões de alta performance.
              </p>
            </div>
          </motion.div>

          <motion.div className="mkt2-gallery-card" variants={cardVariants}>
            <img
              src="/auditorium_real_2.jpg"
              alt="Imersão Prática"
              className="mkt2-gallery-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/event_auditorium.png';
              }}
            />
            <div className="mkt2-gallery-info">
              <span className="mkt2-gallery-badge">STEP 02</span>
              <h3 className="mkt2-gallery-title">Bancada & Live Build</h3>
              <p className="mkt2-gallery-desc">
                O mentor no telão programando ao vivo enquanto você replica a arquitetura lógica e visual do seu lado.
              </p>
            </div>
          </motion.div>

          <motion.div className="mkt2-gallery-card" variants={cardVariants}>
            <img
              src="/auditorium_real_3.jpg"
              alt="Deploy e Lançamento"
              className="mkt2-gallery-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/event_auditorium.png';
              }}
            />
            <div className="mkt2-gallery-info">
              <span className="mkt2-gallery-badge">STEP 03</span>
              <h3 className="mkt2-gallery-title">Deploy de Aplicação</h3>
              <p className="mkt2-gallery-desc">
                Final do dia com aplicativos operacionais lançados online, prontos para uso comercial real e validação.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* CRONOGRAMA OFICIAL */}
      <span id="cronograma"></span>
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label">// Roteiro do Dia</span>
        <h2 className="mkt2-section-title">Estrutura de Blocos</h2>
        <p className="mkt2-section-desc">
          Cronograma prático desenhado com 10 blocos de aprendizagem focada, distribuídos ao longo do dia da imersão.
        </p>

        <div className="mkt2-timeline-box">
          <motion.div className="mkt2-timeline" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
            {[
              { time: '08:30', duration: '30min', title: 'Check-in', desc: 'Abertura oficial, recepção dos computadores e kit de boas-vindas.', shift: 'morning' },
              { time: '09:00', duration: '30min', title: 'IA First & A Era do Selfware', desc: 'Como estruturar o raciocínio de automação e criar ferramentas, bots e scripts sob medida.', shift: 'morning' },
              { time: '09:30', duration: '30min', title: 'Plataformas de IA & Design', desc: 'Visão geral do ecossistema de builders e noções básicas de design visual prático.', shift: 'morning' },
              { time: '10:00', duration: '30min', title: 'Coffee Break & Networking', desc: 'Pausa com coffee break premium e conexões estratégicas entre os participantes.', shift: 'morning' },
              { time: '10:30', duration: '30min', title: 'O Framework Guide', desc: 'Roteiro prático do método Discovery Driven e planejamento das bancadas de desenvolvimento.', shift: 'morning' },
              { time: '11:00', duration: '1h 00m', title: 'Live Build I — Front-end & Telas', desc: 'Criação estruturada das interfaces e fluxo visual do zero no telão.', shift: 'morning' },
              { time: '12:00', duration: '1h 30m', title: 'Almoço — Intervalo Livre', desc: 'Pausa para almoço por conta de cada participante. Retorno às 13:30. Ótimo momento para networking informal.', shift: 'lunch' },
              { time: '13:30', duration: '1h 00m', title: 'Live Build II — Banco de Dados', desc: 'Conexão estruturada, lógicas de segurança (RLS) e integrações.', shift: 'afternoon' },
              { time: '14:30', duration: '2h 00m', title: 'Hands-on Mentorado', desc: 'Bancada aberta de desenvolvimento individual sob mentoria 1:1 direta do mentor.', shift: 'afternoon' },
              { time: '16:30', duration: '1h 00m', title: 'Encerramento & Deploy', desc: 'Deploy final com apps no ar e fechamento de conexões locais. Encerramento às 17:30.', shift: 'evening' }
            ].map((item, idx) => (
              <motion.div className="mkt2-timeline-item" key={idx} variants={cardVariants}>
                <div className="mkt2-timeline-left">
                  <div className="mkt2-timeline-time">{item.time}</div>
                  <div className="mkt2-timeline-duration">{item.duration}</div>
                </div>
                <div className="mkt2-timeline-content">
                  <span className={`mkt2-timeline-shift-badge mkt2-badge-${item.shift}`}>
                    {item.shift === 'morning' ? 'Manhã' : item.shift === 'afternoon' ? 'Tarde' : item.shift === 'lunch' ? 'Almoço' : 'Encerramento'}
                  </span>
                  <h4 className="mkt2-timeline-title">{item.title}</h4>
                  <p className="mkt2-timeline-desc">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* MENTOR THIAGO DIAZ */}
      <span id="mentor"></span>
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mkt2-mentor-layout">
          <div className="mkt2-mentor-photo-wrapper">
            <div className="mkt2-mentor-tag">MENTOR_01</div>
            <img
              src="/thiago-diaz.jpg"
              alt="Thiago Diaz"
              className="mkt2-mentor-photo"
              style={{ filter: mentorPhotoFilter }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/thiago_diaz.png';
              }}
            />
            <div className="mkt2-mentor-photo-info">
              <span>ISO 400 · 50MM</span>
              <span className="mkt2-mentor-photo-arrow">▼</span>
            </div>
          </div>

          <div className="mkt2-mentor-info">
            <span className="mkt2-section-label">[ 07 ] · QUEM TE GUIA</span>
            <h2 className="mkt2-mentor-name">
              THIAGO <br />
              <span className="mkt2-mentor-name-outline">DIAZ.</span>
            </h2>
            <p className="mkt2-mentor-bio">
              Founder da Builderz. Já guiou milhares de builders do "tenho uma ideia" para o "está no ar". Engenheiro por formação, criador por ofício. Vai estar em todas as 6 paradas — sem stand-in.
            </p>

            <div className="mkt2-mentor-stats">
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Lives</span>
                <span className="mkt2-mentor-stat-value">85+</span>
              </div>
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Builders</span>
                <span className="mkt2-mentor-stat-value">12k</span>
              </div>
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Apps Lançados</span>
                <span className="mkt2-mentor-stat-value">230+</span>
              </div>
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Países</span>
                <span className="mkt2-mentor-stat-value">07</span>
              </div>
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Anos no Jogo</span>
                <span className="mkt2-mentor-stat-value">11</span>
              </div>
              <div className="mkt2-mentor-stat-card">
                <span className="mkt2-mentor-stat-label">Cafés/Dia</span>
                <span className="mkt2-mentor-stat-value">∞</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* HOSTS LOCAIS */}
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label" style={{ textAlign: 'center' }}>// Organização Regional</span>
        <h2 className="mkt2-section-title" style={{ textAlign: 'center' }}>Parceria & Idealização Local</h2>
        <p className="mkt2-section-desc" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
          Conheça quem trouxe e viabilizou esta imersão em Estância Velha, promovendo networking corporativo de alto nível na região do Vale do Sinos.
        </p>

        <motion.div className="mkt2-hosts-grid mkt2-hosts-grid--two" variants={containerVariants}>
          <motion.div className="mkt2-host-card mkt2-host-card--photo" variants={cardVariants}>
            <img
              src="/gabriel-muller.jpg"
              alt="Gabriel Müller"
              className="mkt2-host-photo"
            />
            <div className="mkt2-host-info">
              <h3 className="mkt2-host-name">Gabriel Müller</h3>
              <span className="mkt2-host-role">Host & Co-organizador</span>
              <p className="mkt2-host-bio">
                Empresário e liderança local no Vale do Sinos. Viabilizou a parceria com a Builderz e cedeu o Auditório Müller Centro Empresarial para sediar a imersão, promovendo networking corporativo de alto nível na região.
              </p>
            </div>
          </motion.div>

          <motion.div className="mkt2-host-card mkt2-host-card--photo" variants={cardVariants}>
            <img
              src="/eduardo-both.jpg"
              alt="Eduardo Both"
              className="mkt2-host-photo"
            />
            <div className="mkt2-host-info">
              <h3 className="mkt2-host-name">Eduardo Both</h3>
              <span className="mkt2-host-role">Host & Promotor do Evento</span>
              <p className="mkt2-host-bio">
                Empreendedor regional, idealizador do encontro em Estância Velha. Focado em expandir o ecossistema tecnológico prático local, conectando profissionais e lideranças que querem usar IA como ferramenta real de produtividade.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* COMPATIBILIDADE / PARA QUEM É */}
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label" style={{ textAlign: 'center' }}>// Para quem é</span>
        <h2 className="mkt2-section-title" style={{ textAlign: 'center' }}>Perfil do Builder</h2>
        <p className="mkt2-section-desc" style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
          A imersão prática acolhe profissionais com diferentes níveis de contato tecnológico.
        </p>

        <motion.div className="mkt2-audience-grid" variants={containerVariants}>
          <motion.div className="mkt2-audience-card" variants={cardVariants}>
            <h4 className="mkt2-audience-header">
              <span className="mkt2-audience-slash">//</span> Iniciantes
            </h4>
            <p className="mkt2-audience-desc">
              Pessoas com ótimas ideias de negócios ou sistemas, mas que não possuem formação em programação e buscam construir de forma ágil.
            </p>
          </motion.div>
          <motion.div className="mkt2-audience-card" variants={cardVariants}>
            <h4 className="mkt2-audience-header">
              <span className="mkt2-audience-slash">//</span> Vibecoders
            </h4>
            <p className="mkt2-audience-desc">
              Entusiastas que já conhecem ou operam IAs conversacionais (ChatGPT, Claude) e querem dominar o fluxo completo de bancos de dados.
            </p>
          </motion.div>
          <motion.div className="mkt2-audience-card" variants={cardVariants}>
            <h4 className="mkt2-audience-header">
              <span className="mkt2-audience-slash">//</span> Devs
            </h4>
            <p className="mkt2-audience-desc">
              Programadores que querem otimizar seu tempo de escrita de telas, utilizando IA generativa para turbinar sua velocidade de entrega.
            </p>
          </motion.div>
          <motion.div className="mkt2-audience-card" variants={cardVariants}>
            <h4 className="mkt2-audience-header">
              <span className="mkt2-audience-slash">//</span> Designers
            </h4>
            <p className="mkt2-audience-desc">
              Criativos visuais de interfaces no Figma que desejam dar vida real, lógica e banco de dados ativo a seus próprios protótipos de forma rápida.
            </p>
          </motion.div>
          <motion.div className="mkt2-audience-card" variants={cardVariants}>
            <h4 className="mkt2-audience-header">
              <span className="mkt2-audience-slash">//</span> Empresários
            </h4>
            <p className="mkt2-audience-desc">
              Líderes de negócios focados em reduzir custos e economizar horas do seu time operando automações, robôs comerciais e painéis próprios.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FAQ SECTION */}
      <span id="faq"></span>
      <motion.section
        className="mkt2-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <span className="mkt2-section-label" style={{ textAlign: 'center' }}>// Dúvidas Frequentes</span>
        <h2 className="mkt2-section-title" style={{ textAlign: 'center' }}>FAQ do Evento</h2>
        
        <div className="mkt2-faq-list">
          {faqs.map((faq, index) => (
            <div className={`mkt2-faq-item ${openFaq === index ? 'active' : ''}`} key={index}>
              <button className="mkt2-faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className="mkt2-faq-icon"
                  style={{ transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div className={`mkt2-faq-answer-grid ${openFaq === index ? 'open' : ''}`}>
                <div className="mkt2-faq-answer-inner">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA REGISTER */}
      <motion.section
        className="mkt2-section"
        style={{ borderBottom: 'none' }}
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mkt2-cta-box">
          <span className="mkt2-cta-badge">BANCADAS LIMITADAS A 60 VAGAS</span>
          <h2 className="mkt2-cta-title">Participe da Edição de Estância Velha</h2>
          <p className="mkt2-cta-desc">
            Garanta seu lugar no Auditório Müller Centro Empresarial. Traga seu notebook e saia com sua própria aplicação publicada.
          </p>
          <button onClick={handleActionClick} className="mkt2-btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Acessar com Token de Convite <ArrowRight size={16} />
          </button>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="mkt2-footer">
        <p>AI EXPERIENCE © 2026. Realizado por Eduardo Both & Gabriel Müller em parceria com a Builderz.</p>
        <p>Local: Auditório Müller Centro Empresarial - Estância Velha, RS. Todos os direitos reservados.</p>
        <div className="mkt2-footer-links">
          <button onClick={onNavigateToAuth} className="mkt2-footer-btn">
            Acessar Painel Restrito
          </button>
        </div>
      </footer>
    </div>
  );
};
