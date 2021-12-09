import { Trans } from '@lingui/macro';
import React from 'react';

export const UploadInput: React.FC = () => {
    return (
        <label
            htmlFor="file-upload"
            className="cursor-pointer button primary md"
        >
            <input
                ref={fileInput}
                onChange={onFileChange}
                id="file-upload"
                className="hidden"
                type="file"
                accept=".enc"
            />

            {(fileInput.current?.files?.[0] !== undefined && (
                <Trans id="load-backup.input.change">
                    {fileInput.current?.files?.[0].name}
                </Trans>
            )) || <Trans id="load-backup.input">Sicherungsdatei wählen</Trans>}
        </label>
    );
};
