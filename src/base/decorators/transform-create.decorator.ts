import { Transform } from 'class-transformer';

export function TransformCreate(relationType: string = 'create') {
  return Transform(({ value }) => {
    let result = {};
    if (typeof value === 'object' && !Array.isArray(value)) {        
      result = { [relationType]: value };
    }
    
    if (Array.isArray(value)) {        
      result = { createMany: { data: value } };
    }

    return result;

  });
}