<?php

namespace App\Models\DigModule\Specific\Ceramic;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Ceramic extends DigModuleModel
{
    //protected $table = 'ceramics';

    public function getShortAttribute()
    {
        return $this->specialist_description ?? '[No description]';
    }

    public function model_tags()
    {
        return $this->belongsToMany(CeramicTag::class, 'ceramic-ceramic_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}
