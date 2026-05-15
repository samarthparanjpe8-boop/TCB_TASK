import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode } from '../lib/api';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register({ email, password, firstName, lastName, role });
            navigate('/app');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create your account" subtitle="Get started with StudentIQ">
            <Card>
                <div className="space-y-5">
                    {isDemoMode && (
                        <Alert variant="info" title="Demo mode">
                            Your profile is stored locally. Use a password of 4+ characters.
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                        </div>
                        <Select label="Account type" value={role} onChange={(e) => setRole(e.target.value as 'student' | 'teacher')} required>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </Select>
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        <div>
                            <Input
                                label="Password"
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={isDemoMode ? 4 : 6}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="mt-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                            >
                                {showPass ? 'Hide' : 'Show'} password
                            </button>
                        </div>

                        {error && <Alert variant="error">{error}</Alert>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account…' : 'Create account'}
                        </Button>

                        <p className="text-center text-xs text-neutral-600">
                            Teacher sign-up works only for emails configured by the admin.
                        </p>
                        <p className="text-center text-sm text-neutral-500">
                            Already have an account?{' '}
                            <Link to="/sign-in" className="font-medium text-white transition-colors hover:text-red-400">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </Card>
        </AuthLayout>
    );
}
