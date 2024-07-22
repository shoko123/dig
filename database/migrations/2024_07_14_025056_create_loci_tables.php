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
