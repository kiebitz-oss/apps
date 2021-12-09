import React from 'react';
import type { FormState } from 'react-hook-form';
import { Button, ButtonProps } from 'ui';

interface FormSubmitButton extends ButtonProps {
    waiting?: boolean;
    formState: FormState<any>;
}

export const FormSubmitButton: React.FC<FormSubmitButton> = ({
    children,
    formState,
    ...props
}) => {
    return (
        <Button
            type="submit"
            variant="success"
            disabled={formState.isSubmitting}
            {...props}
        >
            {children}
        </Button>
    );
};
