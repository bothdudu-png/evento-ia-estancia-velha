export interface EventSettings {
  id: string;
  name: string;
  subtitle: string;
  date: string; // ISO String (e.g., 2026-08-16T08:00:00-03:00)
  location: string;
  partnerName: string;
}

export interface FinancialSettings {
  id: string;
  targetParticipants: number;
  ticketPriceDefault: number;
  targetProfit: number;
  extraCostsDefault: number;
}

export interface Investment {
  id: string;
  category: string;
  description: string;
  value: number;
  responsible: string;
  date: string;
  status: 'Previsto' | 'Pago' | 'Cancelado';
}

export interface Participant {
  id: string;
  name: string;
  whatsapp: string;
  city: string;
  company: string;
  role: string;
  observations: string;
  status: 'Lead' | 'Contatado' | 'Interessado' | 'Confirmado' | 'Pago' | 'Participou';
  dateAdded: string;
}

export interface ParticipantStatus {
  id: string;
  status: 'Lead' | 'Contatado' | 'Interessado' | 'Confirmado' | 'Pago' | 'Participou';
  label: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  task: string;
  responsible: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  dueDate: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído';
}

export interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  participants: number;
  ticketPrice: number;
  extraCosts: number;
  isSaved: boolean;
}

// Key definitions for localStorage
const KEYS = {
  EVENT_SETTINGS: 'ai_event_settings',
  FINANCIAL_SETTINGS: 'ai_financial_settings',
  INVESTMENTS: 'ai_investments',
  PARTICIPANTS: 'ai_participants',
  PARTICIPANT_STATUS: 'ai_participant_status',
  TASKS: 'ai_tasks',
  CHECKLISTS: 'ai_checklists',
  SCENARIOS: 'ai_scenarios',
};

// Initial Seed Data
const DEFAULT_EVENT_SETTINGS: EventSettings = {
  id: 'evt_1',
  name: 'AI EXPERIENCE ESTÂNCIA VELHA',
  subtitle: 'Evento presencial e hands-on focado em Inteligência Artificial aplicada aos negócios. Leve seu notebook e construa soluções reais utilizando IA.',
  date: '2026-08-16T08:00:00-03:00',
  location: 'Auditório do parceiro Gabriel Müller',
  partnerName: 'Gabriel Müller',
};

const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  id: 'fin_1',
  targetParticipants: 50,
  ticketPriceDefault: 297,
  targetProfit: 10000,
  extraCostsDefault: 1200,
};

const DEFAULT_PARTICIPANT_STATUSES: ParticipantStatus[] = [
  { id: 'st_1', status: 'Lead', label: 'Lead', color: '#6B7280', order: 1 },
  { id: 'st_2', status: 'Contatado', label: 'Contatado', color: '#3B82F6', order: 2 },
  { id: 'st_3', status: 'Interessado', label: 'Interessado', color: '#EAB308', order: 3 },
  { id: 'st_4', status: 'Confirmado', label: 'Confirmado', color: '#10B981', order: 4 },
  { id: 'st_5', status: 'Pago', label: 'Pago', color: '#00D4FF', order: 5 },
  { id: 'st_6', status: 'Participou', label: 'Participou', color: '#7C3AED', order: 6 },
];

