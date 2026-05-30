import { supabase } from '../integrations/supabase/client';

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
  location: 'Auditório Müller Centro Empresarial',
  partnerName: 'Gabriel'
};

const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  id: 'fin_1',
  targetParticipants: 50,
  ticketPriceDefault: 350,
  targetProfit: 10000,
  extraCostsDefault: 1200
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
  {
    id: "inv_1",
    category: "Coffee Break",
    description: "Coffee break completo (salgados, doces e sucos)",
    value: 1200,
    responsible: "Gabriel Müller",
    date: "2026-08-16",
    status: "Previsto"
  },
  {
    id: "inv_2",
    category: "Marketing",
    description: "Tráfego pago no Meta Ads (Estância Velha e região)",
    value: 800,
    responsible: "Eduardo Both",
    date: "2026-06-10",
    status: "Previsto"
  },
  {
    id: "inv_4",
    category: "Brindes",
    description: "Crachás personalizados e canetas touch com marca",
    value: 450,
    responsible: "Eduardo Both",
    date: "2026-07-05",
    status: "Previsto"
  },
  {
    id: "inv_5",
    category: "Outros",
    description: "Aluguel do Auditório",
    value: 1500,
    responsible: "Gabriel Müller",
    date: "2026-08-16",
    status: "Previsto"
  },
  {
    id: "inv_1780103554596",
    category: "Palestrante",
    description: "Thiago Diaz",
    value: 6000,
    responsible: "Eduardo Both",
    date: "2026-06-10",
    status: "Previsto"
  },
  {
    id: "inv_1780104672226",
    category: "Equipe",
    description: "Recepcionista ",
    value: 250,
    responsible: "Eduardo Both ",
    date: "2026-06-24",
    status: "Previsto"
  },
  {
    id: "inv_1780104760436",
    category: "Outros",
    description: "Camisetas para Equipe do Evento utilizar",
    value: 300,
    responsible: "Eduardo Both",
    date: "2026-06-16",
    status: "Previsto"
  }
];

const DEFAULT_PARTICIPANTS: Participant[] = [
  {
    id: "part_1780104826644",
    name: "Rodrigo Erhart",
    whatsapp: "51981923939",
    city: "Ivoti",
    company: "EWT Engenharia",
    role: "Diretor/Arquiteto",
    observations: "Quer aprender sobre a IA. ",
    status: "Lead",
    dateAdded: "2026-05-30"
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "tsk_1",
    task: "Validar capacidade elétrica e tomadas do auditório",
    responsible: "Gabriel",
    priority: "Alta",
    dueDate: "2026-06-15",
    status: "Em andamento"
  },
  {
    id: "tsk_2",
    task: "Configurar a página de checkout no Stripe/Hotmart",
    responsible: "Thiago",
    priority: "Alta",
    dueDate: "2026-06-10",
    status: "Não iniciado"
  },
  {
    id: "tsk_3",
    task: "Contratar serviço de Coffee Break para 60 pessoas",
    responsible: "Gabriel",
    priority: "Média",
    dueDate: "2026-08-01",
    status: "Não iniciado"
  },
  {
    id: "tsk_4",
    task: "Criar criativos e copy para tráfego local",
    responsible: "Thiago",
    priority: "Alta",
    dueDate: "2026-05-30",
    status: "Concluído"
  },
  {
    id: "tsk_5",
    task: "Definir kit de brindes físicos (caderno, crachá, caneta)",
    responsible: "Thiago",
    priority: "Baixa",
    dueDate: "2026-07-01",
    status: "Não iniciado"
  },
  {
    id: "tsk_6",
    task: "Configurar rede Wi-Fi temporária de alta velocidade no auditório",
    responsible: "Gabriel",
    priority: "Alta",
    dueDate: "2026-08-10",
    status: "Não iniciado"
  }
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "chk_1",
    item: "Confirmar auditório",
    completed: true
  },
  {
    id: "chk_2",
    item: "Confirmar palestrante",
    completed: true
  },
  {
    id: "chk_3",
    item: "Definir preço",
    completed: true
  },
  {
    id: "chk_4",
    item: "Criar página de inscrição",
    completed: false
  },
  {
    id: "chk_5",
    item: "Criar campanha",
    completed: false
  },
  {
    id: "chk_6",
    item: "Contratar coffee break",
    completed: false
  },
  {
    id: "chk_7",
    item: "Contratar fotógrafo",
    completed: false
  },
  {
    id: "chk_8",
    item: "Definir brindes",
    completed: false
  },
  {
    id: "chk_9",
    item: "Configurar som",
    completed: false
  },
  {
    id: "chk_10",
    item: "Confirmar participantes",
    completed: false
  }
];

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "scen_1",
    name: "Cenário Conservador",
    participants: 30,
    ticketPrice: 297,
    extraCosts: 500,
    isSaved: true
  },
  {
    id: "scen_2",
    name: "Cenário Meta",
    participants: 50,
    ticketPrice: 297,
    extraCosts: 1200,
    isSaved: true
  },
  {
    id: "scen_3",
    name: "Cenário Otimista",
    participants: 80,
    ticketPrice: 347,
    extraCosts: 2000,
    isSaved: true
  }
];

