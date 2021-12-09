import React, { MouseEventHandler } from 'react';
import { Trans } from '@lingui/macro';
import { useCopyToClipboard } from 'react-use';
import { Button, ButtonProps } from 'ui';

interface CopyToClipboardButton extends ButtonProps {
    toCopy: string;
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButton> = ({
    children,
    toCopy,
    ...props
}) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    const onClick: MouseEventHandler<HTMLButtonElement> = () => {
        copyToClipboard(toCopy);
    };

    return (
        <Button
            variant={!!state.error ? 'danger' : 'secondary'}
            disabled={!!state.error || !!state.value}
            {...props}
            onClick={onClick}
        >
            {!!state.error ? (
                <Trans id="ui.copy-failed">Fehlgeschlagen</Trans>
            ) : state.value ? (
                <Trans id="ui.copy-succeeded">In der Zwischenablage</Trans>
            ) : (
                children || <Trans id="ui.copy">Kopieren</Trans>
            )}
        </Button>
    );
};
