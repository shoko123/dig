<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tag_groups', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->string('name', 40);
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('name', 60);
            $table->unsignedSmallInteger('group_id');
            $table->unsignedInteger('order_column')->nullable();
            $table->foreign('group_id')->references('id')->on('tag_groups')->onUpdate('cascade');
        });

        Schema::create('taggables', function (Blueprint $table) {
            $table->unsignedInteger('tag_id');
            $table->string('taggable_type', 15);
            $table->string('taggable_id', 15);
            $table->unique(['tag_id', 'taggable_id', 'taggable_type']);

            $table->foreign('tag_id')->references('id')->on('tags')
                //->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down()
    {
        Schema::drop('taggables');
        Schema::drop('tags');
        Schema::drop('tag_groups');
    }
};
