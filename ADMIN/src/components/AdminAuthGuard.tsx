import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  Lock, 
  AlertCircle, 
  LogOut, 
  Mail, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { OtpInput } from './OtpInput';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  username?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAdminAuth = () => useContext(AuthContext);

type AuthMode = 'otp_signin' | 'otp_signup' | 'password';
type AuthStep = 'form' | 'verify_otp';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication mode and step
  const [authMode, setAuthMode] = useState<AuthMode>('otp_signin');
  const [authStep, setAuthStep] = useState<AuthStep>('form');

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 60-second cooldown timer for OTP resend
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Allowed privileged administration roles strictly reserved for administrative personnel
  const ADMIN_ROLES = ['Admin', 'Super_Admin', 'Security', 'Moderator'];

  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const verifyUserRole = async (
    userId: string,
    appMetaRole?: string
  ): Promise<{ authorized: boolean; role: string; fullName?: string; username?: string; error?: string }> => {
    if (appMetaRole && ADMIN_ROLES.includes(appMetaRole)) {
      return { authorized: true, role: appMetaRole };
    }

    try {
      // Allow for trigger latency if profile was just created
      let profile: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, is_suspended, full_name, username')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          profile = data;
          break;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!profile) {
        // Fail closed: Never grant administrative access if profile does not exist
        return { 
          authorized: false, 
          role: '',
          error: 'Administrative profile not found. Access denied.',
        };
      }

      if (profile.is_suspended) {
        return { authorized: false, role: profile.role, error: 'Your access has been suspended. Please contact system security.' };
      }

      if (!ADMIN_ROLES.includes(profile.role)) {
        return {
          authorized: false,
          role: profile.role,
          error: `Insufficient privileges: Account role "${profile.role}" is not authorized.`,
        };
      }

      return { 
        authorized: true, 
        role: profile.role,
        fullName: profile.full_name,
        username: profile.username,
      };
    } catch (err: any) {
      return { authorized: false, role: '', error: `Security authorization check failed: ${err.message || err}` };
    }
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          const authCheck = await verifyUserRole(session.user.id, session.user.app_metadata?.role);
          if (authCheck.authorized) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'user@truthprenuer.com',
              role: authCheck.role,
              fullName: authCheck.fullName,
              username: authCheck.username,
            });
          } else {
            setErrorMsg(authCheck.error || 'Access denied.');
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const authCheck = await verifyUserRole(session.user.id, session.user.app_metadata?.role);
        if (authCheck.authorized) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@truthprenuer.com',
            role: authCheck.role,
            fullName: authCheck.fullName,
            username: authCheck.username,
          });
        } else {
          setErrorMsg(authCheck.error || 'Access denied.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 1. Send 6-Digit OTP (Sign In or Sign Up)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (authMode === 'otp_signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name for registration.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'otp_signin') {
        // Sign In OTP: Should not create new account if user doesn't exist
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes('user not found') || lower.includes('signups not allowed') || lower.includes('not found')) {
            setErrorMsg('No registered account found with this email. Switch to the "Create Account" tab to sign up.');
          } else if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
            setErrorMsg('Rate limit exceeded. Please wait a minute before requesting another verification code.');
          } else {
            setErrorMsg(error.message);
          }
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`A 6-digit verification code has been dispatched to ${targetEmail}`);
        setAuthStep('verify_otp');
        setOtp('');
        startCooldown(60);
      } else if (authMode === 'otp_signup') {
        // Sign Up OTP: Creates new account and attaches metadata
        const generatedUsername = username.trim() || `user_${targetEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now().toString(36).slice(-4)}`;
        
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: true,
            data: {
              full_name: fullName.trim(),
              username: generatedUsername,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
            setErrorMsg('Rate limit reached. Please wait a moment before trying again.');
          } else {
            setErrorMsg(error.message);
          }
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Registration initiated! A 6-digit confirmation code was sent to ${targetEmail}`);
        setAuthStep('verify_otp');
        setOtp('');
        startCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to request verification code. Please check connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verify 6-Digit OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = (codeToVerify || otp).trim();
    if (finalOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const primaryType = authMode === 'otp_signup' ? 'signup' : 'email';
      
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: finalOtp,
        type: primaryType as any,
      });

      // Fallback: If signup vs email OTP type mismatch occurs in Supabase Auth
      if (error && (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('invalid'))) {
        const fallbackType = primaryType === 'signup' ? 'email' : 'signup';
        const fallbackRes = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: finalOtp,
          type: fallbackType as any,
        });

        if (!fallbackRes.error && fallbackRes.data.session) {
          data = fallbackRes.data;
          error = null;
        }
      }

      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes('expired')) {
          setErrorMsg('The 6-digit verification code has expired. Please request a new code.');
        } else if (lower.includes('invalid') || lower.includes('token')) {
          setErrorMsg('Incorrect 6-digit code. Please verify the code in your email.');
        } else {
          setErrorMsg(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data?.session) {
        const authCheck = await verifyUserRole(data.session.user.id, data.session.user.app_metadata?.role);
        if (!authCheck.authorized) {
          setErrorMsg(authCheck.error || 'Insufficient privileges for this portal.');
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || email.trim(),
            role: authCheck.role,
            fullName: authCheck.fullName,
            username: authCheck.username,
          });
          setAuthStep('form');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    await handleSendOtp();
  };

  // 4. Password-based Login (Fallback)
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        const authCheck = await verifyUserRole(data.session.user.id, data.session.user.app_metadata?.role);
        if (!authCheck.authorized) {
          setErrorMsg(authCheck.error || 'Insufficient privileges.');
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || email.trim(),
            role: authCheck.role,
            fullName: authCheck.fullName,
            username: authCheck.username,
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Password authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setUser(null);
    setAuthStep('form');
    setOtp('');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#161616] text-[#FEF8E8]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F44A22]"></div>
      </div>
    );
  }

  // Not authenticated: render privileged security & authentication gate
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161616] p-4 sm:p-6 text-white font-sans">
        <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#1F1F1F] p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Brand header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F44A22]/10 text-[#F44A22] border border-[#F44A22]/20 shadow-md shadow-[#F44A22]/10">
              <Shield size={26} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#FEF8E8]">TRUTHPRENUER</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F44A22] font-semibold">
                Supabase Auth Gateway
              </div>
            </div>
          </div>

          {/* Mode switch tabs (only when in initial form step) */}
          {authStep === 'form' && (
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#161616] border border-[#2A2A2A] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === 'otp_signin'
                    ? 'bg-[#F44A22] text-[#FEF8E8] shadow-sm shadow-[#F44A22]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]'
                }`}
              >
                <LogIn size={13} />
                <span>OTP Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === 'otp_signup'
                    ? 'bg-[#F44A22] text-[#FEF8E8] shadow-sm shadow-[#F44A22]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]'
                }`}
              >
                <UserPlus size={13} />
                <span>Sign Up</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  authMode === 'password'
                    ? 'bg-[#F44A22] text-[#FEF8E8] shadow-sm shadow-[#F44A22]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]'
                }`}
              >
                <KeyRound size={13} />
                <span>Password</span>
              </button>
            </div>
          )}

          {/* Context description */}
          {authStep === 'form' ? (
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              {authMode === 'otp_signin' && 'Sign in securely without a password using a single-use 6-digit verification code.'}
              {authMode === 'otp_signup' && 'Register a new Truthprenuer account verified with a 6-digit one-time passcode.'}
              {authMode === 'password' && 'Enter your administrative credentials for direct cryptographic session access.'}
            </p>
          ) : (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthStep('form');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-[#FEF8E8] mb-3 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Change email address</span>
              </button>
              <h2 className="text-lg font-bold text-[#FEF8E8]">Enter 6-Digit Verification Code</h2>
              <p className="text-xs text-gray-400 mt-1">
                We sent a 6-digit security code to <span className="font-semibold text-[#FEF8E8] font-mono">{email}</span>.
              </p>
            </div>
          )}

          {/* Notification alerts */}
          {errorMsg && (
            <div className="mb-5 flex items-start space-x-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start space-x-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3.5 text-xs text-green-400">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* STEP 1: INITIAL FORM (OTP SEND OR PASSWORD) */}
          {authStep === 'form' && (
            <>
              {authMode === 'password' ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                      Identity (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@truthprenuer.com"
                      className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#F44A22] focus:ring-1 focus:ring-[#F44A22] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#F44A22] focus:ring-1 focus:ring-[#F44A22] focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[#F44A22] py-3 text-sm font-semibold text-white hover:bg-[#D73D19] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#F44A22]/20 cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>{isSubmitting ? 'Authenticating...' : 'Authenticate Privileged Session'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {authMode === 'otp_signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Vance"
                          className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#F44A22] focus:ring-1 focus:ring-[#F44A22] focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                          Username (Optional)
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. alex_vance"
                          className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#F44A22] focus:ring-1 focus:ring-[#F44A22] focus:outline-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full rounded-xl border border-[#2A2A2A] bg-[#161616] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#F44A22] focus:ring-1 focus:ring-[#F44A22] focus:outline-none transition-all"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[#F44A22] py-3 text-sm font-semibold text-white hover:bg-[#D73D19] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#F44A22]/20 cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>
                      {isSubmitting
                        ? 'Dispatching 6-Digit Code...'
                        : authMode === 'otp_signup'
                        ? 'Send 6-Digit Sign Up Code'
                        : 'Send 6-Digit Login Code'}
                    </span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION SCREEN */}
          {authStep === 'verify_otp' && (
            <div className="space-y-5">
              <OtpInput
                length={6}
                value={otp}
                onChange={setOtp}
                onComplete={(completedOtp) => handleVerifyOtp(completedOtp)}
                disabled={isSubmitting}
                hasError={Boolean(errorMsg)}
              />

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isSubmitting || otp.length !== 6}
                className="w-full rounded-xl bg-[#F44A22] py-3 text-sm font-semibold text-white hover:bg-[#D73D19] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#F44A22]/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify & Authenticate</span>
                  </>
                )}
              </button>

              {/* Resend OTP with cooldown timer */}
              <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-gray-400">
                <span>Didn't receive the email?</span>
                {cooldown > 0 ? (
                  <span className="flex items-center space-x-1 font-mono text-gray-500">
                    <Clock size={13} />
                    <span>Resend in {cooldown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1 text-[#F44A22] hover:text-[#D73D19] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Resend 6-Digit Code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer security badge */}
          <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-mono">Supabase Auth • 256-Bit TLS</span>
            <span className="text-green-400 font-mono">Zero Trust Enforced</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user exists: verify strict administrative role access
  const privilegedRoles = ['Admin', 'Super_Admin', 'Moderator', 'Security'];
  const hasAccess = privilegedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161616] p-6 text-white font-sans">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#1F1F1F] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-xs text-gray-400 mb-6">
            Your account ({user.email}) has role <span className="font-mono text-[#F44A22]">{user.role}</span>, which lacks permissions for this interface.
          </p>
          <button
            onClick={signOut}
            className="inline-flex items-center space-x-2 rounded-xl bg-[#2A2A2A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
