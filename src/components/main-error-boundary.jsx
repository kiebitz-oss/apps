// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import PropTypes from 'prop-types';
import { withSettings } from './settings';

import { Message } from './message';
import { CenteredCard } from './card';
import { A } from './a';
import { Trans } from '@lingui/macro';

const BaseDefaultErrorMessage = ({ settings }) => (
    <CenteredCard>
        <Message type="danger">
            <Trans id="errorBoundary.somethingWentWrong">
                Es tut uns schrecklich leid aber es ist ein unerwarteter Fehler passiert. Bitte 
                <A href={`mailto:${settings.get(['supportEmail'])}`} external>kontaktieren Sie uns zur Behebung</A>.
            </Trans>
            {' '}
        </Message>
    </CenteredCard>
);

export const DefaultErrorMessage = withSettings(BaseDefaultErrorMessage);

/**
 * An error boundary for main content. It will try to recover when the router's
 * URL changes.
 */
class BaseMainErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, route: props.route };
    }

    /**
     * Updates state so the next render will show the fallback UI.
     * @param {Error} error
     */
    static getDerivedStateFromError() {
        return { hasError: true };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.route !== state.route) {
            return {
                hasError: false,
                route: props.route,
            };
        }
        return null;
    }

    /**
     * @param {Error} error
     * @param {object} errorInfo
     */
    componentDidCatch(error, errorInfo) {
        // eslint-disable-next-line no-console
        console.debug(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.errorContent;
        }

        return this.props.children;
    }
}

BaseMainErrorBoundary.defaultProps = {
    errorContent: <DefaultErrorMessage />,
};

BaseMainErrorBoundary.propTypes = {
    /**
     * These nodes are shown by default. If an error occours in these
     * nodes or one of their children, errorContent will be shown instead.
     */
    children: PropTypes.node.isRequired,
    /**
     * These nodes are shown as a fallback, when an error inside of `children`
     * occurred.
     */
    errorContent: PropTypes.node,
};

export const MainErrorBoundary = BaseMainErrorBoundary;
