// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import classnames from 'classnames'
import PropTypes from 'prop-types';

import './sidebar.scss';

export class Sidebar extends React.Component {
    render() {
        const { active, collapsed, children } = this.props;
        return (
            <div
                className={classnames(
                    'kip-sidebar',
                    { 'kip-sidebar--active': active },
                    { 'kip-sidebar--collapsed': collapsed }
                )}
            >
                {children}
            </div>
        );
    }
}

Sidebar.defaultProps = {
    collapsed: false,
};

Sidebar.propTypes = {
    /** Mobile only: Should the sidebar collapse to a column of icons? */
    active: PropTypes.bool,
    /** Desktop only: Should the sidebar collapse to a column of icons? */
    collapsed: PropTypes.bool,
};
