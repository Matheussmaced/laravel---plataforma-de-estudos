import { Head, router } from '@inertiajs/react';
import { useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LearnController from '@/actions/App/Http/Controllers/LearnController';

type ChallengeStatus = 'idle' | 'correct' | 'incorrect';

interface Challenge {
    id: number;
    level: number;
    category: string;
    categoryColor: string;
    title: string;
    description: string;
    codePrefix: string;
    codeSuffix: string;
    answers: string[];
    hint: string;
    explanation: string;
    multiline?: boolean;
    requiredParts?: string[];
    placeholder?: string;
}

interface LevelConfig {
    id: number;
    name: string;
    subtitle: string;
}

interface Props {
    completedIds: number[];
}

const LEVELS: LevelConfig[] = [
    { id: 1, name: 'Nível 1', subtitle: 'Fundamentos' },
    { id: 2, name: 'Nível 2', subtitle: 'Intermediário' },
    { id: 3, name: 'Nível 3', subtitle: 'Avançado' },
];

const challenges: Challenge[] = [
    // ── Nível 1 – Fundamentos ────────────────────────────────────────────────
    {
        id: 1,
        level: 1,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Rota GET',
        description: 'Para criar uma rota que responde requisições GET, qual método você usa na facade Route?',
        codePrefix: 'Route::',
        codeSuffix: "('/hello', fn() => 'Hello World');",
        answers: ['get'],
        hint: 'É o verbo HTTP mais comum, usado para buscar/exibir dados.',
        explanation:
            "Route::get() registra uma rota que responde ao método HTTP GET. É o mais usado para exibir páginas. Outros métodos: post(), put(), patch(), delete().",
    },
    {
        id: 2,
        level: 1,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Nomear uma rota',
        description: "Como você adiciona um nome a uma rota para poder usar a função route('perfil') depois?",
        codePrefix: "Route::get('/perfil', fn() => ...)->",
        codeSuffix: "('perfil');",
        answers: ['name'],
        hint: 'É um método encadeado chamado depois da definição da rota.',
        explanation:
            "->name() associa um identificador à rota. Com isso você usa route('perfil') para gerar a URL em qualquer lugar do código — se o caminho mudar, só precisa atualizar em um lugar.",
    },
    {
        id: 3,
        level: 1,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Middleware de autenticação',
        description: 'Qual método você usa na Route para aplicar um middleware a um grupo de rotas?',
        codePrefix: 'Route::',
        codeSuffix: "('auth')->group(function () {\n    // rotas protegidas\n});",
        answers: ['middleware'],
        hint: 'O nome do método é exatamente o mesmo que o conceito que ele aplica.',
        explanation:
            "Route::middleware('auth') aplica o guard de autenticação. Todas as rotas dentro de group() só serão acessíveis para usuários logados.",
    },
    {
        id: 4,
        level: 1,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Relação um-para-muitos',
        description: 'Um User pode ter muitos Posts. Qual método Eloquent define essa relação no model User?',
        codePrefix: 'public function posts(): HasMany\n{\n    return $this->',
        codeSuffix: '(Post::class);\n}',
        answers: ['hasmany'],
        hint: 'O nome traduz literalmente o que a relação significa: "tem muitos".',
        explanation:
            '$this->hasMany(Post::class) define que um User possui múltiplos Posts. O Eloquent usa automaticamente user_id na tabela posts para fazer a ligação.',
    },
    {
        id: 5,
        level: 1,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Relação inversa (belongsTo)',
        description: 'Um Post pertence a um User. Qual método Eloquent define essa relação inversa no model Post?',
        codePrefix: 'public function user(): BelongsTo\n{\n    return $this->',
        codeSuffix: '(User::class);\n}',
        answers: ['belongsto'],
        hint: '"Pertence a" em inglês.',
        explanation:
            '$this->belongsTo(User::class) é o lado inverso do hasMany. O Eloquent lê o user_id da tabela posts para encontrar o User dono.',
    },
    {
        id: 6,
        level: 1,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Filtrar registros',
        description: 'Como você filtra usuários onde o campo "active" é true?',
        codePrefix: 'User::',
        codeSuffix: "('active', true)->get();",
        answers: ['where'],
        hint: 'Em SQL você escreveria WHERE. O método Eloquent tem o mesmo nome.',
        explanation:
            "where() adiciona uma cláusula WHERE à query. User::where('active', true)->get() retorna uma Collection com todos os usuários ativos.",
    },
    {
        id: 7,
        level: 1,
        category: 'Validação',
        categoryColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        title: 'Campo obrigatório',
        description: 'Qual regra de validação torna um campo obrigatório?',
        codePrefix: "$request->validate([\n    'nome' => '",
        codeSuffix: "',\n]);",
        answers: ['required'],
        hint: 'Em inglês, significa "obrigatório".',
        explanation:
            "A regra 'required' garante que o campo esteja presente e não seja uma string vazia. Se falhar, o Laravel retorna automaticamente um erro de validação.",
    },
    {
        id: 8,
        level: 1,
        category: 'Validação',
        categoryColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        title: 'Múltiplas regras',
        description: 'Combine as regras para que o campo email seja obrigatório E seja um e-mail válido (use pipe | para separar).',
        codePrefix: "$request->validate([\n    'email' => '",
        codeSuffix: "',\n]);",
        answers: ['required|email', 'email|required'],
        hint: 'Use dois nomes de regras separados por | (pipe).',
        explanation:
            "Regras são encadeadas com |. 'required|email' verifica que o campo foi preenchido E que o valor tem formato de e-mail válido.",
    },
    {
        id: 9,
        level: 1,
        category: 'Artisan',
        categoryColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        title: 'Criar uma migration',
        description: 'Qual é o prefixo do comando Artisan para criar arquivos (migrations, models, controllers...)?',
        codePrefix: 'php artisan ',
        codeSuffix: ':migration create_posts_table',
        answers: ['make'],
        hint: 'Todos os comandos de geração de arquivos no Artisan começam com esse prefixo.',
        explanation:
            "'php artisan make:migration' gera o arquivo em database/migrations/. O mesmo padrão vale para: make:model, make:controller, make:seeder...",
    },
    {
        id: 10,
        level: 1,
        category: 'Helpers',
        categoryColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        title: 'Gerar URL de rota nomeada',
        description: "Qual função global do Laravel gera a URL de uma rota com nome 'dashboard'?",
        codePrefix: '',
        codeSuffix: "('dashboard')",
        answers: ['route'],
        hint: 'O nome da função é o mesmo conceito que você está gerando.',
        explanation:
            "A função route() gera a URL completa da rota nomeada. É melhor que escrever '/dashboard' direto, pois se a URL mudar no futuro, só precisa atualizar em routes/web.php.",
    },

    // ── Nível 2 – Intermediário ──────────────────────────────────────────────
    {
        id: 11,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Eager Loading',
        description: 'Para evitar o problema N+1 e carregar os posts junto com os usuários em uma única query, use:',
        codePrefix: 'User::',
        codeSuffix: "('posts')->get();",
        answers: ['with'],
        hint: '"Junto com" em inglês é "with".',
        explanation:
            'with() faz eager loading da relação, executando apenas 2 queries em vez de N+1 queries.',
    },
    {
        id: 12,
        level: 2,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Rotas de Resource',
        description: 'Para registrar todas as rotas CRUD (index, create, store, show, edit, update, destroy) de uma vez, use:',
        codePrefix: 'Route::',
        codeSuffix: "('posts', PostController::class);",
        answers: ['resource'],
        hint: 'O nome é o mesmo conceito: "resource controller".',
        explanation:
            'Route::resource() registra 7 rotas automaticamente. Equivale a registrar manualmente index, create, store, show, edit, update e destroy.',
    },
    {
        id: 13,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Local Scope',
        description: 'Para criar um scope que filtra posts ativos no model, o método deve ser prefixado com:',
        codePrefix: 'public function ',
        codeSuffix: 'Active(Builder $query): Builder\n{\n    return $query->where(\'active\', true);\n}',
        answers: ['scope'],
        hint: 'É o prefixo padrão para todos os scopes locais no Eloquent.',
        explanation:
            "Métodos prefixados com scope são 'Local Scopes'. Post::active()->get() chama scopeActive() automaticamente.",
    },
    {
        id: 14,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Mass Assignment',
        description: 'Para permitir que Post::create($data) funcione com os campos title e body, declare a propriedade:',
        codePrefix: 'protected $',
        codeSuffix: " = ['title', 'body'];",
        answers: ['fillable'],
        hint: "Os campos 'preenchíveis' ficam numa propriedade com esse exato nome.",
        explanation:
            '$fillable define quais campos podem ser preenchidos em massa. Sem isso, o Laravel lança MassAssignmentException.',
    },
    {
        id: 15,
        level: 2,
        category: 'Validação',
        categoryColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        title: 'Form Request',
        description: 'Um Form Request customizado deve estender qual classe base do Laravel?',
        codePrefix: 'class StorePostRequest extends ',
        codeSuffix: '\n{\n    public function rules(): array { ... }\n}',
        answers: ['formrequest'],
        hint: 'O nome da classe base é "FormRequest" (dois substantivos juntos).',
        explanation:
            'FormRequest é a classe base para validação desacoplada do controller. O Laravel resolve e valida automaticamente antes do método do controller ser chamado.',
    },
    {
        id: 16,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'firstOrCreate',
        description: 'Para buscar um registro ou criá-lo se não existir, use:',
        codePrefix: 'User::',
        codeSuffix: "(['email' => 'a@b.com'], ['name' => 'Ana']);",
        answers: ['firstorcreate'],
        hint: '"Primeiro ou cria" — tradução literal do método.',
        explanation:
            'firstOrCreate() busca pela condição do 1º array. Se não encontrar, cria com a junção dos dois arrays. Ideal para seeders e imports.',
    },
    {
        id: 17,
        level: 2,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Route Model Binding',
        description: 'Para que o Laravel injete automaticamente um Post pelo ID na URL, o parâmetro deve ser tipado como:',
        codePrefix: 'public function show(',
        codeSuffix: ' $post): Response { ... }',
        answers: ['post'],
        hint: 'O type hint é o nome do Model — o Laravel resolve automaticamente.',
        explanation:
            'Route Model Binding injeta o model já resolvido. Se a URL for /posts/5, o Laravel busca Post::findOrFail(5) automaticamente.',
    },
    {
        id: 18,
        level: 2,
        category: 'Artisan',
        categoryColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        title: 'Controller de Resource',
        description: 'Qual flag passa ao make:controller para gerar automaticamente os 7 métodos CRUD?',
        codePrefix: 'php artisan make:controller PostController --',
        codeSuffix: '',
        answers: ['resource'],
        hint: 'A mesma palavra que você usa na Route::___().',
        explanation:
            '--resource gera os métodos index, create, store, show, edit, update e destroy.',
    },
    {
        id: 19,
        level: 2,
        category: 'Autorização',
        categoryColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        title: 'Autorização com Policy',
        description: 'Dentro de um controller, para verificar se o usuário tem permissão via Policy e lançar 403 se não tiver, use:',
        codePrefix: '$this->',
        codeSuffix: "('update', $post);",
        answers: ['authorize'],
        hint: 'O método existe direto no controller e "autoriza" a ação.',
        explanation:
            '$this->authorize() chama a Policy correspondente (PostPolicy@update). Se retornar false, lança AuthorizationException (HTTP 403) automaticamente.',
    },
    {
        id: 20,
        level: 2,
        category: 'Cache',
        categoryColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        title: 'Lembrar no Cache',
        description: 'Para buscar um valor do cache ou executar o closure e armazená-lo por 60 minutos, use:',
        codePrefix: 'Cache::',
        codeSuffix: "('stats', 60, fn() => Stats::calculate());",
        answers: ['remember'],
        hint: '"Lembrar" em inglês.',
        explanation:
            'Cache::remember() verifica o cache primeiro. Se não existir, executa o closure, armazena e retorna. Evita queries repetidas para dados pouco mutáveis.',
    },
    {
        id: 21,
        level: 2,
        category: 'Collections',
        categoryColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        title: 'Transformar Collection',
        description: 'Para transformar cada item de uma collection (como array_map), use o método:',
        codePrefix: '$names = $users->',
        codeSuffix: "(fn($u) => $u->name);",
        answers: ['map'],
        hint: 'Mesmo nome que em JavaScript: Array.map()',
        explanation:
            'map() retorna uma nova Collection com cada item transformado pelo closure. Não modifica a original.',
    },
    {
        id: 22,
        level: 2,
        category: 'Collections',
        categoryColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        title: 'Filtrar Collection',
        description: 'Para filtrar apenas usuários ativos de uma collection, use o método:',
        codePrefix: '$active = $users->',
        codeSuffix: "(fn($u) => $u->active);",
        answers: ['filter'],
        hint: 'Mesmo nome que em JavaScript: Array.filter()',
        explanation:
            'filter() retorna uma nova Collection com apenas os itens onde o closure retorna true.',
    },
    {
        id: 23,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Relação Muitos-para-Muitos',
        description: 'Um Post pode ter muitas Tags, e uma Tag pode estar em muitos Posts. Qual método define essa relação?',
        codePrefix: 'public function tags(): BelongsToMany\n{\n    return $this->',
        codeSuffix: '(Tag::class);\n}',
        answers: ['belongstomany'],
        hint: '"Pertence a muitos" — relação M:N sempre usa esse método nos dois lados.',
        explanation:
            'belongsToMany() define relação M:N. O Eloquent espera uma tabela pivot (ex: post_tag) com post_id e tag_id.',
    },
    {
        id: 24,
        level: 2,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Prefixo de Rotas',
        description: 'Para agrupar rotas com o prefixo /admin em todas as URLs, use o método:',
        codePrefix: "Route::middleware('auth')->",
        codeSuffix: "('/admin')->group(function () {\n    Route::get('/dashboard', ...);\n});",
        answers: ['prefix'],
        hint: 'O nome do método é exatamente o que você está definindo: um "prefixo".',
        explanation:
            'prefix() adiciona um segmento antes de todas as URLs do group(). Combinado com middleware() e name() mantém as rotas organizadas sem repetição.',
    },
    {
        id: 25,
        level: 2,
        category: 'Eloquent',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Paginação',
        description: 'Para retornar resultados paginados com 15 registros por página e links de navegação, use:',
        codePrefix: '$posts = Post::latest()->',
        codeSuffix: '(15);',
        answers: ['paginate'],
        hint: 'O nome do método descreve o que ele faz: "paginar".',
        explanation:
            'paginate() retorna um LengthAwarePaginator com links de navegação. O Inertia serializa os metadados automaticamente.',
    },

    // ── Nível 3 – Avançado ───────────────────────────────────────────────────
    {
        id: 26,
        level: 3,
        category: 'Controllers',
        categoryColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        title: 'Método store() completo',
        description:
            'Escreva um método store() que valida title (required, max:255) e body (required), cria um Post e redireciona para posts.index.',
        codePrefix: 'public function store(Request $request): RedirectResponse\n{',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['validate', 'title', 'body', 'required', 'post::create', 'redirect'],
        placeholder:
            "    $validated = $request->validate([\n        'title' => 'required|max:255',\n        'body'  => 'required',\n    ]);\n\n    Post::create($validated);\n\n    return redirect()->route('posts.index');",
        hint: "Valide com $request->validate(), crie com Post::create($validated) e redirecione com redirect()->route('posts.index').",
        explanation:
            "O fluxo padrão de store(): validar → criar → redirecionar. validate() lança automaticamente de volta com erros. Post::create() usa \$fillable para segurança.",
    },
    {
        id: 27,
        level: 3,
        category: 'Migrations',
        categoryColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        title: 'Migration completa',
        description:
            'Escreva o método up() de uma migration que cria a tabela posts com: id, user_id (foreign key para users), title (string), body (text) e timestamps.',
        codePrefix: 'public function up(): void\n{',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['schema::create', 'posts', 'id()', 'user_id', 'foreignid', 'title', 'body', 'timestamps'],
        placeholder:
            "    Schema::create('posts', function (Blueprint \$table) {\n        \$table->id();\n        \$table->foreignId('user_id')->constrained()->cascadeOnDelete();\n        \$table->string('title');\n        \$table->text('body');\n        \$table->timestamps();\n    });",
        hint: "Use Schema::create(). Para user_id com FK: \$table->foreignId('user_id')->constrained().",
        explanation:
            "foreignId() + constrained() cria a FK automaticamente usando o nome da coluna (user_id → tabela users).",
    },
    {
        id: 28,
        level: 3,
        category: 'Models',
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        title: 'Model completo',
        description:
            'Escreva um Model Post com $fillable para title e body, relação belongsTo User e relação belongsToMany Tag.',
        codePrefix: 'class Post extends Model\n{',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['fillable', 'title', 'body', 'belongsto', 'user::class', 'belongstomany', 'tag::class'],
        placeholder:
            "    protected \$fillable = ['title', 'body'];\n\n    public function user(): BelongsTo\n    {\n        return \$this->belongsTo(User::class);\n    }\n\n    public function tags(): BelongsToMany\n    {\n        return \$this->belongsToMany(Tag::class);\n    }",
        hint: "\$fillable = ['title', 'body']; depois dois métodos: belongsTo(User::class) e belongsToMany(Tag::class).",
        explanation:
            'Models devem ter $fillable para segurança. Relações são métodos que retornam a instância de relação. O Eloquent infere as FK pelos nomes dos models.',
    },
    {
        id: 29,
        level: 3,
        category: 'Validação',
        categoryColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        title: 'Form Request completo',
        description:
            'Escreva os métodos authorize() e rules() de um StorePostRequest: qualquer usuário autenticado pode acessar, title é required|max:255, body é required|min:10.',
        codePrefix: '// Dentro de StorePostRequest extends FormRequest',
        codeSuffix: '',
        answers: [],
        multiline: true,
        requiredParts: ['authorize', 'return true', 'rules', 'title', 'required', 'max:255', 'body', 'min:10'],
        placeholder:
            "public function authorize(): bool\n{\n    return true;\n}\n\npublic function rules(): array\n{\n    return [\n        'title' => 'required|max:255',\n        'body'  => 'required|min:10',\n    ];\n}",
        hint: "authorize() retorna bool (true = todos podem). rules() retorna array com as regras.",
        explanation:
            "authorize() controla quem pode fazer a request. rules() define as regras de validação. O Laravel chama ambos automaticamente antes do controller.",
    },
    {
        id: 30,
        level: 3,
        category: 'Rotas',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'Grupo de rotas API',
        description:
            'Escreva um grupo de rotas com prefixo /api/v1, middleware auth:sanctum, e rotas resource para posts e comments (PostController e CommentController).',
        codePrefix: '// routes/api.php',
        codeSuffix: '',
        answers: [],
        multiline: true,
        requiredParts: ['route::', 'prefix', 'api/v1', 'middleware', 'sanctum', 'resource', 'posts', 'postcontroller', 'comments', 'commentcontroller'],
        placeholder:
            "Route::prefix('api/v1')\n    ->middleware('auth:sanctum')\n    ->group(function () {\n        Route::resource('posts', PostController::class);\n        Route::resource('comments', CommentController::class);\n    });",
        hint: "Use Route::prefix()->middleware()->group(). Dentro do group, dois Route::resource().",
        explanation:
            "Encadear prefix, middleware e group é o padrão para APIs versionadas. auth:sanctum protege as rotas com tokens do Sanctum.",
    },
    {
        id: 31,
        level: 3,
        category: 'Policies',
        categoryColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        title: 'Policy update()',
        description:
            'Escreva um método update() de PostPolicy que só permite a ação se o $user->id for igual ao $post->user_id.',
        codePrefix: '// Dentro de PostPolicy',
        codeSuffix: '',
        answers: [],
        multiline: true,
        requiredParts: ['update', 'user $user', 'post $post', 'user_id', 'return', '$user->id'],
        placeholder:
            "public function update(User \$user, Post \$post): bool\n{\n    return \$user->id === \$post->user_id;\n}",
        hint: "O método recebe User e Post. Compare \$user->id com \$post->user_id.",
        explanation:
            "Policies definem regras de autorização por ação. update() é chamado pelo \$this->authorize('update', \$post) no controller.",
    },
    {
        id: 32,
        level: 3,
        category: 'Jobs',
        categoryColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        title: 'Job com handle()',
        description:
            'Escreva um Job SendWelcomeEmail com: constructor injection (User $user via constructor promotion) e método handle() que usa Mail::to()->send().',
        codePrefix: 'class SendWelcomeEmail implements ShouldQueue\n{\n    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;\n',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['__construct', 'public user $user', 'public function handle', 'mail::to', 'send'],
        placeholder:
            "    public function __construct(\n        public User \$user,\n    ) {}\n\n    public function handle(): void\n    {\n        Mail::to(\$this->user)->send(new WelcomeEmail(\$this->user));\n    }",
        hint: "Constructor promotion: public User \$user no __construct. Handle usa Mail::to(\$this->user)->send(new WelcomeEmail(...)).",
        explanation:
            "Jobs implementam ShouldQueue para execução assíncrona. Constructor promotion é PHP 8+. SerializesModels serializa models corretamente.",
    },
    {
        id: 33,
        level: 3,
        category: 'API Resources',
        categoryColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        title: 'Resource toArray()',
        description:
            "Escreva o método toArray() de PostResource que retorna: id, title, body, e o nome do autor via \$this->user->name.",
        codePrefix: '// Dentro de PostResource extends JsonResource',
        codeSuffix: '',
        answers: [],
        multiline: true,
        requiredParts: ['toarray', 'request $request', 'id', 'title', 'body', 'user', 'name', 'return ['],
        placeholder:
            "public function toArray(Request \$request): array\n{\n    return [\n        'id'     => \$this->id,\n        'title'  => \$this->title,\n        'body'   => \$this->body,\n        'author' => \$this->user->name,\n    ];\n}",
        hint: "Retorne um array com os campos. Acesse propriedades via \$this->campo.",
        explanation:
            "JsonResource formata os dados para a API. \$this->campo acessa o model subjacente. Use \$this->whenLoaded('user') para evitar N+1.",
    },
    {
        id: 34,
        level: 3,
        category: 'Controllers',
        categoryColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        title: 'index() com Inertia',
        description:
            "Escreva um método index() que busca posts com eager loading de user, pagina com 10 por página, e renderiza com Inertia a página 'Posts/Index'.",
        codePrefix: 'public function index(): Response\n{',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['post::', 'with', 'user', 'paginate', '10', 'inertia::render', 'posts/index', 'posts'],
        placeholder:
            "    \$posts = Post::with('user')->paginate(10);\n\n    return Inertia::render('Posts/Index', [\n        'posts' => \$posts,\n    ]);",
        hint: "Post::with('user')->paginate(10) para eager loading + paginação. Inertia::render('Posts/Index', ['posts' => \$posts]).",
        explanation:
            "with('user') evita N+1. paginate() retorna LengthAwarePaginator que o Inertia serializa com links de paginação automaticamente.",
    },
    {
        id: 35,
        level: 3,
        category: 'Observers',
        categoryColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        title: 'Observer created()',
        description:
            'Escreva um PostObserver com método created() que dispara o Job SendNewPostNotification passando o post.',
        codePrefix: 'class PostObserver\n{',
        codeSuffix: '}',
        answers: [],
        multiline: true,
        requiredParts: ['created', 'post $post', 'sendnewpostnotification', 'dispatch', '$post'],
        placeholder:
            "    public function created(Post \$post): void\n    {\n        SendNewPostNotification::dispatch(\$post);\n    }",
        hint: "O método created(Post \$post) recebe o model. Dispare o job com SendNewPostNotification::dispatch(\$post).",
        explanation:
            "Observers encapsulam eventos do Eloquent (created, updated, deleted...) fora do model. Registre com: Post::observe(PostObserver::class).",
    },
];

function checkAnswer(challenge: Challenge, input: string): boolean {
    if (challenge.multiline && challenge.requiredParts) {
        const normalized = input.toLowerCase();
        return challenge.requiredParts.every((part) => normalized.includes(part.toLowerCase()));
    }
    return challenge.answers.includes(input.trim().toLowerCase());
}

export default function Learn({ completedIds }: Props) {
    const [activeLevel, setActiveLevel] = useState(1);

    const [statuses, setStatuses] = useState<Record<number, ChallengeStatus>>(() => {
        const initial: Record<number, ChallengeStatus> = {};
        completedIds.forEach((id) => {
            initial[id] = 'correct';
        });
        return initial;
    });

    const [inputs, setInputs] = useState<Record<number, string>>({});
    const [showHints, setShowHints] = useState<Record<number, boolean>>({});
    const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

    function getLevelChallenges(level: number) {
        return challenges.filter((c) => c.level === level);
    }

    function getLevelCompleted(level: number) {
        return getLevelChallenges(level).filter((c) => completedIds.includes(c.id)).length;
    }

    function isLevelUnlocked(level: number) {
        if (level === 1) return true;
        const prev = getLevelChallenges(level - 1);
        return prev.every((c) => completedIds.includes(c.id));
    }

    function handleCheckAnswer(challenge: Challenge) {
        const input = inputs[challenge.id] ?? '';
        const isCorrect = checkAnswer(challenge, input);

        setStatuses((prev) => ({ ...prev, [challenge.id]: isCorrect ? 'correct' : 'incorrect' }));

        if (isCorrect) {
            setShowExplanations((prev) => ({ ...prev, [challenge.id]: true }));

            if (!completedIds.includes(challenge.id)) {
                router.post(
                    LearnController.store.url(),
                    { challenge_id: challenge.id },
                    { preserveState: true, preserveScroll: true },
                );
            }
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, challenge: Challenge) {
        if (e.key === 'Enter') {
            handleCheckAnswer(challenge);
        }
    }

    function resetChallenge(id: number) {
        setStatuses((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setInputs((prev) => ({ ...prev, [id]: '' }));
        setShowExplanations((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setShowHints((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        router.delete(LearnController.destroy.url(id), { preserveState: true, preserveScroll: true });
    }

    const currentChallenges = getLevelChallenges(activeLevel);
    const currentLevelCompleted = getLevelCompleted(activeLevel);
const categories = [...new Set(currentChallenges.map((c) => c.category))];
    const isCurrentLevelUnlocked = isLevelUnlocked(activeLevel);
    const totalCompleted = completedIds.length;
    const totalChallenges = challenges.length;

    return (
        <>
            <Head title="Guia de Aprendizado Laravel" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b border-border bg-card">
                    <div className="mx-auto max-w-6xl px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-primary">Laravel Tasks</p>
                                <h1 className="text-2xl font-bold text-foreground">Guia de Aprendizado</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${(totalCompleted / totalChallenges) * 100}%` }}
                                    />
                                </div>
                                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                    {totalCompleted}/{totalChallenges}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="mx-auto max-w-6xl px-6 py-8">
                    <div className="flex gap-8">

                        {/* Sidebar – levels */}
                        <aside className="w-56 shrink-0">
                            <div className="sticky top-6 space-y-1">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Níveis</p>
                                {LEVELS.map((level) => {
                                    const completed = getLevelCompleted(level.id);
                                    const total = getLevelChallenges(level.id).length;
                                    const unlocked = isLevelUnlocked(level.id);
                                    const isActive = activeLevel === level.id;
                                    const isDone = completed === total && total > 0;
                                    const pct = total > 0 ? (completed / total) * 100 : 0;

                                    return (
                                        <button
                                            key={level.id}
                                            onClick={() => unlocked && setActiveLevel(level.id)}
                                            className={cn(
                                                'w-full rounded-lg px-3 py-3 text-left transition-colors',
                                                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                                                !unlocked && 'cursor-not-allowed opacity-40',
                                            )}
                                        >
                                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    {!unlocked && (
                                                        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    )}
                                                    {isDone && unlocked && (
                                                        <svg className="h-3 w-3 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    <span className="text-sm font-medium">{level.name}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                                            </div>
                                            <p className="mb-2 text-xs text-muted-foreground">{level.subtitle}</p>
                                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={cn(
                                                        'h-1 rounded-full transition-all duration-500',
                                                        isDone ? 'bg-green-500' : 'bg-primary',
                                                    )}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}

                                <div className="mt-6 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                                    Pressione{' '}
                                    <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">Enter</kbd>{' '}
                                    ou clique em <strong className="text-foreground">Verificar</strong>. O progresso é salvo automaticamente.
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <div className="min-w-0 flex-1 py-0">
                    {!isCurrentLevelUnlocked ? (
                        <Card className="p-12 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="mb-2 text-xl font-bold text-foreground">Nível bloqueado</h2>
                            <p className="text-sm text-muted-foreground">Complete 100% do nível anterior para desbloquear.</p>
                            <button
                                onClick={() => setActiveLevel(activeLevel - 1)}
                                className="mt-4 text-sm text-primary underline-offset-2 hover:underline"
                            >
                                Voltar ao Nível {activeLevel - 1}
                            </button>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {categories.map((category) => (
                                <section key={category}>
                                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        {category}
                                    </h2>
                                    <div className="space-y-4">
                                        {currentChallenges
                                            .filter((c) => c.category === category)
                                            .map((challenge) => {
                                                const status = statuses[challenge.id] ?? 'idle';
                                                const input = inputs[challenge.id] ?? '';
                                                const showHint = showHints[challenge.id] ?? false;
                                                const showExplanation = showExplanations[challenge.id] ?? false;
                                                const isCorrect = status === 'correct';
                                                const isIncorrect = status === 'incorrect';

                                                return (
                                                    <Card
                                                        key={challenge.id}
                                                        className={cn(
                                                            'gap-0 rounded-xl p-0 shadow-none transition-colors',
                                                            isCorrect && 'border-green-300 dark:border-green-800',
                                                            isIncorrect && 'border-destructive/50',
                                                        )}
                                                    >
                                                        <div className="p-6">
                                                            {/* Challenge header */}
                                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <Badge className={cn('mb-2', challenge.categoryColor)} variant="outline">
                                                                        {challenge.category}
                                                                    </Badge>
                                                                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                                                                    <p className="mt-1 text-sm text-muted-foreground">{challenge.description}</p>
                                                                </div>
                                                                {isCorrect && (
                                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                                                        <svg className="h-3.5 w-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Single-line code preview */}
                                                            {!challenge.multiline && (
                                                                <div className="mb-4 overflow-hidden rounded-lg border border-zinc-700 bg-[#1e1e1e]">
                                                                    <div className="flex items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="ml-2 text-xs text-zinc-500">PHP</span>
                                                                    </div>
                                                                    <pre className="overflow-x-auto px-4 py-3 font-mono text-sm leading-relaxed">
                                                                        <span className="text-zinc-200">{challenge.codePrefix}</span>
                                                                        <span
                                                                            className={cn(
                                                                                'rounded px-1 font-bold',
                                                                                isCorrect && 'bg-green-500/20 text-green-300',
                                                                                isIncorrect && input && 'bg-red-500/20 text-red-300',
                                                                                !isCorrect && !isIncorrect && input && 'bg-yellow-500/20 text-yellow-200',
                                                                                !input && 'text-zinc-500 underline decoration-dashed decoration-zinc-500 underline-offset-4',
                                                                            )}
                                                                        >
                                                                            {input || '___'}
                                                                        </span>
                                                                        <span className="text-zinc-200">{challenge.codeSuffix}</span>
                                                                    </pre>
                                                                </div>
                                                            )}

                                                            {/* Multiline: editor block */}
                                                            {challenge.multiline && (
                                                                <div className="mb-4 overflow-hidden rounded-lg border border-zinc-700 bg-[#1e1e1e]">
                                                                    <div className="flex items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-3 py-2">
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                                                        <span className="ml-2 text-xs text-zinc-500">PHP</span>
                                                                    </div>
                                                                    {challenge.codePrefix && (
                                                                        <pre className="border-b border-zinc-700/50 px-4 py-2 font-mono text-sm leading-relaxed text-zinc-300">
                                                                            {challenge.codePrefix}
                                                                        </pre>
                                                                    )}
                                                                    {!isCorrect ? (
                                                                        <textarea
                                                                            value={input}
                                                                            onChange={(e) => {
                                                                                setInputs((prev) => ({ ...prev, [challenge.id]: e.target.value }));
                                                                                if (isIncorrect) {
                                                                                    setStatuses((prev) => ({ ...prev, [challenge.id]: 'idle' }));
                                                                                }
                                                                            }}
                                                                            placeholder={challenge.placeholder ?? 'Digite o código aqui...'}
                                                                            rows={8}
                                                                            spellCheck={false}
                                                                            className={cn(
                                                                                'w-full bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600',
                                                                                isIncorrect && 'bg-red-900/10',
                                                                            )}
                                                                        />
                                                                    ) : (
                                                                        <pre className="px-4 py-3 font-mono text-sm leading-relaxed text-green-300">
                                                                            {input}
                                                                        </pre>
                                                                    )}
                                                                    {challenge.codeSuffix && (
                                                                        <pre className="border-t border-zinc-700/50 px-4 py-2 font-mono text-sm leading-relaxed text-zinc-300">
                                                                            {challenge.codeSuffix}
                                                                        </pre>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Single-line input */}
                                                            {!isCorrect && !challenge.multiline && (
                                                                <div className="mb-3 flex gap-2">
                                                                    <div className={cn(
                                                                        'flex flex-1 items-center overflow-hidden rounded-lg border bg-[#1e1e1e]',
                                                                        isIncorrect ? 'border-destructive' : 'border-zinc-700 focus-within:border-zinc-500',
                                                                    )}>
                                                                        <span className="select-none border-r border-zinc-700 px-2 py-2 font-mono text-xs text-zinc-500">{'>'}</span>
                                                                        <input
                                                                            value={input}
                                                                            onChange={(e) => {
                                                                                setInputs((prev) => ({ ...prev, [challenge.id]: e.target.value }));
                                                                                if (isIncorrect) {
                                                                                    setStatuses((prev) => ({ ...prev, [challenge.id]: 'idle' }));
                                                                                }
                                                                            }}
                                                                            onKeyDown={(e) => handleKeyDown(e, challenge)}
                                                                            placeholder="Digite sua resposta..."
                                                                            spellCheck={false}
                                                                            className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                                                                        />
                                                                    </div>
                                                                    <Button onClick={() => handleCheckAnswer(challenge)} size="sm">
                                                                        Verificar
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {/* Multiline verify button */}
                                                            {!isCorrect && challenge.multiline && (
                                                                <div className="mb-3 mt-2 flex justify-end">
                                                                    <Button onClick={() => handleCheckAnswer(challenge)} size="sm">
                                                                        Verificar
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {isIncorrect && (
                                                                <p className="mb-3 text-sm text-destructive">
                                                                    {challenge.multiline
                                                                        ? 'Alguns elementos estão faltando. Veja a dica!'
                                                                        : 'Resposta incorreta. Tente novamente!'}
                                                                </p>
                                                            )}

                                                            {/* Actions */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex gap-3">
                                                                    {!isCorrect && (
                                                                        <button
                                                                            onClick={() => setShowHints((prev) => ({ ...prev, [challenge.id]: !showHint }))}
                                                                            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                                                        >
                                                                            {showHint ? 'Esconder dica' : 'Ver dica'}
                                                                        </button>
                                                                    )}
                                                                    {isCorrect && (
                                                                        <button
                                                                            onClick={() =>
                                                                                setShowExplanations((prev) => ({
                                                                                    ...prev,
                                                                                    [challenge.id]: !showExplanation,
                                                                                }))
                                                                            }
                                                                            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                                                        >
                                                                            {showExplanation ? 'Esconder explicação' : 'Ver explicação'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {isCorrect && (
                                                                    <button
                                                                        onClick={() => resetChallenge(challenge.id)}
                                                                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                                                    >
                                                                        Refazer
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {showHint && !isCorrect && (
                                                                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                                                                    <span className="font-medium">Dica:</span> {challenge.hint}
                                                                </div>
                                                            )}

                                                            {showExplanation && isCorrect && (
                                                                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-200">
                                                                    {challenge.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                </section>
                            ))}

                            {/* Level complete banner */}
                            {currentLevelCompleted === currentChallenges.length && currentChallenges.length > 0 && (
                                <Card className="p-8 text-center shadow-none">
                                    <div className="mb-2 text-2xl font-bold text-foreground">
                                        {activeLevel < LEVELS.length ? 'Nível completo!' : 'Todos os níveis completos!'}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {activeLevel < LEVELS.length
                                            ? `Você completou o Nível ${activeLevel}. O próximo nível foi desbloqueado!`
                                            : `Você domina Laravel do básico ao avançado. ${totalCompleted} desafios concluídos.`}
                                    </p>
                                    {activeLevel < LEVELS.length && (
                                        <Button className="mt-4" onClick={() => setActiveLevel(activeLevel + 1)}>
                                            Ir para o Nível {activeLevel + 1}
                                        </Button>
                                    )}
                                </Card>
                            )}
                        </div>
                    )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
