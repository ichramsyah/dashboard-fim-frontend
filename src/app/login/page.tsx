'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      toast.success('Login berhasil');
      window.location.href = '/';
    } catch (err: any) {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="bg-gray-1/70 min-h-screen flex items-center justify-center p-4">
      <form className="bg-white p-8 rounded-lg w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="relative mb-6">
          {/* Username */}
          <input
            id="username"
            type="text"
            className="block w-full px-3 py-2 text-gray-900 bg-transparent border border-gray-400 rounded-md appearance-none peer focus:outline-none focus:ring-0 focus:border-gray-900"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="off"
          />
          <label
            htmlFor="username"
            className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-gray-900"
          >
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-6">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="block w-full px-3 py-2 text-gray-900 bg-transparent border border-gray-400 rounded-md appearance-none peer focus:outline-none focus:ring-0 focus:border-gray-900"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
          <label
            htmlFor="password"
            className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-gray-900"
          >
            Password
          </label>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button type="submit" className="w-full cursor-pointer bg-gray-900 text-white py-2 px-4 rounded-[5px] hover:rounded-[50px] transition-all duration-300">
          Login
        </button>
      </form>
    </div>
  );
}
