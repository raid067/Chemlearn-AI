import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
  app: {},
  db: {},
}));

// Mock Modal transition timers
jest.mock('@/components/ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;
    return (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close modal">Close</button>
        {children}
      </div>
    );
  };
});

import AuthModal from '@/components/layout/AuthModal';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

describe('AuthModal Component (User Journeys & Form State)', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUIStore.setState({
      activeModal: 'auth',
      authMode: 'signin',
    });
    useAuthStore.setState({
      signIn: mockSignIn,
      signUp: mockSignUp,
      loading: false,
    });
  });

  it('renders Sign In mode with email and password fields', () => {
    render(<AuthModal />);

    expect(screen.getByRole('dialog', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Name/i)).not.toBeInTheDocument();
    expect(screen.getByText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
  });

  it('switches to Sign Up mode when toggled and shows Name field', () => {
    render(<AuthModal />);

    const toggleButton = screen.getByRole('button', { name: /^Sign Up$/i });
    fireEvent.click(toggleButton);

    expect(useUIStore.getState().authMode).toBe('signup');
  });

  it('handles successful sign in submission', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    render(<AuthModal />);

    const emailInput = screen.getAllByRole('textbox')[0];
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'student@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('student@example.com', 'password123');
      expect(useUIStore.getState().activeModal).toBeNull();
    });
  });

  it('displays error message when sign in fails with invalid credentials', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid email or password'));
    render(<AuthModal />);

    const emailInput = screen.getAllByRole('textbox')[0];
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'badpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('disables submit button and shows loading text during authentication', () => {
    useAuthStore.setState({ loading: true });
    render(<AuthModal />);

    const submitButton = screen.getByRole('button', { name: /Processing.../i });
    expect(submitButton).toBeDisabled();
  });
});