// Mapping helpers to convert between CamelCase and SnakeCase for Supabase
const mapEventSettings = {
  toDb(settings: EventSettings) {
    return {
      id: settings.id,
      name: settings.name,
      subtitle: settings.subtitle,
      date: settings.date,
      location: settings.location,
      partner_name: settings.partnerName
    };
  },
  fromDb(row: any): EventSettings {
    return {
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      date: row.date,
      location: row.location,
      partnerName: row.partner_name
    };
  }
};

const mapFinancialSettings = {
  toDb(settings: FinancialSettings) {
    return {
      id: settings.id,
      target_participants: settings.targetParticipants,
      ticket_price_default: settings.ticketPriceDefault,
      target_profit: settings.targetProfit,
      extra_costs_default: settings.extraCostsDefault
    };
  },
  fromDb(row: any): FinancialSettings {
    return {
      id: row.id,
      targetParticipants: row.target_participants,
      ticketPriceDefault: Number(row.ticket_price_default),
      targetProfit: Number(row.target_profit),
      extraCostsDefault: Number(row.extra_costs_default)
    };
  }
};

const mapInvestment = {
  toDb(inv: Investment) {
    return {
      id: inv.id,
      category: inv.category,
      description: inv.description,
      value: inv.value,
      responsible: inv.responsible,
      date: inv.date,
      status: inv.status
    };
  },
  fromDb(row: any): Investment {
    return {
      id: row.id,
      category: row.category,
      description: row.description,
      value: Number(row.value),
      responsible: row.responsible,
      date: row.date,
      status: row.status
    };
  }
};

const mapParticipant = {
  toDb(part: Participant) {
    return {
      id: part.id,
      name: part.name,
      whatsapp: part.whatsapp,
      city: part.city,
      company: part.company,
      role: part.role,
      observations: part.observations,
      status: part.status,
      date_added: part.dateAdded
    };
  },
  fromDb(row: any): Participant {
    return {
      id: row.id,
      name: row.name,
      whatsapp: row.whatsapp,
      city: row.city,
      company: row.company,
      role: row.role,
      observations: row.observations,
      status: row.status,
      dateAdded: row.date_added
    };
  }
};

const mapTask = {
  toDb(task: Task) {
    return {
      id: task.id,
      task: task.task,
      responsible: task.responsible,
      priority: task.priority,
      due_date: task.dueDate,
      status: task.status
    };
  },
  fromDb(row: any): Task {
    return {
      id: row.id,
      task: row.task,
      responsible: row.responsible,
      priority: row.priority,
      dueDate: row.due_date,
      status: row.status
    };
  }
};

const mapChecklistItem = {
  toDb(item: ChecklistItem) {
    return {
      id: item.id,
      item: item.item,
      completed: item.completed
    };
  },
  fromDb(row: any): ChecklistItem {
    return {
      id: row.id,
      item: row.item,
      completed: row.completed
    };
  }
};

const mapScenario = {
  toDb(scen: Scenario) {
    return {
      id: scen.id,
      name: scen.name,
      participants: scen.participants,
      ticket_price: scen.ticketPrice,
      extra_costs: scen.extraCosts,
      is_saved: scen.isSaved
    };
  },
  fromDb(row: any): Scenario {
    return {
      id: row.id,
      name: row.name,
      participants: row.participants,
      ticketPrice: Number(row.ticket_price),
      extraCosts: Number(row.extra_costs),
      isSaved: row.is_saved
    };
  }
};

// Automatic Database Version Management
const DB_VERSION_KEY = 'ai_db_version';
const CURRENT_DB_VERSION = 'v2_estancia'; // increment this whenever you update the seed data

