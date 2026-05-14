import type { ValidatorFunctions } from '@rjsf/validator-ajv8';

import ajvRuntimeEqual from 'ajv/dist/runtime/equal';
import {
  parseJson as ajvRuntimeparseJson,
  parseJsonNumber as ajvRuntimeparseJsonNumber,
  parseJsonString as ajvRuntimeparseJsonString,
} from 'ajv/dist/runtime/parseJson';
import ajvRuntimeQuote from 'ajv/dist/runtime/quote';
import ajvRuntimeTimestamp from 'ajv/dist/runtime/timestamp';
import ajvRuntimeUcs2length from 'ajv/dist/runtime/ucs2length';
import ajvRuntimeUri from 'ajv/dist/runtime/uri';
import * as ajvFormats from 'ajv-formats/dist/formats';

// Страшный кусок из документации.
const validatorsBundleReplacements: Record<string, [string, unknown]> = {
  'require("ajv/dist/runtime/equal").default': ['ajvRuntimeEqual', ajvRuntimeEqual],
  'require("ajv/dist/runtime/parseJson").parseJson': ['ajvRuntimeparseJson', ajvRuntimeparseJson],
  'require("ajv/dist/runtime/parseJson").parseJsonNumber': ['ajvRuntimeparseJsonNumber', ajvRuntimeparseJsonNumber],
  'require("ajv/dist/runtime/parseJson").parseJsonString': ['ajvRuntimeparseJsonString', ajvRuntimeparseJsonString],
  'require("ajv/dist/runtime/quote").default': ['ajvRuntimeQuote', ajvRuntimeQuote],
  'require("ajv/dist/runtime/timestamp").default': ['ajvRuntimeTimestamp', ajvRuntimeTimestamp],
  'require("ajv/dist/runtime/ucs2length").default': ['ajvRuntimeUcs2length', ajvRuntimeUcs2length],
  'require("ajv/dist/runtime/uri").default': ['ajvRuntimeUri', ajvRuntimeUri],
  'require("ajv-formats/dist/formats")': ['ajvFormats', ajvFormats],
};

const windowValidatorOnLoad = '__rjsf_validatorOnLoad';
const schemas = new Map<
  string,
  { promise: Promise<ValidatorFunctions>; resolve: (result: ValidatorFunctions) => void}
>();
if (typeof window !== 'undefined') {
  window[windowValidatorOnLoad] = (loadedId: string, fn: (...args: unknown[]) => ValidatorFunctions) => {
    const validator = fn(...Object.values(validatorsBundleReplacements).map(([, dep]) => dep));
    const validatorLoader = schemas.get(loadedId);
    if (validatorLoader) {
      validatorLoader.resolve(validator);
    } else {
      throw new Error(`Unknown validator loaded id="${loadedId}"`);
    }
  };
}

/**
 * Функция загрузки валидатора на страницу
 * @param id - айдишник схемы
 * @param scriptSrc - путь до скрипта валидатора
 * @returns промис валидатора
 */
export function evaluateValidator(id: string, scriptSrc: string): Promise<ValidatorFunctions> {
  const maybeValidator = schemas.get(id);
  if (maybeValidator) return maybeValidator.promise;

  let resolveValidator: (result: ValidatorFunctions) => void;
  let rejectValidator: (reason?: unknown) => void;

  const validatorPromise = new Promise<ValidatorFunctions>((resolve, reject) => {
    resolveValidator = resolve;
    rejectValidator = reject;
  });
  
  const scriptElement = document.createElement('script');

  scriptElement.src = scriptSrc;
  
  schemas.set(id, {
    promise: validatorPromise,
    resolve: resolveValidator!,
  });

  // Чистим лишние <script/> после выполнения кода.
  scriptElement.addEventListener('load', () => {
    document.body.removeChild(scriptElement)
  })
  scriptElement.addEventListener('error', (e) => {
    schemas.delete(id)
    rejectValidator(e)
    document.body.removeChild(scriptElement)
  });

  document.body.appendChild(scriptElement);

  return validatorPromise;
}
