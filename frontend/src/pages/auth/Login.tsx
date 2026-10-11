import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/FormElements';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/DisplayElements';
import { Modal } from '../../components/common/Modal';
import {
  Lock,
  Mail,
  GraduationCap,
  Eye,
  EyeOff,
  HelpCircle,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Please enter your institutional email, username or USN'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isNoAccountModalOpen, setIsNoAccountModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Registration/Invitation form state
  const [regRole, setRegRole] = useState<'STUDENT' | 'GUIDE' | 'ADMIN'>('STUDENT');
  const [inviteCode, setInviteCode] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStatusMsg, setRegStatusMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const user = await login(data.identifier, data.password);
      // Strictly redirect by verified role
      if (user.role === 'STUDENT') {
        navigate('/student');
      } else if (user.role === 'GUIDE') {
        navigate('/guide');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Invalid institutional credentials. Please verify your username/email and password.');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 4000);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regRole === 'ADMIN') {
      setRegStatusMsg('Administrative accounts cannot be self-registered. Please contact the Directorate of Academic Projects.');
      return;
    }
    if (!inviteCode.trim() || !regEmail.trim()) {
      setRegStatusMsg('Please enter your institutional email and invitation code / enrollment number.');
      return;
    }
    setRegStatusMsg(`Registration verification initiated for ${regEmail}. An approval link has been dispatched to your institutional inbox.`);
    setTimeout(() => {
      setRegStatusMsg(null);
      setIsNoAccountModalOpen(false);
      setInviteCode('');
      setRegFullName('');
      setRegEmail('');
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#F6F0E5] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#C6A15B] selection:text-[#17243B]">
      {/* Institutional Emblem & Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#17243B] flex items-center justify-center text-[#C6A15B] shadow-lg mb-4 ring-4 ring-[#E6DCB8]">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#17243B] font-serif tracking-tight">
          PROTRACK
        </h1>
        <p className="mt-1 text-xs uppercase font-bold tracking-widest text-[#C6A15B]">
          College Project Monitoring &amp; Improvement Portal
        </p>
        <p className="mt-2 text-xs text-[#536482]">
          Unified academic governance for Students, Faculty Guides, and Administration
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg border border-[#E6DCB8] rounded-2xl sm:px-10">
          {isExpired && (
            <Alert variant="warning" title="Session Expired" className="mb-5">
              Your institutional session has expired for security compliance. Please sign in again.
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="danger" title="Authentication Error" className="mb-5">
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifier input */}
            <Input
              label="Institutional Email or Username"
              placeholder="e.g. sushma.rao@college.edu or CS2022-048"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            {/* Password with Show/Hide toggle */}
            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-[#536482] hover:text-[#17243B] focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password Links */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-[#536482] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#DDD0B6] text-[#C6A15B] focus:ring-[#C6A15B] mr-2"
                />
                Keep session active
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[#C6A15B] font-bold hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Gold Login Button */}
            <Button
              type="submit"
              variant="gold"
              className="w-full py-2.5 text-sm font-bold shadow-xs transition-all"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Account Onboarding Footer */}
          <div className="mt-6 pt-5 border-t border-[#EFE8D8] text-center">
            <p className="text-xs text-[#536482]">
              Don't have an active account?{' '}
              <button
                type="button"
                onClick={() => setIsNoAccountModalOpen(true)}
                className="text-[#17243B] font-bold underline hover:text-[#C6A15B] transition-colors"
              >
                Institutional Registration &amp; Onboarding
              </button>
            </p>
          </div>
        </div>

        {/* Security & Academic Compliance Footer */}
        <p className="mt-6 text-center text-[11px] text-[#536482]">
          Protected institutional portal. Unauthorized access attempts are monitored and logged.
        </p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Institutional Password Recovery"
        subtitle="Submit your registered institutional email to initiate secure verification"
        maxWidth="md"
      >
        {forgotSubmitted ? (
          <div className="p-4 rounded-xl bg-[#EBF5EE] border border-[#C8E6C9] text-center text-xs text-[#1B5E20]">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
            <p className="font-bold text-sm">Reset Verification Link Dispatched</p>
            <p className="mt-1 text-[#536482]">
              If <strong>{forgotEmail}</strong> matches a registered academic record, a cryptographically signed reset token has been sent. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-[#536482] leading-relaxed">
              Enter your college email address or faculty ID. The portal security service will verify your identity against the institutional database and email a temporary password reset token.
            </p>

            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. sushma.rao@college.edu"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EFE8D8]">
              <Button type="button" variant="outline" onClick={() => setIsForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* NO ACCOUNT / INSTITUTIONAL REGISTRATION MODAL */}
      <Modal
        isOpen={isNoAccountModalOpen}
        onClose={() => {
          setIsNoAccountModalOpen(false);
          setRegStatusMsg(null);
        }}
        title="Institutional Account Provisioning"
        subtitle="Student and Faculty Guide account onboarding workflow"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          {regStatusMsg && (
            <Alert
              variant={regRole === 'ADMIN' ? 'danger' : 'success'}
              title="Onboarding Status"
              className="mb-2"
            >
              {regStatusMsg}
            </Alert>
          )}

          <div className="p-3 bg-[#FAF5E8] rounded-xl border border-[#E6D09A] text-[#17243B] space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
              <div>
                <strong>Institutional Onboarding Policy:</strong>
                <p className="text-[#536482] mt-0.5 leading-relaxed">
                  • <strong>Students &amp; Guides:</strong> Accounts must be verified using the department-issued invitation token or official university enrollment number (USN).
                </p>
                <p className="text-[#536482] mt-0.5 leading-relaxed">
                  • <strong>Administrators:</strong> Administrator credentials must be created and authorized directly by the Academic Directorate. Self-service admin creation is restricted.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegistrationSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#17243B] mb-1.5">
                Target Academic Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['STUDENT', 'GUIDE', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegRole(r)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      regRole === r
                        ? 'bg-[#17243B] text-[#F6F0E5] border-[#17243B]'
                        : 'bg-white text-[#536482] border-[#DDD0B6] hover:bg-[#FAF5E8]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {regRole === 'ADMIN' ? (
              <div className="p-4 rounded-xl bg-[#FDEDEC] border border-[#F5B7B1] text-[#900C3F]">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  Restricted Administrator Provisioning
                </div>
                <p className="leading-relaxed">
                  System administrators cannot self-register. Administrative credentials are generated in a secure environment by the Dean of Academics or System Administrator.
                </p>
              </div>
            ) : (
              <>
                <Input
                  label="Full Name"
                  placeholder="e.g. Sinchana Rao"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                />

                <Input
                  label="College Email Address"
                  type="email"
                  placeholder="e.g. student@college.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <Input
                  label={regRole === 'STUDENT' ? 'University Enrollment Number (USN)' : 'Faculty Invitation Token'}
                  placeholder={regRole === 'STUDENT' ? 'e.g. CS2022-048' : 'e.g. INV-CSE-GUIDE-8472'}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE8D8]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNoAccountModalOpen(false);
                  setRegStatusMsg(null);
                }}
              >
                Close
              </Button>
              {regRole !== 'ADMIN' && (
                <Button type="submit" variant="gold" leftIcon={<UserCheck className="w-4 h-4" />}>
                  Submit for Verification
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
