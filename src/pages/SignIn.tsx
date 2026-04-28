import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LinkButton, PrimaryButton } from '@/components/buttons'
import { EmailInput } from '@/components/forms/EmailInput'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { useSignIn } from '@/hooks'
import { useAuth } from '@/context'
import { toastMessage } from '@/utility'

const signInSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type SignInValues = z.infer<typeof signInSchema>

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuth()
  const { mutateAsync: signIn, isPending } = useSignIn()

  const { control, handleSubmit } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: SignInValues): Promise<void> => {
    try {
      const data = await signIn(values)
      setAuth({ accessToken: data.accessToken, role: data.role })
      toastMessage.success({ message: 'Welcome back!' })
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
      navigate(from, { replace: true })
    } catch (error: unknown) {
      toastMessage.error({ err: error })
    }
  }

  return (
    <Card className="bg-card border-border/50 shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-foreground text-xl">Sign in</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <EmailInput
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            disabled={isPending}
          />
          <PasswordInput
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            disabled={isPending}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <PrimaryButton type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account? <LinkButton to="/sign-up">Sign up</LinkButton>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
