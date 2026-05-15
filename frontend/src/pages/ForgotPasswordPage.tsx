import { useState } from 'react';
import { api, isDemoMode } from '../lib/api';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isDemoMode) {
            setSuccess('Demo mode: reset email flow is disabled.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', {
                email: email.trim(),
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setSuccess('If your account exists, a password reset email has been sent.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset your password" subtitle="We'll send a reset link to your email" backTo="/sign-in" backLabel="Back to sign in">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    {error && <Alert variant="error">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Sending…' : 'Send reset email'}
                    </Button>
                </form>
            </Card>
        </AuthLayout>
    );
}
