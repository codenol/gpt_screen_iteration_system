import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';

type ValidationRule = {
    test: (value: string) => boolean;
    message: string;
};

export const regexRule = (regex: RegExp, message: string): ValidationRule => ({
    test: (value: string) => regex.test(value),
    message,
});

export const requiredRule = (message = 'Строка не может быть пустой'): ValidationRule => ({
    test: (value: string) => !value.trim(),
    message,
});

export interface DefaultEditorProps {
    rowData: any;
    field: string;
    rules?: ValidationRule[];
    onChange?: (value: string) => void;
    onSave: (id, value: string) => void;
    onCancel?: () => void;
    customBody?: (value: any) => React.ReactNode;
}

export const DefaultEditor: React.FC<DefaultEditorProps> = ({
    rowData,
    field,
    rules,
    onChange,
    onSave,
    onCancel,
    customBody,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(rowData[field]);
    const [error, setError] = useState<string>('');

    const validateValue = (val: string): string => {
        if (!rules?.length) return '';
        const failedRule = rules.find((rule) => rule.test(val));
        return failedRule?.message ?? '';
    };

    const handleEditClick = () => {
        const validationError = validateValue(rowData[field] || '');
        if (validationError) {
            setError(validationError);
        }
        setIsEditing(true);
    };

    const handleSave = () => {
        const trimmedValue = value.trim();
        const validationError = validateValue(trimmedValue);

        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        onSave(rowData, value);
        setIsEditing(false);
    };
    const handleCancel = () => {
        setValue(rowData[field]);
        setError('');
        setIsEditing(false);
        onCancel?.();
    };

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChange?.(newValue);

        const validationError = validateValue(newValue);
        if (validationError && newValue.length > 0) {
            setError(validationError);
        } else {
            setError('');
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-column gap-2">
                <div className="flex align-items-center">
                    <InputText
                        style={{ width: '100%' }}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        autoFocus
                        maxLength={255}
                        className={!error ? 'p-inputtext' : 'p-invalid'}
                    />
                    <i className={'pi pi-check edit-icon'} onClick={!error ? handleSave : undefined} />
                    <i className="pi pi-times edit-icon" onClick={handleCancel} />
                </div>
                {error && <small className="p-error">{error}</small>}
            </div>
        );
    }

    const displayValue = customBody ? customBody(rowData[field]) : rowData[field] ?? '';
    return (
        <>
            {displayValue}
            <i className={'pi pi-pencil edit-icon'} onClick={handleEditClick}></i>
        </>
    );
};
