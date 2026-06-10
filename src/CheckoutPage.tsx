import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './integrations/supabase/client';
import { 
  Check, 
  Copy, 
  CreditCard, 
  QrCode, 
  MapPin, 
  Calendar,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import './CheckoutPage.css';

interface CheckoutPageProps {
  onNavigateToLanding: () => void;
  ticketPrice?: number;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigateToLanding,
  ticketPrice = 350
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'success'>('form');
  const [selectedBilling, setSelectedBilling] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  
  // --- Form States (Register) ---
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- Form States (Login) ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- Form States (Credit Card transparent checkout) ---
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCep, setCardCep] = useState('');
  const [cardAddressNumber, setCardAddressNumber] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');

  // --- UX States ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [needProfileDetails, setNeedProfileDetails] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    participantId: string;
    paymentId: string;
    pixQrCodeBase64?: string;
    pixCopyPaste?: string;
    invoiceUrl: string;
    identificationField?: string;
    barCode?: string;
    bankSlipUrl?: string;
  } | null>(null);

  // --- Masking formatting ---
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 3) setCpf(clean);
    else if (clean.length <= 6) setCpf(`${clean.slice(0, 3)}.${clean.slice(3)}`);
    else if (clean.length <= 9) setCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`);
    else setCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 2) setPhone(clean);
    else if (clean.length <= 7) setPhone(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    else setPhone(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '').slice(0, 16);
    const matched = clean.match(/.{1,4}/g);
    setCardNumber(matched ? matched.join(' ') : clean);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '').slice(0, 4);
    if (clean.length <= 2) {
      setCardExpiry(clean);
    } else {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    }
  };

  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setCardCvv(rawVal.replace(/\D/g, '').slice(0, 4));
  };

  const handleCardCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const clean = rawVal.replace(/\D/g, '').slice(0, 8);
    if (clean.length <= 5) {
      setCardCep(clean);
    } else {
      setCardCep(`${clean.slice(0, 5)}-${clean.slice(5)}`);
    }
  };

  // --- Password Rules Validation ---
  const passwordRules = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRules).every(Boolean);
  }, [passwordRules]);

  // --- Supabase Realtime Listener for payment status changes ---
  useEffect(() => {
    const client = supabase;
    if (checkoutStep !== 'payment' || !paymentDetails?.participantId || !client) return;

    // Listen for updates on the participant row in DB
    const channel = client
      .channel('checkout-payment-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'participants', filter: `id=eq.${paymentDetails.participantId}` },
        (payload) => {
          if (payload.new && payload.new.status === 'Pago') {
            setCheckoutStep('success');
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [checkoutStep, paymentDetails?.participantId]);

  // --- Handlers ---
  const handleCopyPix = () => {
    if (paymentDetails?.pixCopyPaste) {
      navigator.clipboard.writeText(paymentDetails.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const invokeCreatePayment = async (body: any) => {
    if (!supabase) throw new Error('Supabase não está configurado.');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Get current session token for authentication if available
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !data.success) {
      throw new Error(data?.error || 'Falha ao processar cobrança no Asaas.');
    }
    return data;
  };

  const getCardPayload = () => {
    if (selectedBilling !== 'CREDIT_CARD') return undefined;

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length !== 16) throw new Error('Número do cartão inválido.');
    if (!cardHolder.trim()) throw new Error('Nome do titular é obrigatório.');
    if (cardExpiry.length !== 5) throw new Error('Validade do cartão inválida. Use o formato MM/AA.');
    const [expMonth, expYear] = cardExpiry.split('/');
    if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) throw new Error('Validade do cartão inválida.');
    const cleanCvv = cardCvv.trim();
    if (cleanCvv.length < 3 || cleanCvv.length > 4) throw new Error('Código de segurança (CVV) inválido.');
    const cleanCep = cardCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('CEP de cobrança inválido.');
    if (!cardAddressNumber.trim()) throw new Error('Número de residência é obrigatório.');

    return {
      number: cleanNum,
      holderName: cardHolder,
      expiryMonth: expMonth,
      expiryYear: '20' + expYear, // Asaas expects 4 digit year
      cvv: cleanCvv,
      cep: cleanCep,
      addressNumber: cardAddressNumber,
      installments: Number(cardInstallments)
    };
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg('Supabase não está configurado. Cadastros em nuvem desativados.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('A senha não atende a todas as regras de segurança.');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      setErrorMsg('Informe um CPF válido.');
      return;
    }

    setLoading(true);

    try {
      let cardPayload;
      try {
        cardPayload = getCardPayload();
      } catch (err: any) {
        setErrorMsg(err.message);
        setLoading(false);
        return;
      }

      // 1. Sign Up in Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            cpf: cpf.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, ''),
            birthDate,
            city,
            uf,
            howHeard
          }
        }
      });

      if (authError) throw authError;

      // 2. Call secure Edge Function to process participant database insertion and Asaas charge creation
      const data = await invokeCreatePayment({
        name,
        email,
        cpf: cpf.replace(/\D/g, ''),
        phone: phone.replace(/\D/g, ''),
        city,
        uf,
        howHeard,
        billingType: selectedBilling,
        value: ticketPrice,
        card: cardPayload
      });

      setPaymentDetails({
        participantId: data.participantId,
        paymentId: data.paymentId,
        pixQrCodeBase64: data.pixQrCodeBase64,
        pixCopyPaste: data.pixCopyPaste,
        invoiceUrl: data.invoiceUrl,
        identificationField: data.identificationField,
        barCode: data.barCode,
        bankSlipUrl: data.bankSlipUrl
      });

      if (data.billingType === 'CREDIT_CARD') {
        setCheckoutStep('success');
      } else {
        setCheckoutStep('payment');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg('Supabase não está configurado.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (authError) throw authError;

      // Fetch user profile info to call checkout payment function
      const user = authData.user;
      const meta = user?.user_metadata || {};

      // If user lacks CPF or Phone, we need to gather profile details before calling the payment function
      if (!meta.cpf || meta.cpf === '00000000000' || !meta.phone || meta.phone === '00000000000') {
        // Prefill any existing fields they do have
        setName(meta.name || user?.email?.split('@')[0] || '');
        setCpf(meta.cpf && meta.cpf !== '00000000000' ? meta.cpf : '');
        setPhone(meta.phone && meta.phone !== '00000000000' ? meta.phone : '');
        setCity(meta.city || '');
        setUf(meta.uf || '');
        setHowHeard(meta.howHeard || '');
        setNeedProfileDetails(true);
        setLoading(false);
        return;
      }

      let cardPayload;
      try {
        cardPayload = getCardPayload();
      } catch (err: any) {
        setErrorMsg(err.message);
        setLoading(false);
        return;
      }
      
      const data = await invokeCreatePayment({
        name: meta.name || user?.email?.split('@')[0] || 'Participante',
        email: user?.email || '',
        cpf: meta.cpf,
        phone: meta.phone,
        city: meta.city || 'Estância Velha',
        uf: meta.uf || 'RS',
        howHeard: meta.howHeard || 'Outros',
        billingType: selectedBilling,
        value: ticketPrice,
        card: cardPayload
      });

      setPaymentDetails({
        participantId: data.participantId,
        paymentId: data.paymentId,
        pixQrCodeBase64: data.pixQrCodeBase64,
        pixCopyPaste: data.pixCopyPaste,
        invoiceUrl: data.invoiceUrl,
        identificationField: data.identificationField,
        barCode: data.barCode,
        bankSlipUrl: data.bankSlipUrl
      });

      if (data.billingType === 'CREDIT_CARD') {
        setCheckoutStep('success');
      } else {
        setCheckoutStep('payment');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar em sua conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfileAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg('Supabase não está configurado.');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrorMsg('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);

    try {
      let cardPayload;
      try {
        cardPayload = getCardPayload();
      } catch (err: any) {
        setErrorMsg(err.message);
        setLoading(false);
        return;
      }

      // 1. Update user metadata in Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        data: {
          name,
          cpf: cleanCpf,
          phone: phone.replace(/\D/g, ''),
          city,
          uf,
          howHeard
        }
      });

      if (authError) throw authError;

      // 2. Call the payment endpoint with the updated details
      const data = await invokeCreatePayment({
        name,
        email: user?.email || '',
        cpf: cleanCpf,
        phone: phone.replace(/\D/g, ''),
        city,
        uf,
        howHeard,
        billingType: selectedBilling,
        value: ticketPrice,
        card: cardPayload
      });

      setPaymentDetails({
        participantId: data.participantId,
        paymentId: data.paymentId,
        pixQrCodeBase64: data.pixQrCodeBase64,
        pixCopyPaste: data.pixCopyPaste,
        invoiceUrl: data.invoiceUrl,
        identificationField: data.identificationField,
        barCode: data.barCode,
        bankSlipUrl: data.bankSlipUrl
      });

      if (data.billingType === 'CREDIT_CARD') {
        setCheckoutStep('success');
      } else {
        setCheckoutStep('payment');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar dados e gerar cobrança.');
    } finally {
      setLoading(false);
    }
  };

  // Sleek inline Card Fields builder to avoid code duplication
  const renderCardFields = () => {
    if (selectedBilling !== 'CREDIT_CARD') return null;
    return (
      <div className="mkt2-card-transparent-fields">
        <span className="mkt2-form-label-code" style={{ color: '#00F2FE', display: 'block', margin: '20px 0 10px 0' }}>
          [ DADOS DO CARTÃO DE CRÉDITO ]
        </span>
        
        <div className="mkt2-form-row">
          <div className="mkt2-form-group">
            <label>NOME IMPRESSO NO CARTÃO *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Nome conforme impresso"
              className="mkt2-checkout-input"
            />
          </div>
        </div>

        <div className="mkt2-form-row">
          <div className="mkt2-form-group">
            <label>NÚMERO DO CARTÃO *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              className="mkt2-checkout-input"
            />
          </div>
        </div>

        <div className="mkt2-form-row mkt2-form-row--two">
          <div className="mkt2-form-group">
            <label>VALIDADE *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardExpiry}
              onChange={handleCardExpiryChange}
              placeholder="MM/AA"
              className="mkt2-checkout-input"
            />
          </div>
          <div className="mkt2-form-group">
            <label>CÓDIGO (CVV) *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardCvv}
              onChange={handleCardCvvChange}
              placeholder="000"
              className="mkt2-checkout-input"
            />
          </div>
        </div>

        <div className="mkt2-form-row mkt2-form-row--two">
          <div className="mkt2-form-group" style={{ flex: '2' }}>
            <label>CEP DE COBRANÇA *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardCep}
              onChange={handleCardCepChange}
              placeholder="00000-000"
              className="mkt2-checkout-input"
            />
          </div>
          <div className="mkt2-form-group" style={{ flex: '1' }}>
            <label>NÚMERO *</label>
            <input 
              type="text" 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardAddressNumber}
              onChange={(e) => setCardAddressNumber(e.target.value)}
              placeholder="Nº"
              className="mkt2-checkout-input"
            />
          </div>
        </div>

        <div className="mkt2-form-row">
          <div className="mkt2-form-group">
            <label>OPÇÃO DE PARCELAMENTO *</label>
            <select 
              required={selectedBilling === 'CREDIT_CARD'}
              value={cardInstallments}
              onChange={(e) => setCardInstallments(e.target.value)}
              className="mkt2-checkout-input"
            >
              <option value="1">1x de R$ {ticketPrice.toFixed(2).replace('.', ',')} (Sem Juros)</option>
              <option value="2">2x de R$ {(ticketPrice / 2).toFixed(2).replace('.', ',')} (Sem Juros)</option>
              <option value="3">3x de R$ {(ticketPrice / 3).toFixed(2).replace('.', ',')} (Sem Juros)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mkt2-checkout-container">
      {/* BACKGROUND GRAPHICS & BLURS */}
      <div className="mkt2-circuit-grid"></div>
      <div className="mkt2-noise-overlay"></div>
      <div className="mkt2-glow-radial-1"></div>
      <div className="mkt2-glow-radial-2"></div>

      {/* HEADER BAR */}
      <header className="mkt2-checkout-header">
        <div className="mkt2-checkout-header-inner">
          <button onClick={onNavigateToLanding} className="mkt2-back-btn">
            <ChevronLeft size={16} /> Voltar
          </button>
          <div className="mkt2-checkout-logo">
            AI EXPERIENCE <span className="mkt2-checkout-logo-sub">ESTÂNCIA VELHA</span>
          </div>
          <div style={{ width: '64px' }} className="hide-mobile"></div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="mkt2-checkout-main">
        <div className="mkt2-checkout-grid">
          
          {/* COLUMN LEFT: FORM AND SECTIONS */}
          <div className="mkt2-checkout-col-left">
            {checkoutStep === 'form' && (
              <div className="mkt2-checkout-panel animate-slide-up">
                {!needProfileDetails && (
                  <div className="mkt2-checkout-tabs">
                    <button 
                      onClick={() => { setActiveTab('register'); setErrorMsg(''); }} 
                      className={`mkt2-checkout-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                    >
                      Cadastrar
                    </button>
                    <button 
                      onClick={() => { setActiveTab('login'); setErrorMsg(''); }} 
                      className={`mkt2-checkout-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    >
                      Entrar
                    </button>
                  </div>
                )}

                {errorMsg && (
                  <div className="mkt2-checkout-error">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {needProfileDetails ? (
                  /* COMPLETE PROFILE FORM */
                  <form onSubmit={handleCompleteProfileAndSubmit} className="mkt2-checkout-form">
                    <div className="mkt2-form-title-wrap">
                      <span className="mkt2-form-label-code">[ COMPLEMENTO DE CADASTRO ]</span>
                      <h2 className="mkt2-form-title">Complete seus dados para continuar</h2>
                      <p className="mkt2-form-desc">Precisamos de algumas informações obrigatórias para emitir a cobrança no Asaas.</p>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>NOME COMPLETO *</label>
                        <input 
                          type="text" 
                          required 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nome Completo"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group">
                        <label>CPF *</label>
                        <input 
                          type="text" 
                          required 
                          value={cpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group">
                        <label>WHATSAPP *</label>
                        <input 
                          type="text" 
                          required 
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(00) 00000-0000"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group" style={{ flex: '2' }}>
                        <label>CIDADE *</label>
                        <input 
                          type="text" 
                          required 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Cidade"
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group" style={{ flex: '1' }}>
                        <label>UF *</label>
                        <select 
                          required 
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                          className="mkt2-checkout-input"
                        >
                          <option value="">--</option>
                          {['RS', 'SC', 'PR', 'SP', 'RJ', 'MG', 'ES', 'DF', 'BA', 'PE', 'CE', 'GO', 'MS', 'MT'].map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>COMO CONHECEU O EVENTO? *</label>
                        <select 
                          required 
                          value={howHeard}
                          onChange={(e) => setHowHeard(e.target.value)}
                          className="mkt2-checkout-input"
                        >
                          <option value="">Selecione uma opção</option>
                          <option value="Instagram / Facebook">Instagram / Facebook</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Indicação de Amigo">Indicação de Amigo</option>
                          <option value="Grupo de Whatsapp">Grupo de Whatsapp</option>
                          <option value="E-mail">E-mail</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    {/* BILLING TYPE SELECTOR */}
                    <div className="mkt2-form-group" style={{ marginTop: '12px' }}>
                      <label>MÉTODO DE PAGAMENTO *</label>
                      <div className="mkt2-payment-selectors">
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('PIX')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'PIX' ? 'active' : ''}`}
                        >
                          <QrCode size={16} /> Pagar com PIX
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('CREDIT_CARD')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'CREDIT_CARD' ? 'active' : ''}`}
                        >
                          <CreditCard size={16} /> Cartão de Crédito
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('BOLETO')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'BOLETO' ? 'active' : ''}`}
                        >
                          <MapPin size={16} /> Boleto Bancário
                        </button>
                      </div>
                    </div>

                    {/* Conditional CC inputs */}
                    {renderCardFields()}

                    <button type="submit" disabled={loading} className="mkt2-submit-btn">
                      {loading ? 'Processando e Gerando Cobrança...' : 'CONFIRMAR DADOS & PAGAR ->'}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => { setNeedProfileDetails(false); setErrorMsg(''); }} 
                      className="mkt2-btn-secondary" 
                      style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                    >
                      Voltar ao Login
                    </button>
                  </form>
                ) : activeTab === 'register' ? (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegisterSubmit} className="mkt2-checkout-form">
                    <div className="mkt2-form-title-wrap">
                      <span className="mkt2-form-label-code">[ ACESSO ]</span>
                      <h2 className="mkt2-form-title">Para garantir sua vaga em Estância Velha</h2>
                      <p className="mkt2-form-desc">Crie sua conta ou acesse para prosseguir para o pagamento.</p>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>NOME COMPLETO *</label>
                        <input 
                          type="text" 
                          required 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nome Completo"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group">
                        <label>CPF *</label>
                        <input 
                          type="text" 
                          required 
                          value={cpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group">
                        <label>WHATSAPP *</label>
                        <input 
                          type="text" 
                          required 
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(00) 00000-0000"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group flex-date">
                        <label>DATA DE NASCIMENTO *</label>
                        <input 
                          type="date" 
                          required 
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group flex-heard">
                        <label>COMO CONHECEU O EVENTO? *</label>
                        <select 
                          required 
                          value={howHeard}
                          onChange={(e) => setHowHeard(e.target.value)}
                          className="mkt2-checkout-input"
                        >
                          <option value="">Selecione...</option>
                          <option value="Instagram / Facebook">Instagram / Facebook</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Indicação de Amigo">Indicação de Amigo</option>
                          <option value="Grupo de Whatsapp">Grupo de Whatsapp</option>
                          <option value="E-mail">E-mail</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group" style={{ flex: '2' }}>
                        <label>CIDADE *</label>
                        <input 
                          type="text" 
                          required 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Cidade"
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group" style={{ flex: '1' }}>
                        <label>UF *</label>
                        <select 
                          required 
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                          className="mkt2-checkout-input"
                        >
                          <option value="">--</option>
                          {['RS', 'SC', 'PR', 'SP', 'RJ', 'MG', 'ES', 'DF', 'BA', 'PE', 'CE', 'GO', 'MS', 'MT'].map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>EMAIL *</label>
                        <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="exemplo@email.com"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row mkt2-form-row--two">
                      <div className="mkt2-form-group">
                        <label>SENHA *</label>
                        <input 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="mkt2-checkout-input"
                        />
                      </div>
                      <div className="mkt2-form-group">
                        <label>CONFIRMAR SENHA *</label>
                        <input 
                          type="password" 
                          required 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a senha"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    {/* PASSWORD VALIDATION HINTS */}
                    <div className="mkt2-password-hints">
                      <div className={`mkt2-hint ${passwordRules.length ? 'valid' : ''}`}>
                        <span className="mkt2-hint-bullet">•</span> MÍNIMO 8 CARACTERES
                      </div>
                      <div className={`mkt2-hint ${passwordRules.hasUpper ? 'valid' : ''}`}>
                        <span className="mkt2-hint-bullet">•</span> 1 LETRA MAIÚSCULA
                      </div>
                      <div className={`mkt2-hint ${passwordRules.hasNumber ? 'valid' : ''}`}>
                        <span className="mkt2-hint-bullet">•</span> 1 NÚMERO
                      </div>
                    </div>

                    {/* BILLING TYPE SELECTOR */}
                    <div className="mkt2-form-group" style={{ marginTop: '12px' }}>
                      <label>MÉTODO DE PAGAMENTO *</label>
                      <div className="mkt2-payment-selectors">
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('PIX')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'PIX' ? 'active' : ''}`}
                        >
                          <QrCode size={16} /> Pagar com PIX
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('CREDIT_CARD')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'CREDIT_CARD' ? 'active' : ''}`}
                        >
                          <CreditCard size={16} /> Cartão de Crédito
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('BOLETO')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'BOLETO' ? 'active' : ''}`}
                        >
                          <MapPin size={16} /> Boleto Bancário
                        </button>
                      </div>
                    </div>

                    {/* Conditional CC inputs */}
                    {renderCardFields()}

                    <button type="submit" disabled={loading} className="mkt2-submit-btn">
                      {loading ? 'Cadastrando e Gerando Cobrança...' : 'CRIAR CONTA & PAGAR ->'}
                    </button>
                  </form>
                ) : (
                  /* LOGIN FORM */
                  <form onSubmit={handleLoginSubmit} className="mkt2-checkout-form">
                    <div className="mkt2-form-title-wrap">
                      <span className="mkt2-form-label-code">[ LOGIN ]</span>
                      <h2 className="mkt2-form-title">Acesse sua conta para continuar</h2>
                      <p className="mkt2-form-desc">Caso você já tenha se cadastrado em nosso site, insira seus dados abaixo.</p>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>EMAIL *</label>
                        <input 
                          type="email" 
                          required 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="exemplo@email.com"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-row">
                      <div className="mkt2-form-group">
                        <label>SENHA *</label>
                        <input 
                          type="password" 
                          required 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Insira sua senha"
                          className="mkt2-checkout-input"
                        />
                      </div>
                    </div>

                    <div className="mkt2-form-group" style={{ marginTop: '12px' }}>
                      <label>MÉTODO DE PAGAMENTO *</label>
                      <div className="mkt2-payment-selectors">
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('PIX')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'PIX' ? 'active' : ''}`}
                        >
                          <QrCode size={16} /> Pagar com PIX
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('CREDIT_CARD')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'CREDIT_CARD' ? 'active' : ''}`}
                        >
                          <CreditCard size={16} /> Cartão de Crédito
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBilling('BOLETO')}
                          className={`mkt2-payment-select-btn ${selectedBilling === 'BOLETO' ? 'active' : ''}`}
                        >
                          <MapPin size={16} /> Boleto Bancário
                        </button>
                      </div>
                    </div>

                    {/* Conditional CC inputs */}
                    {renderCardFields()}

                    <button type="submit" disabled={loading} className="mkt2-submit-btn">
                      {loading ? 'Acessando e Gerando Cobrança...' : 'ENTRAR & CONFIRMAR PAGAMENTO ->'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {checkoutStep === 'payment' && (
              /* TRANSPARENT PAYMENT RESULTS STEP */
              <div className="mkt2-checkout-panel animate-slide-up text-center">
                {paymentDetails?.pixQrCodeBase64 ? (
                  /* PIX PAYMENT SECTION */
                  <>
                    <span className="mkt2-form-label-code">// Pagamento Pendente</span>
                    <h2 className="mkt2-payment-title">Escaneie o QR Code do Pix</h2>
                    <p className="mkt2-payment-subtitle">
                      Para finalizar a sua vaga, realize o Pix de <strong>R$ {ticketPrice.toFixed(2).replace('.', ',')}</strong>. A vaga é confirmada na hora!
                    </p>

                    {/* QR CODE DISPLAY */}
                    <div className="mkt2-qr-container">
                      <img 
                        src={`data:image/png;base64,${paymentDetails.pixQrCodeBase64}`} 
                        alt="Pix QR Code" 
                        className="mkt2-qr-image"
                      />
                      <div className="mkt2-qr-glow"></div>
                    </div>

                    {/* COPIA E COLA CHAVE */}
                    <div className="mkt2-copia-cola-group">
                      <label>PIX COPIA E COLA</label>
                      <div className="mkt2-copy-box">
                        <input 
                          type="text" 
                          readOnly 
                          value={paymentDetails.pixCopyPaste} 
                          className="mkt2-copy-input"
                        />
                        <button onClick={handleCopyPix} className="mkt2-copy-btn">
                          {copied ? <Check size={16} style={{ color: '#00F2FE' }} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* REALTIME LOADING STATUS */}
                    <div className="mkt2-payment-status-loader">
                      <div className="mkt2-loader-spinner"></div>
                      <span>Aguardando a confirmação do Pix em tempo real...</span>
                    </div>

                    <div className="mkt2-payment-alternatives">
                      <p className="mkt2-calc-footer">O Pix expira em 3 dias. Se preferir, veja no painel do Asaas:</p>
                      <a href={paymentDetails.invoiceUrl} target="_blank" rel="noopener noreferrer" className="mkt2-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        Ir para página de cobrança Asaas
                      </a>
                    </div>
                  </>
                ) : paymentDetails?.identificationField ? (
                  /* BOLETO PAYMENT SECTION */
                  <>
                    <span className="mkt2-form-label-code" style={{ color: '#E2A110' }}>// Boleto Gerado com Sucesso</span>
                    <h2 className="mkt2-payment-title">Copie o Código de Barras</h2>
                    <p className="mkt2-payment-subtitle">
                      Pague o Boleto de <strong>R$ {ticketPrice.toFixed(2).replace('.', ',')}</strong> no aplicativo do seu banco para confirmar a vaga.
                    </p>

                    {/* COPIA E COLA BOLETO */}
                    <div className="mkt2-copia-cola-group" style={{ margin: '30px 0' }}>
                      <label>LINHA DIGITÁVEL DO BOLETO</label>
                      <div className="mkt2-copy-box">
                        <input 
                          type="text" 
                          readOnly 
                          value={paymentDetails.identificationField} 
                          className="mkt2-copy-input"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(paymentDetails.identificationField || '');
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }} 
                          className="mkt2-copy-btn"
                        >
                          {copied ? <Check size={16} style={{ color: '#E2A110' }} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="mkt2-payment-alternatives" style={{ marginTop: '20px' }}>
                      <a 
                        href={paymentDetails.bankSlipUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mkt2-submit-btn" 
                        style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(90deg, #E2A110 0%, #F5B041 100%)', boxShadow: '0 0 15px rgba(226, 161, 16, 0.4)' }}
                      >
                        Baixar Boleto em PDF
                      </a>
                      
                      <p className="mkt2-calc-footer" style={{ marginTop: '20px' }}>
                        * Boletos podem levar até 1 dia útil para compensar no banco de dados. Sua inscrição será confirmada assim que a compensação ocorrer.
                      </p>
                    </div>
                  </>
                ) : (
                  /* FALLBACK REDIRECT LINK IF NEITHER WORKS */
                  <>
                    <span className="mkt2-form-label-code">// Cobrança Gerada</span>
                    <h2 className="mkt2-payment-title">Prossiga para o Pagamento</h2>
                    <p className="mkt2-payment-subtitle">
                      Clique no botão abaixo para acessar o gateway seguro e finalizar o seu pagamento.
                    </p>
                    <a href={paymentDetails?.invoiceUrl} target="_blank" rel="noopener noreferrer" className="mkt2-submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                      {"PAGAR NO ASAAS ->"}
                    </a>
                  </>
                )}
              </div>
            )}

            {checkoutStep === 'success' && (
              /* REGISTRATION SUCCESS PANEL */
              <div className="mkt2-checkout-panel animate-scale-up text-center success-panel">
                <div className="mkt2-success-icon-wrap">
                  <div className="mkt2-success-icon">
                    <Check size={40} />
                  </div>
                  <div className="mkt2-success-glow"></div>
                </div>

                <span className="mkt2-form-label-code" style={{ color: '#10E27A' }}>// Inscrição Confirmada</span>
                <h2 className="mkt2-success-title">Sua Vaga está Garantida!</h2>
                <p className="mkt2-success-desc">
                  Parabéns! Confirmamos o pagamento da sua inscrição para o <strong>AI Experience Estância Velha</strong>. Enviamos os detalhes do ingresso e orientações de acesso ao seu e-mail cadastrado.
                </p>

                <div className="mkt2-success-details">
                  <div className="mkt2-success-detail-item">
                    <Calendar size={18} style={{ color: '#00F2FE' }} />
                    <div>
                      <span>DATA</span>
                      <strong>15 de Agosto de 2026</strong>
                    </div>
                  </div>
                  <div className="mkt2-success-detail-item">
                    <MapPin size={18} style={{ color: '#7C3AED' }} />
                    <div>
                      <span>LOCAL</span>
                      <strong>Auditório Müller, Estância Velha - RS</strong>
                    </div>
                  </div>
                </div>

                <button onClick={onNavigateToLanding} className="mkt2-submit-btn" style={{ background: '#10E27A', color: '#06091e' }}>
                  Voltar para a Página Inicial
                </button>
              </div>
            )}
          </div>

          {/* COLUMN RIGHT: LOTS INFO */}
          <div className="mkt2-checkout-col-right">
            <div className="mkt2-lot-summary-card">
              <span className="mkt2-lot-badge">LOTE 01 / 03</span>
              <div className="mkt2-lot-price-container">
                <span className="mkt2-lot-currency">R$</span>
                <span className="mkt2-lot-price">{ticketPrice.toFixed(2).split('.')[0]}</span>
                <span className="mkt2-lot-cents">,{ticketPrice.toFixed(2).split('.')[1]}</span>
              </div>
              <p className="mkt2-lot-price-sub">à vista no Pix ou Boleto; parcelado no cartão de crédito em até 3x sem juros</p>
              
              <div className="mkt2-lot-timeline">
                <div className="mkt2-lot-item active">
                  <div className="mkt2-lot-indicator"></div>
                  <div className="mkt2-lot-text">
                    <span className="mkt2-lot-label">Lote 01 (Lote Atual)</span>
                    <span className="mkt2-lot-value">R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div className="mkt2-lot-item">
                  <div className="mkt2-lot-indicator"></div>
                  <div className="mkt2-lot-text">
                    <span className="mkt2-lot-label">Lote 02</span>
                    <span className="mkt2-lot-value">R$ {(ticketPrice + 50).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div className="mkt2-lot-item">
                  <div className="mkt2-lot-indicator"></div>
                  <div className="mkt2-lot-text">
                    <span className="mkt2-lot-label">Lote 03</span>
                    <span className="mkt2-lot-value">R$ {(ticketPrice + 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              <div className="mkt2-lot-disclaimer">
                * Processamento de pagamentos seguro e encriptado via **Asaas**. Sua compra e dados pessoais estão 100% protegidos em conformidade com a LGPD e as normas bancárias vigentes.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
