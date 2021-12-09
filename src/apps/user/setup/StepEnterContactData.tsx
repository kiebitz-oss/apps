// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { t, Trans } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { contactData } from 'apps/user/actions';
import {
    BoxFooter,
    BoxContent,
    InputField,
    Button,
    Form,
    Box,
    BoxHeader,
    Title,
} from 'ui';
import { withActions } from 'components';

interface FormData {
    code: string;
}

const StepEnterContactDataBase: React.FC<any> = ({ contactDataAction }) => {
    const navigate = useNavigate();
    const methods = useForm<FormData>();
    const { register, handleSubmit, reset, formState } = methods;

    useEffectOnce(() => {
        contactDataAction()
            .then((ct: any) => reset(ct.data))
            .catch(() => reset());
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // @TODO return should be checked
        await contactDataAction(data);

        // we redirect to the 'verify' step
        navigate(`/user/setup/finalize`);
    };

    return (
        <FormProvider {...methods}>
            <Form name="contact-data" onSubmit={handleSubmit(onSubmit)}>
                <Box>
                    <BoxHeader>
                        <Title>
                            <Trans id="wizard.steps.enter-contact-data">
                                Registrierungsdaten eingeben
                            </Trans>
                        </Title>
                    </BoxHeader>

                    <BoxContent>
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
                    </BoxContent>

                    <BoxFooter>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!formState.isValid}
                            waiting={formState.isSubmitting}
                        >
                            {formState.isSubmitting ? (
                                <Trans id="contact-data.saving">
                                    Speichere...
                                </Trans>
                            ) : (
                                <Trans id="contact-data.save-and-continue">
                                    Weiter
                                </Trans>
                            )}
                        </Button>
                    </BoxFooter>
                </Box>
            </Form>
        </FormProvider>
    );
};

export const StepEnterContactData = Object.assign(
    withActions(StepEnterContactDataBase, [contactData]),
    {
        step: 'enter-contact-data',
        title: t({
            id: 'wizard.steps.enter-contact-data',
            message: 'Registrierungsdaten eingeben',
        }),
    }
);
