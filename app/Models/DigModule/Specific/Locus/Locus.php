<?php

namespace App\Models\DigModule\Specific\Locus;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Locus extends DigModuleModel
{
    protected $table = 'loci';

    public function getShortAttribute()
    {
        return $this->oc_label; //$short;
    }

    public function model_tags()
    {
        return $this->belongsToMany(LocusTag::class, 'locus-locus_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function dateColumns(): array
    {
        return [];
    }
}
