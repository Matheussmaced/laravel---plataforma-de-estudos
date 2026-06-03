import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlock {
    label: string;
    code: string;
    note?: string;
}

interface Section {
    id: string;
    title: string;
    color: string;
    blocks: CodeBlock[];
}

const sections: Section[] = [
    {
        id: 'php8',
        title: 'PHP 8 — Sintaxe Moderna',
        color: 'text-blue-500',
        blocks: [
            {
                label: 'Constructor Promotion',
                code: `class Post {
    public function __construct(
        public readonly string $title,
        public string $body,
        public ?User $author = null,
    ) {}
}`,
                note: 'Declara e atribui propriedades diretamente nos parâmetros do __construct.',
            },
            {
                label: 'Named Arguments',
                code: `// Sem named args
Post::create('Título', 'Corpo', true);

// Com named args
Post::create(
    title: 'Título',
    body: 'Corpo',
    published: true,
);`,
            },
            {
                label: 'Match Expression',
                code: `$label = match($status) {
    'draft'     => 'Rascunho',
    'published' => 'Publicado',
    'archived'  => 'Arquivado',
    default     => 'Desconhecido',
};`,
                note: 'Como switch, mas retorna valor e usa comparação estrita (===).',
            },
            {
                label: 'Nullsafe Operator (?->)',
                code: `// Sem nullsafe (verbose)
$city = $user?->address?->city;

// Com nullsafe
$name = $order?->customer?->profile?->name;`,
                note: 'Retorna null se qualquer elo da cadeia for null, sem lançar exceção.',
            },
            {
                label: 'Union Types & Enums',
                code: `// Union Types
function process(int|string $id): Post|null {}

// Enum backed (PHP 8.1)
enum Status: string {
    case Draft     = 'draft';
    case Published = 'published';
}

$s = Status::Published; // Status::Published
$s->value;              // 'published'`,
            },
            {
                label: 'Arrow Functions',
                code: `// Closure normal
$double = function ($n) { return $n * 2; };

// Arrow function (captura $outer automaticamente)
$factor = 3;
$triple = fn($n) => $n * $factor;

// Uso em Collections
$names = $users->map(fn($u) => $u->name);`,
            },
            {
                label: 'Fibers (PHP 8.1)',
                code: `$fiber = new Fiber(function () {
    $value = Fiber::suspend('primeiro');
    echo "Retomou com: $value";
});

$first = $fiber->start();   // 'primeiro'
$fiber->resume('olá');      // imprime: Retomou com: olá`,
                note: 'Corrotinas leves. Base da implementação de async no PHP.',
            },
            {
                label: 'Readonly Properties (8.1) & Classes (8.2)',
                code: `// Propriedade readonly (8.1)
class Post {
    public readonly string $slug;

    public function __construct(string $title) {
        $this->slug = str($title)->slug()->value();
    }
}

// Classe readonly (8.2) — todas as props são readonly
readonly class Point {
    public function __construct(
        public float $x,
        public float $y,
    ) {}
}`,
            },
        ],
    },
    {
        id: 'eloquent',
        title: 'Eloquent ORM',
        color: 'text-purple-500',
        blocks: [
            {
                label: 'Queries básicas',
                code: `Post::all();                          // Collection de todos
Post::find(1);                        // Por ID (ou null)
Post::findOrFail(1);                  // Por ID (ou 404)
Post::first();                        // Primeiro registro
Post::where('active', true)->get();   // Filtro
Post::where('views', '>', 100)->first();
Post::count();                        // SELECT COUNT(*)
Post::sum('views');                   // SELECT SUM(views)`,
            },
            {
                label: 'Create / Update / Delete',
                code: `// Criar
$post = Post::create(['title' => 'Olá', 'body' => '...']);

// Atualizar
$post->update(['title' => 'Novo título']);
$post->title = 'Outro'; $post->save();

// Upsert
Post::updateOrCreate(
    ['slug' => 'meu-post'],           // chave de busca
    ['title' => 'Meu Post'],          // dados
);

// Deletar
$post->delete();
Post::destroy([1, 2, 3]);            // múltiplos IDs
Post::where('old', true)->delete();  // em massa`,
            },
            {
                label: 'Relações',
                code: `// hasMany / belongsTo
public function posts(): HasMany    { return $this->hasMany(Post::class); }
public function user(): BelongsTo  { return $this->belongsTo(User::class); }

// hasOne
public function profile(): HasOne  { return $this->hasOne(Profile::class); }

// belongsToMany (M:N)
public function tags(): BelongsToMany {
    return $this->belongsToMany(Tag::class);
}

// hasManyThrough
public function comments(): HasManyThrough {
    return $this->hasManyThrough(Comment::class, Post::class);
}`,
            },
            {
                label: 'Eager Loading',
                code: `// N+1 (ruim)
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name; // query por post!
}

// Eager loading (bom)
$posts = Post::with('user')->get();
$posts = Post::with(['user', 'tags'])->get();
$posts = Post::with('user:id,name')->get(); // colunas específicas

// Eager condicional
$posts = Post::withCount('comments')->get();
// $post->comments_count disponível`,
            },
            {
                label: 'Scopes',
                code: `// Local Scope (no model)
public function scopePublished(Builder $q): Builder {
    return $q->where('published', true);
}

public function scopeByAuthor(Builder $q, User $user): Builder {
    return $q->where('user_id', $user->id);
}

// Uso
Post::published()->get();
Post::published()->byAuthor($user)->latest()->get();`,
            },
            {
                label: 'SoftDeletes',
                code: `// No model
use SoftDeletes;

// Queries
Post::all();                  // ignora deletados
Post::withTrashed()->get();   // inclui deletados
Post::onlyTrashed()->get();   // só deletados

// Restaurar
$post->restore();

// Forçar delete
$post->forceDelete();`,
            },
            {
                label: 'Accessors & Mutators (PHP 8)',
                code: `use Illuminate\Database\Eloquent\Casts\Attribute;

// Accessor + Mutator combinados
protected function fullName(): Attribute {
    return Attribute::make(
        get: fn() => "{$this->first_name} {$this->last_name}",
        set: fn($value) => [
            'first_name' => explode(' ', $value)[0],
            'last_name'  => explode(' ', $value)[1] ?? '',
        ],
    );
}

// $user->full_name  →  'João Silva'`,
            },
        ],
    },
    {
        id: 'routes',
        title: 'Rotas',
        color: 'text-blue-400',
        blocks: [
            {
                label: 'Verbos HTTP',
                code: `Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);
Route::put('/posts/{post}', [PostController::class, 'update']);
Route::patch('/posts/{post}', [PostController::class, 'update']);
Route::delete('/posts/{post}', [PostController::class, 'destroy']);

// Qualquer verbo
Route::any('/webhook', WebhookController::class);

// Vários verbos
Route::match(['get', 'post'], '/form', FormController::class);`,
            },
            {
                label: 'Resource & API Resource',
                code: `// 7 rotas: index, create, store, show, edit, update, destroy
Route::resource('posts', PostController::class);

// Somente API (sem create/edit)
Route::apiResource('posts', PostController::class);

// Parcial
Route::resource('posts', PostController::class)
    ->only(['index', 'show']);

Route::resource('posts', PostController::class)
    ->except(['destroy']);`,
            },
            {
                label: 'Grupos e Middleware',
                code: `Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class);
});

Route::prefix('admin')->middleware('admin')->group(function () {
    Route::resource('users', AdminUserController::class);
});

// Prefixo de nome
Route::name('admin.')->prefix('admin')->group(function () {
    Route::get('/stats', StatsController::class)->name('stats');
    // nome: admin.stats
});`,
            },
            {
                label: 'Route Model Binding',
                code: `// Implícito — Laravel busca Post::findOrFail($post)
Route::get('/posts/{post}', [PostController::class, 'show']);

public function show(Post $post): Response {
    return Inertia::render('Posts/Show', ['post' => $post]);
}

// Explícito — busca por campo customizado
Route::get('/posts/{post:slug}', [PostController::class, 'show']);

// Em grupos
Route::scopeBindings()->group(function () {
    Route::get('/users/{user}/posts/{post}', ...);
});`,
            },
            {
                label: 'Rotas nomeadas e URLs',
                code: `Route::get('/posts/{post}', [PostController::class, 'show'])
    ->name('posts.show');

// Gerar URL
route('posts.show', $post);           // https://...
route('posts.show', ['post' => 1]);
url('/posts/1');                      // URL absoluta
to_route('posts.show', $post);        // redirect

// Verificar rota atual (no controller/middleware)
request()->routeIs('posts.*');`,
            },
        ],
    },
    {
        id: 'validation',
        title: 'Validação',
        color: 'text-green-500',
        blocks: [
            {
                label: 'Regras mais usadas',
                code: `$request->validate([
    'name'     => 'required|string|max:255',
    'email'    => 'required|email|unique:users',
    'password' => 'required|min:8|confirmed',
    'age'      => 'nullable|integer|min:18|max:120',
    'photo'    => 'nullable|image|mimes:jpg,png|max:2048',
    'tags'     => 'array',
    'tags.*'   => 'exists:tags,id',
    'status'   => ['required', Rule::in(['draft', 'published'])],
    'slug'     => [
        'required',
        Rule::unique('posts')->ignore($post->id),
    ],
]);`,
            },
            {
                label: 'Form Request',
                code: `// php artisan make:request StorePostRequest
class StorePostRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user()->can('create', Post::class);
    }

    public function rules(): array {
        return [
            'title' => 'required|max:255',
            'body'  => 'required|min:10',
        ];
    }

    public function messages(): array {
        return [
            'title.required' => 'O título é obrigatório.',
        ];
    }
}

// No controller
public function store(StorePostRequest $request): RedirectResponse {
    Post::create($request->validated());
}`,
            },
            {
                label: 'Regra Customizada',
                code: `// php artisan make:rule Uppercase
class Uppercase implements ValidationRule {
    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail
    ): void {
        if (!ctype_upper($value)) {
            $fail('O :attribute deve estar em maiúsculas.');
        }
    }
}

// Uso
'name' => ['required', new Uppercase],`,
            },
        ],
    },
    {
        id: 'collections',
        title: 'Collections',
        color: 'text-teal-500',
        blocks: [
            {
                label: 'Transformação',
                code: `$users = collect([...]);

$users->map(fn($u) => $u->name);        // transforma cada item
$users->flatMap(fn($u) => $u->roles);   // map + flatten
$users->pluck('name');                  // extrai campo
$users->pluck('name', 'id');            // indexado por id
$users->keyBy('id');                    // array indexado`,
            },
            {
                label: 'Filtro e Busca',
                code: `$users->filter(fn($u) => $u->active);  // filtra
$users->reject(fn($u) => $u->banned);  // inverso de filter
$users->where('role', 'admin');        // por campo
$users->whereIn('role', ['admin', 'mod']);
$users->first(fn($u) => $u->age > 18);
$users->firstOrFail(fn($u) => $u->email === 'a@b.com');
$users->contains(fn($u) => $u->isPremium());`,
            },
            {
                label: 'Agrupamento e Ordenação',
                code: `$users->groupBy('role');               // agrupa por campo
$users->sortBy('name');                // ordena crescente
$users->sortByDesc('created_at');      // decrescente
$users->sortBy(fn($u) => $u->age);    // por closure
$users->unique('email');              // remove duplicatas`,
            },
            {
                label: 'Agregação',
                code: `$users->count();                       // total de itens
$users->sum('points');                 // soma de campo
$users->avg('age');                    // média
$users->min('age');                    // mínimo
$users->max('points');                 // máximo
$users->reduce(fn($carry, $u) => $carry + $u->points, 0);

// Particionar em dois grupos
[$admins, $users] = $users->partition(fn($u) => $u->isAdmin());`,
            },
            {
                label: 'Lazy Collections (memória)',
                code: `// LazyCollection — processa linha a linha sem carregar tudo
Post::query()->lazy()->each(function (Post $post) {
    // processado um por vez
    $post->regenerateSlug();
    $post->save();
});

// chunk — processa em lotes
Post::chunk(200, function ($posts) {
    foreach ($posts as $post) {
        ProcessPost::dispatch($post);
    }
});`,
            },
        ],
    },
    {
        id: 'artisan',
        title: 'Artisan',
        color: 'text-orange-500',
        blocks: [
            {
                label: 'Comandos de geração',
                code: `php artisan make:model Post -mfsc    # model + migration + factory + seeder + controller
php artisan make:controller PostController --resource
php artisan make:request StorePostRequest
php artisan make:policy PostPolicy --model=Post
php artisan make:job SendWelcomeEmail
php artisan make:event UserRegistered
php artisan make:listener SendWelcomeEmail --event=UserRegistered
php artisan make:notification WelcomeNotification
php artisan make:mail WelcomeMail
php artisan make:rule Uppercase
php artisan make:middleware EnsureIsAdmin
php artisan make:command SendReports`,
            },
            {
                label: 'Banco de dados',
                code: `php artisan migrate                  # rodar migrations pendentes
php artisan migrate:fresh            # drop + migrate (cuidado!)
php artisan migrate:fresh --seed     # + seeders
php artisan migrate:rollback         # reverter último batch
php artisan migrate:status           # ver status das migrations
php artisan db:seed                  # rodar seeders
php artisan db:seed --class=PostSeeder
php artisan tinker                   # REPL interativo`,
            },
            {
                label: 'Cache e otimização',
                code: `php artisan config:cache     # cachear configurações
php artisan config:clear
php artisan route:cache      # cachear rotas
php artisan route:clear
php artisan view:cache       # compilar Blade
php artisan view:clear
php artisan optimize         # config + route + view cache juntos
php artisan optimize:clear   # limpar todos os caches`,
            },
            {
                label: 'Filas e Schedule',
                code: `php artisan queue:work              # processar jobs
php artisan queue:work --queue=emails,default
php artisan queue:listen            # recarrega a cada job (dev)
php artisan queue:failed            # listar jobs falhos
php artisan queue:retry all         # reprocessar falhos
php artisan schedule:run            # rodar tarefas agendadas (cron: * * * * *)
php artisan schedule:list           # ver agendamentos`,
            },
        ],
    },
    {
        id: 'helpers',
        title: 'Helpers & Facades',
        color: 'text-red-500',
        blocks: [
            {
                label: 'String helpers',
                code: `use Illuminate\Support\Str;

Str::slug('Olá Mundo');             // 'ola-mundo'
Str::camel('hello_world');          // 'helloWorld'
Str::studly('hello_world');         // 'HelloWorld'
Str::snake('HelloWorld');           // 'hello_world'
Str::plural('post');                // 'posts'
Str::singular('posts');             // 'post'
Str::limit('Texto longo...', 50);   // trunca
Str::uuid();                        // UUID v4
Str::random(32);                    // string aleatória
Str::contains('hello world', 'hello');   // true
Str::startsWith('hello', 'he');          // true

// Fluent (str() helper)
str('hello world')->title()->slug()->value();`,
            },
            {
                label: 'Array helpers',
                code: `use Illuminate\Support\Arr;

Arr::get($array, 'user.name', 'default');
Arr::set($array, 'user.name', 'João');
Arr::has($array, 'user.email');
Arr::only($array, ['name', 'email']);
Arr::except($array, ['password']);
Arr::pluck($array, 'name');
Arr::flatten($multidimensional);
Arr::wrap($value);          // garante array
Arr::shuffle($array);`,
            },
            {
                label: 'Funções globais',
                code: `// Geração de URLs
route('posts.show', $post);   // URL de rota nomeada
url('/posts/1');              // URL absoluta
asset('css/app.css');         // URL de asset

// Redirecionamentos
redirect()->route('home');
redirect()->back();
redirect()->back()->withErrors($validator);
redirect()->back()->with('status', 'Salvo!');

// Responses
response()->json($data);
response()->json($data, 201);
response()->download($path);
response()->noContent();

// Outros
config('app.name');
env('APP_ENV', 'production');
now();                        // Carbon::now()
today();                      // Carbon::today()
abort(404);
abort_if($condition, 403);
abort_unless($condition, 404);
logger()->info('mensagem');`,
            },
            {
                label: 'Cache Facade',
                code: `Cache::put('key', $value, 3600);        // por segundos
Cache::put('key', $value, now()->addHour());

Cache::get('key');
Cache::get('key', 'default');

Cache::remember('key', 3600, fn() => DB::...);
Cache::rememberForever('key', fn() => [...]);

Cache::forget('key');
Cache::flush();                         // limpar tudo

Cache::has('key');
Cache::increment('visits');
Cache::decrement('stock', 5);`,
            },
            {
                label: 'Carbon (datas)',
                code: `use Carbon\Carbon;

$now = Carbon::now();
$now->format('d/m/Y H:i');             // '03/06/2026 14:30'
$now->addDays(7);
$now->subMonths(1);
$now->startOfWeek();
$now->diffForHumans();                  // '5 minutos atrás'

Carbon::parse('2026-01-15');
Carbon::createFromFormat('d/m/Y', '15/01/2026');

$now->isWeekend();
$now->isFuture();
$now->isPast();`,
            },
            {
                label: 'Event & Queue',
                code: `// Disparar evento
UserRegistered::dispatch($user);
event(new UserRegistered($user));

// Disparar job
SendWelcomeEmail::dispatch($user);
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(10));
SendWelcomeEmail::dispatch($user)->onQueue('emails');

// Disparar notificação
$user->notify(new WelcomeNotification());
Notification::send($users, new NewsletterNotification());`,
            },
        ],
    },
    {
        id: 'inertia',
        title: 'Inertia + Laravel',
        color: 'text-indigo-500',
        blocks: [
            {
                label: 'Render e Props',
                code: `// Controller
use Inertia\Inertia;
use Inertia\Response;

public function index(): Response {
    return Inertia::render('Posts/Index', [
        'posts'  => PostResource::collection(Post::paginate()),
        'filter' => request('filter'),
    ]);
}

// Props lazy (carregadas sob demanda)
return Inertia::render('Dashboard', [
    'stats' => Inertia::defer(fn() => Stats::heavy()),
]);

// Props opcionais (só quando pedidas)
'user' => Inertia::optional(fn() => auth()->user()),`,
            },
            {
                label: 'Shared Data',
                code: `// Em HandleInertiaRequests::share()
return array_merge(parent::share($request), [
    'auth' => [
        'user' => $request->user(),
    ],
    'flash' => [
        'message' => fn() => $request->session()->get('message'),
    ],
]);

// No componente React
const { auth, flash } = usePage().props;`,
            },
            {
                label: 'Navegação no React',
                code: `import { Link, router } from '@inertiajs/react';

// Link
<Link href="/posts">Posts</Link>
<Link href="/logout" method="post" as="button">Sair</Link>
<Link href="/posts" prefetch>Posts (prefetch)</Link>

// Programático
router.visit('/posts');
router.post('/posts', data);
router.delete(\`/posts/\${id}\`);

// Preservar estado/scroll
router.post('/posts', data, {
    preserveState: true,
    preserveScroll: true,
});`,
            },
            {
                label: 'Formulários',
                code: `import { Form } from '@inertiajs/react';

<Form action="/posts" method="post">
    {({ errors, processing, wasSuccessful }) => (
        <>
            <input name="title" />
            {errors.title && <p>{errors.title}</p>}

            <button disabled={processing}>
                {processing ? 'Salvando...' : 'Salvar'}
            </button>

            {wasSuccessful && <p>Salvo!</p>}
        </>
    )}
</Form>`,
            },
        ],
    },
    {
        id: 'testing',
        title: 'Testes com Pest',
        color: 'text-lime-500',
        blocks: [
            {
                label: 'Estrutura de um teste',
                code: `it('usuario pode criar post', function () {
    // Arrange
    $user = User::factory()->create();
    $data = ['title' => 'Meu Post', 'body' => 'Conteúdo'];

    // Act
    $response = actingAs($user)->post('/posts', $data);

    // Assert
    $response->assertRedirect();
    assertDatabaseHas('posts', ['title' => 'Meu Post']);
});`,
            },
            {
                label: 'Assertions HTTP',
                code: `$response->assertOk();              // 200
$response->assertCreated();          // 201
$response->assertNoContent();        // 204
$response->assertRedirect('/home');  // 302
$response->assertForbidden();        // 403
$response->assertNotFound();         // 404
$response->assertUnprocessable();    // 422

$response->assertJson(['key' => 'value']);
$response->assertJsonStructure(['data' => ['*' => ['id', 'name']]]);
$response->assertInertia(fn ($page) =>
    $page->component('Posts/Index')
         ->has('posts.data', 5)
);`,
            },
            {
                label: 'Assertions de banco',
                code: `assertDatabaseHas('posts', ['title' => 'Teste']);
assertDatabaseMissing('posts', ['id' => $id]);
assertDatabaseCount('posts', 3);
assertSoftDeleted('posts', ['id' => $id]);
assertModelExists($post);
assertModelMissing($post);`,
            },
            {
                label: 'Fakes',
                code: `// No início do teste
Event::fake();
Mail::fake();
Queue::fake();
Notification::fake();
Http::fake();
Storage::fake('s3');

// Verificações após a ação
Event::assertDispatched(UserRegistered::class);
Mail::assertSent(WelcomeMail::class);
Queue::assertPushed(SendReport::class);
Notification::assertSentTo($user, WelcomeNotification::class);
Http::assertSent(fn($req) => $req->url() === 'https://api.example.com');`,
            },
            {
                label: 'Datasets e beforeEach',
                code: `// beforeEach (roda antes de cada teste do arquivo)
beforeEach(function () {
    $this->user = User::factory()->create();
});

// Dataset (roda o teste com múltiplos inputs)
it('valida o campo email', function (string $email) {
    actingAs($this->user)
        ->post('/profile', ['email' => $email])
        ->assertUnprocessable();
})->with([
    'email inválido' => ['nao-e-email'],
    'email vazio'    => [''],
    'muito longo'    => [str_repeat('a', 300)],
]);`,
            },
        ],
    },
];

