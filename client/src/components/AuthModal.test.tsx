import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthModal } from './AuthModal';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  demoLogin: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authMocks,
}));

describe('AuthModal', () => {
  beforeEach(() => {
    authMocks.login.mockReset();
    authMocks.register.mockReset();
    authMocks.demoLogin.mockReset();
  });

  test('submits email and password through the login flow', async () => {
    const onClose = vi.fn();
    render(<AuthModal isOpen onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('candidate@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '[ SIGN IN ]' }));

    await waitFor(() => {
      expect(authMocks.login).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('shows an authentication error without closing the modal', async () => {
    const onClose = vi.fn();
    authMocks.login.mockRejectedValue(new Error('Invalid email or password'));
    render(<AuthModal isOpen onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('candidate@example.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: '[ SIGN IN ]' }));

    expect(await screen.findByText(/Invalid email or password/)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

