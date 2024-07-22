<?php

namespace App\Models\Tag;

use Illuminate\Database\Eloquent\Model;

class TagGroup extends Model
{
    public $timestamps = false;

    protected $table = 'tag_groups';

    public function tags()
    {
        return $this->hasMany(Tag::class, 'group_id', 'id');
    }
}
