<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppController;
use App\Http\Controllers\DigModule\DigModuleInitController;
use App\Http\Controllers\DigModule\DigModuleReadController;
use App\Http\Controllers\DigModule\DigModuleMutateController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\TagController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//open routes

Route::get('app/init', [AppController::class, 'init']);

//read only APIs. Accessible when config.accessibility.authenticatedUsersOnly is false, or authenticated.
//Route::group(['middleware' => ['read.accessibility']], function () {
Route::post('model/init', [DigModuleInitController::class, 'init']);
Route::post('model/index', [DigModuleReadController::class, 'index']);
Route::post('model/page', [DigModuleReadController::class, 'page']);
Route::post('model/show', [DigModuleReadController::class, 'show']);
Route::post('model/carousel', [MediaController::class, 'carousel']);
//});


// Route::get('about/me', [PermissionController::class, 'me'])->middleware('auth:sanctum');

//mutator APIs
// Route::group(['middleware' => ['auth:sanctum', 'verified']], function () {
Route::post('model/store', [DigModuleMutateController::class, 'store']);
Route::put('model/store', [DigModuleMutateController::class, 'store']);
Route::post('model/destroy', [DigModuleMutateController::class, 'destroy']);
Route::post('tags/sync', [TagController::class, 'sync']);
Route::post('media/upload', [MediaController::class, 'upload']);
Route::post('media/destroy', [MediaController::class, 'destroy']);
Route::post('media/edit', [MediaController::class, 'edit']);
Route::post('media/reorder', [MediaController::class, 'reorder']);
// });


//more open routes
Route::post('test/status', [AppController::class, 'status']);
Route::post('test/run', [AppController::class, 'run']);