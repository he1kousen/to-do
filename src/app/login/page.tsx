'use client';

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            To-Do List
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your tasks
          </p>
        </div>
      </div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginForm />;
}
