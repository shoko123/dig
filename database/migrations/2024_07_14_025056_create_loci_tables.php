<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('loci', function (Blueprint $table) {
            $table->string('id', 20)->primary();
            $table->string('category', 20)->nullable();
            $table->unsignedMediumInteger('a')->default(0);
            $table->unsignedMediumInteger('b')->default(0);
            $table->string('oc_label', 200)->nullable();
            $table->string('square', 50)->nullable();
            $table->string('uri', 200)->nullable();
            $table->string('context_uri', 200)->nullable();
            $table->string('published_date', 50)->nullable();
            $table->string('updated_date', 50)->nullable();

            $table->unique(['category', 'a', 'b']);
        });


        Schema::create('locus_tag_groups', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('name', 40);
            $table->boolean('multiple')->default(0);
        });

        Schema::create('locus_tags', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('name', 50);
            $table->unsignedTinyInteger('group_id');
            $table->unsignedSmallInteger('order_column');

            $table->foreign('group_id')
                ->references('id')
                ->on('locus_tag_groups')
                ->onUpdate('cascade');
        });

        Schema::create('locus-locus_tags', function (Blueprint $table) {
            //$table->unsignedInteger('item_id');
            $table->string('item_id', 15);
            $table->foreign('item_id')->references('id')->on('loci')->onUpdate('cascade');

            $table->unsignedSmallInteger('tag_id')->unsigned();
            $table->foreign('tag_id')->references('id')->on('locus_tags')->onUpdate('cascade');

            $table->primary(['item_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('loci');
    }
};
