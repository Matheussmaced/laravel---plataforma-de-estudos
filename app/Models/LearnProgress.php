<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearnProgress extends Model
{
    protected $table = 'learn_progresses';

    public $timestamps = false;

    protected $fillable = ['user_id', 'challenge_id', 'completed_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
