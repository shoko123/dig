<?php

namespace App\Models\Tag;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public $timestamps = false;

    protected $table = 'tags';

    public function tag_group()
    {
        return $this->belongsTo(TagGroup::class, 'group_id');
    }

    public function ceramics()
    {
        return $this->morphedByMany('Ceramic', 'taggable');
    }

    public function stones()
    {
        return $this->morphedByMany('Stone', 'taggable');
    }

    public function loci()
    {
        return $this->morphedByMany('Locus', 'taggable');
    }
}
