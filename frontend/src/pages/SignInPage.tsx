import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode } from '../lib/api';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export function SignInPage() {
    const [email, setEmail] = useState(isDemoMode ? 'admin@school.edu' : '');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const approved = new URLSearchParams(location.search).get('approved') === 'true';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/app');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to your StudentIQ account">
            <Card>
                <div className="space-y-5">
                    {approved && (
                        <Alert variant="success" title="Account approved">
                            Your teacher account has been verified. You can now sign in.
                        </Alert>
                    )}
                    {isDemoMode && (
                        <Alert variant="info" title="Demo mode">
                            Use any email and a password of 4+ characters. Suggested: admin@school.edu / admin123
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@school.edu"
                            required
                            autoComplete="email"
                        />
                        <div>
                            <Input
                                label="Password"
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                                >
                                    {showPass ? 'Hide' : 'Show'} password
                                </button>
                                <Link to="/forgot-password" className="text-xs text-red-400 transition-colors hover:text-red-300">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && <Alert variant="error">{error}</Alert>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing in…' : 'Sign in'}
                        </Button>

                        <p className="text-center text-sm text-neutral-500">
                            New here?{' '}
                            <Link to="/register" className="font-medium text-white transition-colors hover:text-red-400">
                                Create an account
                            </Link>
                        </p>
                    </form>
                </div>
            </Card>
        </AuthLayout>
    );
}
