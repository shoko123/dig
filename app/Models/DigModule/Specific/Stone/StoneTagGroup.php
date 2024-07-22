<?php

namespace App\Models\DigModule\Specific\Stone;

use Illuminate\Database\Eloquent\Model;

class StoneTagGroup extends Model
{
    public $timestamps = false;

    protected $table = 'stone_tag_groups';

    public function tags()
    {
        return $this->hasMany(StoneTag::class, 'group_id', 'id');
    }
}
