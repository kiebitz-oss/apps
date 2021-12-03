// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { Modal } from './modal';
import { Trans } from '@lingui/macro';

class BaseLeaveGuard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ask: false,
        };
    }

    updateRoute = (type, ...rest) => {
        const { ask, confirmed } = this.state;
        const { saveToLeave } = this.props;
        let url, state;
        if (type === 'update') {
            // this was triggered by a 'back' navigation event
            [url, , state] = rest;
        } else if (type === 'navigate') {
            [url, state] = rest;
        } else {
            return;
        }
        if (confirmed) {
            return undefined;
        }
        if (ask) return true;
        if (!saveToLeave(url, state)) {
            this.setState({ ask: true, url: url, state: state });
            return true;
        }
    };

    onBeforeUnload = (e) => {
        const { saveToReload } = this.props;
        const { confirmed } = this.state;
        if (!saveToReload() && !confirmed) {
            e.preventDefault();
            e.returnValue = '';
        }
        return false;
    };

    componentDidUpdate() {
        const { router, onLeave } = this.props;
        const { confirmed, url, state } = this.state;
        if (confirmed) {
            navigate(url, state);
            if (onLeave !== undefined) onLeave();
            this.setState({
                ask: undefined,
                confirmed: undefined,
                url: undefined,
                state: undefined,
            });
        }
    }

    componentDidMount() {
        const { router } = this.props;
        this.watcherId = router.watch(this.updateRoute);
        window.addEventListener('beforeunload', this.onBeforeUnload);
    }

    componentWillUnmount() {
        const { router } = this.props;
        router.unwatch(this.watcherId);
        window.removeEventListener('beforeunload', this.onBeforeUnload);
    }

    render() {
        const { children, text } = this.props;
        const { ask } = this.state;
        const stayOnPage = () => this.setState({ ask: false });
        return (
            <>
                {ask && (
                    <Modal
                        onClose={stayOnPage}
                        onCancel={stayOnPage}
                        onSave={() =>
                            this.setState({ ask: false, confirmed: true })
                        }
                        saveType="danger"
                        save={<Trans id="leave.leave">Seite verlassen</Trans>}
                        cancel={<Trans id="leave.cancel">Zurück</Trans>}
                        title={
                            <Trans id="leave.title">
                                Möchten Sie diese Seite wirklich verlassen?
                            </Trans>
                        }
                    >
                        {text || (
                            <Trans id="leave.text">
                                Es gibt ungespeicherte Änderungen auf der
                                aktuellen Seite. Wollen Sie diese wirklich
                                verlassen?
                            </Trans>
                        )}
                    </Modal>
                )}
                {children}
            </>
        );
    }
}

export const LeaveGuard = BaseLeaveGuard;