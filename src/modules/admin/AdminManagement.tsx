import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserPlus,
  KeyRound,
  RotateCw,
  Mail,
  CheckCircle,
  AlertTriangle,
  Lock,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import {
  adminManagerService,
  AdminUserRecord,
  AdminRole,
} from '../../services/adminManagerService';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';

export const AdminManagement: React.FC = () => {
  // Estado de autenticação do Supabase
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Formulário de Login de Admin
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Bootstrap inicial do Super Admin
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // Lista de Administradores
  const [admins, setAdmins] = useState<AdminUserRecord[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  // Modal / Formulário de Convite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Fluxo de definição de senha pós-convite/recuperação
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaveError, setPasswordSaveError] = useState<string | null>(null);

  // Monitora a sessão do Supabase em tempo real e tokens na URL
  useEffect(() => {
    checkSession();

    // Checa se veio de um link de convite/recuperação
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || hash.includes('type=invite')) {
        setIsSettingNewPassword(true);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSettingNewPassword(true);
      }

      if (session?.user) {
        setCurrentUser({ id: session.user.id, email: session.user.email || '' });
        loadAdmins();
      } else {
        setCurrentUser(null);
        setAdmins([]);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser({ id: session.user.id, email: session.user.email || '' });
        loadAdmins();
      }
    } catch (e) {
      console.error('Erro ao verificar sessão:', e);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    setTableError(null);
    try {
      const res = await adminManagerService.listAdmins();
      if (res.success && res.admins) {
        setAdmins(res.admins);
      } else if (res.error) {
        setTableError(res.error);
      }
    } catch (err: any) {
      setTableError(err.message || 'Erro ao carregar lista de administradores.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  // 1. Execução do Bootstrap First Admin (exclusivo para cantoraalinesilvasouza@gmail.com)
  const handleBootstrap = async () => {
    setBootstrapLoading(true);
    setBootstrapMessage(null);
    setBootstrapError(null);

    const res = await adminManagerService.bootstrapFirstAdmin('cantoraalinesilvasouza@gmail.com');

    setBootstrapLoading(false);
    if (res.success) {
      setBootstrapMessage(
        res.message || 'Convite de Super Administrador enviado para cantoraalinesilvasouza@gmail.com. Abra seu e-mail para cadastrar sua senha.'
      );
      setLoginEmail('cantoraalinesilvasouza@gmail.com');
    } else {
      setBootstrapError(res.error || 'Falha ao executar bootstrap.');
    }
  };

  // 2. Login com E-mail e Senha
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Informe e-mail e senha.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message || 'Credenciais inválidas.');
      } else if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email || '' });
        loadAdmins();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro inesperado ao realizar login.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 3. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAdmins([]);
  };

  // 4. Enviar Convite para Novo Admin
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      setActionErrorMsg('Digite o e-mail do novo administrador.');
      return;
    }

    setInviteLoading(true);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);

    const res = await adminManagerService.inviteAdmin(inviteEmail, inviteRole);
    setInviteLoading(false);

    if (res.success) {
      setActionSuccessMsg(res.message || `Convite enviado com sucesso para ${inviteEmail}.`);
      setInviteEmail('');
      setShowInviteModal(false);
      loadAdmins();
    } else {
      setActionErrorMsg(res.error || 'Falha ao enviar convite.');
    }
  };

  // 5. Ativar / Desativar Admin
  const handleToggleActive = async (admin: AdminUserRecord) => {
    if (admin.email === currentUser?.email) {
      alert('Você não pode desativar seu próprio acesso de administrador.');
      return;
    }

    const nextState = !admin.is_active;
    const confirmAction = confirm(
      `Deseja realmente ${nextState ? 'ativar' : 'desativar'} o acesso de ${admin.email}?`
    );
    if (!confirmAction) return;

    setActionErrorMsg(null);
    const res = await adminManagerService.toggleActive(admin.id, nextState, admin.user_id);

    if (res.success) {
      setActionSuccessMsg(res.message || `Status de ${admin.email} atualizado.`);
      loadAdmins();
    } else {
      setActionErrorMsg(res.error || 'Falha ao alterar status.');
    }
  };

  // 6. Atualizar Nível de Acesso (Role)
  const handleRoleChange = async (admin: AdminUserRecord, newRole: AdminRole) => {
    if (admin.role === newRole) return;

    setActionErrorMsg(null);
    const res = await adminManagerService.updateRole(admin.id, newRole, admin.user_id);

    if (res.success) {
      setActionSuccessMsg(res.message || `Papel de ${admin.email} alterado para ${newRole}.`);
      loadAdmins();
    } else {
      setActionErrorMsg(res.error || 'Falha ao atualizar papel.');
    }
  };

  // 7. Recuperar Senha do Admin
  const handleResetPassword = async (email: string, userId?: string) => {
    const confirmAction = confirm(`Enviar link de redefinição de senha para ${email}?`);
    if (!confirmAction) return;

    setActionErrorMsg(null);
    const res = await adminManagerService.resetPassword(email, userId);

    if (res.success) {
      setActionSuccessMsg(res.message || `E-mail de recuperação enviado para ${email}.`);
    } else {
      setActionErrorMsg(res.error || 'Falha ao enviar e-mail de recuperação.');
    }
  };

  // 8. Salvar nova senha após convite ou link de recuperação
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordSaveError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordSaveError('A confirmação não confere com a nova senha.');
      return;
    }

    setSavingPassword(true);
    setPasswordSaveError(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordSaveError(error.message || 'Falha ao salvar nova senha.');
      } else if (data.user) {
        setIsSettingNewPassword(false);
        setActionSuccessMsg('Senha cadastrada com sucesso! Você está conectado como Administrador.');
        if (typeof window !== 'undefined' && window.location.hash) {
          window.location.hash = '';
        }
        checkSession();
      }
    } catch (err: any) {
      setPasswordSaveError(err.message || 'Erro inesperado ao salvar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
        <span className="text-xs uppercase tracking-widest mt-3 block font-serif-luxury">
          Verificando Sessão Administrativa...
        </span>
      </div>
    );
  }

  // =========================================================================
  // CASO ESPECIAL: DEFINIÇÃO DE SENHA (CONVITE / RECUPERAÇÃO)
  // =========================================================================
  if (isSettingNewPassword) {
    return (
      <div className="max-w-md mx-auto py-8">
        <LuxuryCard className="p-8 border-[#D4AF37]/50 bg-[#14120C]">
          <div className="flex items-center gap-2 text-xs font-serif-luxury text-[#ECC876] uppercase tracking-wider mb-2">
            <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            <span>Definição de Credenciais</span>
          </div>

          <h2 className="font-serif-luxury text-2xl text-white">
            Cadastrar Senha de Administrador
          </h2>

          <p className="text-xs text-neutral-300 mt-1 mb-6 font-editorial">
            Cadastre sua senha pessoal para concluir o primeiro acesso ao projeto AURA-PARFUMS:
          </p>

          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                Nova Senha (Mínimo 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {passwordSaveError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordSaveError}</span>
              </div>
            )}

            <div className="pt-2">
              <GoldButton
                variant="primary"
                size="md"
                type="submit"
                className="w-full"
                disabled={savingPassword}
                icon={savingPassword ? <RotateCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              >
                {savingPassword ? 'Salvando Senha...' : 'Salvar Senha e Acessar Painel'}
              </GoldButton>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSettingNewPassword(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar para tela de login
              </button>
            </div>
          </form>
        </LuxuryCard>
      </div>
    );
  }

  // =========================================================================
  // CASO 1: NÃO AUTENTICADO — TELA DE BOOTSTRAP E LOGIN DE SUPER ADMINISTRADOR
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Banner de Apresentação */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] mb-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>Controle de Acesso Restrito</span>
          </div>
          <h2 className="font-serif-luxury text-3xl text-white">
            Acesso à Gestão de Administradores
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl mx-auto font-editorial leading-relaxed">
            Painel protegido pela Edge Function <code className="text-[#ECC876]">aura-admin-manager</code> com Row Level Security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Cartão 1: Bootstrap Inicial (Exclusivo para cantoraalinesilvasouza@gmail.com) */}
          <LuxuryCard className="p-6 sm:p-8 border-[#D4AF37]/40 bg-[#14120C]">
            <div className="flex items-center gap-2 text-xs font-serif-luxury text-[#ECC876] uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Configuração Inicial (Bootstrap)</span>
            </div>

            <h3 className="font-serif-luxury text-xl text-white">
              Primeiro Acesso — Super Admin
            </h3>

            <p className="text-xs text-neutral-300 mt-2 leading-relaxed font-editorial">
              Para o primeiro acesso ao projeto <strong className="text-white">AURA-PARFUMS</strong>, dispare o convite
              oficial de inicialização para o e-mail da liderança administrativa:
            </p>

            <div className="mt-4 p-3 bg-[#0A0A0A] border border-[#26241E] text-xs">
              <span className="text-neutral-500 uppercase tracking-wider block text-[10px]">
                E-mail Exclusivo Autorizado
              </span>
              <span className="text-[#ECC876] font-mono text-xs font-semibold block mt-1 break-all">
                cantoraalinesilvasouza@gmail.com
              </span>
            </div>

            {bootstrapMessage && (
              <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bootstrapMessage}</span>
              </div>
            )}

            {bootstrapError && (
              <div className="mt-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bootstrapError}</span>
              </div>
            )}

            <div className="mt-6">
              <GoldButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleBootstrap}
                disabled={bootstrapLoading}
                icon={bootstrapLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              >
                {bootstrapLoading ? 'Processando Convite...' : 'Disparar Convite Super Admin'}
              </GoldButton>
            </div>

            <span className="text-[11px] text-neutral-400 block mt-3 text-center">
              Ação: <code className="text-[#ECC876]">bootstrap_first_admin</code> via Edge Function
            </span>
          </LuxuryCard>

          {/* Cartão 2: Login com E-mail e Senha */}
          <LuxuryCard className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-serif-luxury text-[#ECC876] uppercase tracking-wider mb-2">
              <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              <span>Autenticação de Equipe</span>
            </div>

            <h3 className="font-serif-luxury text-xl text-white">
              Entrar como Administrador
            </h3>

            <p className="text-xs text-neutral-400 mt-1 mb-6">
              Após aceitar o convite e cadastrar sua senha, acesse o painel operacional:
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  E-mail Administrativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@auraparfums.com.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 pr-10 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2">
                <GoldButton
                  variant="outline"
                  size="md"
                  type="submit"
                  className="w-full"
                  disabled={loginLoading}
                  icon={loginLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                >
                  {loginLoading ? 'Validando Acesso...' : 'Acessar Painel Admin'}
                </GoldButton>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!loginEmail) {
                      alert('Digite seu e-mail no campo acima para solicitar a recuperação.');
                      return;
                    }
                    handleResetPassword(loginEmail);
                  }}
                  className="text-xs text-[#ECC876] hover:underline underline-offset-4"
                >
                  Esqueceu a senha? Solicitar redefinição
                </button>
              </div>
            </form>
          </LuxuryCard>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASO 2: AUTENTICADO — TELA DE GESTÃO DE ADMINISTRADORES
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Barra de Perfil do Administrador Logado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#14120C] border border-[#D4AF37]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1F1C12] border border-[#D4AF37] flex items-center justify-center text-[#ECC876]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-sm text-white font-medium">
                {currentUser.email}
              </span>
              <GoldBadge variant="gold-hairline">Sessão Autenticada</GoldBadge>
            </div>
            <span className="text-xs text-neutral-400 block mt-0.5">
              Conectado à Edge Function <code className="text-[#ECC876]">aura-admin-manager</code>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GoldButton
            variant="outline"
            size="sm"
            onClick={loadAdmins}
            disabled={loadingAdmins}
            icon={<RotateCw className={`w-3.5 h-3.5 ${loadingAdmins ? 'animate-spin' : ''}`} />}
          >
            Atualizar
          </GoldButton>

          <GoldButton
            variant="primary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Novo Administrador
          </GoldButton>

          <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-red-400 transition-colors border border-[#26241E] hover:border-red-900"
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alertas de Ação (Sucesso / Erro) */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {tableError && (
        <div className="p-3 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{tableError}</span>
        </div>
      )}

      {/* Tabela de Administradores Cadastrados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury text-xl text-white">Equipe de Gestão AURA Parfums</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Administradores autorizados a gerenciar vitrines, conferir estoques físicos e conciliar Pix.
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {admins.length} {admins.length === 1 ? 'membro cadastrado' : 'membros cadastrados'}
          </span>
        </div>

        <div className="overflow-x-auto border border-[#26241E] bg-[#121212]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#26241E] bg-[#171717] text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Administrador / E-mail</th>
                <th className="py-3.5 px-4">Nível de Acesso (Role)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Inclusão</th>
                <th className="py-3.5 px-4 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26241E] text-neutral-300">
              {admins.map((adm) => {
                const isCurrent = adm.email === currentUser.email;

                return (
                  <tr key={adm.id} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white font-medium">
                          {adm.email}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-[#ECC876] bg-[#1C1A14] border border-[#D4AF37]/40 px-1.5 py-0.5">
                            Você
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={adm.role}
                        onChange={(e) => handleRoleChange(adm, e.target.value as AdminRole)}
                        disabled={isCurrent}
                        className="bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-2.5 py-1 focus:outline-none focus:border-[#D4AF37] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="super_admin">Super Administrador</option>
                        <option value="admin">Administrador Geral</option>
                        <option value="inventory_manager">Gestor de Estoque Físico</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(adm)}
                        disabled={isCurrent}
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 border transition-colors cursor-pointer disabled:cursor-not-allowed ${
                          adm.is_active
                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800 hover:bg-emerald-900/60'
                            : 'text-neutral-400 bg-neutral-900/60 border-neutral-700 hover:text-white'
                        }`}
                        title={isCurrent ? 'Não é possível desativar sua própria conta' : 'Clique para alternar'}
                      >
                        {adm.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                      {adm.created_at ? new Date(adm.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleResetPassword(adm.email, adm.user_id)}
                        className="text-xs text-[#ECC876] hover:underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
                        title="Enviar link de redefinição de senha para este administrador"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Recuperar Senha</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {admins.length === 0 && !loadingAdmins && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="font-serif-luxury text-base text-neutral-300">
                      Nenhum administrador adicional cadastrado.
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Clique no botão "Novo Administrador" acima para convidar membros da equipe.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Convite de Novo Administrador */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm p-2 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
              <UserPlus className="w-4 h-4" />
              <span>Novo Acesso</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white">
              Convidar Administrador
            </h3>

            <p className="text-xs text-neutral-400 mt-1 mb-6 font-editorial">
              O convidado receberá um e-mail oficial com o link de confirmação para definir a senha pessoal.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  placeholder="gerente@auraparfums.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">
                  Nível de Acesso (Perfil)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full bg-[#171717] border border-[#26241E] text-xs text-neutral-200 px-3.5 py-2.5 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="admin">Administrador Geral (Vitrines, Pedidos e Estoque)</option>
                  <option value="super_admin">Super Administrador (Acesso Irrestrito)</option>
                  <option value="inventory_manager">Gestor de Estoque Físico (Apenas Inventário)</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#26241E]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>

                <GoldButton
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={inviteLoading}
                  icon={inviteLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                >
                  {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
