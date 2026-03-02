import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsRequiredIf', async: false })
export class IsRequiredIfConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName, relatedValue] = args.constraints;
    const relatedPropertyValue = (args.object as any)[relatedPropertyName];
    
    // If the condition is met, the field is required
    if (relatedPropertyValue === relatedValue) {
      const isValid = value !== null && value !== undefined && value !== '';
      console.log(`Validation result: ${isValid}`);
      return isValid;
    }
      
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName, relatedValue] = args.constraints;
    return `${args.property} is required when ${relatedPropertyName} is ${relatedValue}`;
  }
}

export function IsRequiredIf(
  property: string,        // ← Added missing parameter
  value: any,              // ← Added missing parameter
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property, value],  // ← Now passing both values
      validator: IsRequiredIfConstraint,
    });
  };
}