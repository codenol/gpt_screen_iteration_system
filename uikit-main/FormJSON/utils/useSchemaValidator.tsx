import { useEffect, useState } from 'react';
import { type RJSFSchema, type ValidatorType } from '@rjsf/utils';
import { createPrecompiledValidator, customizeValidator } from '@rjsf/validator-ajv8';
import ruLocalizer from 'ajv-i18n/localize/ru';
import { evaluateValidator } from './evaluateValidator';
import { useToast } from '../../hook/useToast';

type TUseValidatorResult = {
    validator: ValidatorType<any, RJSFSchema, any> | undefined;
    validationSchema: RJSFSchema | undefined;
    isLoading: boolean;
    error: unknown;
};

export type TExternalValidatorFunctions = {
    getValidatorId: (formSchema: RJSFSchema) => Promise<string>,
    getValidatorScriptSrc: (id: string) => string
}

/**
 * Хук для работы с валидатором.
 * @param formSchema - схема
 * @param externalFunctions - функции получения валидатора для схемы
 * @returns валидатор, схему, загрузку валидатора и ошибку загрузки
 */
export function useSchemaValidator(
    formSchema: RJSFSchema | undefined,
    externalFunctions: TExternalValidatorFunctions | undefined
): TUseValidatorResult {
    // Если функции для загрузки не передали, то используем обычный русский валидатор.
    const [validator, setValidator] = useState<ValidatorType<any, RJSFSchema, any> | undefined>(
        !externalFunctions
            ? customizeValidator({}, ruLocalizer as any)
            : undefined
    );
    const [validationSchema, setValidationSchema] = useState<RJSFSchema>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const { showToast } = useToast()

    useEffect(() => {
        let isCancelled = false;

        if (!externalFunctions) {
            return () => {
                isCancelled = true;
            }
        }

        if (!formSchema) {
            setValidator(undefined);
            setValidationSchema(undefined);
            setError(null);
            setIsLoading(false);

            return () => {
                isCancelled = true;
            };
        }

        setIsLoading(true);
        setError(null);

        externalFunctions.getValidatorId(formSchema)
            .then((id) => evaluateValidator(id, externalFunctions.getValidatorScriptSrc(id)))
            .then((validatorFns) => {
                if (isCancelled) return;
                const compiledValidator = createPrecompiledValidator(validatorFns, formSchema, ruLocalizer);
                setValidator(compiledValidator);
                setValidationSchema(formSchema);
                setError(null);
            }).catch((err) => {
                if (isCancelled) return;
                showToast({
                    severity: 'error',
                    summary: 'Не удалось загрузить форму',
                    id: 'form-load-error',
                });
                setValidator(undefined);
                setValidationSchema(undefined);
                setError(err);
            }).finally(() => {
                if (isCancelled) return;
                setIsLoading(false);
            })

        return () => {
            isCancelled = true;
        };
    }, [externalFunctions, formSchema]);

    if (!externalFunctions) {
        return {
            validator,
            validationSchema: formSchema,
            isLoading: false,
            error: false
        }
    }

    return {
        validator,
        validationSchema,
        isLoading,
        error,
    };
}