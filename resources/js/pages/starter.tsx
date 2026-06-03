import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LightbulbIcon } from 'lucide-react';

interface Section {
    id: string;
    title: string;
    subtitle: string;
    blocks: Block[];
}

type Block =
    | { type: 'text'; value: string }
    | { type: 'code'; lang: string; label?: string; value: string }
    | { type: 'command'; value: string }
    | { type: 'tip'; value: string }
    | { type: 'warning'; value: string }
    | { type: 'diagram'; value: string };

const sections: Section[] = [
    {
        id: 'stack',
        title: 'O Stack',
        subtitle: 'Laravel + Inertia.js + React',
        blocks: [
            {
                type: 'text',
                value: 'Este projeto usa três camadas que trabalham juntas: Laravel no servidor, Inertia.js como ponte, e React no cliente. Você escreve controllers PHP normais e componentes React normais — o Inertia conecta os dois sem precisar de uma API REST separada.',
            },
            {
                type: 'diagram',
                value: `┌─────────────────────────────────────────────────────────┐
│                      NAVEGADOR                           │
│                                                          │
│   React Component  ←──── props ────  Inertia Client     │
│   (resources/js/pages/*.tsx)                             │
└──────────────────────────────┬──────────────────────────┘
                               │  HTTP (JSON ou HTML)
                               ▼
┌─────────────────────────────────────────────────────────┐
│                       SERVIDOR                           │
│                                                          │
│   routes/web.php → Controller → Inertia::render()       │
│                                 ↑ passa props (array PHP)│
└─────────────────────────────────────────────────────────┘`,
            },
            {
                type: 'tip',
                value: 'Não existe uma API REST entre o React e o Laravel. O Inertia usa um protocolo próprio: na primeira visita entrega HTML completo; nas navegações seguintes entrega JSON com o nome do componente e as props.',
            },
        ],
    },
    {
        id: 'protocol',
        title: 'Protocolo Inertia',
        subtitle: 'Como o servidor e o cliente se comunicam',
        blocks: [
            {
                type: 'text',
                value: '1ª visita (acesso direto pela URL): o servidor retorna HTML completo com o JavaScript embutido. O React monta o componente com as props recebidas.',
            },
            {
                type: 'code',
                lang: 'html',
                label: 'HTML retornado na 1ª visita',
                value: `<!-- O servidor entrega um <div> com os dados embutidos -->
<div id="app"
     data-page='{
       "component": "learn",
       "props": { "completedIds": [1, 3, 5] },
       "url": "/learn",
       "version": "abc123"
     }'>
</div>

<!-- O JavaScript React monta o componente "learn" com essas props -->`,
            },
            {
                type: 'text',
                value: 'Navegações seguintes (via <Link> ou router.visit()): o Inertia intercepta o clique, faz um fetch com header X-Inertia: true, e o servidor retorna só JSON.',
            },
            {
                type: 'code',
                lang: 'json',
                label: 'JSON retornado nas navegações internas',
                value: `{
  "component": "learn",
  "props": {
    "completedIds": [1, 3, 5],
    "auth": { "user": { "name": "João" } }
  },
  "url": "/learn",
  "version": "abc123"
}`,
            },
            {
                type: 'tip',
                value: 'É por isso que o app se comporta como SPA (sem reload de página) mas você escreve código de servidor tradicional. O Inertia cuida da troca de componentes no cliente.',
            },
        ],
    },
    {
        id: 'routes',
        title: 'Declarar Rotas',
        subtitle: 'routes/web.php — o ponto de entrada',
        blocks: [
            {
                type: 'text',
                value: 'Todas as rotas ficam em routes/web.php. Existem duas formas principais: Route::inertia() para páginas estáticas (sem dados do servidor), e Route::get() com um controller para páginas que precisam de dados.',
            },
            {
                type: 'code',
                lang: 'php',
                label: 'routes/web.php',
                value: `<?php

use App\\Http\\Controllers\\PostController;
use Illuminate\\Support\\Facades\\Route;

// Forma 1 — página estática (sem controller)
// Renderiza resources/js/pages/welcome.tsx sem props
Route::inertia('/', 'welcome')->name('home');

// Forma 2 — com controller (tem dados do banco)
// Chama PostController::index() que retorna Inertia::render()
Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

// Proteger com middleware
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});`,
            },
            {
                type: 'tip',
                value: 'O nome da página no Route::inertia() ou no Inertia::render() é o caminho do arquivo dentro de resources/js/pages/, sem a extensão. Ex: "posts/show" → resources/js/pages/posts/show.tsx',
            },
        ],
    },
    {
        id: 'get',
        title: 'Carregar uma Página (GET)',
        subtitle: 'Controller → props → componente React',
        blocks: [
            {
                type: 'text',
                value: 'O fluxo completo de um GET: a rota aponta para um controller, o controller busca dados e chama Inertia::render() passando as props, e o React recebe essas props como parâmetros do componente.',
            },
            {
                type: 'code',
                lang: 'php',
                label: '1. app/Http/Controllers/PostController.php',
                value: `<?php

namespace App\\Http\\Controllers;

use App\\Http\\Resources\\PostResource;
use App\\Models\\Post;
use Inertia\\Inertia;
use Inertia\\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        // Busca dados normalmente com Eloquent
        $posts = Post::with('user')->latest()->paginate(10);

        // Renderiza o componente React e passa os dados como props
        return Inertia::render('posts/index', [
            'posts' => PostResource::collection($posts),
        ]);
    }

    public function show(Post $post): Response
    {
        return Inertia::render('posts/show', [
            'post' => new PostResource($post->load('user')),
        ]);
    }
}`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: '2. resources/js/pages/posts/index.tsx (recebe as props)',
                value: `import { Head, Link } from '@inertiajs/react';

// Tipagem das props (o que o PHP passou)
interface Post {
    id: number;
    title: string;
    body: string;
}

interface Props {
    posts: {
        data: Post[];
        meta: { current_page: number; last_page: number };
    };
}

// As props chegam como parâmetros do componente
export default function PostsIndex({ posts }: Props) {
    return (
        <>
            <Head title="Posts" />
            <div>
                {posts.data.map(post => (
                    <div key={post.id}>
                        <h2>{post.title}</h2>
                        {/* Link Inertia — não recarrega a página */}
                        <Link href={\`/posts/\${post.id}\`}>Ver post</Link>
                    </div>
                ))}
            </div>
        </>
    );
}`,
            },
            {
                type: 'tip',
                value: 'Quando você usa Eloquent Resources (PostResource), o Laravel serializa o model para array automaticamente antes de enviar ao Inertia. Paginação também é serializada com data, links e meta.',
            },
        ],
    },
    {
        id: 'navigation',
        title: 'Navegação no Cliente',
        subtitle: '<Link>, router.visit() e prefetch',
        blocks: [
            {
                type: 'text',
                value: 'Use sempre o <Link> do Inertia em vez de <a href>. O <Link> intercepta o clique, faz o request via Inertia (sem reload) e troca o componente no cliente.',
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Navegação declarativa com <Link>',
                value: `import { Link } from '@inertiajs/react';
import { posts } from '@/routes'; // Wayfinder — URL tipada

// Link simples
<Link href="/posts">Ver posts</Link>

// Usando Wayfinder (URL gerada pelo PHP, com segurança de tipo)
<Link href={posts.index()}>Ver posts</Link>

// Prefetch — pré-carrega ao passar o mouse
<Link href={posts.index()} prefetch>Ver posts</Link>

// Link que faz POST (ex: logout)
<Link href="/logout" method="post" as="button">
    Sair
</Link>`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Navegação programática com router',
                value: `import { router } from '@inertiajs/react';
import { posts } from '@/routes';

// Navegar para uma página
function handleClick() {
    router.visit(posts.index());
}

// Navegar preservando scroll e estado
router.visit(posts.index(), {
    preserveScroll: true,
    preserveState: true,
});

// Navegar após um evento (ex: salvar e ir para a lista)
router.visit(posts.index(), {
    onSuccess: () => console.log('Navegou!'),
});`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Wayfinder — rotas tipadas no React',
                value: `// Wayfinder gera funções TypeScript a partir das rotas PHP.
// Importe de @/routes (rotas nomeadas) ou @/actions (controllers).

import { learn, reference } from '@/routes';
import PostController from '@/actions/App/Http/Controllers/PostController';

// Rotas nomeadas
<Link href={learn()}>Aprender</Link>
<Link href={reference()}>Referência</Link>

// Controller actions (com parâmetros)
<Link href={PostController.show.url({ post: post.id })}>Ver post</Link>

// POST com parâmetros via actions
router.post(PostController.store.url(), formData);`,
            },
        ],
    },
    {
        id: 'forms',
        title: 'Formulário POST',
        subtitle: 'Enviar dados, validar e redirecionar',
        blocks: [
            {
                type: 'text',
                value: 'O componente <Form> do Inertia v3 é a forma mais simples de enviar dados. Ele gerencia o estado de loading, erros de validação e sucesso automaticamente.',
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Formulário com o componente <Form> (Inertia v3)',
                value: `import { Form } from '@inertiajs/react';
import { store } from '@/routes/posts'; // Wayfinder

export default function CreatePost() {
    return (
        <Form
            {...store.form()}   // action="/posts" method="post"
            resetOnSuccess      // limpa os campos após salvar
        >
            {({ errors, processing, wasSuccessful }) => (
                <>
                    <div>
                        <label>Título</label>
                        <input name="title" type="text" />
                        {errors.title && (
                            <p className="text-red-500">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label>Conteúdo</label>
                        <textarea name="body" />
                        {errors.body && (
                            <p className="text-red-500">{errors.body}</p>
                        )}
                    </div>

                    <button type="submit" disabled={processing}>
                        {processing ? 'Salvando...' : 'Publicar'}
                    </button>

                    {wasSuccessful && <p>Post criado!</p>}
                </>
            )}
        </Form>
    );
}`,
            },
            {
                type: 'code',
                lang: 'php',
                label: 'Controller que recebe o POST (app/Http/Controllers/PostController.php)',
                value: `public function store(Request $request): RedirectResponse
{
    // 1. Validar
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'body'  => ['required', 'string', 'min:10'],
    ]);

    // 2. Criar
    $post = $request->user()->posts()->create($validated);

    // 3. Redirecionar (o Inertia faz a navegação no cliente)
    return redirect()
        ->route('posts.show', $post)
        ->with('message', 'Post criado com sucesso!');
}`,
            },
            {
                type: 'tip',
                value: 'Quando a validação falha, o Laravel redireciona de volta automaticamente com os erros. O Inertia detecta isso e popula o objeto errors no componente — sem nenhum código extra.',
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Alternativa: useForm para controle total',
                value: `import { useForm } from '@inertiajs/react';
import { store } from '@/routes/posts';

export default function CreatePost() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        body: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(store(), {           // store() retorna '/posts'
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit}>
            <input
                value={data.title}
                onChange={e => setData('title', e.target.value)}
            />
            {errors.title && <p>{errors.title}</p>}

            <button disabled={processing}>Publicar</button>
        </form>
    );
}`,
            },
        ],
    },
    {
        id: 'shared',
        title: 'Dados Compartilhados',
        subtitle: 'Props disponíveis em todos os componentes',
        blocks: [
            {
                type: 'text',
                value: 'Dados que precisam estar em todas as páginas (usuário autenticado, flash messages, configurações) são definidos uma vez no HandleInertiaRequests middleware e ficam disponíveis via usePage().',
            },
            {
                type: 'code',
                lang: 'php',
                label: 'app/Http/Middleware/HandleInertiaRequests.php',
                value: `<?php

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // Usuário autenticado — disponível em TODOS os componentes
            'auth' => [
                'user' => $request->user(),
            ],

            // Flash messages do redirect()->with()
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'error'   => fn() => $request->session()->get('error'),
            ],

            // Qualquer outro dado global
            'appName' => config('app.name'),
        ]);
    }
}`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Consumindo shared data no React (usePage)',
                value: `import { usePage } from '@inertiajs/react';

// Tipagem das props compartilhadas
interface SharedProps {
    auth: { user: { name: string; email: string } | null };
    flash: { message?: string; error?: string };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const { auth, flash } = usePage<SharedProps>().props;

    return (
        <div>
            {/* Exibir flash message */}
            {flash.message && (
                <div className="bg-green-100 p-3">{flash.message}</div>
            )}

            {/* Usuário autenticado */}
            {auth.user && (
                <p>Olá, {auth.user.name}</p>
            )}

            {children}
        </div>
    );
}`,
            },
            {
                type: 'tip',
                value: 'Use fn() => no share() para dados que devem ser avaliados por request (lazy), não na hora em que o middleware é instanciado. Isso evita queries desnecessárias em requests parciais do Inertia.',
            },
        ],
    },
    {
        id: 'middleware',
        title: 'Autenticação e Middleware',
        subtitle: 'Proteger rotas e redirecionar',
        blocks: [
            {
                type: 'text',
                value: 'O middleware auth redireciona usuários não autenticados para /login automaticamente. O Fortify (instalado neste projeto) gerencia login, registro e verificação de email.',
            },
            {
                type: 'code',
                lang: 'php',
                label: 'Protegendo rotas em web.php',
                value: `// Requer login
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// Requer login E email verificado
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/learn', [LearnController::class, 'index'])->name('learn');
});

// Redirecionar usuário já logado (ex: não mostrar login se já autenticado)
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
});`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Verificar autenticação no React',
                value: `import { usePage, Link } from '@inertiajs/react';
import { login, learn } from '@/routes';

export default function Nav() {
    const { auth } = usePage<{ auth: { user: any } }>().props;

    return (
        <nav>
            {auth.user ? (
                // Usuário logado
                <>
                    <span>Olá, {auth.user.name}</span>
                    <Link href={learn()}>Aprender</Link>
                    <Link href="/logout" method="post" as="button">
                        Sair
                    </Link>
                </>
            ) : (
                // Usuário não logado
                <Link href={login()}>Entrar</Link>
            )}
        </nav>
    );
}`,
            },
            {
                type: 'code',
                lang: 'php',
                label: 'Middleware customizado',
                value: `// php artisan make:middleware EnsureIsAdmin

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->is_admin) {
            // Redireciona com mensagem de erro
            return redirect()->route('home')
                ->with('error', 'Acesso restrito a administradores.');
        }

        return $next($request);
    }
}

// Registrar e usar em web.php
Route::middleware(['auth', EnsureIsAdmin::class])->group(function () {
    Route::get('/admin', AdminController::class);
});`,
            },
        ],
    },
    {
        id: 'layout',
        title: 'Layouts',
        subtitle: 'Reusar estrutura entre páginas',
        blocks: [
            {
                type: 'text',
                value: 'Layouts são componentes React que envolvem as páginas. Neste projeto o AppLayout usa um sidebar; o AuthLayout usa um painel dividido. Defina o layout via propriedade estática no componente de página.',
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Usando AppLayout (com sidebar)',
                value: `import AppLayout from '@/layouts/app-layout';

// O componente de página define qual layout usar
// via a propriedade estática .layout
function PostsIndex({ posts }) {
    return <div>...</div>;
}

// Define o layout para esta página
PostsIndex.layout = (page: React.ReactNode) => (
    <AppLayout>{page}</AppLayout>
);

export default PostsIndex;`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: 'Alternativa: layout via propriedade objeto (auth pages)',
                value: `// Para páginas de auth, o layout recebe title e description
export default function Login() {
    return <Form ...>...</Form>;
}

// O Inertia usa esse objeto para passar props ao layout
Login.layout = {
    title: 'Bem-vindo de volta',
    description: 'Digite seu e-mail e senha para continuar',
};`,
            },
            {
                type: 'tip',
                value: 'Os layouts persistem entre navegações — apenas o conteúdo da página é trocado. Isso evita re-renderizar o sidebar, header, etc. a cada troca de página.',
            },
        ],
    },
    {
        id: 'fullcycle',
        title: 'Ciclo Completo',
        subtitle: 'Exemplo real ponta a ponta',
        blocks: [
            {
                type: 'text',
                value: 'Vamos traçar o caminho completo de uma funcionalidade: o usuário acessa /posts, clica em "Criar post", preenche o formulário e é redirecionado para o post criado.',
            },
            {
                type: 'code',
                lang: 'php',
                label: '1. routes/web.php — declarar as rotas',
                value: `Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
});`,
            },
            {
                type: 'code',
                lang: 'php',
                label: '2. PostController.php — controller',
                value: `class PostController extends Controller
{
    // GET /posts — lista os posts
    public function index(): Response
    {
        return Inertia::render('posts/index', [
            'posts' => Post::latest()->paginate(10),
        ]);
    }

    // GET /posts/create — exibe o formulário
    public function create(): Response
    {
        return Inertia::render('posts/create');
    }

    // POST /posts — processa o formulário
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'body'  => 'required',
        ]);

        $post = $request->user()->posts()->create($validated);

        return redirect()
            ->route('posts.show', $post)
            ->with('message', 'Post publicado!');
    }

    // GET /posts/{post} — exibe o post
    public function show(Post $post): Response
    {
        return Inertia::render('posts/show', [
            'post' => $post->load('user'),
        ]);
    }
}`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: '3. resources/js/pages/posts/create.tsx — formulário',
                value: `import { Form, Head, Link } from '@inertiajs/react';
import { store } from '@/routes/posts'; // Wayfinder

export default function PostCreate() {
    return (
        <>
            <Head title="Criar Post" />
            <Form {...store.form()} resetOnSuccess>
                {({ errors, processing }) => (
                    <div className="space-y-4">
                        <div>
                            <label>Título</label>
                            <input name="title" className="w-full border p-2" />
                            {errors.title && <p className="text-red-500">{errors.title}</p>}
                        </div>

                        <div>
                            <label>Conteúdo</label>
                            <textarea name="body" rows={6} className="w-full border p-2" />
                            {errors.body && <p className="text-red-500">{errors.body}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-primary px-4 py-2 text-primary-foreground"
                        >
                            {processing ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                )}
            </Form>
        </>
    );
}`,
            },
            {
                type: 'code',
                lang: 'tsx',
                label: '4. resources/js/pages/posts/show.tsx — exibe o post',
                value: `import { Head, usePage } from '@inertiajs/react';

interface Post { id: number; title: string; body: string; }

export default function PostShow({ post }: { post: Post }) {
    // Lê a flash message do shared data
    const { flash } = usePage<{ flash: { message?: string } }>().props;

    return (
        <>
            <Head title={post.title} />

            {/* Flash message do redirect()->with() */}
            {flash.message && (
                <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
                    {flash.message}
                </div>
            )}

            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="mt-4">{post.body}</p>
        </>
    );
}`,
            },
            {
                type: 'diagram',
                value: `Fluxo completo:

  Usuário clica "Criar post"
        │
        ▼
  <Link href={posts.create()}>  →  GET /posts/create
        │                               │
        │                         PostController::create()
        │                               │
        │                         Inertia::render('posts/create')
        │                               │
        ◄──────── JSON { component, props } ────────────
        │
  React monta <PostCreate />
        │
  Usuário preenche e clica "Publicar"
        │
  <Form {...store.form()}>  →  POST /posts  (+ CSRF automático)
        │                               │
        │                    Validação (falha → volta com errors)
        │                    Post::create($validated)
        │                    redirect()->route('posts.show', $post)
        │                               │
        ◄──────── 302 Location: /posts/1 ───────────────
        │
  Inertia faz GET /posts/1  →  PostController::show()
        │                               │
        ◄──────── JSON { component: 'posts/show', props } ──
        │
  React monta <PostShow /> com flash.message = 'Post publicado!'`,
            },
        ],
    },
];

