'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin, useRegister } from '@/hooks/useAuth'
import { type Credentials, loginSchema, registerSchema } from '@/lib/schemas'
import { showAuthError } from './showAuthError'

// Sign-in and registration are the same two fields; only the rules, the call and the
// words change.
const modes = {
  login: {
    schema: loginSchema,
    title: 'Entrar',
    subtitle: 'Usa el correo con el que te registraste.',
    submit: 'Entrar',
    passwordAutocomplete: 'current-password',
    switchText: '¿No tienes cuenta?',
    switchLink: { href: '/register', label: 'Regístrate' },
  },
  register: {
    schema: registerSchema,
    title: 'Crear cuenta',
    subtitle: null,
    submit: 'Crear cuenta',
    passwordAutocomplete: 'new-password',
    switchText: '¿Ya tienes cuenta?',
    switchLink: { href: '/login', label: 'Entrar' },
  },
} as const

// The mockup's inputs: taller and rounder than shadcn's default
const inputClass = 'h-11 rounded-[14px] bg-card px-3.5'

export function AuthForm({ mode }: { mode: keyof typeof modes }) {
  const copy = modes[mode]
  const router = useRouter()
  const login = useLogin()
  const register = useRegister()
  const mutation = mode === 'login' ? login : register

  const {
    register: field,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm<Credentials>({ resolver: zodResolver(copy.schema) })

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: () => {
        if (mode === 'login') {
          router.replace('/cases')
          return
        }
        // RF-13 · registering does not sign the person in
        toast.success('Cuenta creada. Ya puedes entrar.')
        router.replace('/login')
      },
      onError: (error) => {
        showAuthError(error, { setError, setFocus })
      },
    }),
  )

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      // The form-level notice goes as soon as the person types again
      onChange={() => errors.root && clearErrors('root')}
      className="grid gap-5"
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{copy.title}</h1>
        {copy.subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        )}
      </div>

      <Field id="email" label="Correo" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClass}
          {...field('email')}
        />
      </Field>

      <Field id="password" label="Contraseña" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete={copy.passwordAutocomplete}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={inputClass}
          {...field('password')}
        />
      </Field>

      {errors.root && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-[14px] border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-sm font-semibold text-destructive"
        >
          <CircleAlert className="mt-px size-4.5 shrink-0" />
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-11 w-full rounded-full text-sm font-semibold shadow-[0_6px_16px_rgba(79,104,241,.28)]"
      >
        {copy.submit}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {copy.switchText}{' '}
        <Link
          href={copy.switchLink.href}
          className="font-semibold text-primary hover:underline"
        >
          {copy.switchLink.label}
        </Link>
      </p>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="font-semibold">
        {label}
      </Label>
      {children}
      {/* RF-18 · the error sits next to the field that caused it */}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-[12.5px] text-destructive"
        >
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
