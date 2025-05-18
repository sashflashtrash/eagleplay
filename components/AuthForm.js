
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        setUser(data.user);
        setMessage('✅ Eingeloggt');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('📧 Bestätigungslink gesendet');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessage('🚪 Abgemeldet');
  };

  if (user) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
        <p>✅ Eingeloggt als: {user.email}</p>
        <button onClick={handleLogout}>🚪 Logout</button>
        {message && <div style={{ marginTop: 10 }}>{message}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
      <h2>{isLogin ? 'Login' : 'Registrieren'}</h2>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Registrieren'}</button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ fontSize: 12 }}>
          {isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Schon registriert? Jetzt einloggen'}
        </button>
        {message && <div style={{ marginTop: 10 }}>{message}</div>}
      </form>
    </div>
  );
}
