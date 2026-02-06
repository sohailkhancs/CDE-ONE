import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import {
  Building2, ShieldCheck, Mail, Lock, AlertCircle,
  Eye, EyeOff, Check, HardHat, FileText, Box, User, Phone, MessageSquare, Send
} from 'lucide-react';

const LoginView: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  // 'login' or 'contact'
  const [activeTab, setActiveTab] = useState<'login' | 'contact'>('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Contact State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      clearError();
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending contact form
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setActiveTab('login');
    }, 2000);
  };

  // Red theme colors matching the user's "read" (Red) scheme
  const theme = {
    primary: '#EF4444', // Tailwind red-500
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

      {/* 
        --------------------------------------------------------------------------
        BACKGROUND STYLES & ASSETS
        --------------------------------------------------------------------------
      */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>

      {/* Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-red-300/12 via-rose-400/8 to-red-400/12 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-slate-300/15 via-gray-300/10 to-slate-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-gradient-to-br from-red-400/8 via-rose-300/6 to-red-500/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/4 via-slate-400/4 to-rose-400/4 animate-pulse"></div>

      <style>{`
        :root {
          --primary-color: ${theme.primary};
        }
        
        /* The Custom Tab Shape */
        .tab-extension {
            position: absolute;
            left: -80px;
            top: 180px; 
            width: 80px;
            height: 160px;
            background-color: transparent;
            z-index: 20;
            display: flex;
            flex-direction: column;
        }

        /* Generic shared styles for tabs */
        .tab-item {
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 600;
            cursor: pointer;
            position: relative;
            transition: all 0.3s ease;
        }

        /* ACTIVE TAB STYLES (White bubble) */
        .tab-active {
            background-color: #ffffff;
            border-top-left-radius: 30px;
            border-bottom-left-radius: 30px;
            color: var(--primary-color);
            z-index: 10;
        }

        /* INACTIVE TAB STYLES (Transparent/Colored) */
        .tab-inactive {
            color: #ffffff;
            opacity: 0.9;
        }
        .tab-inactive:hover {
            opacity: 1;
        }

        /* CURVES FOR ACTIVE TABS */
        
        /* Top Curve */
        .tab-active::before {
            content: '';
            position: absolute;
            top: -20px;
            right: 0;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle at 0 0, transparent 20px, #ffffff 20.5px);
        }

        /* Bottom Curve */
        .tab-active::after {
            content: '';
            position: absolute;
            bottom: -20px;
            right: 0;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle at 0 100%, transparent 20px, #ffffff 20.5px);
        }
      `}</style>

      {/* 
        --------------------------------------------------------------------------
        MAIN CARD CONTAINER
        --------------------------------------------------------------------------
      */}
      <div className="relative z-10 w-full max-w-6xl flex shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden bg-white min-h-[650px]">

        {/* 
          --------------------
          LEFT PANEL (RED)
          --------------------
        */}
        <div className="w-1/2 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 relative flex items-center justify-center p-8 overflow-hidden transition-all duration-500">

          {/* Decorative overlays */}
          <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/10 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-gradient-to-br from-white/20 to-transparent rounded-full blur-[60px]"></div>
            <div className="absolute bottom-[20%] left-[10%] w-[250px] h-[250px] bg-gradient-to-tr from-white/15 to-transparent rounded-full blur-[50px]"></div>
          </div>

          {/* 
               CENTRAL ILLUSTRATION (BIM BUBBLE)
             */}
          <div className="relative z-10 scale-90 md:scale-100 transition-all duration-500">
            {/* Central CDE Concept Illustration */}
            <div className="relative mb-6 flex justify-center">
              {/* Large main bubble */}
              <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-white/30 via-white/10 to-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl relative overflow-visible">

                {/* Connecting Lines for "Hub" Concept */}
                <div className="absolute inset-0 flex items-center justify-center animate-[spin_60s_linear_infinite]">
                  <div className="w-[80%] h-[80%] border border-dashed border-white/30 rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]">
                  <div className="w-[60%] h-[60%] border border-dotted border-white/40 rounded-full"></div>
                </div>

                {/* CENTRAL NODE: CDE Core */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center mb-2">
                    <Building2 className="text-white drop-shadow-md" size={48} strokeWidth={1.5} />
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                    <span className="text-white text-xs font-bold tracking-widest">CDE CORE</span>
                  </div>
                </div>

                {/* 
                   SATELLITE NODES: Specific CDE Functions 
                   Positioned nicely around the circle
                */}

                {/* Top Right: Cost Management */}
                <div className="absolute top-[15%] right-[15%] flex flex-col items-center animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-14 h-14 bg-emerald-500/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg flex items-center justify-center mb-1 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  <span className="text-[10px] font-medium text-white/90 bg-black/20 px-2 rounded-full backdrop-blur-sm">Cost</span>
                </div>

                {/* Top Left: Document Management */}
                <div className="absolute top-[18%] left-[15%] flex flex-col items-center animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                  <div className="w-14 h-14 bg-blue-500/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg flex items-center justify-center mb-1 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                    <FileText className="text-white" size={24} />
                  </div>
                  <span className="text-[10px] font-medium text-white/90 bg-black/20 px-2 rounded-full backdrop-blur-sm">Docs</span>
                </div>

                {/* Bottom Right: BIM Viewer */}
                <div className="absolute bottom-[20%] right-[18%] flex flex-col items-center animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                  <div className="w-14 h-14 bg-purple-500/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg flex items-center justify-center mb-1 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Box className="text-white" size={24} />
                  </div>
                  <span className="text-[10px] font-medium text-white/90 bg-black/20 px-2 rounded-full backdrop-blur-sm">BIM</span>
                </div>

                {/* Bottom Left: Project/Tasks */}
                <div className="absolute bottom-[22%] left-[18%] flex flex-col items-center animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
                  <div className="w-14 h-14 bg-orange-500/80 backdrop-blur-md rounded-xl border border-white/30 shadow-lg flex items-center justify-center mb-1 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <ShieldCheck className="text-white" size={24} />
                  </div>
                  <span className="text-[10px] font-medium text-white/90 bg-black/20 px-2 rounded-full backdrop-blur-sm">Quality</span>
                </div>

              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">CDE-ONE</h2>
              <p className="text-white/90 font-light">
                Enterprise Common Data Environment
              </p>
            </div>
          </div>

          {/* ISO Badge - Compact & Professional */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg px-5 py-1.5 rounded-xl flex items-center space-x-3 transform hover:scale-105 transition-transform duration-300 cursor-default group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm animate-pulse"></div>
                <ShieldCheck size={18} className="relative z-10 text-emerald-100" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-red-100 font-medium uppercase tracking-wider leading-none opacity-90 mb-0.5">Security Standard</span>
                <span className="text-xs font-bold text-white tracking-wide leading-none group-hover:text-red-50 transition-colors">ISO 19650 Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* 
          --------------------
          RIGHT PANEL (WHITE)
          --------------------
        */}
        <div className="w-1/2 bg-white relative p-[60px] flex flex-col justify-center transition-all duration-300">

          {/* The Floating Tab Connector */}
          <div className="tab-extension">
            {/* LOGIN TAB */}
            <div
              className={`tab-item ${activeTab === 'login' ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => setActiveTab('login')}
              style={{ marginBottom: activeTab === 'login' ? '0' : '10px' }}
            >
              Log in
            </div>

            {/* CONTACT TAB */}
            <div
              className={`tab-item ${activeTab === 'contact' ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => setActiveTab('contact')}
              style={{ marginTop: activeTab === 'contact' ? '0' : '10px' }}
            >
              Contact
            </div>
          </div>

          {/* 
              CONTENT SWITCHER 
            */}
          {activeTab === 'login' ? (
            // ---------------- LOG IN FORM ----------------
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-red-500 mb-2">Log in</h1>
                <p className="text-slate-500 text-base">Welcome back! Please enter your details.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="w-full">
                {/* Error Banner */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                    <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-red-600 font-medium">{error}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="mb-6">
                  <label htmlFor="email" className="block mb-2 text-slate-800 font-semibold text-sm">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors text-slate-800"
                      placeholder="Enter your email"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-6">
                  <label htmlFor="password" className="block mb-2 text-slate-800 font-semibold text-sm">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors text-slate-800"
                      placeholder="..........."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex justify-between items-center mb-8 text-sm">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-red-500 rounded"
                    />
                    Remember for 30 days
                  </label>
                  <button type="button" className="text-red-500 font-semibold hover:text-red-600">
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-4"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                  Don't have an account? <span onClick={() => setActiveTab('contact')} className="text-red-500 font-semibold cursor-pointer hover:text-red-600">Contact Admin</span>
                </p>
              </form>
            </div>
          ) : (
            // ---------------- CONTACT FORM ----------------
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col justify-center">
              {contactSent ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h2>
                  <p className="text-slate-500">We'll get back to you shortly.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-red-500 mb-2">Contact Support</h1>
                    <p className="text-slate-500 text-sm">Need access or facing issues? Let us know.</p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="w-full">
                    {/* Name Input */}
                    <div className="mb-4">
                      <label htmlFor="c-name" className="block mb-1.5 text-slate-800 font-semibold text-xs uppercase">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="c-name"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors text-slate-800 text-sm"
                          placeholder="Your Name"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <User size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                      <label htmlFor="c-email" className="block mb-1.5 text-slate-800 font-semibold text-xs uppercase">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          id="c-email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors text-slate-800 text-sm"
                          placeholder="your@email.com"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Mail size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="mb-6">
                      <label htmlFor="c-message" className="block mb-1.5 text-slate-800 font-semibold text-xs uppercase">Message</label>
                      <div className="relative">
                        <textarea
                          id="c-message"
                          required
                          rows={3}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-colors text-slate-800 text-sm resize-none"
                          placeholder="How can we help?"
                        ></textarea>
                        <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                          <MessageSquare size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!contactName || !contactEmail || !contactMessage}
                      className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-4"
                    >
                      <span>Send Message</span>
                      <Send size={16} />
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-slate-400 text-sm hover:text-red-500 transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
