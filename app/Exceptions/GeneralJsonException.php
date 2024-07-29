<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class GeneralJsonException extends Exception
{
    public function report(/*Request $r*/)
    {
        //
    }

    public function render(/*Request $r*/)
    {
        return new JsonResponse([
            'message' => $this->getMessage(),
        ], $this->code);
    }
}
