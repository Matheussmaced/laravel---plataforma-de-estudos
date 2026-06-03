import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const features = [
    { label: '35 desafios interativos', desc: 'Fill-in-the-blank e código completo' },
    { label: '3 níveis progressivos', desc: 'Fundamentos, Intermediário e Avançado' },
    { label: 'Progresso salvo', desc: 'Continue de onde parou, em qualquer dispositivo' },
    { label: 'Cobertura completa', desc: 'Eloquent, Rotas, Validação, Cache, Jobs e mais' },
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left panel */}
            <div className="relative hidden flex-col bg-zinc-950 p-10 text-white lg:flex">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

                {/* Logo */}
                <Link href={home()} className="relative z-20 flex items-center gap-2.5 text-lg font-semibold">
                    <AppLogoIcon className="size-7 fill-current text-white" />
                    <span>Laravel Tasks</span>
                </Link>

                {/* Main content */}
                <div className="relative z-20 mt-30">
                    <blockquote className="space-y-8">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                Plataforma de aprendizado
                            </p>
                            <h2 className="text-3xl font-bold leading-tight text-white">
                                Domine Laravel<br />com desafios práticos
                            </h2>
                            <p className="text-base text-zinc-400">
                                Preencha espaços em branco e escreva código real. Aprenda fazendo, não memorizando.
                            </p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3">
                            {features.map((f) => (
                                <li key={f.label} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <div>
                                        <span className="text-sm font-medium text-white">{f.label}</span>
                                        <p className="text-xs text-zinc-500">{f.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Mini challenge preview */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">Rotas</span>
                                <span className="text-xs font-semibold text-white">Rota GET</span>
                            </div>
                            <p className="mb-3 text-xs text-zinc-400">
                                Para criar uma rota que responde requisições GET, qual método você usa na facade Route?
                            </p>
                            <pre className="rounded-lg bg-black/40 px-3 py-2 font-mono text-xs">
                                <span className="text-zinc-400">Route::</span>
                                <span className="animate-pulse font-bold text-green-400">get</span>
                                <span className="text-zinc-400">('/hello', fn() =&gt; 'Hello World');</span>
                            </pre>
                        </div>
                    </blockquote>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex items-center justify-center bg-background px-6 py-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile logo */}
                    <Link href={home()} className="flex items-center justify-center gap-2 lg:hidden">
                        <AppLogoIcon className="size-8 fill-current text-foreground" />
                        <span className="text-lg font-semibold">Laravel Tasks</span>
                    </Link>

                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
