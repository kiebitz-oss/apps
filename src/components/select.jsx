// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React, { useState } from 'react';
import classnames from 'helpers/classnames';
import './select.scss';

export const RichSelectItem = ({ onClick, option, selected }) => {
    return (
        <div
            tabIndex="0"
            className={classnames('kip-select-item', {
                'kip-is-selected': selected,
            })}
            onClick={onClick}
        >
            {option.title && <h3 className={'m-0'}>{option.title}</h3>}
            {option.description && <p>{option.description}</p>}
        </div>
    );
};

export const RichSelect = ({ id, options, onChange, value }) => {
    const [active, setActive] = useState(false);
    const items = options.map(option => (
        <RichSelectItem
            key={option.value}
            selected={option.value === value}
            option={option}
            onClick={() => onChange(option)}
        />
    ));
    return (
        <div
            id={id}
            className={classnames('kip-select', { 'kip-is-active': active })}
            onClick={() => setActive(!active)}
            aria-selected={() => setActive(true)}
        >
            <span className="bulma-more">
                <span className="kip-select-more">&or;</span>
            </span>
            {items}
        </div>
    );
};
