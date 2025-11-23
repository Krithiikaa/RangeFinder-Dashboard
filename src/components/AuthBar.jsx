import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseClient';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export default function AuthBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google login failed', err);
      alert('Login failed: ' + err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className='flex items-center gap-4'>
      {user ? (
        <>
          <div className='text-sm text-gray-700'>Signed in as <strong>{user.email ?? user.displayName ?? user.uid}</strong></div>
          <button onClick={logout} className='px-3 py-1 rounded bg-gray-100 hover:bg-gray-200'>Sign out</button>
        </>
      ) : (
        <button onClick={loginGoogle} className='px-3 py-1 rounded bg-indigo-600 text-white hover:opacity-90'>Sign in with Google</button>
      )}
    </div>
  );
}
