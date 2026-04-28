import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LinkButton, PrimaryButton } from '@/components/buttons'
import { TextInput } from '@/components/forms/TextInput'
import { EmailInput } from '@/components/forms/EmailInput'
import { PasswordInput } from '@/components/forms/PasswordInput'
import { useSignUp } from '@/hooks'
import { toastMessage } from '@/utility'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
const passwordValidationMessage =
  'Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character'

const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().regex(passwordRegex, passwordValidationMessage),
})

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUp() {
  const navigate = useNavigate()
  const { mutateAsync: signUp, isPending } = useSignUp()

  const { control, handleSubmit } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = async (values: SignUpValues): Promise<void> => {
    try {
      await signUp(values)
      toastMessage.success({ message: 'Account created! Please sign in.' })
      navigate('/')
    } catch (error: unknown) {
      toastMessage.error({ err: error })
    }
  }

  return (
    <Card className="bg-card border-border/50 shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-foreground text-xl">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Fill in the details below to get started
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <TextInput
            control={control}
            name="name"
            label="Full name"
            placeholder="Jane Doe"
            autoComplete="name"
            disabled={isPending}
          />
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
            placeholder="Min. 6 chars, mixed case, number, symbol"
            autoComplete="new-password"
            disabled={isPending}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 border-t-0 bg-transparent">
          <PrimaryButton type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account…' : 'Create account'}
          </PrimaryButton>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account? <LinkButton to="/">Sign in</LinkButton>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