const checkAndMigrateDB = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const activeVersion = localStorage.getItem(DB_VERSION_KEY);
    if (activeVersion !== CURRENT_DB_VERSION) {
      // Clear old keys to allow DEFAULT seed data to populate
      localStorage.removeItem(KEYS.EVENT_SETTINGS);
      localStorage.removeItem(KEYS.FINANCIAL_SETTINGS);
      localStorage.removeItem(KEYS.INVESTMENTS);
      localStorage.removeItem(KEYS.PARTICIPANTS);
      localStorage.removeItem(KEYS.PARTICIPANT_STATUS);
      localStorage.removeItem(KEYS.TASKS);
      localStorage.removeItem(KEYS.CHECKLISTS);
      localStorage.removeItem(KEYS.SCENARIOS);
      
      // Seed the new data
      localStorage.setItem(KEYS.EVENT_SETTINGS, JSON.stringify(DEFAULT_EVENT_SETTINGS));
      localStorage.setItem(KEYS.FINANCIAL_SETTINGS, JSON.stringify(DEFAULT_FINANCIAL_SETTINGS));
      localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
      localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(DEFAULT_PARTICIPANTS));
      localStorage.setItem(KEYS.PARTICIPANT_STATUS, JSON.stringify(DEFAULT_PARTICIPANT_STATUSES));
      localStorage.setItem(KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(DEFAULT_CHECKLIST));
      localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(DEFAULT_SCENARIOS));
      
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    }
  }
};

checkAndMigrateDB();

