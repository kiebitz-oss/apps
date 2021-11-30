// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import React from 'react';
import { RetractingLabelInput } from './retracting-label-input';
import './search-select.scss';
import { Trans } from '@lingui/macro';

export const SearchSelect = ({
    search,
    disabled,
    label,
    description,
    onSelect,
    setSearch,
    candidates,
}) => {
    const items = candidates.map(candidate => (
        <li
            onClick={() => onSelect(candidate)}
            key={candidate.name}
            className="kip-candidate"
        >
            {candidate.value}
            {candidate.description && <p>{candidate.description}</p>}
        </li>
    ));

    let searchCandidates;
    if (items.length > 0)
        searchCandidates = <ul className="kip-candidates">{items}</ul>;
    else {
        searchCandidates = (
            <ul className="kip-candidates">
                <li className="kip-candidate" key="not-found">
                    <Trans id="search-select.no-candidates">Keine Kandidaten gefunden</Trans>
                </li>
            </ul>
        );
    }

    return (
        <div className="kip-search-select">
            <RetractingLabelInput
                onChange={setSearch}
                onEnter={e => e.preventDefault()}
                label={label}
                disabled={disabled}
                description={description}
                autoComplete="off"
                value={search}
            >
                {searchCandidates}
            </RetractingLabelInput>
        </div>
    );
};
