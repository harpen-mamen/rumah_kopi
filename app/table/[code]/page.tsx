'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TableOrderRedirectPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/order?table=${encodeURIComponent(params.code)}`);
  }, [params.code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
      Opening table order...
    </div>
  );
}
