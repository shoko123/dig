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
        Schema::create('ceramic_base_types', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('name', 50);
        });

        Schema::create('ceramics', function (Blueprint $table) {
            $table->string('id', 15)->primary();
            $table->unsignedTinyInteger('id_year')->default(1);
            $table->unsignedMediumInteger('id_object_no')->default(1);
            $table->string('field_description', 200)->nullable();
            $table->string('specialist_description', 200)->nullable();
            $table->string('notes', 200)->nullable();
            $table->unsignedTinyInteger('base_type_id')->default(1);

            $table->foreign('base_type_id')
                ->references('id')->on('ceramic_base_types')
                ->onUpdate('cascade');
        });

        Schema::create('ceramic_tag_groups', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('name', 40);
            $table->boolean('multiple')->default(0);
        });

        Schema::create('ceramic_tags', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('name', 50);
            $table->unsignedTinyInteger('group_id');
            $table->unsignedSmallInteger('order_column');

            $table->foreign('group_id')
                ->references('id')
                ->on('ceramic_tag_groups')
                ->onUpdate('cascade');
        });

        Schema::create('ceramic-ceramic_tags', function (Blueprint $table) {
            $table->string('item_id', 15);
            $table->foreign('item_id')->references('id')->on('ceramics')->onUpdate('cascade');

            $table->unsignedSmallInteger('tag_id')->unsigned();
            $table->foreign('tag_id')->references('id')->on('ceramic_tags')->onUpdate('cascade');

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
        Schema::dropIfExists('ceramic');
    }
};
