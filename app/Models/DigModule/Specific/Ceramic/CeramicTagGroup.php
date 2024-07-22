<?php

namespace App\Models\DigModule\Specific\Ceramic;

use Illuminate\Database\Eloquent\Model;

class CeramicTagGroup extends Model
{
    public $timestamps = false;

    protected $table = 'ceramic_tag_groups';

    public function tags()
    {
        return $this->hasMany(CeramicTag::class, 'group_id', 'id');
    }
}
