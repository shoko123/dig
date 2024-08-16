<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = ['create', 'update', 'delete', 'media', 'tag'];
        $models = ['Locus', 'Stone', 'Ceramic'];

        foreach ($models as $m) {
            $role = Role::create(['name' => $m.' manager']);
            foreach ($permissions as $p) {
                $p_name = $m.'-'.$p;
                Permission::create(['name' => $p_name]);
                $role->givePermissionTo($p_name);
            }
        }

        $editor = User::findOrFail(2);
        $editor->assignRole('Locus Manager', 'Stone Manager');
    }
}
