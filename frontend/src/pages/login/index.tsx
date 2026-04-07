import { LoginForm } from '@/features/auth/ui/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">POS System</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
