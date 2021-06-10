import React, { ReactNode } from 'react';
import { FormProvider, useForm, UseFormProps } from 'react-hook-form';
import cn from 'classnames';
import { Spinner } from './Spinner';

interface Props {
    children: ReactNode;
    defaultValues?: any;
    isLoading?: boolean;
    onSubmit: (data) => void;
    id?: string;
}

// See: https://react-hook-form.com/api for options
const formConfigs: UseFormProps = {
    mode: 'onSubmit',
    reValidateMode: 'onChange',
};

export const Form = (props: Props) => {
    const { defaultValues, children, onSubmit, isLoading, id } = props;
    const methods = useForm({ ...formConfigs, defaultValues });
    return (
        <FormProvider {...methods}>
            {isLoading && <Spinner />}

            {/* hide instead of unmount to not lose form state on error */}
            <div className={cn({ 'opacity-0': isLoading, 'h-1': isLoading })}>
                <form onSubmit={methods.handleSubmit(onSubmit)} id={id}>
                    {children}
                </form>
            </div>
        </FormProvider>
    );
};
