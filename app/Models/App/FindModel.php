<?php

namespace App\Models\App;

use App\Models\App\DigModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

use Exception;

abstract class FindModel extends DigModel
{
    public function __construct()
    {
    }
}
