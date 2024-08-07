<?php

namespace App\Models\DigModule\Specific\Stone;

use App\Models\DigModule\DigModuleModel;
use App\Models\Tag\Tag;

class Stone extends DigModuleModel
{
    //protected $table = 'stones';

    public function model_tags()
    {
        return $this->belongsToMany(StoneTag::class, 'stone-stone_tags', 'item_id', 'tag_id');
    }

    public function global_tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function baseType()
    {
        return $this->belongsTo(StoneBaseType::class, 'base_type_id');
    }

    public function material()
    {
        return $this->belongsTo(StoneMaterial::class, 'material_id');
    }

    public function cataloger()
    {
        return $this->belongsTo(StoneCataloger::class, 'cataloger_id');
    }

    public function dateColumns(): array
    {
        return ['excavation_date', 'catalog_date'];
    }

    public function getDerivedIdAttribute(): string
    {
        return 'B' . (string)$this->id_year + 2000 . '.' . $this->id_access_no . '.' . $this->id_object_no;
    }

    public function getShortAttribute(): string
    {
        return $this->cataloger_description ?? '[No description]';
    }
}
