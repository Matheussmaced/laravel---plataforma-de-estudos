<?php

namespace App\Http\Controllers;

use App\Models\LearnProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearnController extends Controller
{
    public function index(): Response
    {
        $completedIds = LearnProgress::where('user_id', auth()->id())
            ->pluck('challenge_id')
            ->toArray();

        return Inertia::render('learn', ['completedIds' => $completedIds]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['challenge_id' => 'required|integer|min:1']);

        LearnProgress::firstOrCreate([
            'user_id' => auth()->id(),
            'challenge_id' => $request->challenge_id,
        ]);

        return back();
    }

    public function destroy(int $challengeId): RedirectResponse
    {
        LearnProgress::where('user_id', auth()->id())
            ->where('challenge_id', $challengeId)
            ->delete();

        return back();
    }
}
