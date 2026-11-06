import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { GoldButton } from '../../components/ui/GoldButton';
import { LuxuryCard } from '../../components/ui/LuxuryCard';
import { supabaseAuthService } from '../../services/supabaseAuthService';

interface LoginModuleProps {
  mode: 'customer' | 'admin';
  onLoginSuccess: () => void;
}

export const ResetPasswordModule: React.FC<{ onSaveSuccess: () => void }> = ({ onSaveSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabaseAuthService.updatePassword(newPassword);
      if (error) throw error;
      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <LuxuryCard className="p-8">
        <h2 className="font-serif-luxury text-2xl text-white mb-6">Redefinir Senha</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Nova Senha</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-white text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">Confirmar Nova Senha</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-white text-sm outline-none" />
          </div>
          {error && <div className="text-rose-300 text-xs">{error}</div>}
          <GoldButton type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Nova Senha'}</GoldButton>
        </form>
      </LuxuryCard>
    </div>
  );
};

export const LoginModule: React.FC<LoginModuleProps> = ({ mode, onLoginSuccess }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'admin') {
        const isAdmin = await supabaseAuthService.loginAdmin({ email, token: password });
        if (!isAdmin) throw new Error('Acesso negado: Credenciais inválidas ou sem privilégios administrativos.');
        onLoginSuccess();
      } else {
        await supabaseAuthService.loginCustomer(email);
        alert('Instruções de acesso enviadas para o seu e-mail!');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <LuxuryCard className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#14120C] border border-[#D4AF37]/30 mb-4">
            {mode === 'admin' ? <ShieldCheck className="w-8 h-8 text-[#D4AF37]" /> : <User className="w-8 h-8 text-[#D4AF37]" />}
          </div>
          <h2 className="font-serif-luxury text-2xl text-white">
            {mode === 'admin' ? 'Acesso Administrativo' : 'Acesso do Cliente'}
          </h2>
          <p className="text-xs text-neutral-400 mt-2">
            {mode === 'admin' 
              ? 'Área restrita à gestão operacional AURA' 
              : 'Entre para acompanhar seus pedidos e preferências'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-neutral-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-white text-sm outline-none"
              />
            </div>
          </div>

          {mode === 'admin' && (
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-white text-sm outline-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  setError('Por favor, informe seu e-mail acima para solicitar a recuperação.');
                  return;
                }
                try {
                  const { error } = await supabaseAuthService.resetPassword(email);
                  if (error) throw error;
                  alert('Instruções de redefinição enviadas para seu e-mail.');
                } catch (err: any) {
                  setError(err.message || 'Erro ao solicitar recuperação.');
                }
              }}
              className="text-[10px] text-neutral-500 hover:text-[#ECC876] uppercase tracking-wider underline cursor-pointer transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>

          <GoldButton type="submit" variant="primary" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Autenticando...' : mode === 'admin' ? 'Entrar no Painel' : 'Enviar Link de Acesso'}
          </GoldButton>
        </form>
      </LuxuryCard>
    </div>
  );
};
