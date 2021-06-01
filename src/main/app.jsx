// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { Fragment } from 'react';
import Menu from 'main/sidebar-menu';
import PropTypes from 'prop-types';
import Notification from 'main/notifications';
import TitleActions from 'actions/title';
import {
    withActions,
    withRouter,
    withSettings,
    withRoute,
    Message,
    Button,
    TopNavbar,
    Sidebar,
    T,
    CenteredCard,
    CardContent,
    SidebarContainer,
} from 'components';

import t from './translations.yml';
import { user } from 'actions';
import { encodeQueryData } from 'helpers/url';
import './app.scss';

class App extends React.Component {
    constructor(props) {
        super(props);
        const { settings } = props;
        this.state = {
            sidebarActive: false,
            outdated: false,
        };
        this.checkRoute(true);
        this.mounted = false;
        this.commitSHA = settings.get('commitSHA');
    }

    handleSidebarToggle = () => {
        this.setState({ sidebarActive: !this.state.sidebarActive });
    };

    checkRoute(redirect) {
        const { route } = this.props;
        if (route.handler.authentication !== undefined) {
            if (user === undefined) {
                if (redirect) {
                    const data = encodeQueryData({ redirectTo: route.path });
                    router.navigateToUrl(`/login#${data}`);
                }
                return false;
            }
        }
        return true;
    }

    componentDidMount() {
        this.mounted = true;
        const { settings } = this.props;
        const checkSettings = () => {
            if (!this.mounted) return;
            if (settings.get('commitSHA') !== this.commitSHA)
                this.setState({ outdated: true });
            else setTimeout(checkSettings, 60000);
        };

        setTimeout(checkSettings, 60000);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate() {
        this.checkRoute(true);
    }

    render() {
        const { settings, route, router, user } = this.props;
        const { outdated } = this.state;
        const RouteComponent = route.handler.component;

        let notice;

        if (outdated) {
            notice = (
                <Message className="kip-outdated-notice" type="warning">
                    <p>
                        <T t={t} k="outdated" />
                    </p>
                    <Button type="info" onClick={() => location.reload()}>
                        <T t={t} k="reload" />
                    </Button>
                </Message>
            );
        }

        if (!this.checkRoute())
            return (
                <CenteredCard>
                    <CardContent>
                        <T t={t} k="redirecting" />
                    </CardContent>
                </CenteredCard>
            );

        let content;
        if (route.handler.isSimple)
            content = this.renderSimple(RouteComponent, route.handler.props);
        else content = this.renderFull(RouteComponent, route.handler.props);

        return (
            <Fragment>
                {notice}
                {content}
            </Fragment>
        );
    }

    renderFull(Component, props) {
        const { menu, settings, title } = this.props;
        const { sidebarActive } = this.state;
        const { route } = this.props;

        const mainMenu = new Map(menu.get('main'));
        const navMenu = new Map([]);

        // we add the normal "nav" menu entries...
        menu.get('nav').forEach((v, k) => navMenu.set(k, v));

        const content = (
            <div className="bulma-container">
                <Component {...props} route={route} />
            </div>
        );
        const sidebar = (
            <Sidebar
                active={sidebarActive}
                collapsed={true}
                mainMenu={mainMenu}
                navMenu={navMenu}
            >
                <Menu menu={mainMenu} onToggle={this.handleSidebarToggle} />
                <Menu
                    menu={navMenu}
                    onToggle={this.handleSidebarToggle}
                    mobileOnly
                />
            </Sidebar>
        );
        return (
            <Fragment>
                <Notification />
                <TopNavbar
                    active={sidebarActive}
                    menu={navMenu}
                    settings={settings}
                    title={title}
                    onToggle={this.handleSidebarToggle}
                />
                <SidebarContainer
                    active={true}
                    sidebar={sidebar}
                    content={content}
                />
            </Fragment>
        );
    }

    renderSimple(Component, props) {
        const { route, settings } = this.props;
        return (
            <React.Fragment>
                <div className="kip-with-logo-wrapper">
                    <div className="kip-logo-wrapper">
                        <img
                            className="kip-logo"
                            src={settings.get('whiteLogo')}
                        />
                    </div>
                    <Component {...props} route={route} settings={settings} />
                </div>
            </React.Fragment>
        );
    }
}

App.propTypes = {
    menu: PropTypes.shape({
        get: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.shape({
        component: PropTypes.any,
        props: PropTypes.object,
        title: PropTypes.string,
    }).isRequired,
    settings: PropTypes.shape({
        t: PropTypes.func.isRequired,
    }).isRequired,
};

export default withSettings(
    withActions(withRoute(withRouter(App)), [TitleActions, user])
);
