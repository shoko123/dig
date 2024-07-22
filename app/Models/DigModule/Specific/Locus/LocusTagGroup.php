<?php

namespace App\Models\DigModule\Specific\Locus;

use Illuminate\Database\Eloquent\Model;

class LocusTagGroup extends Model
{
    public $timestamps = false;

    protected $table = 'locus_tag_groups';

    public function tags()
    {
        return $this->hasMany(LocusTag::class, 'group_id', 'id');
    }
}
