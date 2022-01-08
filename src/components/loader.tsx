// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { Component, ReactChild } from 'react';
import { Message } from './message';
import { Status } from 'vanellus';
import { T } from './t';
// @ts-ignore
import t from './translations.yml';
import './loader.scss';

type Resource = {
    status: string | undefined;
};

export const LoadingIndicator = () => (
    <div className="kip-loading-indicator">
        <Message waiting type="info">
            <T t={t} k="loader.updating" />
        </Message>
    </div>
);

export const RenderWait = () => (
    <Message waiting type="info">
        <T t={t} k="loader.please-wait" />
    </Message>
);

export const RenderFailed = () => (
    <Message type="danger">
        <T t={t} k="loader.failed" />
    </Message>
);

function allAre(resources: Resource[], statuses: Array<string>) {
    for (const resource of resources) {
        if (resource === null) return false;
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
        if (resource !== null && resource.status === status) return true;
    }
    return false;
}

function isFailed(resources: Resource[]) {
    return oneIs(resources, Status.Failed);
}

function isLoaded(resources: Resource[]) {
    return allAre(resources, [Status.Succeeded, Status.Updating]);
}

function isUpdating(resources: Resource[]) {
    return oneIs(resources, Status.Updating);
}

type WithLoaderProps = {
    renderFailed: (resources: Resource[]) => ReactChild;
    renderLoaded: () => ReactChild;
    renderWait: () => ReactChild;
    resources: Resource[];
    onLoad: () => {};
};

type WithLoaderState = {
    showLoader: boolean;
};

export class WithLoader extends Component<WithLoaderProps, WithLoaderState> {
    private mounted: boolean;

    static defaultProps = {
        renderWait: RenderWait,
        renderFailed: RenderFailed,
    };

    constructor(props: WithLoaderProps) {
        super(props);
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
            if (isUpdating(resources))
                loadingIndicator = <LoadingIndicator key="loadingIndicator" />;
            return (
                <React.Fragment>
                    {loadingIndicator}
                    {component}
                </React.Fragment>
            );
        } else if (isFailed(resources))
            return this.props.renderFailed(resources);
        if (showLoader) return this.props.renderWait();
        return <React.Fragment />;
    }
}
