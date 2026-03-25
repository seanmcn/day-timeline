import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useGoogleStore } from '@/store/googleStore';
import { getGoogleRedirectUri } from '@/lib/google-auth';

export function GoogleOAuthCallback() {
  const navigate = useNavigate();
  const { exchangeCode } = useGoogleStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(error === 'access_denied' ? 'Access was denied' : error);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('No authorization code received');
      return;
    }

    const redirectUri = getGoogleRedirectUri();

    exchangeCode(code, redirectUri).then((success) => {
      if (success) {
        setStatus('success');
        setTimeout(() => navigate('/settings'), 1500);
      } else {
        setStatus('error');
        setErrorMessage('Failed to connect Google account');
      }
    });
  }, [exchangeCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="glass-card p-8 text-center max-w-sm w-full">
        {status === 'loading' && (
          <>
            <Loader2
              size={32}
              className="mx-auto mb-4 animate-spin text-[hsl(var(--primary))]"
            />
            <p className="text-[hsl(var(--foreground))]">
              Connecting your Google account...
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2
              size={32}
              className="mx-auto mb-4 text-green-500"
            />
            <p className="text-[hsl(var(--foreground))]">
              Google account connected!
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              Redirecting to settings...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={32} className="mx-auto mb-4 text-red-500" />
            <p className="text-[hsl(var(--foreground))]">{errorMessage}</p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
