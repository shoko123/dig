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
            $table->unsignedTinyInteger('id')->primary();
            $table->string('name', 50);
        });

        Schema::create('stone_materials', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('name', 50);
        });

        Schema::create('stone_catalogers', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('name', 50);
        });

        Schema::create('stones', function (Blueprint $table) {
            $table->string('id', 15)->primary();

            $table->unsignedTinyInteger('id_year')->default(1);
            $table->unsignedTinyInteger('id_access_no')->default(1);
            $table->unsignedMediumInteger('id_object_no')->default(1);
            ////
            $table->string('square', 50)->nullable();
            $table->string('context', 50)->nullable();
            $table->date('excavation_date')->nullable();
            $table->string('occupation_level', 10)->nullable();
            $table->string('cataloger_material', 50)->nullable();
            $table->unsignedTinyInteger('whole')->default(1);
            $table->string('cataloger_typology', 50)->nullable();
            $table->string('cataloger_description', 350)->nullable();
            $table->string('conservation_notes', 250)->nullable();
            $table->string('weight', 50)->nullable();
            $table->string('length', 50)->nullable();
            $table->string('width', 50)->nullable();
            $table->string('height', 50)->nullable();
            $table->string('diameter', 50)->nullable();
            $table->string('dimension_notes', 250)->nullable();
            $table->string('cultural_period', 50)->nullable();
            $table->string('excavation_object_id', 50)->nullable();
            $table->string('old_museum_id', 50)->nullable();
            $table->unsignedTinyInteger('cataloger_id')->default(1);
            $table->date('catalog_date')->nullable();
            $table->string('specialist_description', 250)->nullable();
            $table->date('specialist_date')->nullable();
            $table->string('thumbnail', 150)->nullable();
            $table->string('uri', 100)->nullable();
            $table->unsignedTinyInteger('base_type_id')->default(1);
            $table->unsignedTinyInteger('material_id')->default(1);

            $table->unique(['id_year', 'id_access_no', 'id_object_no']);

            $table->foreign('base_type_id')
                ->references('id')->on('stone_base_types')
                ->onUpdate('cascade');

            $table->foreign('material_id')
                ->references('id')->on('stone_materials')
                ->onUpdate('cascade');

            $table->foreign('cataloger_id')
                ->references('id')->on('stone_catalogers')
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
            //$table->unsignedInteger('item_id');
            $table->string('item_id', 15);
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