// Helper functions for LocalStorage and Supabase management
export const db = {
  // Sync everything from Supabase Cloud to local storage on mount
  async fetchAllFromCloud() {
    if (!supabase) return null;
    
    try {
      const [
        evtRes,
        finRes,
        invRes,
        partRes,
        tskRes,
        chkRes,
        scenRes
      ] = await Promise.all([
        supabase.from('event_settings').select('*'),
        supabase.from('financial_settings').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('participants').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('checklists').select('*'),
        supabase.from('scenarios').select('*')
      ]);

      const data: any = {};
      
      if (evtRes.data && evtRes.data.length > 0) {
        data.eventSettings = mapEventSettings.fromDb(evtRes.data[0]);
        localStorage.setItem(KEYS.EVENT_SETTINGS, JSON.stringify(data.eventSettings));
      }
      if (finRes.data && finRes.data.length > 0) {
        data.financialSettings = mapFinancialSettings.fromDb(finRes.data[0]);
        localStorage.setItem(KEYS.FINANCIAL_SETTINGS, JSON.stringify(data.financialSettings));
      }
      if (invRes.data) {
        data.investments = invRes.data.map(mapInvestment.fromDb);
        localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(data.investments));
      }
      if (partRes.data) {
        data.participants = partRes.data.map(mapParticipant.fromDb);
        localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(data.participants));
      }
      if (tskRes.data) {
        data.tasks = tskRes.data.map(mapTask.fromDb);
        localStorage.setItem(KEYS.TASKS, JSON.stringify(data.tasks));
      }
      if (chkRes.data) {
        data.checklists = chkRes.data.map(mapChecklistItem.fromDb);
        localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(data.checklists));
      }
      if (scenRes.data) {
        data.scenarios = scenRes.data.map(mapScenario.fromDb);
        localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(data.scenarios));
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      return null;
    }
  },

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
    if (supabase) {
      supabase
        .from('event_settings')
        .upsert(mapEventSettings.toDb(settings))
        .then(({ error }) => {
          if (error) console.error('Error syncing event_settings:', error);
        });
    }
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
    if (supabase) {
      supabase
        .from('financial_settings')
        .upsert(mapFinancialSettings.toDb(settings))
        .then(({ error }) => {
          if (error) console.error('Error syncing financial_settings:', error);
        });
    }
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
    const prevData = localStorage.getItem(KEYS.INVESTMENTS);
    const prevList: Investment[] = prevData ? JSON.parse(prevData) : [];
    
    localStorage.setItem(KEYS.INVESTMENTS, JSON.stringify(investments));
    
    if (supabase) {
      const newIds = new Set(investments.map(i => i.id));
      const deletedIds = prevList.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        supabase
          .from('investments')
          .delete()
          .in('id', deletedIds)
          .then(({ error }) => {
            if (error) console.error('Error deleting investments:', error);
          });
      }
      
      if (investments.length > 0) {
        supabase
          .from('investments')
          .upsert(investments.map(mapInvestment.toDb))
          .then(({ error }) => {
            if (error) console.error('Error syncing investments:', error);
          });
      }
    }
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
    const prevData = localStorage.getItem(KEYS.PARTICIPANTS);
    const prevList: Participant[] = prevData ? JSON.parse(prevData) : [];
    
    localStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(participants));
    
    if (supabase) {
      const newIds = new Set(participants.map(p => p.id));
      const deletedIds = prevList.filter(p => !newIds.has(p.id)).map(p => p.id);
      
      if (deletedIds.length > 0) {
        supabase
          .from('participants')
          .delete()
          .in('id', deletedIds)
          .then(({ error }) => {
            if (error) console.error('Error deleting participants:', error);
          });
      }
      
      if (participants.length > 0) {
        supabase
          .from('participants')
          .upsert(participants.map(mapParticipant.toDb))
          .then(({ error }) => {
            if (error) console.error('Error syncing participants:', error);
          });
      }
    }
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
    const prevData = localStorage.getItem(KEYS.TASKS);
    const prevList: Task[] = prevData ? JSON.parse(prevData) : [];
    
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    
    if (supabase) {
      const newIds = new Set(tasks.map(t => t.id));
      const deletedIds = prevList.filter(t => !newIds.has(t.id)).map(t => t.id);
      
      if (deletedIds.length > 0) {
        supabase
          .from('tasks')
          .delete()
          .in('id', deletedIds)
          .then(({ error }) => {
            if (error) console.error('Error deleting tasks:', error);
          });
      }
      
      if (tasks.length > 0) {
        supabase
          .from('tasks')
          .upsert(tasks.map(mapTask.toDb))
          .then(({ error }) => {
            if (error) console.error('Error syncing tasks:', error);
          });
      }
    }
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
    const prevData = localStorage.getItem(KEYS.CHECKLISTS);
    const prevList: ChecklistItem[] = prevData ? JSON.parse(prevData) : [];
    
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(checklist));
    
    if (supabase) {
      const newIds = new Set(checklist.map(c => c.id));
      const deletedIds = prevList.filter(c => !newIds.has(c.id)).map(c => c.id);
      
      if (deletedIds.length > 0) {
        supabase
          .from('checklists')
          .delete()
          .in('id', deletedIds)
          .then(({ error }) => {
            if (error) console.error('Error deleting checklists:', error);
          });
      }
      
      if (checklist.length > 0) {
        supabase
          .from('checklists')
          .upsert(checklist.map(mapChecklistItem.toDb))
          .then(({ error }) => {
            if (error) console.error('Error syncing checklists:', error);
          });
      }
    }
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
    const prevData = localStorage.getItem(KEYS.SCENARIOS);
    const prevList: Scenario[] = prevData ? JSON.parse(prevData) : [];
    
    localStorage.setItem(KEYS.SCENARIOS, JSON.stringify(scenarios));
    
    if (supabase) {
      const newIds = new Set(scenarios.map(s => s.id));
      const deletedIds = prevList.filter(s => !newIds.has(s.id)).map(s => s.id);
      
      if (deletedIds.length > 0) {
        supabase
          .from('scenarios')
          .delete()
          .in('id', deletedIds)
          .then(({ error }) => {
            if (error) console.error('Error deleting scenarios:', error);
          });
      }
      
      if (scenarios.length > 0) {
        supabase
          .from('scenarios')
          .upsert(scenarios.map(mapScenario.toDb))
          .then(({ error }) => {
            if (error) console.error('Error syncing scenarios:', error);
          });
      }
    }
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

    const client = supabase;
    if (client) {
      // Clear all items on Cloud as well by wiping and upserting defaults
      Promise.all([
        client.from('event_settings').upsert(mapEventSettings.toDb(DEFAULT_EVENT_SETTINGS)),
        client.from('financial_settings').upsert(mapFinancialSettings.toDb(DEFAULT_FINANCIAL_SETTINGS)),
        client.from('investments').delete().neq('id', 'placeholder'),
        client.from('participants').delete().neq('id', 'placeholder'),
        client.from('tasks').delete().neq('id', 'placeholder'),
        client.from('checklists').delete().neq('id', 'placeholder'),
        client.from('scenarios').delete().neq('id', 'placeholder')
      ]).then(() => {
        Promise.all([
          client.from('investments').upsert(DEFAULT_INVESTMENTS.map(mapInvestment.toDb)),
          client.from('participants').upsert(DEFAULT_PARTICIPANTS.map(mapParticipant.toDb)),
          client.from('tasks').upsert(DEFAULT_TASKS.map(mapTask.toDb)),
          client.from('checklists').upsert(DEFAULT_CHECKLIST.map(mapChecklistItem.toDb)),
          client.from('scenarios').upsert(DEFAULT_SCENARIOS.map(mapScenario.toDb))
        ]).catch(err => console.error('Error resetting cloud seed data:', err));
      }).catch(err => console.error('Error wiping cloud database on reset:', err));
    }
  }
};
