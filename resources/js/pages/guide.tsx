import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';
import { WarningProvider } from '@radix-ui/react-dialog';

interface Step {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    content: StepContent[];
}

interface StepContent {
    type: 'text' | 'code' | 'command' | 'tip' | 'warning';
    label?: string;
    value: string;
}

const steps: Step[] = [
    {
        id: 'overview',
        number: 0,
        title: 'Visão Geral',
        subtitle: 'O que vamos construir',
        content: [
            {
                type: 'text',
                value:
                    'Neste guia vamos construir uma API REST completa de Posts com autenticação via Sanctum. Ao final, teremos endpoints para listar, criar, exibir, atualizar e deletar posts — tudo validado, autorizado e formatado corretamente.',
            },
            {
                type: 'text',
                label: 'Estrutura que criaremos',
                value:
                    'database/migrations/create_posts_table.php\napp/Models/Post.php\napp/Http/Resources/PostResource.php\napp/Http/Requests/StorePostRequest.php\napp/Http/Requests/UpdatePostRequest.php\napp/Http/Controllers/Api/PostController.php\nroutes/api.php  (endpoints)',
            },
            {
                type: 'text',
                label: 'Endpoints finais',
                value:
                    'GET    /api/posts          → lista posts paginados\nPOST   /api/posts          → cria post\nGET    /api/posts/{id}     → exibe post\nPUT    /api/posts/{id}     → atualiza post\nDELETE /api/posts/{id}     → deleta post',
            },
            {
                type: 'tip',
                value: 'Sanctum já vem configurado no starter kit. Se estiver num projeto do zero, instale com: composer require laravel/sanctum && php artisan install:api',
            },
        ],
    },
    {
        id: 'migration',
        number: 1,
        title: 'Migration',
        subtitle: 'Criar a tabela no banco',
        content: [
            {
                type: 'text',
                value: 'A migration define a estrutura da tabela. Use o comando Artisan para gerar o arquivo e depois edite o método up().',
            },
            {
                type: 'command',
                label: 'Gerar a migration',
                value: 'php artisan make:migration create_posts_table',
            },
            {
                type: 'code',
                label: 'database/migrations/xxxx_create_posts_table.php',
                value: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};`,
            },
            {
                type: 'command',
                label: 'Rodar a migration',
                value: 'php artisan migrate',
            },
            {
                type: 'tip',
                value: 'foreignId(\'user_id\')->constrained() cria a FK automaticamente apontando para a tabela users. cascadeOnDelete() deleta os posts quando o usuário é removido.',
            },
        ],
    },
    {
        id: 'model',
        number: 2,
        title: 'Model',
        subtitle: 'Configurar o Eloquent',
        content: [
            {
                type: 'text',
                value: 'O Model é a representação PHP da tabela. Configure $fillable, relações, casts e qualquer lógica de negócio ligada aos dados.',
            },
            {
                type: 'command',
                label: 'Gerar o model',
                value: 'php artisan make:model Post',
            },
            {
                type: 'code',
                label: 'app/Models/Post.php',
                value: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Post extends Model
{
    protected $fillable = [
        'title',
        'body',
        'published',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published'    => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    // Relação: um Post pertence a um User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope para posts publicados
    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}`,
            },
            {
                type: 'tip',
                value: '$fillable protege contra mass assignment. Apenas os campos listados podem ser preenchidos via create() ou update().',
            },
        ],
    },
    {
        id: 'factory',
        number: 3,
        title: 'Factory & Seeder',
        subtitle: 'Dados de teste',
        content: [
            {
                type: 'text',
                value: 'Factories geram dados falsos para testes e seeds. São essenciais para testes automatizados e para popular o banco em desenvolvimento.',
            },
            {
                type: 'command',
                label: 'Gerar factory e seeder',
                value: 'php artisan make:factory PostFactory --model=Post\nphp artisan make:seeder PostSeeder',
            },
            {
                type: 'code',
                label: 'database/factories/PostFactory.php',
                value: `<?php

namespace Database\\Factories;

use App\\Models\\User;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'title'        => fake()->sentence(6),
            'body'         => fake()->paragraphs(3, true),
            'published'    => fake()->boolean(70), // 70% publicados
            'published_at' => fake()->optional()->dateTimeBetween('-1 year'),
        ];
    }

    // Estado: post publicado
    public function published(): static
    {
        return $this->state([
            'published'    => true,
            'published_at' => now(),
        ]);
    }
}`,
            },
            {
                type: 'code',
                label: 'database/seeders/PostSeeder.php',
                value: `<?php

namespace Database\\Seeders;

use App\\Models\\Post;
use App\\Models\\User;
use Illuminate\\Database\\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory(5)->create();

        $users->each(function (User $user) {
            Post::factory(10)
                ->for($user)
                ->create();
        });
    }
}`,
            },
            {
                type: 'command',
                label: 'Rodar o seeder',
                value: 'php artisan db:seed --class=PostSeeder',
            },
        ],
    },
    {
        id: 'resource',
        number: 4,
        title: 'API Resource',
        subtitle: 'Formatar o JSON de saída',
        content: [
            {
                type: 'text',
                value: 'API Resources transformam os models Eloquent em JSON estruturado. Definem exatamente quais campos expor, como formatá-los e quais relações incluir condicionalmente.',
            },
            {
                type: 'command',
                label: 'Gerar o Resource',
                value: 'php artisan make:resource PostResource',
            },
            {
                type: 'code',
                label: 'app/Http/Resources/PostResource.php',
                value: `<?php

namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'body'         => $this->body,
            'published'    => $this->published,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at'   => $this->created_at->toIso8601String(),

            // Relação carregada condicionalmente (evita N+1)
            'author' => $this->whenLoaded('user', fn() => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}`,
            },
            {
                type: 'tip',
                value: 'whenLoaded() só inclui o campo "author" se o relacionamento user já foi carregado com with(\'user\'). Isso evita N+1 queries acidentais.',
            },
            {
                type: 'code',
                label: 'Exemplo de resposta JSON',
                value: `{
  "data": {
    "id": 1,
    "title": "Meu primeiro post",
    "body": "Conteúdo do post...",
    "published": true,
    "published_at": "2026-06-03T14:30:00+00:00",
    "created_at": "2026-06-03T10:00:00+00:00",
    "author": {
      "id": 1,
      "name": "João Silva"
    }
  }
}`,
            },
        ],
    },
    {
        id: 'requests',
        number: 5,
        title: 'Form Requests',
        subtitle: 'Validar a entrada',
        content: [
            {
                type: 'text',
                value: 'Form Requests isolam a validação do controller. São injetados automaticamente — o controller só é chamado se a validação passar.',
            },
            {
                type: 'command',
                label: 'Gerar os Form Requests',
                value: 'php artisan make:request StorePostRequest\nphp artisan make:request UpdatePostRequest',
            },
            {
                type: 'code',
                label: 'app/Http/Requests/StorePostRequest.php',
                value: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Qualquer usuário autenticado pode criar posts
        return true;
    }

    public function rules(): array
    {
        return [
            'title'     => ['required', 'string', 'max:255'],
            'body'      => ['required', 'string', 'min:10'],
            'published' => ['boolean'],
        ];
    }
}`,
            },
            {
                type: 'code',
                label: 'app/Http/Requests/UpdatePostRequest.php',
                value: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Apenas o dono do post pode editar
        return $this->user()->can('update', $this->route('post'));
    }

    public function rules(): array
    {
        return [
            'title'     => ['sometimes', 'string', 'max:255'],
            'body'      => ['sometimes', 'string', 'min:10'],
            'published' => ['sometimes', 'boolean'],
        ];
    }
}`,
            },
            {
                type: 'tip',
                value: '"sometimes" só valida o campo se ele estiver presente na request. Perfeito para PATCH parcial — o cliente pode enviar só os campos que quer mudar.',
            },
        ],
    },
    {
        id: 'policy',
        number: 6,
        title: 'Policy',
        subtitle: 'Controlar autorização',
        content: [
            {
                type: 'text',
                value: 'Policies encapsulam as regras de autorização por model. O Laravel as descobre automaticamente pelo nome (PostPolicy para o model Post).',
            },
            {
                type: 'command',
                label: 'Gerar a Policy',
                value: 'php artisan make:policy PostPolicy --model=Post',
            },
            {
                type: 'code',
                label: 'app/Policies/PostPolicy.php',
                value: `<?php

namespace App\\Policies;

use App\\Models\\Post;
use App\\Models\\User;

class PostPolicy
{
    // Qualquer usuário autenticado pode listar/ver
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Post $post): bool
    {
        return true;
    }

    // Qualquer autenticado pode criar
    public function create(User $user): bool
    {
        return true;
    }

    // Apenas o dono pode editar/deletar
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}`,
            },
            {
                type: 'tip',
                value: 'O Laravel descobre a PostPolicy automaticamente para o model Post. Se os nomes não coincidirem, registre manualmente em AppServiceProvider: Gate::policy(Post::class, PostPolicy::class).',
            },
        ],
    },
    {
        id: 'controller',
        number: 7,
        title: 'Controller',
        subtitle: 'Implementar o CRUD',
        content: [
            {
                type: 'text',
                value: 'O controller orquestra tudo: recebe a request validada, chama o model e retorna o Resource formatado. Com Form Requests e Policy configurados, o controller fica enxuto.',
            },
            {
                type: 'command',
                label: 'Gerar o controller de API',
                value: 'php artisan make:controller Api/PostController --api',
            },
            {
                type: 'code',
                label: 'app/Http/Controllers/Api/PostController.php',
                value: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StorePostRequest;
use App\\Http\\Requests\\UpdatePostRequest;
use App\\Http\\Resources\\PostResource;
use App\\Models\\Post;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;
use Illuminate\\Http\\Response;

class PostController extends Controller
{
    // GET /api/posts
    public function index(Request $request): AnonymousResourceCollection
    {
        $posts = Post::with('user')
            ->when($request->boolean('published'), fn($q) => $q->published())
            ->latest()
            ->paginate(15);

        return PostResource::collection($posts);
    }

    // POST /api/posts
    public function store(StorePostRequest $request): PostResource
    {
        $post = $request->user()->posts()->create(
            $request->validated()
        );

        return new PostResource($post->load('user'));
    }

    // GET /api/posts/{post}
    public function show(Post $post): PostResource
    {
        return new PostResource($post->load('user'));
    }

    // PUT /api/posts/{post}
    public function update(UpdatePostRequest $request, Post $post): PostResource
    {
        $post->update($request->validated());

        return new PostResource($post->load('user'));
    }

    // DELETE /api/posts/{post}
    public function destroy(Request $request, Post $post): Response
    {
        $this->authorize('delete', $post);

        $post->delete();

        return response()->noContent();
    }
}`,
            },
            {
                type: 'tip',
                value: '$request->user()->posts()->create() cria o post já associado ao usuário autenticado, preenchendo user_id automaticamente via relação.',
            },
        ],
    },
    {
        id: 'routes',
        number: 8,
        title: 'Rotas',
        subtitle: 'Registrar os endpoints',
        content: [
            {
                type: 'text',
                value: 'As rotas de API ficam em routes/api.php e são automaticamente prefixadas com /api. Proteja-as com auth:sanctum para exigir autenticação via token.',
            },
            {
                type: 'code',
                label: 'routes/api.php',
                value: `<?php

use App\\Http\\Controllers\\Api\\PostController;
use Illuminate\\Support\\Facades\\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('posts', PostController::class);
});`,
            },
            {
                type: 'command',
                label: 'Ver as rotas geradas',
                value: 'php artisan route:list --path=api/posts',
            },
            {
                type: 'code',
                label: 'Saída do route:list',
                value: `GET    api/posts           posts.index    → PostController@index
POST   api/posts           posts.store    → PostController@store
GET    api/posts/{post}    posts.show     → PostController@show
PUT    api/posts/{post}    posts.update   → PostController@update
DELETE api/posts/{post}    posts.destroy  → PostController@destroy`,
            },
            {
                type: 'tip',
                value: 'apiResource() registra as 5 rotas de API (sem create e edit, pois APIs não têm formulários HTML). Para incluir sub-recursos: Route::apiResource(\'posts.comments\', CommentController::class).',
            },
        ],
    },
    {
        id: 'testing',
        number: 9,
        title: 'Testando',
        subtitle: 'Chamadas reais e testes automáticos',
        content: [
            {
                type: 'text',
                value: 'Para obter um token Sanctum, use a rota de login (POST /api/login) ou pelo Tinker. Depois inclua o token no header Authorization.',
            },
            {
                type: 'command',
                label: 'Criar token pelo Tinker',
                value: "php artisan tinker\n>>> $user = App\\Models\\User::first();\n>>> $token = $user->createToken('dev')->plainTextToken;\n>>> echo $token;",
            },
            {
                type: 'code',
                label: 'Exemplos com cURL',
                value: `# Listar posts
curl -H "Authorization: Bearer SEU_TOKEN" \\
     https://seusite.com/api/posts

# Criar post
curl -X POST \\
     -H "Authorization: Bearer SEU_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"title":"Meu Post","body":"Conteúdo aqui..."}' \\
     https://seusite.com/api/posts

# Atualizar post
curl -X PUT \\
     -H "Authorization: Bearer SEU_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"title":"Título atualizado"}' \\
     https://seusite.com/api/posts/1

# Deletar post
curl -X DELETE \\
     -H "Authorization: Bearer SEU_TOKEN" \\
     https://seusite.com/api/posts/1`,
            },
            {
                type: 'code',
                label: 'Testes automáticos com Pest (tests/Feature/PostApiTest.php)',
                value: `<?php

use App\\Models\\Post;
use App\\Models\\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('lista posts paginados', function () {
    Post::factory(3)->for($this->user)->create();

    actingAs($this->user)
        ->getJson('/api/posts')
        ->assertOk()
        ->assertJsonStructure([
            'data' => ['*' => ['id', 'title', 'body']],
            'meta' => ['total', 'per_page'],
        ]);
});

it('cria post com dados validos', function () {
    actingAs($this->user)
        ->postJson('/api/posts', [
            'title' => 'Meu Post',
            'body'  => 'Conteúdo do post aqui.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Meu Post');

    assertDatabaseHas('posts', ['title' => 'Meu Post']);
});

it('nao cria post sem title', function () {
    actingAs($this->user)
        ->postJson('/api/posts', ['body' => 'Sem título'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('title');
});

it('nao pode editar post de outro usuario', function () {
    $other = User::factory()->create();
    $post  = Post::factory()->for($other)->create();

    actingAs($this->user)
        ->putJson("/api/posts/{$post->id}", ['title' => 'Hack'])
        ->assertForbidden();
});

it('deleta o proprio post', function () {
    $post = Post::factory()->for($this->user)->create();

    actingAs($this->user)
        ->deleteJson("/api/posts/{$post->id}")
        ->assertNoContent();

    assertModelMissing($post);
});`,
            },
            {
                type: 'command',
                label: 'Rodar os testes',
                value: 'php artisan test --compact --filter=PostApi',
            },
        ],
    },
    {
        id: 'extras',
        number: 10,
        title: 'Melhorias extras',
        subtitle: 'Deixar a API production-ready',
        content: [
            {
                type: 'text',
                value: 'Com o CRUD funcionando, aqui estão melhorias importantes para uma API em produção:',
            },
            {
                type: 'code',
                label: '1. Rate Limiting (AppServiceProvider.php)',
                value: `// No método boot() do AppServiceProvider
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by(
        $request->user()?->id ?? $request->ip()
    );
});`,
            },
            {
                type: 'code',
                label: '2. Filtros e busca no index()',
                value: `public function index(Request $request): AnonymousResourceCollection
{
    $posts = Post::with('user')
        ->when($request->search, fn($q) =>
            $q->where('title', 'like', "%{$request->search}%")
        )
        ->when($request->boolean('published'), fn($q) => $q->published())
        ->when($request->user_id, fn($q) =>
            $q->where('user_id', $request->user_id)
        )
        ->latest()
        ->paginate($request->integer('per_page', 15));

    return PostResource::collection($posts);
}`,
            },
            {
                type: 'code',
                label: '3. Resposta 201 no store()',
                value: `public function store(StorePostRequest $request): JsonResponse
{
    $post = $request->user()->posts()->create($request->validated());

    return (new PostResource($post->load('user')))
        ->response()
        ->setStatusCode(201);
}`,
            },
            {
                type: 'code',
                label: '4. Handler global de erros (bootstrap/app.php)',
                value: `->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (ModelNotFoundException $e, Request $request) {
        if ($request->expectsJson()) {
            return response()->json(
                ['message' => 'Recurso não encontrado.'],
                404
            );
        }
    });

    $exceptions->render(function (AuthorizationException $e, Request $request) {
        if ($request->expectsJson()) {
            return response()->json(
                ['message' => 'Não autorizado.'],
                403
            );
        }
    });
})`,
            },
            {
                type: 'warning',
                value: 'Nunca exponha campos sensíveis como password, remember_token ou tokens de API no Resource. Sempre revise o toArray() antes de fazer deploy.',
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
                    {label && (
                        <span className="font-mono text-xs text-zinc-400">{label}</span>
                    )}
                </div>
                <button
                    onClick={copy}
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    {copied ? 'copiado!' : 'copiar'}
                </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed text-zinc-200">
                {value}
            </pre>
        </div>
    );
}

function CommandBlock({ value, label }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
            {label && (
                <div className="border-b border-zinc-700 px-3 py-1.5">
                    <span className="text-xs text-zinc-500">{label}</span>
                </div>
            )}
            <div className="flex items-start justify-between gap-4 px-4 py-3">
                <pre className="font-mono text-sm leading-relaxed text-green-400">{value}</pre>
                <button
                    onClick={copy}
                    className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    {copied ? 'copiado!' : 'copiar'}
                </button>
            </div>
        </div>
    );
}