const DEFAULT_INVESTMENTS: Investment[] = [
  { id: 'inv_1', category: 'Coffee Break', description: 'Coffee break completo (salgados, doces e sucos)', value: 1500, responsible: 'Gabriel Müller', date: '2026-08-16', status: 'Previsto' },
  { id: 'inv_2', category: 'Marketing', description: 'Tráfego pago no Meta Ads (Estância Velha e região)', value: 800, responsible: 'Eduardo Both', date: '2026-06-10', status: 'Pago' },
  { id: 'inv_3', category: 'Fotografia', description: 'Cobertura fotográfica profissional (4 horas)', value: 600, responsible: 'Gabriel Müller', date: '2026-08-16', status: 'Previsto' },
  { id: 'inv_4', category: 'Brindes', description: 'Crachás personalizados e canetas touch com marca', value: 450, responsible: 'Eduardo Both', date: '2026-07-05', status: 'Pago' },
  { id: 'inv_5', category: 'Sonorização', description: 'Som de alta fidelidade e microfones adicionais', value: 800, responsible: 'Gabriel Müller', date: '2026-08-16', status: 'Previsto' },
  { id: 'inv_6', category: 'Tráfego Pago', description: 'Anúncios Google Ads focados em empresários locais', value: 500, responsible: 'Eduardo Both', date: '2026-07-01', status: 'Pago' },
];

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: 'part_1', name: 'Rodrigo Becker', whatsapp: '51998877665', city: 'Estância Velha', company: 'Becker Calçados', role: 'Diretor Comercial', observations: 'Muito interessado em IA para automatizar equipe de vendas.', status: 'Pago', dateAdded: '2026-05-20' },
  { id: 'part_2', name: 'Camila Schneider', whatsapp: '51987654321', city: 'Estância Velha', company: 'Studio Design EV', role: 'Sócia-Fundadora', observations: 'Quer entender como aplicar Midjourney e ChatGPT nos processos de branding.', status: 'Confirmado', dateAdded: '2026-05-22' },
  { id: 'part_3', name: 'Guilherme Silva', whatsapp: '51976543210', city: 'Novo Hamburgo', company: 'Inovação Tech', role: 'Gerente de TI', observations: 'Estudando automações com n8n e LLMs.', status: 'Interessado', dateAdded: '2026-05-24' },
  { id: 'part_4', name: 'Juliana Krause', whatsapp: '51965432109', city: 'Estância Velha', company: 'Krause Contabilidade', role: 'CEO', observations: 'Levará sócio. Foco em otimização de atendimento ao cliente.', status: 'Contatado', dateAdded: '2026-05-25' },
  { id: 'part_5', name: 'Lucas Reis', whatsapp: '51954321098', city: 'Ivoti', company: 'Reis & Advogados', role: 'Sócio', observations: 'Foco em análise e geração de contratos via IA.', status: 'Lead', dateAdded: '2026-05-26' },
  { id: 'part_6', name: 'Mariana Flores', whatsapp: '51943210987', city: 'Estância Velha', company: 'Flores & Cia Jardim', role: 'Proprietária', observations: 'Acompanhando posts do Thiago Diaz no Instagram. Super engajada.', status: 'Pago', dateAdded: '2026-05-18' },
  { id: 'part_7', name: 'Eduardo Schmidt', whatsapp: '51932109876', city: 'Campo Bom', company: 'Schmidt Autopeças', role: 'Diretor Geral', observations: 'Confirmou presença mas ainda está pendente do pagamento.', status: 'Confirmado', dateAdded: '2026-05-19' },
  { id: 'part_8', name: 'Gabriel Müller', whatsapp: '51921098765', city: 'Estância Velha', company: 'Müller Partner Tech', role: 'Fundador / Parceiro Local', observations: 'Dono do auditório parceiro. Participando ativamente da coordenação.', status: 'Participou', dateAdded: '2026-05-10' }
];

const DEFAULT_TASKS: Task[] = [
  { id: 'tsk_1', task: 'Validar capacidade elétrica e tomadas do auditório', responsible: 'Gabriel Müller', priority: 'Alta', dueDate: '2026-06-15', status: 'Em andamento' },
  { id: 'tsk_2', task: 'Configurar a página de checkout no Stripe/Hotmart', responsible: 'Eduardo Both', priority: 'Alta', dueDate: '2026-06-10', status: 'Não iniciado' },
  { id: 'tsk_3', task: 'Contratar serviço de Coffee Break para 60 pessoas', responsible: 'Gabriel Müller', priority: 'Média', dueDate: '2026-08-01', status: 'Não iniciado' },
  { id: 'tsk_4', task: 'Criar criativos e copy para tráfego local', responsible: 'Eduardo Both', priority: 'Alta', dueDate: '2026-05-30', status: 'Concluído' },
  { id: 'tsk_5', task: 'Definir kit de brindes físicos (caderno, crachá, caneta)', responsible: 'Eduardo Both', priority: 'Baixa', dueDate: '2026-07-01', status: 'Não iniciado' },
  { id: 'tsk_6', task: 'Configurar rede Wi-Fi temporária de alta velocidade no auditório', responsible: 'Gabriel Müller', priority: 'Alta', dueDate: '2026-08-10', status: 'Não iniciado' },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'chk_1', item: 'Confirmar auditório', completed: true },
  { id: 'chk_2', item: 'Confirmar palestrante', completed: true },
  { id: 'chk_3', item: 'Definir preço', completed: true },
  { id: 'chk_4', item: 'Criar página de inscrição', completed: false },
  { id: 'chk_5', item: 'Criar campanha', completed: false },
  { id: 'chk_6', item: 'Contratar coffee break', completed: false },
  { id: 'chk_7', item: 'Contratar fotógrafo', completed: false },
  { id: 'chk_8', item: 'Definir brindes', completed: false },
  { id: 'chk_9', item: 'Configurar som', completed: false },
  { id: 'chk_10', item: 'Confirmar participantes', completed: false },
];

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: 'scen_1', name: 'Cenário Conservador', participants: 30, ticketPrice: 297, extraCosts: 500, isSaved: true },
  { id: 'scen_2', name: 'Cenário Meta', participants: 50, ticketPrice: 297, extraCosts: 1200, isSaved: true },
  { id: 'scen_3', name: 'Cenário Otimista', participants: 80, ticketPrice: 347, extraCosts: 2000, isSaved: true },
];

