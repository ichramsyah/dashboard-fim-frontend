// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api('login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="bg-neutral-2/70 min-h-screen flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="username">Username:</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '20px' }}>
          Login
        </button>
      </form>
    </div>
  );
}