export default function Guide() {
    const [activeStep, setActiveStep] = useState(steps[0].id);

    const current = steps.find((s) => s.id === activeStep) ?? steps[0];

    function goNext() {
        const idx = steps.findIndex((s) => s.id === activeStep);
        if (idx < steps.length - 1) setActiveStep(steps[idx + 1].id);
    }

    function goPrev() {
        const idx = steps.findIndex((s) => s.id === activeStep);
        if (idx > 0) setActiveStep(steps[idx - 1].id);
    }

    const currentIdx = steps.findIndex((s) => s.id === activeStep);

    return (
        <>
            <Head title="Guia — API CRUD com Laravel" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            Laravel Tasks
                        </p>
                        <h1 className="text-2xl font-bold text-foreground">
                            API CRUD com Laravel
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Passo a passo: migration → model → resource → requests → policy → controller → rotas → testes
                        </p>
                    </div>
                </div>

                {/* Mobile step selector */}
                <div className="border-b border-border md:hidden">
                    <div className="flex overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {steps.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveStep(s.id)}
                                className={cn(
                                    'mr-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                                    activeStep === s.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {s.number > 0 ? `${s.number}. ` : ''}{s.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="flex gap-8">
                        {/* Sidebar (desktop) */}
                        <aside className="hidden w-52 shrink-0 md:block">
                            <div className="sticky top-6">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Passos
                                </p>
                                <nav className="space-y-0.5">
                                    {steps.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveStep(s.id)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
                                                activeStep === s.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                                    activeStep === s.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {s.number === 0 ? '·' : s.number}
                                            </span>
                                            <span className="text-sm font-medium leading-tight">
                                                {s.title}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Main content */}
                        <div className="min-w-0 flex-1">
                            {/* Step header */}
                            <div className="mb-6">
                                <div className="mb-1 flex items-center gap-2">
                                    {current.number > 0 && (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            {current.number}
                                        </span>
                                    )}
                                    <h2 className="text-xl font-bold text-foreground">
                                        {current.title}
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
                            </div>

                            {/* Step content */}
                            <div className="space-y-5">
                                {current.content.map((item, i) => {
                                    if (item.type === 'code') {
                                        return (
                                            <div key={i}>
                                                {item.label && (
                                                    <p className="mb-2 text-sm font-semibold text-foreground">
                                                        {item.label}
                                                    </p>
                                                )}
                                                <CodeBlock value={item.value} label={item.label} />
                                            </div>
                                        );
                                    }

                                    if (item.type === 'command') {
                                        return (
                                            <div key={i}>
                                                {item.label && (
                                                    <p className="mb-2 text-sm font-semibold text-foreground">
                                                        {item.label}
                                                    </p>
                                                )}
                                                <CommandBlock value={item.value} />
                                            </div>
                                        );
                                    }

                                    if (item.type === 'tip') {
                                        return (
                                            <div
                                                key={i}
                                                className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-900/20"
                                            >
                                                <span className="mt-0.5 shrink-0 text-blue-500">
                                                    <Lightbulb className="h-4 w-4" />
                                                </span>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    {item.value}
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (item.type === 'warning') {
                                        return (
                                            <div
                                                key={i}
                                                className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800/50 dark:bg-yellow-900/20"
                                            >
                                               
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    {item.value}
                                                </p>
                                            </div>
                                        );
                                    }

                                    // type: 'text'
                                    return (
                                        <div key={i}>
                                            {item.label && (
                                                <p className="mb-2 text-sm font-semibold text-foreground">
                                                    {item.label}
                                                </p>
                                            )}
                                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                                                {item.value}
                                            </pre>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Prev / Next navigation */}
                            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIdx === 0}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors',
                                        currentIdx === 0
                                            ? 'cursor-not-allowed opacity-30'
                                            : 'text-foreground hover:bg-muted',
                                    )}
                                >
                                    ← {currentIdx > 0 ? steps[currentIdx - 1].title : ''}
                                </button>

                                <span className="text-xs text-muted-foreground">
                                    {currentIdx + 1} / {steps.length}
                                </span>

                                <button
                                    onClick={goNext}
                                    disabled={currentIdx === steps.length - 1}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90',
                                        currentIdx === steps.length - 1 && 'cursor-not-allowed opacity-30',
                                    )}
                                >
                                    {currentIdx < steps.length - 1 ? steps[currentIdx + 1].title : ''} →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