// Helper functions for LocalStorage management
export const db = {
  getEventSettings(): EventSettings {
    const data = localStorage.getItem(KEYS.EVENT_SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.EVENT_SETTINGS, JSON.stringify(DEFAULT_EVENT_SETTINGS));
      return DEFAULT_EVENT_SETTINGS;
    }
    return JSON.parse(data);
  },
  saveEventSettings(settings: EventSettings): void {
    localStorage.setItem(KEYS.EVENT_SETTINGS, JSON.stringify(settings));
  },

  getFinancialSettings(): FinancialSettings {
    const data = localStorage.getItem(KEYS.FINANCIAL_SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.FINANCIAL_SETTINGS, JSON.stringify(DEFAULT_FINANCIAL_SETTINGS));
      return DEFAULT_FINANCIAL_SETTINGS;
    }
    return JSON.parse(data);
  },
  saveFinancialSettings(settings: FinancialSettings): void {
    localStorage.setItem(KEYS.FINANCIAL_SETTINGS, JSON.stringify(settings));
  },

  getInvestments(): Investment[] {
    const data = localStorage.getItem(KEYS.INVESTMENTS);
    if (!data) {
      localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
      return DEFAULT_INVESTMENTS;
    }
    return JSON.parse(data);
  },
  saveInvestments(investments: Investment[]): void {
    localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(investments));
  },

  getParticipants(): Participant[] {
    const data = localStorage.getItem(KEYS.PARTICIPANTS);
    if (!data) {
      localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(DEFAULT_PARTICIPANTS));
      return DEFAULT_PARTICIPANTS;
    }
    return JSON.parse(data);
  },
  saveParticipants(participants: Participant[]): void {
    localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(participants));
  },

  getParticipantStatuses(): ParticipantStatus[] {
    const data = localStorage.getItem(KEYS.PARTICIPANT_STATUS);
    if (!data) {
      localStorage.setItem(KEYS.PARTICIPANT_STATUS, JSON.stringify(DEFAULT_PARTICIPANT_STATUSES));
      return DEFAULT_PARTICIPANT_STATUSES;
    }
    return JSON.parse(data);
  },

  getTasks(): Task[] {
    const data = localStorage.getItem(KEYS.TASKS);
    if (!data) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(data);
  },
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getChecklist(): ChecklistItem[] {
    const data = localStorage.getItem(KEYS.CHECKLISTS);
    if (!data) {
      localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(DEFAULT_CHECKLIST));
      return DEFAULT_CHECKLIST;
    }
    return JSON.parse(data);
  },
  saveChecklist(checklist: ChecklistItem[]): void {
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(checklist));
  },

  getScenarios(): Scenario[] {
    const data = localStorage.getItem(KEYS.SCENARIOS);
    if (!data) {
      localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(DEFAULT_SCENARIOS));
      return DEFAULT_SCENARIOS;
    }
    return JSON.parse(data);
  },
  saveScenarios(scenarios: Scenario[]): void {
    localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(scenarios));
  },

  // Reset database function
  resetDatabase(): void {
    localStorage.setItem(KEYS.EVENT_SETTINGS, JSON.stringify(DEFAULT_EVENT_SETTINGS));
    localStorage.setItem(KEYS.FINANCIAL_SETTINGS, JSON.stringify(DEFAULT_FINANCIAL_SETTINGS));
    localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
    localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(DEFAULT_PARTICIPANTS));
    localStorage.setItem(KEYS.PARTICIPANT_STATUS, JSON.stringify(DEFAULT_PARTICIPANT_STATUSES));
    localStorage.setItem(KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(DEFAULT_CHECKLIST));
    localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(DEFAULT_SCENARIOS));
  }
};