function CodeBlock({ value, label }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }
    return (
        <div className="overflow-hidden rounded-lg border border-zinc-700 bg-[#1e1e1e]">
            <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 px-3 py-1.5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-zinc-600" />
                        <span className="h-2 w-2 rounded-full bg-zinc-600" />
                        <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    </div>
                    {label && <span className="font-mono text-xs text-zinc-400">{label}</span>}
                </div>
                <button onClick={copy} className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                    {copied ? 'copiado!' : 'copiar'}
                </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-zinc-200">{value}</pre>
        </div>
    );
}

export default function Starter() {
    const [activeId, setActiveId] = useState(sections[0].id);

    const current = sections.find((s) => s.id === activeId) ?? sections[0];
    const currentIdx = sections.findIndex((s) => s.id === activeId);

    function goNext() { if (currentIdx < sections.length - 1) setActiveId(sections[currentIdx + 1].id); }
    function goPrev() { if (currentIdx > 0) setActiveId(sections[currentIdx - 1].id); }

    return (
        <>
            <Head title="Como funciona o Starter Kit" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary">Laravel Tasks</p>
                        <h1 className="text-2xl font-bold text-foreground">Como funciona o Starter Kit</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Laravel + Inertia.js + React — rotas, controllers, formulários e navegação
                        </p>
                    </div>
                </div>

                {/* Mobile pills */}
                <div className="border-b border-border md:hidden">
                    <div className="flex overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveId(s.id)}
                                className={cn(
                                    'mr-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                                    activeId === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layout */}
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="flex gap-8">
                        {/* Sidebar desktop */}
                        <aside className="hidden w-52 shrink-0 md:block">
                            <div className="sticky top-6">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Seções</p>
                                <nav className="space-y-0.5">
                                    {sections.map((s, i) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveId(s.id)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
                                                activeId === s.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <span className={cn(
                                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                                activeId === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                            )}>
                                                {i + 1}
                                            </span>
                                            <span className="text-sm font-medium leading-tight">{s.title}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">{current.subtitle}</p>
                            </div>

                            <div className="space-y-5">
                                {current.blocks.map((block, i) => {
                                    if (block.type === 'code') {
                                        return (
                                            <div key={i}>
                                                {block.label && (
                                                    <p className="mb-2 text-sm font-semibold text-foreground">{block.label}</p>
                                                )}
                                                <CodeBlock value={block.value} label={block.label} />
                                            </div>
                                        );
                                    }

                                    if (block.type === 'command') {
                                        return (
                                            <div key={i} className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
                                                <pre className="font-mono text-sm text-green-400">{block.value}</pre>
                                            </div>
                                        );
                                    }

                                    if (block.type === 'diagram') {
                                        return (
                                            <div key={i} className="overflow-x-auto rounded-lg border border-border bg-muted/50 px-4 py-3">
                                                <pre className="font-mono text-xs leading-relaxed text-muted-foreground">{block.value}</pre>
                                            </div>
                                        );
                                    }

                                    if (block.type === 'tip') {
                                        return (
                                            <div key={i} className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-900/20">
                                                <span className="mt-0.5 shrink-0 text-blue-500">
                                                    <LightbulbIcon className="h-4 w-4" />
                                                </span>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">{block.value}</p>
                                            </div>
                                        );
                                    }

                                    if (block.type === 'warning') {
                                        return (
                                            <div key={i} className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800/50 dark:bg-yellow-900/20">
                                                <span className="mt-0.5 shrink-0">⚠️</span>
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">{block.value}</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                                            {block.value}
                                        </p>
                                    );
                                })}
                            </div>

                            {/* Prev / Next */}
                            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIdx === 0}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors',
                                        currentIdx === 0 ? 'cursor-not-allowed opacity-30' : 'text-foreground hover:bg-muted',
                                    )}
                                >
                                    ← {currentIdx > 0 ? sections[currentIdx - 1].title : ''}
                                </button>
                                <span className="text-xs text-muted-foreground">{currentIdx + 1} / {sections.length}</span>
                                <button
                                    onClick={goNext}
                                    disabled={currentIdx === sections.length - 1}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90',
                                        currentIdx === sections.length - 1 && 'cursor-not-allowed opacity-30',
                                    )}
                                >
                                    {currentIdx < sections.length - 1 ? sections[currentIdx + 1].title : ''} →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
