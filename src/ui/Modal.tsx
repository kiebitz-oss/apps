// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// @see https://headlessui.dev/react/dialog

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface ModalProps {
    onClose?: Function;
    open?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    children,
    onClose,
    open = true,
}) => {
    const [isOpen, setIsOpen] = useState(open);

    const close = () => {
        if (onClose) {
            onClose();
        }

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onClose={close} className="modal">
            <div className="container">
                <Dialog.Overlay className="overlay" />

                <div className="inner">
                    {children}

                    {/* {(onSave || onCancel || footer) && (
                        <footer className="bulma-modal-card-foot">
                            {footer}
                            {onSave && (
                                <Button
                                    variant={saveType as unknown as any}
                                    data-test-id="modal-save"
                                    waiting={waiting}
                                    disabled={saveDisabled || disabled}
                                    onClick={() => {
                                        if (!saveDisabled && !disabled) {
                                            onSave();
                                            close();
                                        }
                                    }}
                                >
                                    {save || <Trans id="modal.save" />}
                                </Button>
                            )}
                            {onCancel && (
                                <Button
                                    disabled={cancelDisabled || disabled}
                                    onClick={() =>
                                        !cancelDisabled &&
                                        !disabled &&
                                        onCancel()
                                    }
                                >
                                    {cancel || <Trans id="modal.cancel" />}
                                </Button>
                            )}
                        </footer>
                    )} */}
                </div>
            </div>
        </Dialog>
    );
};
