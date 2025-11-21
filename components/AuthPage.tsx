
import React, { useState } from 'react';
import { login, signup, loginWithGoogle, resetPassword } from '../services/authService';

type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (view === 'LOGIN') {
        await login(email, password);
      } else if (view === 'SIGNUP') {
        await signup(email, password);
      } else if (view === 'FORGOT_PASSWORD') {
        await resetPassword(email);
        setSuccessMsg(`Password reset email sent to ${email}. Check your inbox.`);
        setIsLoading(false);
        return; // Stay on reset page or switch to login
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use. Try logging in.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
      if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Try again later.";
      setError(msg);
    } finally {
      if (view !== 'FORGOT_PASSWORD') setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      let msg = "Google sign in failed.";
      if (err.code === 'auth/popup-closed-by-user') msg = "Sign in cancelled.";
      if (err.code === 'auth/popup-blocked') msg = "Pop-up blocked by browser.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AncestryFlow</h1>
          <p className="text-slate-500 text-sm mt-1">
            {view === 'LOGIN' && 'Sign in to access your family tree'}
            {view === 'SIGNUP' && 'Create an account to start building'}
            {view === 'FORGOT_PASSWORD' && 'Recover your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs rounded-lg flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {successMsg}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {view !== 'FORGOT_PASSWORD' && (
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {view === 'LOGIN' && (
                  <button 
                    type="button"
                    onClick={() => switchView('FORGOT_PASSWORD')}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {view === 'LOGIN' && 'Signing in...'}
                {view === 'SIGNUP' && 'Creating account...'}
                {view === 'FORGOT_PASSWORD' && 'Sending email...'}
              </span>
            ) : (
              <>
                {view === 'LOGIN' && 'Sign In'}
                {view === 'SIGNUP' && 'Create Account'}
                {view === 'FORGOT_PASSWORD' && 'Send Reset Link'}
              </>
            )}
          </button>
        </form>

        {view !== 'FORGOT_PASSWORD' && (
          <>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
                Google
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          {view === 'FORGOT_PASSWORD' ? (
            <button 
              onClick={() => switchView('LOGIN')}
              className="text-sm text-slate-500 hover:text-primary font-medium transition-colors"
            >
              Back to Sign In
            </button>
          ) : (
            <button 
              onClick={() => switchView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
              className="text-sm text-slate-500 hover:text-primary font-medium transition-colors"
            >
              {view === 'LOGIN' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
