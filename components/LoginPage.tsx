import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LOGO_URL = "https://framerusercontent.com/images/BrlQcPpho2hjJ0qjdKGIdbfXY.png?width=1024&height=276";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // App.tsx s'occupera de la redirection via l'écouteur onAuthStateChanged
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Identifiants incorrects. Veuillez réessayer.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Trop de tentatives infructueuses. Compte temporairement bloqué.");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      {/* Left Side: Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
          alt="Modern Kitchen" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} className="h-10 w-auto brightness-0 invert" alt="Xora Logo" />
          </div>

          <div className="space-y-6 max-w-2xl">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tighter">
              Simplifiez votre gestion, <span className="text-[#F97316] drop-shadow-md">sublimez vos projets.</span>
            </h2>
            <p className="text-lg text-gray-200 font-medium leading-relaxed max-w-lg">
              La plateforme tout-en-un conçue pour les cuisinistes, par des cuisinistes.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/150?u=${i + 40}`} className="w-10 h-10 rounded-full border-2 border-gray-900" alt="" />
                ))}
              </div>
              <p className="text-sm self-center font-semibold text-gray-300">
                +2,000 professionnels nous font confiance
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-400 font-medium">
            © 2025 Xora Technologies Inc. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-md:flex max-md:flex-col max-md:items-center max-w-md space-y-10">
          <div className="lg:hidden mb-4">
             <img src={LOGO_URL} className="h-10 w-auto" alt="Xora Logo" />
          </div>
          
          <div className="space-y-3 w-full">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Ravi de vous revoir</h3>
            <p className="text-gray-500 font-medium">Veuillez entrer vos identifiants pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 ml-1">Adresse e-mail</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-bold text-gray-700">Mot de passe</label>
                <a href="#" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors">Mot de passe oublié ?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F9FA] border border-gray-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all placeholder:text-gray-300"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-bold text-gray-500 cursor-pointer">Rester connecté</label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-sm font-bold text-gray-400">
              Nouveau sur XORA ? <a href="#" className="text-gray-900 hover:underline">Créer un compte</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;