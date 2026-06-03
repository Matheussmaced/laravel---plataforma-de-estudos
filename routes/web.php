<?php

use App\Http\Controllers\LearnController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/learn', [LearnController::class, 'index'])->name('learn');
    Route::post('/learn/progress', [LearnController::class, 'store'])->name('learn.progress.store');
    Route::delete('/learn/progress/{challengeId}', [LearnController::class, 'destroy'])->name('learn.progress.destroy');

});

require __DIR__.'/settings.php';
