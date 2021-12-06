// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ReactElement } from 'react';
import { Button } from './button';
import './modal.scss';
import classnames from 'helpers/classnames';
import { Trans } from '@lingui/macro';

interface ModalProps {
    children: ReactElement;
    className: string;
    title: string;
    waiting?: boolean;
    disabled?: boolean;
    footer?: ReactElement;
    saveDisabled?: boolean;
    onSave?: () => void;
    save?: ReactElement;
    cancelDisabled?: boolean;
    onCancel?: () => void;
    cancel?: ReactElement;
    closeDisabled?: boolean;
    onClose?: () => void;
    saveType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const closeFromProps = ({ closeDisabled = false, disabled, onClose }: ModalProps) =>
    () => !closeDisabled && !disabled && onClose && onClose()

const BareModal = (props: ModalProps) =>
    <div
        className={classnames(
            'bulma-modal',
            'bulma-is-active',
            props.className
        )}
    >
        <div
            className="bulma-modal-background"
            onClick={closeFromProps(props)}
        ></div>
        <div className="bulma-modal-card">{props.children}</div>
    </div>

const DefaultModal = ({
            children,
            className,
            title,
            waiting = false,
            disabled = false,
            saveDisabled = false,
            cancelDisabled = false,
            save,
            footer,
            cancel,
            onSave,
            onCancel,
            onClose,
            saveType = 'primary'}: ModalProps) =>
    <div
        className={classnames(
            'bulma-modal',
            'bulma-is-active',
            className
        )}
    >
        <div className="bulma-modal-background" onClick={close}></div>
        <div className="bulma-modal-card">
            {title && (
                <header className="bulma-modal-card-head">
                    <p className="bulma-modal-card-title">{title}</p>
                    {onClose && (
                        <Button
                            variant="info"
                            aria-label="Close modal"
                            className="bulma-delete"
                            data-test-id="modal-close"
                            onClick={close}
                        />
                    )}
                </header>
            )}
            <section className="bulma-modal-card-body">
                {children}
            </section>
            {(onSave || onCancel || footer) && (
                <footer className="bulma-modal-card-foot">
                    {footer}
                    {onSave && (
                        <Button
                            variant={saveType}
                            data-test-id="modal-save"
                            waiting={waiting}
                            disabled={saveDisabled || disabled}
                            onClick={() =>
                                !saveDisabled && !disabled && onSave()
                            }
                        >
                            {save || (
                                <Trans id="modal.save">Speichern</Trans>
                            )}
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
                            {cancel || (
                                <Trans id="modal.cancel">
                                    Abbrechen
                                </Trans>
                            )}
                        </Button>
                    )}
                </footer>
            )}
        </div>
    </div>

export const Modal = ({ bare = false, ...props }: ModalProps & { bare?: boolean }) => {
    if (bare) {
        return BareModal(props);
    } else {
        return DefaultModal(props);
    }
}
