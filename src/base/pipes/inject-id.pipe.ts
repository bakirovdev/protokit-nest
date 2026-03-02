import { ArgumentMetadata, Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class InjectIdPipe implements PipeTransform
{
    constructor(@Inject(REQUEST) private readonly request: Request){} 

    transform(value: any, metadata: ArgumentMetadata) {    
        if (this.request && this.request.params?.id) {    
            value.$excludeId = parseInt(this.request.params.id, 10);
        }
        return value;
    }
}