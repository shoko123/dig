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
        Schema::create('stone_base_types', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
        });

        Schema::create('stone_materials', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
        });

        Schema::create('stones', function (Blueprint $table) {
            $table->increments('id');
            $table->string('area', 50)->nullable();
            $table->string('locus', 50)->nullable();
            $table->string('basket', 50);
            $table->unsignedTinyInteger('stone_no')->default(0);
            $table->string('date', 50)->nullable();
            $table->unsignedInteger('year')->nullable();
            $table->string('prov_notes', 200)->nullable();
            $table->string('type', 50)->nullable();
            $table->string('material_code', 20)->nullable();
            $table->string('dimensions', 250)->nullable();
            $table->unsignedMediumInteger('rim_diameter')->nullable();
            $table->string('description', 500)->nullable();
            $table->string('notes', 250)->nullable();
            $table->string('publication', 250)->nullable();
            $table->unsignedInteger('material_id')->default(1);
            $table->unsignedInteger('base_type_id')->default(1);
            $table->unsignedInteger('order_column')->nullable();
   
            $table->unique(['basket', 'stone_no']);

            $table->foreign('base_type_id')
                ->references('id')->on('stone_base_types')
                ->onUpdate('cascade');

            $table->foreign('material_id')
                ->references('id')->on('stone_materials')
                ->onUpdate('cascade');
        });

        Schema::create('stone_tag_groups', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('name', 40);
            $table->boolean('multiple')->default(0);
        });

        Schema::create('stone_tags', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('name', 50);
            $table->unsignedTinyInteger('group_id');
            $table->unsignedSmallInteger('order_column');

            $table->foreign('group_id')
                ->references('id')
                ->on('stone_tag_groups')
                ->onUpdate('cascade');
        });

        Schema::create('stone-stone_tags', function (Blueprint $table) {
            $table->unsignedInteger('item_id');
            $table->foreign('item_id')->references('id')->on('stones')->onUpdate('cascade');

            $table->unsignedSmallInteger('tag_id')->unsigned();
            $table->foreign('tag_id')->references('id')->on('stone_tags')->onUpdate('cascade');

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
        Schema::dropIfExists('stones');
    }
};
