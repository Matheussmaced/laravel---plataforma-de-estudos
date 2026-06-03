import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\LearnController::store
 * @see app/Http/Controllers/LearnController.php:22
 * @route '/learn/progress'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/learn/progress',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LearnController::store
 * @see app/Http/Controllers/LearnController.php:22
 * @route '/learn/progress'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LearnController::store
 * @see app/Http/Controllers/LearnController.php:22
 * @route '/learn/progress'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\LearnController::destroy
 * @see app/Http/Controllers/LearnController.php:34
 * @route '/learn/progress/{challengeId}'
 */
export const destroy = (args: { challengeId: string | number } | [challengeId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/learn/progress/{challengeId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LearnController::destroy
 * @see app/Http/Controllers/LearnController.php:34
 * @route '/learn/progress/{challengeId}'
 */
destroy.url = (args: { challengeId: string | number } | [challengeId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { challengeId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    challengeId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        challengeId: args.challengeId,
                }

    return destroy.definition.url
            .replace('{challengeId}', parsedArgs.challengeId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LearnController::destroy
 * @see app/Http/Controllers/LearnController.php:34
 * @route '/learn/progress/{challengeId}'
 */
destroy.delete = (args: { challengeId: string | number } | [challengeId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const progress = {
    store: Object.assign(store, store),
destroy: Object.assign(destroy, destroy),
}

export default progress