import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { learn, login, register } from '@/routes';

interface AuthUser {
    name: string;
    email: string;
}

const levels = [
    {
        number: 1,
        name: 'Fundamentos',
        count: 10,
        color: 'border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/10',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        topics: ['Rotas GET/POST', 'Eloquent ORM', 'Validação', 'Artisan CLI', 'Helpers'],
    },
    {
        number: 2,
        name: 'Intermediário',
        count: 15,
        color: 'border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-900/10',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        topics: ['Eager Loading', 'Resource Routes', 'Form Requests', 'Cache', 'Collections'],
    },
    {
        number: 3,
        name: 'Avançado',
        count: 10,
        color: 'border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-900/10',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        topics: ['Controllers completos', 'Migrations', 'Policies', 'Jobs', 'API Resources'],
    },
];

const stats = [
    { value: '35', label: 'Desafios' },
    { value: '3', label: 'Níveis' },
    { value: '10+', label: 'Tópicos' },
    { value: '100%', label: 'Gratuito' },
];

export default function Welcome() {
    const { auth } = usePage().props as { auth: { user: AuthUser | null } };

    return (
        <>
            <Head title="Laravel Tasks — Aprenda Laravel na Prática" />
            <div className="min-h-screen bg-background text-foreground">

                {/* Nav */}
                <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <AppLogoIcon className="size-7 fill-current text-foreground" />
                            <span className="font-bold text-foreground">Laravel Tasks</span>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <>
                                    <span className="hidden text-sm text-muted-foreground sm:block">
                                        Olá, {auth.user.name.split(' ')[0]}
                                    </span>
                                    <Link
                                        href={learn()}
                                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Continuar aprendendo
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Criar conta grátis
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="mx-auto max-w-5xl px-6 py-20 text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        35 desafios · 3 níveis · progresso salvo no banco
                    </div>
                    <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
                        Domine Laravel<br />
                        <span className="text-muted-foreground">na prática</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                        Preencha espaços em branco e escreva código real. Do básico ao avançado — aprenda Laravel fazendo, não apenas lendo.
                    </p>
                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        {auth.user ? (
                            <Link
                                href={learn()}
                                className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Continuar os desafios
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Começar grátis
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
                                >
                                    Já tenho conta
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {stats.map((s) => (
                            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Levels */}
                <section className="border-t border-border bg-card/50">
                    <div className="mx-auto max-w-5xl px-6 py-16">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-foreground">Trilha de aprendizado</h2>
                            <p className="mt-2 text-muted-foreground">
                                Desbloqueie o próximo nível conforme você avança
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {levels.map((level) => (
                                <div
                                    key={level.number}
                                    className={`rounded-2xl border p-6 ${level.color}`}
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${level.badge}`}>
                                            Nível {level.number}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{level.count} desafios</span>
                                    </div>
                                    <h3 className="mb-4 text-lg font-bold text-foreground">{level.name}</h3>
                                    <ul className="space-y-2">
                                        {level.topics.map((topic) => (
                                            <li key={topic} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Challenge preview */}
                <section className="mx-auto max-w-5xl px-6 py-16">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-foreground">Como funciona</h2>
                        <p className="mt-2 text-muted-foreground">
                            Cada desafio testa um conceito real do Laravel
                        </p>
                    </div>
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        Eloquent
                                    </span>
                                    <h3 className="mt-2 font-semibold text-foreground">Relação um-para-muitos</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Um User pode ter muitos Posts. Qual método Eloquent define essa relação no model User?
                                    </p>
                                </div>
                                <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                    <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            </div>
                            <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 font-mono text-sm leading-relaxed">
                                <span className="text-zinc-400">{'public function posts(): HasMany\n{\n    return $this->'}</span>
                                <span className="font-bold text-green-400">hasMany</span>
                                <span className="text-zinc-400">{'(Post::class);\n}'}</span>
                            </pre>
                            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200">
                                hasMany() define que um User possui múltiplos Posts. O Eloquent usa automaticamente user_id na tabela posts para fazer a ligação.
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {!auth.user && (
                    <section className="border-t border-border bg-card/50">
                        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
                            <h2 className="text-2xl font-bold text-foreground">Pronto para começar?</h2>
                            <p className="mt-2 text-muted-foreground">Crie sua conta gratuitamente e comece a aprender Laravel agora.</p>
                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                                <Link
                                    href={register()}
                                    className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Criar conta grátis
                                </Link>
                                <Link
                                    href={login()}
                                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                >
                                    Já tenho conta
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t border-border">
                    <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AppLogoIcon className="size-4 fill-current" />
                            <span>Laravel Tasks</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Aprenda Laravel com desafios práticos</p>
                    </div>
                </footer>

            </div>
        </>
    );
}
