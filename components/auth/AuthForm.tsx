'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { FormField, ariaFor, inputClass } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin, useRegister } from '@/hooks/useSession'
import { successMessages } from '@/lib/messages.es'
import { notifyError, notifySuccess } from '@/lib/notify'
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

export function AuthForm({ mode }: { mode: keyof typeof modes }) {
  const copy = modes[mode]
  const router = useRouter()
  const login = useLogin()
  const register = useRegister()
  const mutation = mode === 'login' ? login : register

  const form = useForm<Credentials>({ resolver: zodResolver(copy.schema) })
  const {
    register: field,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = form

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
      if (mode === 'login') {
        router.replace('/cases')
        return
      }
      // Registering does not sign the person in (RF-13)
      notifySuccess(successMessages.registered)
      router.replace('/login')
    } catch (error) {
      if (!showAuthError(error, form)) notifyError(error)
    }
  })

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

      <FormField id="email" label="Correo" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...ariaFor('email', errors.email?.message)}
          className={inputClass}
          {...field('email')}
        />
      </FormField>

      <FormField
        id="password"
        label="Contraseña"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete={copy.passwordAutocomplete}
          {...ariaFor('password', errors.password?.message)}
          className={inputClass}
          {...field('password')}
        />
      </FormField>

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
        className="h-11 w-full text-sm"
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
