<?php

namespace App\Http\Controllers;

enum ServiceEnum
{
    case Init;
    case Read;
    case Mutate;
}
