import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isCNPJ } from "validation-br";

@ValidatorConstraint({ async: false })
export class IsCNPJConstrait implements ValidatorConstraintInterface {
    validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        return isCNPJ(value);
    }

    defaultMessage(): string {
        return 'CNPJ is invalid';
    }
}

export function IsCNPJ(validationOptions?: ValidationOptions){
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isCNPJ',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsCNPJConstrait,
        })
    };
}