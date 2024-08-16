<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RawSqlFilesSeeder extends Seeder
{
    public function run(): void
    {
        $files = [
            // 'media_table_seeder',
            'global_tags_seeder',
            'locus_tables_seeder',
            'stone_tags_seeder',
            'stone_tables_seeder',
            'ceramic_tags_seeder',
            'ceramic_tables_seeder',
        ];

        foreach ($files as $file_name) {
            dump('Running '.$file_name);
            $path = base_path().'/database/seeders/sql/'.$file_name.'.sql';
            $sql = file_get_contents($path);
            DB::unprepared($sql);
        }
    }
}
