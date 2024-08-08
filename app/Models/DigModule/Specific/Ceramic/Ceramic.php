<?php

namespace App\Models\DigModule\Specific\Ceramic;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Ceramic extends DigModuleModel
{
    protected $table = 'ceramics';

    public function model_tags()
    {
        return $this->belongsToMany(CeramicTag::class, 'ceramic-ceramic_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function dateColumns(): array
    {
        return [];
    }

    public function getShortAttribute(): string
    {
        return $this->specialist_description ?? '[No description]';
    }

    public function getDerivedIdAttribute(): string
    {
        return $this->id_year . '.' . $this->id_object;
    }
}
