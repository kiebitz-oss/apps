// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from './button';
import { T } from './t';
import './modal.scss';
import classnames from 'helpers/classnames';
import t from './translations.yml';

export const ModalHeader = ({ onClose, disabled, title }) => {
    if (!title) return null;
    const close = () => !disabled && onClose();
    return (
        <header className="bulma-modal-card-head">
            <p className="bulma-modal-card-title">{title}</p>
            {onClose && (
                <button
                    disabled={disabled}
                    aria-label="Close modal"
                    className="bulma-delete"
                    data-test-id="modal-close"
                    onClick={close}
                />
            )}
        </header>
    );
};

ModalHeader.defaultProps = {
    disabled: false,
};

ModalHeader.propTypes = {
    onClose: PropTypes.func,
    disabled: PropTypes.bool,
    title: PropTypes.any,
};

export class Modal extends React.Component {
    render() {
        const {
            children,
            className,
            title,
            waiting,
            bare,
            disabled,
            saveDisabled,
            cancelDisabled,
            closeDisabled,
            save,
            footer,
            cancel,
            onSave,
            onCancel,
            onClose,
            saveType,
        } = this.props;
        const close = () => !closeDisabled && !disabled && onClose();
        if (bare)
            return (
                <div
                    className={classnames(
                        'bulma-modal',
                        'bulma-is-active',
                        className
                    )}
                >
                    <div
                        className="bulma-modal-background"
                        onClick={close}
                    ></div>
                    <div className="bulma-modal-card">{children}</div>
                </div>
            );
        return (
            <div
                className={classnames(
                    'bulma-modal',
                    'bulma-is-active',
                    className
                )}
            >
                <div className="bulma-modal-background" onClick={close}></div>
                <div className="bulma-modal-card">
                    <ModalHeader
                        title={title}
                        onClose={onClose}
                        disabled={disabled || closeDisabled}
                    />
                    <section className="bulma-modal-card-body">
                        {children}
                    </section>
                    {(onSave || onCancel || footer) && (
                        <footer className="bulma-modal-card-foot">
                            {footer}
                            {onSave && (
                                <Button
                                    type={saveType}
                                    data-test-id="modal-save"
                                    waiting={waiting}
                                    disabled={saveDisabled || disabled}
                                    onClick={() =>
                                        !saveDisabled && !disabled && onSave()
                                    }
                                >
                                    {save || <T t={t} k="modal.save" />}
                                </Button>
                            )}
                            {onCancel && (
                                <Button
                                    type=""
                                    disabled={cancelDisabled || disabled}
                                    onClick={() =>
                                        !cancelDisabled &&
                                        !disabled &&
                                        onCancel()
                                    }
                                >
                                    {cancel || <T t={t} k="modal.cancel" />}
                                </Button>
                            )}
                        </footer>
                    )}
                </div>
            </div>
        );
    }
}

Modal.defaultProps = {
    cancelDisabled: false,
    closeDisabled: false,
    waiting: false,
    bare: false,
    disabled: false,
    saveDisabled: false,
    save: undefined,
    cancel: undefined,
    saveType: 'primary',
};

Modal.propTypes = {
    cancel: PropTypes.node,
    bare: PropTypes.bool,
    cancelDisabled: PropTypes.bool,
    waiting: PropTypes.bool,
    children: PropTypes.node,
    save: PropTypes.node,
    saveType: PropTypes.string,
    saveDisabled: PropTypes.bool,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
};
