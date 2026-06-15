import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authAPI } from '@/utils/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.login(data)
      const { user, access, refresh } = res.data
      login(user, access, refresh)
      toast.success(t('auth.login_success'))
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">MC</span>
          </div>
          <h1 className="text-2xl font-bold"><span className="text-primary-400">Manga</span>Cafe</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">{t('auth.login')}</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.email')}</label>
              <input {...register('email', { required: 'Email required' })} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input {...register('password', { required: 'Password required' })} type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t('auth.login')}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-muted)] mt-4">
            {t('auth.no_account')} <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">{t('auth.signup')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.register(data)
      const { user, tokens } = res.data
      login(user, tokens.access, tokens.refresh)
      toast.success(t('auth.register_success'))
      navigate('/')
    } catch (err) {
      const errs = err.response?.data
      if (errs) Object.values(errs).flat().forEach(msg => toast.error(msg))
      else toast.error('Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">MC</span>
          </div>
          <h1 className="text-2xl font-bold"><span className="text-primary-400">Manga</span>Cafe</h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">{t('auth.signup')}</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.username')}</label>
              <input {...register('username', { required: 'Username required', minLength: { value: 3, message: 'Min 3 chars' } })} className="input-field" placeholder="coolreader99" />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.email')}</label>
              <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" className="input-field" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.phone')}</label>
              <input {...register('phone')} type="tel" className="input-field" placeholder="+95 9..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } })} type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t('auth.confirm_password')}</label>
              <input {...register('confirm_password', { required: true, validate: v => v === password || 'Passwords do not match' })} type="password" className="input-field" placeholder="••••••••" />
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : t('auth.signup')}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-muted)] mt-4">
            {t('auth.have_account')} <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
