// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { Component, ReactChild } from 'react';
import { Message } from './message';
import { Trans } from '@lingui/macro';
import './loader.scss';

type Resource = {
    status: string | undefined;
};

export const LoadingIndicator = () => (
    <div className="kip-loading-indicator">
        <Message waiting variant="info">
            <Trans id="loader.updating">Aktualisiere Daten...</Trans>
        </Message>
    </div>
);

export const RenderWait = () => (
    <Message waiting variant="info">
        <Trans id="loader.please-wait">Bitte warten, lade Daten...</Trans>
    </Message>
);

export const RenderFailed = () => (
    <Message variant="danger">
        <Trans id="loader.failed">
            Das Laden von Ressourcen ist leider fehlgeschlagen.
        </Trans>
    </Message>
);

function allAre(resources: Resource[], statuses: Array<string>) {
    for (const resource of resources) {
        if (resource === undefined) return false;
        let found = false;
        for (const status of statuses) {
            if (resource.status === status) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

function oneIs(resources: Resource[], status: string) {
    for (const resource of resources) {
        if (resource !== undefined && resource.status === status) return true;
    }
    return false;
}

function isFailed(resources: Resource[]) {
    return oneIs(resources, 'failed');
}

function isLoaded(resources: Resource[]) {
    return allAre(resources, ['loaded', 'updating']);
}

function isUpdating(resources: Resource[]) {
    return oneIs(resources, 'updating');
}

type WithLoaderProps = {
    renderFailed: (resources: Resource[]) => ReactChild;
    renderLoaded: () => ReactChild;
    renderWait: () => ReactChild;
    resources: Resource[];
    onLoad: () => {};
};

interface WithLoaderState {
    showLoader: boolean;
}

export class WithLoader extends Component<WithLoaderProps> {
    private mounted: boolean;
    private state: WithLoaderState;

    static defaultProps = {
        renderWait: RenderWait,
        renderFailed: RenderFailed,
    };

    constructor(props: WithLoaderProps) {
        super(props);
        this.mounted = false;
        this.state = {
            showLoader: false,
        };
        this.update();
    }

    componentDidMount() {
        const { resources } = this.props;
        this.mounted = true;
        // we only show the loader after a certain amonunt of time to avoid
        // fast flickering of fast-loading resources...
        setTimeout(
            () =>
                this.mounted &&
                (!isLoaded(resources) || isUpdating(resources)) &&
                this.setState({ showLoader: true }),
            200
        );
    }

    componentDidUpdate() {
        this.update();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    update = () => {
        const props = this.props;
        if (props.onLoad !== undefined && isLoaded(props.resources)) {
            props.onLoad();
        }
    };

    render() {
        const { resources } = this.props;
        const { showLoader } = this.state;

        if (isLoaded(resources)) {
            const component = this.props.renderLoaded();
            let loadingIndicator;

            if (isUpdating(resources)) {
                loadingIndicator = <LoadingIndicator key="loadingIndicator" />;
            }

            return (
                <>
                    {loadingIndicator}
                    {component}
                </>
            );
        } else if (isFailed(resources)) {
            return this.props.renderFailed(resources);
        }

        if (showLoader) {
            return this.props.renderWait();
        }

        return null;
    }
}