function CodeSnippet({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="group relative overflow-hidden rounded-lg border border-zinc-700 bg-[#1e1e1e]">
            <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    <span className="ml-1.5 font-mono text-xs text-zinc-500">PHP</span>
                </div>
                <button
                    onClick={copy}
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    {copied ? 'copiado!' : 'copiar'}
                </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-zinc-200">
                {code}
            </pre>
        </div>
    );
}

export default function Reference() {
    const [activeSection, setActiveSection] = useState(sections[0].id);
    const [search, setSearch] = useState('');

    const currentSection = sections.find((s) => s.id === activeSection) ?? sections[0];

    const filteredBlocks = search.trim()
        ? currentSection.blocks.filter(
              (b) =>
                  b.label.toLowerCase().includes(search.toLowerCase()) ||
                  b.code.toLowerCase().includes(search.toLowerCase()) ||
                  (b.note ?? '').toLowerCase().includes(search.toLowerCase()),
          )
        : currentSection.blocks;

    return (
        <>
            <Head title="Referência PHP & Laravel" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
                                    Laravel Tasks
                                </p>
                                <h1 className="text-2xl font-bold text-foreground">Referência Rápida</h1>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar nesta seção..."
                                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile section selector */}
                <div className="border-b border-border md:hidden">
                    <div className="flex overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => { setActiveSection(s.id); setSearch(''); }}
                                className={cn(
                                    'mr-2 shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                                    activeSection === s.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {s.title.split(' — ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="flex gap-8">
                        {/* Sidebar (desktop) */}
                        <aside className="hidden w-52 shrink-0 md:block">
                            <div className="sticky top-6 space-y-0.5">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Seções
                                </p>
                                {sections.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setActiveSection(s.id); setSearch(''); }}
                                        className={cn(
                                            'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                                            activeSection === s.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <span className={cn('mr-2 text-xs', s.color)}>●</span>
                                        {s.title.split(' — ')[0]}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <h2 className="mb-6 text-xl font-bold text-foreground">
                                {currentSection.title}
                            </h2>

                            {filteredBlocks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nenhum resultado para "{search}".
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {filteredBlocks.map((block) => (
                                        <div key={block.label}>
                                            <p className="mb-2 text-sm font-semibold text-foreground">
                                                {block.label}
                                            </p>
                                            <CodeSnippet code={block.code} />
                                            {block.note && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {block.note}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
