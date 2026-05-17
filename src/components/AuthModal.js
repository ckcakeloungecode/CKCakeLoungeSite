'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = isSignUp 
        ? await signUp(email, password, firstName, lastName, phone)
        : await signIn(email, password);

      if (authError) {
        setError(authError.message);
      } else {
        // Success!
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <h2 className={styles.title}>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
        <p className={styles.subtitle}>
          {isSignUp ? 'Join to unlock exclusive discounts!' : 'Log in to use your promo codes.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required={isSignUp} 
                    placeholder="Jane"
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    required={isSignUp} 
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required={isSignUp} 
                  placeholder="(555) 123-4567"
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className={styles.toggleText}>
          {isSignUp ? 'Already have an account? ' : 'Need an account? '}
          <button 
            type="button" 
            className={styles.toggleBtn} 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          >
            {isSignUp ? 'Log in here.' : 'Sign up here.'}
          </button>
        </div>
      </div>
    </div>
  );
}
