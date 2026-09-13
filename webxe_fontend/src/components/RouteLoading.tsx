import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function RouteLoading() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.events]);

  if (!isLoading) return null;

  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Đang tải trang">
      <div className="route-loading-spinner" aria-hidden="true" />
      <span className="route-loading-text">Đang tải...</span>
    </div>
  );
}