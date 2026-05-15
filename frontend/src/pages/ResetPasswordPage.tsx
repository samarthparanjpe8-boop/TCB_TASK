import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isDemoMode } from '../lib/api';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

function readAccessTokenFromUrl(): string {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);
    return hashParams.get('access_token') ?? queryParams.get('access_token') ?? '';
}

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const token = useMemo(() => readAccessTokenFromUrl(), []);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Reset token is missing. Open the reset link from your email again.');
            return;
        }
        if (isDemoMode) {
            setError('Demo mode does not support password reset.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { accessToken: token, password });
            navigate('/sign-in');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Set a new password" subtitle="Choose a strong password you have not used before" backTo="/sign-in" backLabel="Back to sign in">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="New password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
                    <Input label="Confirm password" type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-neutral-500 hover:text-neutral-300">
                        {showPass ? 'Hide' : 'Show'} passwords
                    </button>
                    {error && <Alert variant="error">{error}</Alert>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Updating…' : 'Update password'}
                    </Button>
                </form>
            </Card>
        </AuthLayout>
    );
}
