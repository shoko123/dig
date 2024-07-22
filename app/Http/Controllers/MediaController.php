<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Implementation\MediaService;

class MediaController extends Controller
{
    protected MediaService $ms;

    public function __construct()
    {
        $this->ms = new MediaService();
    }

    /**
     * Upload an array of media files.
     */
    public function upload(Request $r)
    {
        $this->ms->upload($r->toArray());
    }


    /**
     * Reorder item's related media collection.
     */
    public function reorder(Request $r)
    {
        $this->ms->reorder($r->toArray());
    }

    /**
     * Destroy a single media item
     */
    public function destroy(Request $r)
    {
        $this->ms->destroy($r->toArray());
        //
    }

    /**
     * Edit the media's name and description.
     */
    public function edit(Request $r)
    {
        $this->ms->edit($r->toArray());
    }
}
