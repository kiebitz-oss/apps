// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { contactData } from 'apps/user/actions';
import {
    withActions,
    CardFooter,
    CardContent,
    InputField,
    Button,
} from 'components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { t, Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
// import './contact-data.scss';

interface FormData {
    code: string;
}

const ContactDataBase: React.FC<any> = ({ contactDataAction }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState } = useForm<FormData>();

    useEffectOnce(() => {
        reset();
        contactDataAction().then((ct: any) => reset(ct.data));
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const result = await contactDataAction(data);

        // we redirect to the 'verify' step
        navigate(`/user/setup/finalize`);
    };

    return (
        <form
            name="contact-data"
            className="kip-form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <CardContent>
                <InputField
                    {...register('code')}
                    label={t({
                        id: 'contact-data.access-code.label',
                        message: 'Zugangscode',
                    })}
                    description={t({
                        id: 'contact-data.access-code.description',
                        message:
                            'Zugangscodes sind nur für bestimmte Impfstellen notwendig. Wenn kein Zugangscode vorliegt, leer lassen.',
                    })}
                />
            </CardContent>

            <CardFooter>
                <Button
                    type="submit"
                    variant="success"
                    disabled={!formState.isValid}
                    waiting={formState.isSubmitting}
                >
                    {formState.isSubmitting ? (
                        <Trans id="contact-data.saving">Speichere...</Trans>
                    ) : (
                        <Trans id="contact-data.save-and-continue">
                            Weiter
                        </Trans>
                    )}
                </Button>
            </CardFooter>
        </form>
    );
};

export default withActions(ContactDataBase, [contactData]);
