import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Search,
  Layers,
  Settings,
  AlertCircle,
  Filter,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Phone,
  Play,
  Award,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import { db } from './utils/db';
import { animate, stagger } from 'animejs';
import type {
  EventSettings,
  FinancialSettings,
  Investment,
  Participant,
  ParticipantStatus,
  Task,
  ChecklistItem,
  Scenario
} from './utils/db';
import { supabase } from './integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { MarketingLandingPage } from './MarketingLandingPage';
import { MarketingLandingPage2 } from './MarketingLandingPage2';
import { CheckoutPage } from './CheckoutPage';

export default function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulador' | 'investimentos' | 'crm' | 'planejamento' | 'programacao' | 'usuarios'>('dashboard');
  
  const [eventSettings, setEventSettings] = useState<EventSettings>(db.getEventSettings());
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(db.getFinancialSettings());
  const [investments, setInvestments] = useState<Investment[]>(db.getInvestments());
  const [participants, setParticipants] = useState<Participant[]>(db.getParticipants());
  const [tasks, setTasks] = useState<Task[]>(db.getTasks());
  const [checklist, setChecklist] = useState<ChecklistItem[]>(db.getChecklist());
  const [scenarios, setScenarios] = useState<Scenario[]>(db.getScenarios());
  const statuses: ParticipantStatus[] = db.getParticipantStatuses();

  // --- Auth & Session States ---
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ email: string; role: 'admin' | 'user'; name?: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // --- Marketing Landing Page State ---
  const [marketingVersion, setMarketingVersion] = useState<'v1' | 'v2' | 'checkout' | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const path = window.location.pathname;
    
    if (page === 'checkout' || page === 'cadastro' || path === '/checkout' || path === '/cadastro') {
      return 'checkout'; // Checkout and Registration view
    }
    if (page === 'marketing' || page === 'landing' || page === 'v2' || path === '/marketing' || path === '/landing') {
      return 'v2'; // Marketing V2 is the promotional view
    }
    if (page === 'marketing1' || path === '/marketing1') {
      return 'v1'; // Legacy one in background
    }
    return null; // Dashboard Executivo (Admin Panel) is the default main page!
  });

  // --- Auth Form States ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Invite Checking States ---
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  // --- User & Invite Management States (Admin) ---
  const [usersList, setUsersList] = useState<{ id: string; email: string; role: string; name?: string; created_at: string }[]>([]);
  const [invitesList, setInvitesList] = useState<{ id: string; email: string; token: string; used: boolean; created_at: string }[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [loadingUsersTab, setLoadingUsersTab] = useState(false);

  // --- Countdown State ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  // --- Search & Filters States ---
  const [invSearch, setInvSearch] = useState('');
  const [invFilterCategory, setInvFilterCategory] = useState('Todas');
  const [invFilterStatus, setInvFilterStatus] = useState('Todos');

  const [crmSearch, setCrmSearch] = useState('');
  const [crmCityFilter, setCrmCityFilter] = useState('Todas');

  const [taskFilterStatus, setTaskFilterStatus] = useState('Todos');
  const [taskFilterPriority, setTaskFilterPriority] = useState('Todas');

  // --- Scenario Simulator States (Inputs) ---
  const [simParticipants, setSimParticipants] = useState<number>(() => {
    const saved = localStorage.getItem('ai_sim_participants');
    return saved ? Number(saved) : 50;
  });
  const [simTicketPrice, setSimTicketPrice] = useState<number>(() => {
    const saved = localStorage.getItem('ai_sim_ticket_price');
    return saved ? Number(saved) : 350;
  });
  const [simExtraCosts, setSimExtraCosts] = useState<number>(() => {
    const saved = localStorage.getItem('ai_sim_extra_costs');
    return saved ? Number(saved) : 1200;
  });

  // --- Modal States ---
  const [showInvModal, setShowInvModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [invForm, setInvForm] = useState({
    category: 'Coffee Break',
    description: '',
    value: 0,
    responsible: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Previsto' as 'Previsto' | 'Pago' | 'Cancelado'
  });

  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantForm, setParticipantForm] = useState({
    name: '',
    whatsapp: '',
    city: 'Estância Velha',
    company: '',
    role: '',
    observations: '',
    status: 'Lead' as 'Lead' | 'Contatado' | 'Interessado' | 'Confirmado' | 'Pago' | 'Participou'
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    task: '',
    responsible: '',
    priority: 'Média' as 'Baixa' | 'Média' | 'Alta',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Não iniciado' as 'Não iniciado' | 'Em andamento' | 'Concluído'
  });

  const [newChecklistItem, setNewChecklistItem] = useState('');

  // --- Drag and Drop State ---
  const [draggedParticipantId, setDraggedParticipantId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // --- CRM Sub-view State ---
  const [crmSubView, setCrmSubView] = useState<'kanban' | 'dashboard'>('kanban');

  // --- Temporary Launch Settings States ---
  const [tempName, setTempName] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempTicketPrice, setTempTicketPrice] = useState(0);
  const [tempTargetParticipants, setTempTargetParticipants] = useState(0);
  const [tempLocation, setTempLocation] = useState('');

  // --- Persist Scenario Simulator States ---
  useEffect(() => {
    localStorage.setItem('ai_sim_participants', String(simParticipants));
  }, [simParticipants]);

  useEffect(() => {
    localStorage.setItem('ai_sim_ticket_price', String(simTicketPrice));
  }, [simTicketPrice]);

  useEffect(() => {
    localStorage.setItem('ai_sim_extra_costs', String(simExtraCosts));
  }, [simExtraCosts]);

  // --- Load Initial Data on Start ---
  useEffect(() => {
    // 1. Sync from localStorage synchronously for instant local load (Offline-first/Fast UX)
    const settings = db.getEventSettings();
    const finSettings = db.getFinancialSettings();
    setEventSettings(settings);
    setFinancialSettings(finSettings);
    setInvestments(db.getInvestments());
    setParticipants(db.getParticipants());
    setTasks(db.getTasks());
    setChecklist(db.getChecklist());
    setScenarios(db.getScenarios());

    // Sync temporary parameters
    setTempName(settings.name);
    setTempDate(settings.date);
    setTempTicketPrice(finSettings.ticketPriceDefault);
    setTempTargetParticipants(finSettings.targetParticipants);
    setTempLocation(settings.location);
  }, []);

  // --- Auth State and Invite Verification ---
  useEffect(() => {
    // Check invite token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      setCheckingInvite(true);
      if (supabase) {
        supabase
          .from('invites')
          .select('email, used')
          .eq('token', token)
          .eq('used', false)
          .single()
          .then(({ data }) => {
            setCheckingInvite(false);
            if (data && !data.used) {
              setInviteEmail(data.email || '');
              setInviteValid(true);
            } else {
              setInviteValid(false);
            }
          });
      } else {
        setCheckingInvite(false);
        setInviteValid(false);
      }
    }

    if (!supabase) {
      setLoadingProfile(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoadingProfile(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchUserProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, name')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data as any);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Sync from Cloud only when authenticated session is active
  useEffect(() => {
    if (session) {
      db.fetchAllFromCloud().then((cloudData) => {
        if (cloudData) {
          if (cloudData.eventSettings) {
            setEventSettings(cloudData.eventSettings);
            setTempName(cloudData.eventSettings.name);
            setTempDate(cloudData.eventSettings.date);
            setTempLocation(cloudData.eventSettings.location);
          }
          if (cloudData.financialSettings) {
            setFinancialSettings(cloudData.financialSettings);
            setTempTicketPrice(cloudData.financialSettings.ticketPriceDefault);
            setTempTargetParticipants(cloudData.financialSettings.targetParticipants);
          }
          if (cloudData.investments) setInvestments(cloudData.investments);
          if (cloudData.participants) setParticipants(cloudData.participants);
          if (cloudData.tasks) setTasks(cloudData.tasks);
          if (cloudData.checklists) setChecklist(cloudData.checklists);
          if (cloudData.scenarios) setScenarios(cloudData.scenarios);
        }
      });
    }
  }, [session]);

  // Fetch users and invites for admin console
  const fetchUsersAndInvites = async () => {
    if (!supabase || profile?.role !== 'admin') return;
    setLoadingUsersTab(true);
    try {
      const [usersRes, invitesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('invites').select('*').order('created_at', { ascending: false })
      ]);
      if (usersRes.data) setUsersList(usersRes.data);
      if (invitesRes.data) setInvitesList(invitesRes.data);
    } catch (err) {
      console.error('Error fetching users and invites:', err);
    } finally {
      setLoadingUsersTab(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios' && profile?.role === 'admin') {
      fetchUsersAndInvites();
    }
  }, [activeTab, profile]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail.trim() || !supabase) return;
    try {
      const token = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { error } = await supabase.from('invites').insert({
        email: newInviteEmail.trim().toLowerCase(),
        token,
        created_by: session?.user?.id
      });
      if (error) throw error;
      setNewInviteEmail('');
      alert('Convite por e-mail gerado com sucesso!');
      fetchUsersAndInvites();
    } catch (err: any) {
      alert('Erro ao gerar convite: ' + err.message);
    }
  };

  const handleRotateGeneralInvite = async () => {
    if (!supabase) return;
    if (confirm('Tem certeza que deseja rotacionar o link geral? O link anterior deixará de funcionar imediatamente para novos cadastros.')) {
      try {
        // 1. Invalida convites gerais anteriores (onde email is null) marcando-os como used = true
        await supabase
          .from('invites')
          .update({ used: true })
          .is('email', null)
          .eq('used', false);
          
        // 2. Cria o novo convite geral
        const token = typeof crypto.randomUUID === 'function' 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
        const { error } = await supabase.from('invites').insert({
          token,
          created_by: session?.user?.id
          // email é omitido, então fica nulo
        });
        
        if (error) throw error;
        alert('Link geral renovado com sucesso! O novo link já está ativo.');
        fetchUsersAndInvites();
      } catch (err: any) {
        alert('Erro ao renovar link geral: ' + err.message);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!supabase) return;
    if (confirm('Tem certeza que deseja excluir permanentemente o acesso deste usuário? Ele não poderá mais fazer login.')) {
      try {
        const { error } = await supabase.rpc('delete_user', { user_id: userId });
        if (error) throw error;
        alert('Usuário excluído com sucesso.');
        fetchUsersAndInvites();
      } catch (err: any) {
        alert('Erro ao excluir usuário: ' + err.message);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !loginEmail.trim() || !loginPassword) return;
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (error) {
        // Auto-cadastro do administrador no primeiro acesso
        if (loginEmail.trim().toLowerCase() === 'eduardo@esquadriasmoradadosol.com.br' && error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: loginEmail.trim().toLowerCase(),
            password: loginPassword,
          });
          if (signUpError) throw signUpError;
          
          if (signUpData.session) {
            setSession(signUpData.session);
            alert('Conta de Administrador criada e conectada com sucesso!');
          } else {
            alert('Conta de Administrador registrada! Por favor, verifique seu e-mail (caso a confirmação esteja ativa no painel do Supabase) ou tente fazer login.');
          }
          return;
        }
        throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !inviteToken) return;
    const emailToRegister = (inviteEmail || signUpEmail).trim().toLowerCase();
    if (!emailToRegister) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }
    if (!signUpName.trim()) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signUp({
        email: emailToRegister,
        password: signUpPassword,
        options: {
          data: {
            invite_token: inviteToken,
            name: signUpName.trim()
          }
        }
      });
      if (error) throw error;
      
      alert('Cadastro concluído com sucesso!');
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setInviteToken(null);
      setInviteValid(null);
      setSignUpEmail('');
      setSignUpName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta. Verifique o link de convite.');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- Countdown Effect ---
  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = new Date(eventSettings.date).getTime();
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [eventSettings.date]);

  // --- Anime.js Page & Stagger Transitions ---
  useEffect(() => {
    // 1. Transition the main tab container
    animate('.tab-content-container', {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 350,
      ease: 'outQuad'
    });

    // 2. If transitioning to Dashboard, stagger indicators
    if (activeTab === 'dashboard') {
      animate('.indicator-card', {
        scale: [0.92, 1],
        opacity: [0, 1],
        translateY: [25, 0],
        delay: stagger(40, { start: 100 }),
        duration: 800,
        ease: 'outBack'
      });
    }

    // 3. If transitioning to CRM, stagger cards in each column
    if (activeTab === 'crm') {
      animate('.kanban-card', {
        scale: [0.95, 1],
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(30, { start: 100 }),
        duration: 600,
        ease: 'outQuad'
      });
    }

    // 4. If transitioning to Planning, stagger checklist items
    if (activeTab === 'planejamento') {
      animate('.checklist-item', {
        opacity: [0, 1],
        translateX: [-10, 0],
        delay: stagger(25, { start: 100 }),
        duration: 500,
        ease: 'outQuad'
      });
    }

    // 5. If transitioning to Timeline/Schedule, stagger timeline items
    if (activeTab === 'programacao') {
      animate('.timeline-item', {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: stagger(40, { start: 100 }),
        duration: 600,
        ease: 'outBack'
      });
    }
  }, [activeTab]);

  // --- Database Sync Helpers ---
  const updateInvestmentsState = (newInvestments: Investment[]) => {
    setInvestments(newInvestments);
    db.saveInvestments(newInvestments);
  };

  const updateParticipantsState = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    db.saveParticipants(newParticipants);
  };

  const updateTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    db.saveTasks(newTasks);
  };

  const updateChecklistState = (newChecklist: ChecklistItem[]) => {
    setChecklist(newChecklist);
    db.saveChecklist(newChecklist);
  };

  const updateEventSettingsState = (newSettings: EventSettings) => {
    setEventSettings(newSettings);
    db.saveEventSettings(newSettings);
  };

  const updateFinancialSettingsState = (newSettings: FinancialSettings) => {
    setFinancialSettings(newSettings);
    db.saveFinancialSettings(newSettings);
  };

  // --- Calculations for Real-Time Indicators ---
  const metrics = useMemo(() => {
    const target = financialSettings.targetParticipants;
    
    // Active participants: Confirmado, Pago, Participou
    const confirmedCount = participants.filter(p => ['Confirmado', 'Pago', 'Participou'].includes(p.status)).length;
    const paidCount = participants.filter(p => ['Pago', 'Participou'].includes(p.status)).length;
    const occupancyRate = (confirmedCount / (target || 1)) * 100;

    const ticketPrice = financialSettings.ticketPriceDefault;

    // Financial Metrics
    const expectedRevenue = confirmedCount * ticketPrice;
    const actualRevenue = paidCount * ticketPrice;

    // Investment (costs) where status is NOT 'Cancelado'
    const totalInvestment = investments
      .filter(i => i.status !== 'Cancelado')
      .reduce((sum, item) => sum + item.value, 0);

    const paidInvestment = investments
      .filter(i => i.status === 'Pago')
      .reduce((sum, item) => sum + item.value, 0);

    const projectedProfit = expectedRevenue - totalInvestment;
    const actualProfit = actualRevenue - paidInvestment;

    const roi = totalInvestment > 0 ? (projectedProfit / totalInvestment) * 100 : 0;
    const actualRoi = paidInvestment > 0 ? (actualProfit / paidInvestment) * 100 : 0;

    const ticketMedio = ticketPrice;
    const profitPerParticipant = confirmedCount > 0 ? projectedProfit / confirmedCount : 0;
    const breakevenParticipants = ticketPrice > 0 ? Math.ceil(totalInvestment / ticketPrice) : 0;

    return {
      targetParticipants: target,
      confirmedCount,
      occupancyRate,
      expectedRevenue,
      actualRevenue,
      totalInvestment,
      paidInvestment,
      projectedProfit,
      actualProfit,
      roi,
      actualRoi,
      ticketMedio,
      profitPerParticipant,
      breakevenParticipants
    };
  }, [participants, investments, financialSettings]);

  // --- Calculations for CRM Leads Dashboard ---
  const crmMetrics = useMemo(() => {
    const totalLeads = participants.length;
    const contactedCount = participants.filter(p => p.status !== 'Lead').length;
    const hotCount = participants.filter(p => p.status === 'Interessado').length;
    const confirmedAndPaidCount = participants.filter(p => ['Confirmado', 'Pago', 'Participou'].includes(p.status)).length;
    
    const conversionRate = totalLeads > 0 ? (confirmedAndPaidCount / totalLeads) * 100 : 0;
    
    const ticketPrice = financialSettings.ticketPriceDefault;
    
    // Value in negotiation (Lead, Contatado, Interessado)
    const pipelineValue = participants
      .filter(p => ['Lead', 'Contatado', 'Interessado'].includes(p.status))
      .length * ticketPrice;
      
    // Realized/Confirmed revenue from CRM
    const realizedRevenue = confirmedAndPaidCount * ticketPrice;
    
    return {
      totalLeads,
      contactedCount,
      hotCount,
      confirmedAndPaidCount,
      conversionRate,
      pipelineValue,
      realizedRevenue
    };
  }, [participants, financialSettings]);

  const funnelData = useMemo(() => {
    const exactCounts = {
      Lead: participants.filter(p => p.status === 'Lead').length,
      Contatado: participants.filter(p => p.status === 'Contatado').length,
      Interessado: participants.filter(p => p.status === 'Interessado').length,
      Confirmado: participants.filter(p => p.status === 'Confirmado').length,
      Pago: participants.filter(p => p.status === 'Pago').length,
      Participou: participants.filter(p => p.status === 'Participou').length,
    };
    
    const participou = exactCounts.Participou;
    const pago = exactCounts.Pago + participou;
    const confirmado = exactCounts.Confirmado + pago;
    const interessado = exactCounts.Interessado + confirmado;
    const contatado = exactCounts.Contatado + interessado;
    const lead = exactCounts.Lead + contatado;
    
    return [
      { name: '1. Lead', quantidade: lead, atual: exactCounts.Lead, conversion: lead > 0 ? 100 : 0 },
      { name: '2. Contatado', quantidade: contatado, atual: exactCounts.Contatado, conversion: lead > 0 ? (contatado / lead) * 100 : 0 },
      { name: '3. Interessado', quantidade: interessado, atual: exactCounts.Interessado, conversion: contatado > 0 ? (interessado / contatado) * 100 : 0 },
      { name: '4. Confirmado', quantidade: confirmado, atual: exactCounts.Confirmado, conversion: interessado > 0 ? (confirmado / interessado) * 100 : 0 },
      { name: '5. Pago', quantidade: pago, atual: exactCounts.Pago, conversion: confirmado > 0 ? (pago / confirmado) * 100 : 0 },
      { name: '6. Participou', quantidade: participou, atual: exactCounts.Participou, conversion: pago > 0 ? (participou / pago) * 100 : 0 },
    ];
  }, [participants]);

  const leadsByCityData = useMemo(() => {
    const cityMap: { [key: string]: number } = {};
    participants.forEach(p => {
      const city = p.city || 'Desconhecida';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    return Object.keys(cityMap)
      .map(city => ({ name: city, Leads: cityMap[city] }))
      .sort((a, b) => b.Leads - a.Leads)
      .slice(0, 8);
  }, [participants]);

  const leadsByCompanyData = useMemo(() => {
    const companyMap: { [key: string]: number } = {};
    participants.forEach(p => {
      if (p.company) {
        companyMap[p.company] = (companyMap[p.company] || 0) + 1;
      }
    });
    return Object.keys(companyMap)
      .map(comp => ({ name: comp, Leads: companyMap[comp] }))
      .sort((a, b) => b.Leads - a.Leads)
      .slice(0, 5);
  }, [participants]);

  const leadsTrendData = useMemo(() => {
    const dates: { [key: string]: number } = {};
    participants.forEach(p => {
      const dateStr = p.dateAdded || new Date().toISOString().split('T')[0];
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dates).sort();
    let accumulated = 0;
    return sortedDates.map(d => {
      accumulated += dates[d];
      const parts = d.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      return {
        date: formattedDate,
        Leads: accumulated
      };
    });
  }, [participants]);

  const crmInsights = useMemo(() => {
    const insights: string[] = [];
    const total = participants.length;
    const leadsNoContact = participants.filter(p => p.status === 'Lead').length;
    const hotLeads = participants.filter(p => p.status === 'Interessado').length;
    const target = financialSettings.targetParticipants;
    const confirmedCount = participants.filter(p => ['Confirmado', 'Pago', 'Participou'].includes(p.status)).length;
    const conversion = total > 0 ? (confirmedCount / total) : 0;
    
    if (leadsNoContact > 0) {
      insights.push(`Você tem **${leadsNoContact} lead(s)** na etapa **Lead** sem contato inicial. Envie uma mensagem pelo WhatsApp para engajá-los!`);
    } else {
      insights.push(`Excelente! Todos os leads no seu funil já receberam contato inicial.`);
    }
    
    if (hotLeads > 0) {
      insights.push(`A coluna **Interessado** conta com **${hotLeads} lead(s)** quentes. Ofereça um desconto especial ou tire dúvidas finais para convertê-los.`);
    }
    
    const missingConfirmations = target - confirmedCount;
    if (missingConfirmations > 0) {
      if (conversion > 0) {
        const estimatedLeadsNeeded = Math.ceil(missingConfirmations / conversion);
        insights.push(`Faltam **${missingConfirmations}** confirmados. Com sua conversão de **${(conversion * 100).toFixed(0)}%**, você precisará de mais **${estimatedLeadsNeeded} lead(s)** no funil.`);
      } else {
        insights.push(`Para alcançar sua meta de **${target}** confirmados, comece a mover os primeiros leads para Confirmado/Pago.`);
      }
    } else {
      insights.push(`🎉 Parabéns! Você atingiu ou superou sua meta de **${target}** participantes confirmados no funil!`);
    }
    
    const cityMap: { [key: string]: number } = {};
    participants.forEach(p => {
      const city = p.city || '';
      if (city) cityMap[city] = (cityMap[city] || 0) + 1;
    });
    
    let topCity = '';
    let topCityCount = 0;
    Object.keys(cityMap).forEach(c => {
      if (cityMap[c] > topCityCount) {
        topCityCount = cityMap[c];
        topCity = c;
      }
    });
    
    if (topCity) {
      const percentage = total > 0 ? ((topCityCount / total) * 100).toFixed(0) : '0';
      insights.push(`**${topCity}** é a sua principal fonte de leads, representando **${percentage}%** do pipeline (**${topCityCount} leads**).`);
    }
    
    return insights;
  }, [participants, financialSettings]);

  // --- Investment CRUD Actions ---
  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setInvForm({
      category: 'Coffee Break',
      description: '',
      value: 0,
      responsible: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Previsto'
    });
    setShowInvModal(true);
  };

  const handleEditInvestment = (inv: Investment) => {
    setEditingInvestment(inv);
    setInvForm({
      category: inv.category,
      description: inv.description,
      value: inv.value,
      responsible: inv.responsible,
      date: inv.date,
      status: inv.status
    });
    setShowInvModal(true);
  };

  const handleDeleteInvestment = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      const updated = investments.filter(i => i.id !== id);
      updateInvestmentsState(updated);
    }
  };

  const handleSaveInvestmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvestment) {
      // Edit
      const updated = investments.map(i => 
        i.id === editingInvestment.id 
          ? { ...i, ...invForm, value: Number(invForm.value) } 
          : i
      );
      updateInvestmentsState(updated);
    } else {
      // New
      const newInv: Investment = {
        id: 'inv_' + Date.now(),
        category: invForm.category,
        description: invForm.description,
        value: Number(invForm.value),
        responsible: invForm.responsible,
        date: invForm.date,
        status: invForm.status
      };
      updateInvestmentsState([...investments, newInv]);
    }
    setShowInvModal(false);
  };

  // --- Participant CRUD Actions ---
  const handleAddParticipant = () => {
    setEditingParticipant(null);
    setParticipantForm({
      name: '',
      whatsapp: '',
      city: 'Estância Velha',
      company: '',
      role: '',
      observations: '',
      status: 'Lead'
    });
    setShowParticipantModal(true);
  };

  const handleEditParticipant = (p: Participant) => {
    setEditingParticipant(p);
    setParticipantForm({
      name: p.name,
      whatsapp: p.whatsapp,
      city: p.city,
      company: p.company,
      role: p.role,
      observations: p.observations,
      status: p.status
    });
    setShowParticipantModal(true);
  };

  const handleDeleteParticipant = (id: string) => {
    if (confirm('Deseja realmente remover este participante interessado?')) {
      const updated = participants.filter(p => p.id !== id);
      updateParticipantsState(updated);
    }
  };

  const handleSaveParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParticipant) {
      const updated = participants.map(p => 
        p.id === editingParticipant.id 
          ? { ...p, ...participantForm } 
          : p
      );
      updateParticipantsState(updated);
    } else {
      const newParticipant: Participant = {
        id: 'part_' + Date.now(),
        ...participantForm,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      updateParticipantsState([...participants, newParticipant]);
    }
    setShowParticipantModal(false);
  };

  // --- Task CRUD Actions ---
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      task: '',
      responsible: '',
      priority: 'Média',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Não iniciado'
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      task: task.task,
      responsible: task.responsible,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      const updated = tasks.filter(t => t.id !== id);
      updateTasksState(updated);
    }
  };

  const handleSaveTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const updated = tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskForm } 
          : t
      );
      updateTasksState(updated);
    } else {
      const newT: Task = {
        id: 'tsk_' + Date.now(),
        ...taskForm
      };
      updateTasksState([...tasks, newT]);
    }
    setShowTaskModal(false);
  };

  // --- Checklist Actions ---
  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map(c => 
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    updateChecklistState(updated);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: 'chk_' + Date.now(),
      item: newChecklistItem.trim(),
      completed: false
    };
    updateChecklistState([...checklist, newItem]);
    setNewChecklistItem('');
  };

  // --- Drag and Drop Event Handlers ---
  const handleDragStart = (id: string) => {
    setDraggedParticipantId(id);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setDragOverColumn(colStatus);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'Lead' | 'Contatado' | 'Interessado' | 'Confirmado' | 'Pago' | 'Participou') => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedParticipantId) return;

    const updated = participants.map(p => 
      p.id === draggedParticipantId 
        ? { ...p, status: targetStatus } 
        : p
    );
    updateParticipantsState(updated);
    setDraggedParticipantId(null);
  };

  // --- Scenario Simulator Calculations ---
  const simResults = useMemo(() => {
    const grossRevenue = simParticipants * simTicketPrice;
    const totalCosts = metrics.totalInvestment + simExtraCosts;
    const netProfit = grossRevenue - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Automatic Comparatives (30, 40, 50, 60, 70 people)
    const comparatives = [30, 40, 50, 60, 70].map(qty => {
      const rev = qty * simTicketPrice;
      const profit = rev - (metrics.totalInvestment + simExtraCosts);
      return { qty, profit };
    });

    return {
      grossRevenue,
      totalCosts,
      netProfit,
      roi,
      margin,
      comparatives
    };
  }, [simParticipants, simTicketPrice, simExtraCosts, metrics.totalInvestment]);

  // --- Recharts Data Formatting ---
  
  // Graph 1: Revenue vs Costs (Current confirmed status vs target vs actual)
  const chartRevenueVsCostsData = [
    { name: 'Meta Planejada', Receita: metrics.targetParticipants * financialSettings.ticketPriceDefault, Custos: metrics.totalInvestment },
    { name: 'Confirmados (Projetado)', Receita: metrics.expectedRevenue, Custos: metrics.totalInvestment },
    { name: 'Realizado (Pago)', Receita: metrics.actualRevenue, Custos: metrics.paidInvestment }
  ];

  // Graph 2: Profit by Scenario (using the user's Simulator & Saved scenarios)
  const chartProfitByScenarioData = scenarios.map(sc => {
    const totalC = metrics.totalInvestment + sc.extraCosts;
    const rev = sc.participants * sc.ticketPrice;
    return {
      name: sc.name,
      Lucro: rev - totalC,
      Participantes: sc.participants
    };
  });

  // Graph 3: Costs Distribution (by Category)
  const chartCostsData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    investments
      .filter(i => i.status !== 'Cancelado')
      .forEach(i => {
        categories[i.category] = (categories[i.category] || 0) + i.value;
      });

    return Object.keys(categories).map(cat => ({
      name: cat,
      value: categories[cat]
    }));
  }, [investments]);

  const COLORS = ['#00D4FF', '#7C3AED', '#00F2FE', '#EC4899', '#3B82F6', '#EAB308', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Graph 4: Cumulative Inscriptions Confirmation Over Time (ordered by date)
  const chartInscriptionsTrend = useMemo(() => {
    const dates: { [key: string]: number } = {};
    
    // Initial accumulation from confirmed participants
    participants
      .filter(p => ['Confirmado', 'Pago', 'Participou'].includes(p.status))
      .forEach(p => {
        const dateStr = p.dateAdded || '2026-05-15';
        dates[dateStr] = (dates[dateStr] || 0) + 1;
      });

    const sortedDates = Object.keys(dates).sort();
    let accumulated = 0;
    
    return sortedDates.map(d => {
      accumulated += dates[d];
      // Format to readable DD/MM
      const parts = d.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
      return {
        date: formattedDate,
        Confirmados: accumulated
      };
    });
  }, [participants]);

  // --- Investment Filter Logic ---
  const filteredInvestments = investments.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(invSearch.toLowerCase()) || 
                          i.responsible.toLowerCase().includes(invSearch.toLowerCase());
    const matchesCategory = invFilterCategory === 'Todas' || i.category === invFilterCategory;
    const matchesStatus = invFilterStatus === 'Todos' || i.status === invFilterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const investmentCategories = [
    'Palestrante', 'Auditório', 'Coffee Break', 'Água', 'Refrigerantes',
    'Sonorização', 'Marketing', 'Tráfego Pago', 'Equipe', 'Fotografia',
    'Brindes', 'Material Impresso', 'Outros'
  ];

  // --- CRM Filter Logic ---
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                          p.company.toLowerCase().includes(crmSearch.toLowerCase()) ||
                          p.role.toLowerCase().includes(crmSearch.toLowerCase());
    const matchesCity = crmCityFilter === 'Todas' || p.city === crmCityFilter;
    return matchesSearch && matchesCity;
  });

  const crmCities = Array.from(new Set(participants.map(p => p.city)));

  // --- Tasks Filter Logic ---
  const filteredTasks = tasks.filter(t => {
    const matchesStatus = taskFilterStatus === 'Todos' || t.status === taskFilterStatus;
    const matchesPriority = taskFilterPriority === 'Todas' || t.priority === taskFilterPriority;
    return matchesStatus && matchesPriority;
  });



  const handleSaveLaunchSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: EventSettings = {
      ...eventSettings,
      name: tempName,
      date: tempDate,
      location: tempLocation
    };
    const newFinSettings: FinancialSettings = {
      ...financialSettings,
      ticketPriceDefault: Number(tempTicketPrice),
      targetParticipants: Number(tempTargetParticipants)
    };
    updateEventSettingsState(newSettings);
    updateFinancialSettingsState(newFinSettings);
    alert('Configurações de lançamento salvas e aplicadas em todo o site com sucesso!');
  };

  const formattedEventDateHeader = useMemo(() => {
    try {
      if (eventSettings.date) {
        const parts = eventSettings.date.split('T')[0].split('-');
        if (parts.length === 3) {
          const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          const day = parseInt(parts[2], 10);
          const monthIndex = parseInt(parts[1], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            return `${day} de ${months[monthIndex]}`;
          }
        }
      }
    } catch (e) {
      // fallback
    }
    return "16 de Agosto";
  }, [eventSettings.date]);

  const parsedEventNameHeader = useMemo(() => {
    const name = eventSettings.name || "";
    if (name.toUpperCase().startsWith("AI EXPERIENCE")) {
      const main = name.substring(0, 13);
      const sub = name.substring(13).trim();
      return { main, sub };
    }
    const lastSpace = name.lastIndexOf(" ");
    if (lastSpace !== -1) {
      return {
        main: name.substring(0, lastSpace),
        sub: name.substring(lastSpace).trim()
      };
    }
    return { main: name, sub: "" };
  }, [eventSettings.name]);

  // Renderizar a Landing Page de Marketing caso a rota ou parâmetro esteja ativo
  if (marketingVersion === 'v2') {
    return (
      <MarketingLandingPage2 
        inviteToken={inviteToken} 
        confirmedCount={metrics.confirmedCount}
        onNavigateToCheckout={() => {
          setMarketingVersion('checkout');
          window.history.pushState({}, document.title, '?page=checkout');
        }}
        onNavigateToAuth={() => {
          setMarketingVersion(null);
          window.history.pushState({}, document.title, '?page=admin');
        }} 
      />
    );
  }

  if (marketingVersion === 'checkout') {
    return (
      <CheckoutPage 
        onNavigateToLanding={() => {
          setMarketingVersion('v2');
          window.history.pushState({}, document.title, '?page=marketing');
        }}
        ticketPrice={financialSettings.ticketPriceDefault}
      />
    );
  }

  if (marketingVersion === 'v1') {
    return (
      <MarketingLandingPage 
        inviteToken={inviteToken} 
        confirmedCount={metrics.confirmedCount}
        onNavigateToAuth={() => {
          setMarketingVersion(null);
          window.history.pushState({}, document.title, '?page=admin');
        }} 
      />
    );
  }

  // Se estiver carregando o perfil do usuário, mostrar um carregador premium
  if (loadingProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06091e', color: '#fff', position: 'relative' }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10, margin: 'auto' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 212, 255, 0.1)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>VERIFICANDO CONEXÃO SEGURA...</span>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver conectado, mostrar tela de Login/Cadastro
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#06091e' }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="ambient-glow-1"></div>
        <div className="ambient-glow-2"></div>

        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px 30px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,255,255,0.1)' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              <span className="gradient-text-blue-purple">AI EXPERIENCE</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Painel Executivo • Acesso Restrito
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#F87171', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {checkingInvite ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0', margin: 'auto' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(0, 212, 255, 0.1)', borderTopColor: 'var(--neon-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validando link de convite...</span>
            </div>
          ) : inviteToken && inviteValid === false ? (
            /* Convite inválido ou expirado */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <AlertCircle size={32} style={{ color: '#F87171' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Convite Inválido ou Já Utilizado</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Este link de convite expirou, foi desativado ou já foi utilizado para cadastrar uma conta.
                </p>
              </div>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  setInviteToken(null);
                  setInviteValid(null);
                }}
              >
                Voltar para o Login
              </button>
            </div>
          ) : inviteToken && inviteValid === true ? (
            /* Formulário de Cadastro (Signup) com convite validado */
            <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <div>Convite validado! Crie sua senha de acesso.</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Seu Nome:</label>
                <input 
                  type="text" 
                  value={signUpName} 
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="glass-input" 
                  placeholder="Nome Completo"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>E-mail:</label>
                {inviteEmail ? (
                  <input 
                    type="email" 
                    value={inviteEmail} 
                    disabled 
                    className="glass-input" 
                    style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                ) : (
                  <input 
                    type="email" 
                    value={signUpEmail} 
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="glass-input" 
                    placeholder="exemplo@email.com"
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Senha:</label>
                <input 
                  type="password" 
                  value={signUpPassword} 
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="glass-input" 
                  placeholder="Defina uma senha"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Confirmar Senha:</label>
                <input 
                  type="password" 
                  value={signUpConfirmPassword} 
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="glass-input" 
                  placeholder="Confirme a senha"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={authLoading}>
                {authLoading ? 'Criando conta...' : 'Registrar e Acessar'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button 
                  type="button"
                  onClick={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setInviteToken(null);
                    setInviteValid(null);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Cancelar e voltar para o Login
                </button>
              </div>
            </form>
          ) : (
            /* Formulário de Login padrão */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>E-mail:</label>
                <input 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Senha:</label>
                <input 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={authLoading}>
                {authLoading ? 'Verificando...' : 'Entrar'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '10px' }}>
                * Novos acessos exigem convite. O cadastro de novos usuários é restrito à liberação por link do administrador.
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingBottom: '40px' }}>
      {/* Background Glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* STICKY HEADER & NAVBAR with Progressive Blur */}
      <header style={{ borderBottom: '1px solid var(--border-color)', padding: '14px 0', background: 'rgba(6, 9, 30, 0.45)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="gradient-blur">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Left: Brand logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 10px rgba(0, 242, 254, 0.2)' }}>AI</span>
                  <span style={{ color: 'var(--neon-purple)', textShadow: '0 0 10px rgba(124, 58, 237, 0.2)' }}>EXPERIENCE</span>
                </h1>
                {parsedEventNameHeader.sub && (
                  <span className="badge" style={{ background: 'rgba(0, 242, 254, 0.04)', color: 'var(--neon-cyan)', fontSize: '0.7rem', border: '1px solid var(--neon-cyan)', borderRadius: '20px', padding: '2px 10px', fontWeight: 700 }}>
                    {parsedEventNameHeader.sub}
                  </span>
                )}
                <span className="badge hide-mobile" style={{ background: 'rgba(124, 58, 237, 0.04)', color: 'var(--neon-purple)', fontSize: '0.7rem', border: '1px solid var(--neon-purple)', borderRadius: '20px', padding: '2px 10px', fontWeight: 700 }}>
                  {eventSettings.location.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }} className="hide-mobile">
                Evento presencial hands-on • Leve seu notebook • {formattedEventDateHeader}
              </p>
            </div>
          </div>

          {/* Center: Compact Premium Countdown Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '6px 16px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile">
              <Clock size={12} style={{ color: 'var(--neon-cyan)' }} /> RESTAM:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-title)', fontSize: '0.9rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 8px rgba(0,212,255,0.3)' }}>{String(timeLeft.days).padStart(2, '0')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>d</span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ color: 'var(--neon-purple)', textShadow: '0 0 8px rgba(124,58,237,0.3)' }}>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>h</span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 8px rgba(0,212,255,0.3)' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>m</span>
              <span style={{ color: 'var(--text-muted)' }}>:</span>
              <span style={{ color: 'var(--neon-pink)', textShadow: '0 0 8px rgba(236,72,153,0.3)' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>s</span>
            </div>
          </div>
          
          {/* Right: Quick actions (Logout and connected info) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }} className="hide-mobile">
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conectado como</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neon-cyan)' }}>
                {profile?.name || (profile?.email === 'eduardo@esquadriasmoradadosol.com.br' || session?.user?.email === 'eduardo@esquadriasmoradadosol.com.br' ? 'Eduardo Both' : (profile?.email || session?.user?.email))}
              </div>
            </div>
            <a 
              href="?page=marketing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.75rem', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                color: '#10B981',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'rgba(16, 185, 129, 0.05)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={12} /> Ver Landing Page
            </a>
            <button 
              onClick={() => supabase?.auth.signOut()} 
              className="btn-secondary" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.75rem', 
                border: '1px solid rgba(236,72,153,0.3)', 
                color: 'var(--neon-pink)',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'rgba(236,72,153,0.05)'
              }}
            >
              Sair
            </button>
          </div>

        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '20px auto 0', padding: '0 20px' }}>

        {/* NAVIGATION TABS */}
        <nav style={{ marginBottom: '24px' }}>
          <div className="tab-nav">
            {[
              { id: 'dashboard', label: 'Dashboard Executivo', icon: <Layers size={16} /> },
              { id: 'simulador', label: 'Simulador Financeiro', icon: <TrendingUp size={16} /> },
              { id: 'investimentos', label: 'Gestão de Investimentos', icon: <DollarSign size={16} /> },
              { id: 'crm', label: 'CRM Kanban de Leads', icon: <Users size={16} /> },
              { id: 'planejamento', label: 'Tarefas & Checklist', icon: <ListTodo size={16} /> },
              { id: 'programacao', label: 'Programação & Ajustes', icon: <Clock size={16} /> },
              ...(profile?.role === 'admin' ? [{ id: 'usuarios', label: 'Usuários & Convites', icon: <Settings size={16} /> }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* TAB CONTENTS */}
        <div className="tab-content-container">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Real-time Indicators Grid (12 indicators) */}
            <section className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} className="gradient-text-blue-purple" /> Indicadores de Saúde Financeira e Viabilidade (Tempo Real)
                </h3>
                <span className="badge badge-pago" style={{ textTransform: 'none' }}>
                  Atualizado em tempo real
                </span>
              </div>
              
              <div className="indicators-grid">
                
                {/* 1. Participantes Meta */}
                <div className="indicator-card accent-blue animate-fadeInUp stagger-1">
                  <div className="indicator-label">Participantes Meta</div>
                  <div className="indicator-value">{metrics.targetParticipants}</div>
                  <div className="indicator-sub">Almejado no planejamento</div>
                </div>

                {/* 2. Participantes Confirmados */}
                <div className="indicator-card accent-blue animate-fadeInUp stagger-2">
                  <div className="indicator-label" style={{ color: 'var(--neon-blue)' }}>Confirmados</div>
                  <div className="indicator-value" style={{ color: 'var(--neon-blue)' }}>{metrics.confirmedCount}</div>
                  <div className="indicator-sub">Inscritos ou já confirmados</div>
                </div>

                {/* 3. Taxa de Ocupação */}
                <div className="indicator-card accent-cyan animate-fadeInUp stagger-3">
                  <div className="indicator-label" style={{ color: 'var(--neon-cyan)' }}>Taxa de Ocupação</div>
                  <div className="indicator-value" style={{ color: 'var(--neon-cyan)' }}>
                    {metrics.occupancyRate.toFixed(1)}%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '4px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(metrics.occupancyRate, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))' }}></div>
                    </div>
                  </div>
                </div>

                {/* 4. Receita Prevista */}
                <div className="indicator-card accent-pink animate-fadeInUp stagger-4">
                  <div className="indicator-label" style={{ color: 'var(--neon-pink)' }}>Receita Projetada</div>
                  <div className="indicator-value" style={{ color: 'var(--neon-pink)' }}>R$ {metrics.expectedRevenue.toLocaleString('pt-BR')}</div>
                  <div className="indicator-sub">Confirmados × R$ {financialSettings.ticketPriceDefault}</div>
                </div>

                {/* 5. Receita Atual */}
                <div className="indicator-card accent-emerald animate-fadeInUp stagger-5">
                  <div className="indicator-label" style={{ color: '#34D399' }}>Receita Recebida</div>
                  <div className="indicator-value" style={{ color: '#34D399' }}>R$ {metrics.actualRevenue.toLocaleString('pt-BR')}</div>
                  <div className="indicator-sub">Comprovadamente paga</div>
                </div>

                {/* 6. Investimento Total */}
                <div className="indicator-card accent-rose animate-fadeInUp stagger-6">
                  <div className="indicator-label" style={{ color: '#F87171' }}>Custo do Evento</div>
                  <div className="indicator-value" style={{ color: '#F87171' }}>R$ {metrics.totalInvestment.toLocaleString('pt-BR')}</div>
                  <div className="indicator-sub">Previstos e Pagos</div>
                </div>

                {/* 7. Lucro Projetado */}
                <div className="indicator-card accent-purple animate-fadeInUp stagger-7">
                  <div className="indicator-label" style={{ color: 'var(--neon-purple)' }}>Lucro Projetado</div>
                  <div className="indicator-value" style={{ color: 'var(--neon-purple)' }}>
                    R$ {metrics.projectedProfit.toLocaleString('pt-BR')}
                  </div>
                  <div className="indicator-sub">Com todos os confirmados</div>
                </div>

                {/* 8. Lucro Atual */}
                <div className={`indicator-card ${metrics.actualProfit >= 0 ? 'accent-emerald' : 'accent-rose'} animate-fadeInUp stagger-8`}>
                  <div className="indicator-label">Lucro Líquido Atual</div>
                  <div className="indicator-value" style={{ color: metrics.actualProfit >= 0 ? '#34D399' : '#F87171' }}>
                    R$ {metrics.actualProfit.toLocaleString('pt-BR')}
                  </div>
                  <div className="indicator-sub">Receita paga - Investimento pago</div>
                </div>

                {/* 9. ROI Projetado */}
                <div className="indicator-card accent-amber animate-fadeInUp stagger-9">
                  <div className="indicator-label" style={{ color: '#FBBF24' }}>ROI Projetado</div>
                  <div className="indicator-value" style={{ color: '#FBBF24' }}>
                    {metrics.roi.toFixed(0)}%
                  </div>
                  <div className="indicator-sub">Retorno sobre o Investimento</div>
                </div>

                {/* 10. Ticket Médio */}
                <div className="indicator-card accent-blue animate-fadeInUp stagger-10">
                  <div className="indicator-label">Ticket Padrão</div>
                  <div className="indicator-value">R$ {metrics.ticketMedio.toLocaleString('pt-BR')}</div>
                  <div className="indicator-sub">Preço base do lote atual</div>
                </div>

                {/* 11. Lucro por Participante */}
                <div className="indicator-card accent-purple animate-fadeInUp stagger-11">
                  <div className="indicator-label">Lucro p/ Confirmado</div>
                  <div className="indicator-value">
                    R$ {metrics.profitPerParticipant.toFixed(0)}
                  </div>
                  <div className="indicator-sub">Margem média individual</div>
                </div>

                {/* 12. Ponto de Equilíbrio */}
                <div className="indicator-card accent-rose animate-fadeInUp stagger-12">
                  <div className="indicator-label" style={{ color: '#F87171' }}>Breakeven</div>
                  <div className="indicator-value" style={{ color: '#F87171' }}>
                    {metrics.breakevenParticipants}
                  </div>
                  <div className="indicator-sub">Inscrições para cobrir custos</div>
                </div>

              </div>
            </section>

            {/* CHARTS CONTAINER SECTION (4 CHARTS) */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
              
              {/* Graph 1: Receita vs Custos */}
              <div className="glass-panel">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} style={{ color: 'var(--neon-cyan)' }} /> 1. Receitas vs Custos (R$)
                </h4>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartRevenueVsCostsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar dataKey="Receita" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Custos" fill="url(#purpleGrad)" radius={[4, 4, 0, 0]} />
                      
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--neon-blue)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--electric-blue)" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--neon-purple)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9333EA" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graph 2: Lucro por Cenário */}
              <div className="glass-panel">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--neon-purple)' }} /> 2. Lucro Projetado por Cenários de Inscrição (R$)
                </h4>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartProfitByScenarioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Area type="monotone" dataKey="Lucro" stroke="var(--neon-purple)" fill="url(#glowPurple)" strokeWidth={2} />
                      
                      <defs>
                        <linearGradient id="glowPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--neon-purple)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--bg-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graph 3: Distribuição dos Custos */}
              <div className="glass-panel">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} style={{ color: 'var(--neon-pink)' }} /> 3. Distribuição de Custos por Categoria
                </h4>
                <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {chartCostsData.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum custo cadastrado</div>
                  ) : (
                    <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center' }}>
                      <div style={{ flex: 1.2, height: '100%' }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={chartCostsData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {chartCostsData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '200px', paddingRight: '8px' }}>
                        {chartCostsData.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length], flexShrink: 0 }}></span>
                              <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: 600 }}>R$ {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Graph 4: Inscrições Confirmadas ao Longo do Tempo */}
              <div className="glass-panel">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} style={{ color: 'var(--neon-cyan)' }} /> 4. Curva de Inscrições Confirmadas (Evolução)
                </h4>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartInscriptionsTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="Confirmados" stroke="var(--neon-cyan)" strokeWidth={3} dot={{ fill: 'var(--neon-cyan)', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </section>

          </div>
        )}

        {/* TAB 2: SCENARIO SIMULATOR */}
        {activeTab === 'simulador' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Description Alert */}
            <div className="glass-panel" style={{ borderLeft: '4px solid var(--neon-cyan)', background: 'rgba(0, 212, 255, 0.02)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ color: 'var(--neon-cyan)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Simulador Dinâmico de Viabilidade</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    Teste cenários financeiros do evento modificando o volume de participantes, preço do lote de ingressos e custos operacionais adicionais em tempo real. Os custos fixos da tabela de investimentos (Atualmente **R$ {metrics.totalInvestment}**) já são incorporados como despesa base automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Interactive Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Sliders Panel */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} style={{ color: 'var(--neon-cyan)' }} /> Parâmetros do Cenário
                </h3>

                {/* Parameter 1: Number of Participants */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Participantes Projetados:</span>
                    <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--neon-cyan)' }}>{simParticipants} pessoas</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={simParticipants}
                    onChange={(e) => setSimParticipants(Number(e.target.value))}
                    className="neon-slider" 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>10 Mínimo</span>
                    <span>100 Máximo (Capacidade)</span>
                  </div>
                </div>

                {/* Parameter 2: Ticket Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Preço do Ingresso (R$):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input 
                      type="number" 
                      value={simTicketPrice} 
                      onChange={(e) => setSimTicketPrice(Number(e.target.value))}
                      className="glass-input" 
                      style={{ paddingLeft: '32px' }}
                    />
                  </div>
                </div>

                {/* Parameter 3: Extra Optional Costs */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Custos Extras do Cenário (R$):
                  </label>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    (Ex: Margem de contingência, marketing extra, coffee incrementado)
                  </span>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input 
                      type="number" 
                      value={simExtraCosts} 
                      onChange={(e) => setSimExtraCosts(Number(e.target.value))}
                      className="glass-input" 
                      style={{ paddingLeft: '32px' }}
                      placeholder="Ex: 1000"
                    />
                  </div>
                </div>
              </div>

              {/* Simulation Instant Results Cards */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--neon-purple)' }} /> Projeção de Resultados
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  
                  {/* Revenue */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receita Bruta</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700 }}>
                      R$ {simResults.grossRevenue.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Costs */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Custos Totais</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: '#F87171' }}>
                      R$ {simResults.totalCosts.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Profit */}
                  <div style={{ gridColumn: 'span 2', background: 'rgba(124, 58, 237, 0.04)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neon-purple)', fontWeight: 600 }}>Lucro Líquido Projetado</div>
                    <div style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800, color: simResults.netProfit >= 0 ? 'var(--neon-cyan)' : '#F87171', margin: '4px 0' }}>
                      R$ {simResults.netProfit.toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Fórmula: (Participantes × Ingresso) - (Custos Cadastrados + Custos Extras)
                    </div>
                  </div>

                  {/* ROI */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROI Estimado</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: simResults.roi >= 0 ? '#34D399' : '#F87171' }}>
                      {simResults.roi.toFixed(0)}%
                    </div>
                  </div>

                  {/* Margem */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Margem de Lucro</div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: simResults.margin >= 0 ? '#34D399' : '#F87171' }}>
                      {simResults.margin.toFixed(1)}%
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* ROW 2: AUTOMATIC COMPARATIVE TABLE */}
            <section className="glass-panel">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--neon-cyan)' }} /> Tabela Comparativa de Lucratividade Automática
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Esta tabela simula automaticamente o resultado líquido do evento para diferentes faixas de público pagante, considerando o ticket atual de **R$ {simTicketPrice}** e custos fixos.
              </p>

              <div className="premium-table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Pessoas Confirmadas</th>
                      <th>Receita Bruta</th>
                      <th>Custo Operacional Total</th>
                      <th>Lucro Líquido Projetado</th>
                      <th>ROI Projetado</th>
                      <th>Status de Viabilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simResults.comparatives.map((comp) => {
                      const totalC = metrics.totalInvestment + simExtraCosts;
                      const roiPct = totalC > 0 ? (comp.profit / totalC) * 100 : 0;
                      const isViable = comp.profit > 0;
                      return (
                        <tr key={comp.qty} style={{ 
                          background: comp.qty === simParticipants ? 'rgba(0, 212, 255, 0.03)' : 'transparent',
                          borderLeft: comp.qty === simParticipants ? '3px solid var(--neon-cyan)' : 'none'
                        }}>
                          <td style={{ fontWeight: 700 }}>{comp.qty} participantes {comp.qty === simParticipants ? ' (Atual)' : ''}</td>
                          <td>R$ {(comp.qty * simTicketPrice).toLocaleString('pt-BR')}</td>
                          <td style={{ color: 'var(--text-muted)' }}>R$ {totalC.toLocaleString('pt-BR')}</td>
                          <td style={{ fontWeight: 700, color: isViable ? 'var(--neon-cyan)' : '#F87171' }}>
                            R$ {comp.profit.toLocaleString('pt-BR')}
                          </td>
                          <td style={{ fontWeight: 600, color: roiPct >= 0 ? '#34D399' : '#F87171' }}>
                            {roiPct.toFixed(0)}%
                          </td>
                          <td>
                            {comp.profit > 10000 ? (
                              <span className="badge badge-previsto" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--neon-purple)' }}>Excelente Margem</span>
                            ) : isViable ? (
                              <span className="badge badge-pago">Viável</span>
                            ) : (
                              <span className="badge badge-cancelado">Déficit</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* TAB 3: INVESTMENTS (CRUD) */}
        {activeTab === 'investimentos' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Control row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gestão de Custos e Investimentos</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Controle cada despesa prevista, paga ou cancelada. O total de investimentos é alimentado nos dashboards.
                </p>
              </div>

              <button className="btn-primary" onClick={handleAddInvestment}>
                <Plus size={16} /> Adicionar Investimento
              </button>
            </div>

            {/* Filter and Search Panel */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por descrição ou responsável..." 
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="glass-input" 
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                
                {/* Category filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    value={invFilterCategory}
                    onChange={(e) => setInvFilterCategory(e.target.value)}
                    className="glass-select" 
                    style={{ width: '160px', padding: '8px' }}
                  >
                    <option value="Todas">Todas Categorias</option>
                    {investmentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <select 
                  value={invFilterStatus}
                  onChange={(e) => setInvFilterStatus(e.target.value)}
                  className="glass-select" 
                  style={{ width: '130px', padding: '8px' }}
                >
                  <option value="Todos">Todos Status</option>
                  <option value="Previsto">Previsto</option>
                  <option value="Pago">Pago</option>
                  <option value="Cancelado">Cancelado</option>
                </select>

              </div>
            </div>

            {/* Table of Investments */}
            <div className="premium-table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Responsável</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredInvestments.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ 
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: COLORS[investmentCategories.indexOf(inv.category) % COLORS.length],
                            marginRight: '8px'
                          }}></span>
                          {inv.category}
                        </td>
                        <td>{inv.description || '-'}</td>
                        <td style={{ fontWeight: 700, color: inv.status === 'Cancelado' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          R$ {inv.value.toLocaleString('pt-BR')}
                        </td>
                        <td>{inv.responsible}</td>
                        <td>{inv.date ? new Date(inv.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                        <td>
                          <span className={`badge badge-${inv.status.toLowerCase()}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button className="btn-icon" onClick={() => handleEditInvestment(inv)} title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDeleteInvestment(inv.id)} style={{ color: '#F87171' }} title="Excluir">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Aggregate Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="glass-panel" style={{ width: '280px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Total Previsto:</span>
                  <span style={{ fontWeight: 600 }}>
                    R$ {investments.filter(i => i.status === 'Previsto').reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Total Pago:</span>
                  <span style={{ fontWeight: 600, color: '#34D399' }}>
                    R$ {investments.filter(i => i.status === 'Pago').reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                  <span>Custo Total:</span>
                  <span style={{ color: 'var(--neon-blue)' }}>R$ {metrics.totalInvestment.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CRM KANBAN BOARD */}
        {activeTab === 'crm' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Control header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Funil de Interessados & Pipeline CRM</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {crmSubView === 'kanban' 
                    ? 'Arraste e solte os cards entre as colunas para atualizar o status e recalcular as finanças automaticamente.' 
                    : 'Acompanhe métricas, conversões de leads e insights de vendas em tempo real.'}
                </p>
              </div>

              {/* Segmented sub-tab switch */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '4px' }}>
                <button 
                  className={`tab-btn ${crmSubView === 'kanban' ? 'active' : ''}`}
                  onClick={() => setCrmSubView('kanban')}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.8rem', 
                    minWidth: '120px', 
                    border: 'none', 
                    background: crmSubView === 'kanban' ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)' : 'transparent', 
                    color: crmSubView === 'kanban' ? 'var(--neon-blue)' : 'var(--text-secondary)',
                    borderRadius: '6px'
                  }}
                >
                  Quadro Kanban
                </button>
                <button 
                  className={`tab-btn ${crmSubView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCrmSubView('dashboard')}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.8rem', 
                    minWidth: '140px', 
                    border: 'none', 
                    background: crmSubView === 'dashboard' ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)' : 'transparent', 
                    color: crmSubView === 'dashboard' ? 'var(--neon-blue)' : 'var(--text-secondary)',
                    borderRadius: '6px'
                  }}
                >
                  Métricas & Dashboard
                </button>
              </div>

              <button className="btn-primary" onClick={handleAddParticipant}>
                <Plus size={16} /> Adicionar Interessado
              </button>
            </div>

            {crmSubView === 'kanban' ? (
              <>
                {/* Filter and Search Panel */}
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  
                  <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome, empresa ou cargo..." 
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      className="glass-input" 
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>

                  {/* City filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                    <select 
                      value={crmCityFilter}
                      onChange={(e) => setCrmCityFilter(e.target.value)}
                      className="glass-select" 
                      style={{ width: '160px', padding: '8px' }}
                    >
                      <option value="Todas">Todas Cidades</option>
                      {crmCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Kanban Columns (Drag and Drop Container) */}
                <div className="kanban-board">
                  
                  {statuses.map((col) => {
                    // Get participants belonging to this status column
                    const colParticipants = filteredParticipants.filter(p => p.status === col.status);
                    
                    return (
                      <div 
                        key={col.status}
                        className={`kanban-column ${dragOverColumn === col.status ? 'dragover' : ''}`}
                        onDragOver={(e) => handleDragOver(e, col.status)}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(e) => handleDrop(e, col.status)}
                      >
                        <div className="kanban-column-header">
                          <div className="kanban-column-title">
                            <span style={{ 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: col.color,
                              boxShadow: `0 0 8px ${col.color}`
                            }}></span>
                            {col.label}
                          </div>
                          <span className="kanban-column-badge">{colParticipants.length}</span>
                        </div>

                        <div className="kanban-column-list">
                          {colParticipants.length === 0 ? (
                            <div style={{ 
                              flex: 1, 
                              border: '1px dashed rgba(255,255,255,0.04)', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: 'var(--text-muted)', 
                              fontSize: '0.75rem',
                              textAlign: 'center',
                              padding: '20px'
                            }}>
                              Arraste leads para esta coluna
                            </div>
                          ) : (
                            colParticipants.map((p) => (
                              <div 
                                key={p.id}
                                className={`kanban-card ${draggedParticipantId === p.id ? 'dragging' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(p.id)}
                                onDragEnd={() => setDraggedParticipantId(null)}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</span>
                                  
                                  {/* Action tools */}
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn-icon" onClick={() => handleEditParticipant(p)} style={{ padding: '3px', border: 'none', background: 'transparent' }} title="Editar">
                                      <Edit2 size={11} />
                                    </button>
                                    <button className="btn-icon" onClick={() => handleDeleteParticipant(p.id)} style={{ padding: '3px', border: 'none', background: 'transparent', color: '#F87171' }} title="Remover">
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>

                                {/* Details */}
                                {p.company && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                    💼 {p.company} {p.role ? `(${p.role})` : ''}
                                  </div>
                                )}

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                  <span>📍 {p.city}</span>
                                  
                                  {/* WhatsApp trigger */}
                                  {p.whatsapp && (
                                    <a 
                                      href={`https://wa.me/55${p.whatsapp.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(p.name)}, tudo bem? Aqui é o ${encodeURIComponent(eventSettings.partnerName)} do time do ${encodeURIComponent(eventSettings.name)}. Fiquei feliz com o seu interesse!`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '3px', 
                                        color: '#34D399', 
                                        textDecoration: 'none', 
                                        fontWeight: 600, 
                                        fontSize: '0.7rem' 
                                      }}
                                      title="Iniciar conversa no WhatsApp"
                                      onClick={(e) => e.stopPropagation()} // Prevent trigger drag
                                    >
                                      <Phone size={10} /> {p.whatsapp}
                                    </a>
                                  )}
                                </div>

                                {p.observations && (
                                  <div style={{ 
                                    marginTop: '8px', 
                                    padding: '6px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '4px', 
                                    fontSize: '0.7rem', 
                                    color: 'var(--text-secondary)',
                                    borderLeft: '2px solid rgba(255,255,255,0.1)',
                                    wordBreak: 'break-word'
                                  }}>
                                    📝 {p.observations}
                                  </div>
                                )}

                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              </>
            ) : (
              /* DASHBOARD & ANALYTICS VIEW */
              <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. Metric Cards Grid */}
                <div className="indicators-grid">
                  
                  {/* Card 1: Total Leads */}
                  <div className="indicator-card accent-blue">
                    <div className="indicator-label">Total de Leads</div>
                    <div className="indicator-value">{crmMetrics.totalLeads}</div>
                    <div className="indicator-sub">Cadastrados no pipeline</div>
                  </div>

                  {/* Card 2: Contatados */}
                  <div className="indicator-card accent-purple">
                    <div className="indicator-label" style={{ color: 'var(--neon-purple)' }}>Contatados</div>
                    <div className="indicator-value" style={{ color: 'var(--neon-purple)' }}>{crmMetrics.contactedCount}</div>
                    <div className="indicator-sub">Com contato estabelecido</div>
                  </div>

                  {/* Card 3: Taxa de Conversão */}
                  <div className="indicator-card accent-cyan">
                    <div className="indicator-label" style={{ color: 'var(--neon-cyan)' }}>Taxa de Conversão</div>
                    <div className="indicator-value" style={{ color: 'var(--neon-cyan)' }}>{crmMetrics.conversionRate.toFixed(1)}%</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(crmMetrics.conversionRate, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Valor em Negociação */}
                  <div className="indicator-card accent-pink">
                    <div className="indicator-label" style={{ color: 'var(--neon-pink)' }}>Pipeline em Negociação</div>
                    <div className="indicator-value" style={{ color: 'var(--neon-pink)' }}>R$ {crmMetrics.pipelineValue.toLocaleString('pt-BR')}</div>
                    <div className="indicator-sub">Não confirmados × R$ {financialSettings.ticketPriceDefault}</div>
                  </div>

                  {/* Card 5: Receita Confirmada */}
                  <div className="indicator-card accent-emerald">
                    <div className="indicator-label" style={{ color: '#34D399' }}>Receita Confirmada</div>
                    <div className="indicator-value" style={{ color: '#34D399' }}>R$ {crmMetrics.realizedRevenue.toLocaleString('pt-BR')}</div>
                    <div className="indicator-sub">Faturamento gerado via CRM</div>
                  </div>

                </div>

                {/* 2. Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
                  
                  {/* Chart 1: Funil de Vendas Horizontal */}
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={16} style={{ color: 'var(--neon-blue)' }} /> Funil de Conversão do CRM
                    </h4>
                    <div style={{ display: 'flex', width: '100%', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1.5, height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                            <XAxis type="number" stroke="#9CA3AF" tick={{ fontSize: 11 }} hide />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{ fontSize: 11 }} width={90} />
                            <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                            <Bar dataKey="quantidade" fill="url(#crmBluePurpleGrad)" radius={[0, 4, 4, 0]}>
                              {funnelData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                            <defs>
                              <linearGradient id="crmBluePurpleGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="5%" stopColor="var(--neon-blue)" stopOpacity={0.85}/>
                                <stop offset="95%" stopColor="var(--neon-purple)" stopOpacity={0.85}/>
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Step Conversion Details */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '180px' }}>
                        {funnelData.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span style={{ color: 'var(--text-secondary)' }}>{step.name.substring(3)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <strong style={{ color: '#fff' }}>{step.quantidade}</strong>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({step.conversion.toFixed(0)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Leads por Cidade */}
                  <div className="glass-panel">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: 'var(--neon-cyan)' }} /> Origem dos Leads por Cidade (Top Cidades)
                    </h4>
                    <div style={{ width: '100%', height: 260 }}>
                      {leadsByCityData.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          Nenhum lead com cidade cadastrada
                        </div>
                      ) : (
                        <ResponsiveContainer>
                          <BarChart data={leadsByCityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                            <Bar dataKey="Leads" fill="url(#crmCyanGrad)" radius={[4, 4, 0, 0]}>
                              {leadsByCityData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                              ))}
                            </Bar>
                            <defs>
                              <linearGradient id="crmCyanGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.85}/>
                                <stop offset="95%" stopColor="var(--electric-blue)" stopOpacity={0.2}/>
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Chart 3: Curva de Entrada de Leads */}
                  <div className="glass-panel">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} style={{ color: 'var(--neon-pink)' }} /> Crescimento e Entrada de Leads (Acumulado)
                    </h4>
                    <div style={{ width: '100%', height: 260 }}>
                      {leadsTrendData.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          Nenhum lead cadastrado para gerar histórico
                        </div>
                      ) : (
                        <ResponsiveContainer>
                          <AreaChart data={leadsTrendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <ChartTooltip contentStyle={{ background: '#0b0f24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="Leads" stroke="var(--neon-pink)" fill="url(#crmAreaPink)" strokeWidth={2.5} />
                            <defs>
                              <linearGradient id="crmAreaPink" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--neon-pink)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--bg-primary)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Chart 4: Principais Empresas Parceiras (B2B) */}
                  <div className="glass-panel">
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={16} style={{ color: 'var(--neon-purple)' }} /> Empresas do Ecossistema com Mais Leads
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '260px' }}>
                      {leadsByCompanyData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Nenhuma empresa cadastrada nos leads.
                        </div>
                      ) : (
                        leadsByCompanyData.map((comp, idx) => (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>💼 {comp.name}</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neon-blue)' }}>{comp.Leads} lead(s)</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${(comp.Leads / crmMetrics.totalLeads) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))' }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* 3. AI Smart Insights & Sales Recommendations */}
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--neon-purple)', background: 'rgba(124, 58, 237, 0.02)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Sparkles size={18} style={{ color: 'var(--neon-purple)' }} /> Insights Inteligentes & Ações Recomendadas
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {crmInsights.map((insight, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                        <div dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 5: PLANNING & CHECKLIST */}
        {activeTab === 'planejamento' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Interactive Checklist and Tasks Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              
              {/* Checklist Column */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--neon-cyan)' }} /> Checklist Inicial do Lançamento
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Etapas essenciais do projeto. Clique para marcar como concluído.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '420px' }}>
                  {checklist.map((item) => (
                    <div 
                      key={item.id} 
                      className={`checklist-item ${item.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleChecklist(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={`custom-checkbox ${item.completed ? 'checked' : ''}`}></span>
                      <span style={{ fontSize: '0.85rem', flex: 1 }}>{item.item}</span>
                    </div>
                  ))}
                </div>

                {/* Add Checklist Item Form */}
                <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Adicionar novo item no checklist..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="glass-input" 
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '10px 14px' }}>
                    <Plus size={16} />
                  </button>
                </form>
              </div>

              {/* Tasks Board Column */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListTodo size={18} style={{ color: 'var(--neon-purple)' }} /> Planejamento de Tarefas Executivas
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Cronograma e divisão de tarefas críticas do evento.
                    </p>
                  </div>

                  <button className="btn-secondary" onClick={handleAddTask} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Nova Tarefa
                  </button>
                </div>

                {/* Task filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select 
                    value={taskFilterStatus}
                    onChange={(e) => setTaskFilterStatus(e.target.value)}
                    className="glass-select" 
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                  >
                    <option value="Todos">Todos Status</option>
                    <option value="Não iniciado">Não iniciado</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>

                  <select 
                    value={taskFilterPriority}
                    onChange={(e) => setTaskFilterPriority(e.target.value)}
                    className="glass-select" 
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                  >
                    <option value="Todas">Todas Prioridades</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px', paddingRight: '4px' }}>
                  {filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Nenhuma tarefa encontrada.
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div key={t.id} style={{ 
                        background: 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'var(--transition-smooth)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: t.status === 'Concluído' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.status === 'Concluído' ? 'line-through' : 'none' }}>
                            {t.task}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-icon" onClick={() => handleEditTask(t)} style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                              <Edit2 size={11} />
                            </button>
                            <button className="btn-icon" onClick={() => handleDeleteTask(t.id)} style={{ padding: '4px', border: 'none', background: 'transparent', color: '#F87171' }}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                            <span style={{ color: 'var(--text-muted)' }}>Resp: <strong>{t.responsible}</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Prazo: {new Date(t.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                            <span style={{ 
                              color: t.status === 'Concluído' ? '#10B981' : t.status === 'Em andamento' ? '#F59E0B' : '#6B7280',
                              fontWeight: 700 
                            }}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 6: PROGRAMAÇÃO E CONFIGURAÇÃO */}
        {activeTab === 'programacao' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              
              {/* Event Highlights Section */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--neon-cyan)' }} /> Destaques & Propósito Prático
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A essência do "Hands-On Experience" desenhado para trazer resultado prático para empresários.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  
                  <div style={{ padding: '14px', background: 'rgba(0, 212, 255, 0.02)', border: '1px solid rgba(0, 212, 255, 0.1)', borderRadius: '10px' }}>
                    <div style={{ color: 'var(--neon-cyan)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Play size={12} fill="var(--neon-cyan)" /> Hands-On
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      Aprenda construindo projetos e inteligências reais em tempo de execução.
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(124, 58, 237, 0.02)', border: '1px solid rgba(124, 58, 237, 0.1)', borderRadius: '10px' }}>
                    <div style={{ color: 'var(--neon-purple)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Users size={12} /> Networking
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      Conecte-se com empresários de destaque de Estância Velha e região.
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Sparkles size={12} style={{ color: 'var(--neon-cyan)' }} /> IA Aplicada
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      Ferramentas práticas para vendas, automação e redução de custos.
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <BookOpen size={12} style={{ color: 'var(--neon-purple)' }} /> Notebook Obrigatório
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      Garantia de que todos estarão construindo soluções juntos.
                    </div>
                  </div>

                </div>

                {/* Projecting Settings Edit Area */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Ajustar Parâmetros do Lançamento</h4>
                  
                  <form onSubmit={handleSaveLaunchSettings} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Título do Evento:
                      </label>
                      <input 
                        type="text" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="glass-input" 
                        style={{ fontSize: '0.85rem', padding: '8px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Data do Evento (ISO):
                        </label>
                        <input 
                          type="datetime-local" 
                          value={tempDate ? tempDate.substring(0, 16) : ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempDate(val ? `${val}:00-03:00` : '');
                          }}
                          className="glass-input" 
                          style={{ fontSize: '0.85rem', padding: '8px' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Ticket Padrão (R$):
                        </label>
                        <input 
                          type="number" 
                          value={tempTicketPrice} 
                          onChange={(e) => setTempTicketPrice(Number(e.target.value))}
                          className="glass-input" 
                          style={{ fontSize: '0.85rem', padding: '8px' }}
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Meta Participantes:
                        </label>
                        <input 
                          type="number" 
                          value={tempTargetParticipants} 
                          onChange={(e) => setTempTargetParticipants(Number(e.target.value))}
                          className="glass-input" 
                          style={{ fontSize: '0.85rem', padding: '8px' }}
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Localização do Evento:
                        </label>
                        <input 
                          type="text" 
                          value={tempLocation} 
                          onChange={(e) => setTempLocation(e.target.value)}
                          className="glass-input" 
                          style={{ fontSize: '0.85rem', padding: '8px' }}
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ 
                        marginTop: '12px', 
                        width: '100%', 
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={16} /> Salvar e Confirmar Alterações
                    </button>
                  </form>
                </div>

              </div>

              {/* Event Timeline / Schedule Section */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--neon-purple)' }} /> Cronograma & Linha do Tempo Visual
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Abaixo está o roteiro estruturado do dia, contendo os 11 blocos da imersão (total de 8 horas de conteúdo prático).
                </p>

                <div className="timeline">
                  {[
                    { time: '30min', title: 'Check-in', desc: 'Café, kit do builder, setup da máquina e ice-breaker.' },
                    { time: '20min', title: 'IA First', desc: 'Como a IA virou o motor da evolução do software.' },
                    { time: '20min', title: 'A Era do Selfware', desc: 'DIY com IA: ao invés de contratar serviços, construa sob medida. Scripts e automações que otimizam o seu dia.' },
                    { time: '20min', title: 'IA Criadora de Apps', desc: 'Panorama das plataformas que constroem apps por IA.' },
                    { time: '40min', title: 'Design é Tudo', desc: 'Design System, skills e dicas para interfaces que vendem.' },
                    { time: '20min', title: 'O Método', desc: 'LLM, Guide, Janela de Contexto, Discovery Driven.' },
                    { time: '30min', title: 'Intervalo', desc: 'Café, networking, respira.' },
                    { time: '1h', title: 'Live Build I — UI & Telas', desc: 'Do brief à interface funcional, gerada ao vivo.' },
                    { time: '1h', title: 'Live Build II — Banco & Lógica', desc: 'RLS, auth, integrações. Sem mistério.' },
                    { time: '2h', title: 'Hands-on: Seu App', desc: 'Bancada, mentoria 1:1, você constrói o seu.' },
                    { time: '1h', title: 'After', desc: 'Comunidade, conexões e a tour continua.' }
                  ].map((item, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-title">{item.title}</div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 7: USER & INVITE MANAGEMENT (ADMIN ONLY) */}
        {activeTab === 'usuarios' && profile?.role === 'admin' && (
          <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Controle de Usuários e Convites</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Gere links de convite para novos membros e gerencie as contas ativas do painel.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              {/* Box 1: Link Geral de Acesso */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--neon-cyan)' }} /> Link Geral de Cadastro (Sem e-mail pré-definido)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Use este link para enviar a qualquer convidado. Você pode renovar este link a qualquer momento; ao fazer isso, o link antigo deixará de funcionar imediatamente.
                </p>
                {(() => {
                  const generalInvite = invitesList.find(inv => !inv.used && !inv.email);
                  if (generalInvite) {
                    const link = `${window.location.origin}${window.location.pathname}?invite=${generalInvite.token}`;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="text" 
                            value={link} 
                            readOnly 
                            className="glass-input" 
                            style={{ fontSize: '0.75rem', padding: '10px', flex: 1 }}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <button 
                            className="btn-primary" 
                            onClick={() => {
                              navigator.clipboard.writeText(link);
                              alert('Link de convite geral copiado!');
                            }}
                          >
                            Copiar Link
                          </button>
                        </div>
                        <button 
                          className="btn-secondary" 
                          style={{ borderColor: 'rgba(236,72,153,0.3)', color: 'var(--neon-pink)', alignSelf: 'flex-start', fontSize: '0.75rem', padding: '6px 12px' }}
                          onClick={handleRotateGeneralInvite}
                        >
                          🔄 Renovar / Rotacionar Link (Invalida o atual)
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '12px' }}>Nenhum link geral ativo no momento.</span>
                        <button className="btn-primary" onClick={handleRotateGeneralInvite}>Gerar Novo Link Geral</button>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Box 2: Gerar Convite por E-mail */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} style={{ color: 'var(--neon-cyan)' }} /> Convite Nominal por E-mail
                </h4>
                <form onSubmit={handleCreateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      E-mail do Convidado:
                    </label>
                    <input 
                      type="email" 
                      placeholder="exemplo@email.com" 
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Criar Convite Nominal
                  </button>
                </form>
              </div>

              {/* Box 3: Convites Nominais Ativos */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  Convites Nominais Ativos
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {invitesList.filter(inv => !inv.used && inv.email).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                      Nenhum convite nominal pendente.
                    </div>
                  ) : (
                    invitesList.filter(inv => !inv.used && inv.email).map((inv) => {
                      const link = `${window.location.origin}${window.location.pathname}?invite=${inv.token}`;
                      return (
                        <div key={inv.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.email}</span>
                            <span className="badge badge-previsto" style={{ fontSize: '0.6rem' }}>Pendente</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input 
                              type="text" 
                              value={link} 
                              readOnly 
                              className="glass-input" 
                              style={{ fontSize: '0.7rem', padding: '6px', height: 'auto', flex: 1 }} 
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button 
                              className="btn-secondary" 
                              style={{ fontSize: '0.7rem', padding: '0 10px' }} 
                              onClick={() => {
                                navigator.clipboard.writeText(link);
                                alert('Link copiado!');
                              }}
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Usuários com Acesso</h4>
              <div className="premium-table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Perfil</th>
                      <th>Data de Criação</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsersTab ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name || (u.email === 'eduardo@esquadriasmoradadosol.com.br' ? 'Eduardo Both' : '-')}</td>
                          <td style={{ fontWeight: 600 }}>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'badge-pago' : 'badge-previsto'}`}>
                              {u.role === 'admin' ? 'Administrador' : 'Membro'}
                            </span>
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                          <td style={{ textAlign: 'right' }}>
                            {u.email !== 'eduardo@esquadriasmoradadosol.com.br' && u.email !== session?.user?.email ? (
                              <button 
                                className="btn-icon" 
                                style={{ color: '#F87171' }} 
                                onClick={() => handleDeleteUser(u.id)}
                                title="Excluir Acesso"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. INVESTMENT CRUD MODAL */}
      {showInvModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel glass-panel-neon" style={{ width: '100%', maxWidth: '480px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingInvestment ? 'Editar Custo / Investimento' : 'Novo Custo / Investimento'}
              </h3>
              <button className="btn-icon" onClick={() => setShowInvModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>

            <form onSubmit={handleSaveInvestmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Categoria:</label>
                <select 
                  value={invForm.category}
                  onChange={(e) => setInvForm({ ...invForm, category: e.target.value })}
                  className="glass-select"
                  required
                >
                  {investmentCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Descrição:</label>
                <input 
                  type="text" 
                  value={invForm.description}
                  onChange={(e) => setInvForm({ ...invForm, description: e.target.value })}
                  placeholder="Ex: Aluguel de microfones ou coffee adicional"
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Valor (R$):</label>
                  <input 
                    type="number" 
                    value={invForm.value}
                    onChange={(e) => setInvForm({ ...invForm, value: Number(e.target.value) })}
                    className="glass-input"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Responsável:</label>
                  <input 
                    type="text" 
                    value={invForm.responsible}
                    onChange={(e) => setInvForm({ ...invForm, responsible: e.target.value })}
                    placeholder="Ex: Gabriel"
                    className="glass-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Data:</label>
                  <input 
                    type="date" 
                    value={invForm.date}
                    onChange={(e) => setInvForm({ ...invForm, date: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status:</label>
                  <select 
                    value={invForm.status}
                    onChange={(e) => setInvForm({ ...invForm, status: e.target.value as any })}
                    className="glass-select"
                    required
                  >
                    <option value="Previsto">Previsto</option>
                    <option value="Pago">Pago</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowInvModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Investimento</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. CRM PARTICIPANT CRUD MODAL */}
      {showParticipantModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel glass-panel-purple" style={{ width: '100%', maxWidth: '520px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingParticipant ? 'Editar Participante Interessado' : 'Novo Lead / Interessado'}
              </h3>
              <button className="btn-icon" onClick={() => setShowParticipantModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>

            <form onSubmit={handleSaveParticipantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nome Completo:</label>
                  <input 
                    type="text" 
                    value={participantForm.name}
                    onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                    placeholder="Ex: Carlos Roberto"
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>WhatsApp (DDD + Número):</label>
                  <input 
                    type="text" 
                    value={participantForm.whatsapp}
                    onChange={(e) => setParticipantForm({ ...participantForm, whatsapp: e.target.value })}
                    placeholder="Ex: 51988887777"
                    className="glass-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Cidade:</label>
                  <input 
                    type="text" 
                    value={participantForm.city}
                    onChange={(e) => setParticipantForm({ ...participantForm, city: e.target.value })}
                    placeholder="Ex: Estância Velha"
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Empresa:</label>
                  <input 
                    type="text" 
                    value={participantForm.company}
                    onChange={(e) => setParticipantForm({ ...participantForm, company: e.target.value })}
                    placeholder="Ex: Calçados Estância"
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Cargo / Ocupação:</label>
                  <input 
                    type="text" 
                    value={participantForm.role}
                    onChange={(e) => setParticipantForm({ ...participantForm, role: e.target.value })}
                    placeholder="Ex: Diretor de Operações"
                    className="glass-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status Funil CRM:</label>
                  <select 
                    value={participantForm.status}
                    onChange={(e) => setParticipantForm({ ...participantForm, status: e.target.value as any })}
                    className="glass-select"
                    required
                  >
                    <option value="Lead">Lead</option>
                    <option value="Contatado">Contatado</option>
                    <option value="Interessado">Interessado</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pago">Pago</option>
                    <option value="Participou">Participou</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Observações / Desafios:</label>
                <textarea 
                  value={participantForm.observations}
                  onChange={(e) => setParticipantForm({ ...participantForm, observations: e.target.value })}
                  placeholder="Ex: Quer automatizar atendimento comercial da metalúrgica"
                  className="glass-textarea"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowParticipantModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Interessado</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. TASK CRUD MODAL */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel glass-panel-neon" style={{ width: '100%', maxWidth: '460px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingTask ? 'Editar Tarefa Executiva' : 'Nova Tarefa Executiva'}
              </h3>
              <button className="btn-icon" onClick={() => setShowTaskModal(false)} style={{ border: 'none', background: 'transparent' }}>✕</button>
            </div>

            <form onSubmit={handleSaveTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Descrição da Tarefa:</label>
                <input 
                  type="text" 
                  value={taskForm.task}
                  onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                  placeholder="Ex: Revisar slides ou contatar Gabriel"
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Responsável:</label>
                  <input 
                    type="text" 
                    value={taskForm.responsible}
                    onChange={(e) => setTaskForm({ ...taskForm, responsible: e.target.value })}
                    placeholder="Ex: Eduardo Both"
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Prioridade:</label>
                  <select 
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="glass-select"
                    required
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Data de Prazo:</label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status:</label>
                  <select 
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="glass-select"
                    required
                  >
                    <option value="Não iniciado">Não iniciado</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Tarefa</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
