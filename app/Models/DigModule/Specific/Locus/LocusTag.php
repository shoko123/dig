<?php

namespace App\Models\DigModule\Specific\Locus;

use Illuminate\Database\Eloquent\Model;

class LocusTag extends Model
{
    public $timestamps = false;

    protected $table = 'locus_tags';

    public function tag_group()
    {
        return $this->belongsTo(LocusTagGroup::class, 'group_id');
    }

    public function item()
    {
        return $this->belongsToMany(Locus::class, 'locus-locus_tags', 'tag_id', 'item_id');
    }
}
