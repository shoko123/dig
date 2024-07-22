<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Implementation\MediaService;

class AppController extends Controller
{
    /**
     * Init the app.
     */
    public function init()
    {
        return response()->json([
            'bucketUrl' => env('S3_BUCKET_URL'),
            'accessibility' => [
                'readOnly' => env('ACCESSIBILITY_READ_ONLY'),
                'authenticatedUsersOnly' => env('ACCESSIBILITY_AUTHENTICATED_ONLY'),
            ],
            'media_collections' => MediaService::collection_names(),
        ], 200);
    }

    /**
     * Retrieve app's status.
     */
    public function status()
    {
        //
    }

    /**
     * Run test.
     */
    public function test(Request $request)
    {
        //
    }
}
