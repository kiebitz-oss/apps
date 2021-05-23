// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import React, { useState, useEffect } from 'react';
import { SearchSelect, T } from 'components';
import t from './translations.yml';
import './queue-select.scss';

export const QueueSelect = ({
    disabled,
    queues,
    existingQueues,
    addQueue,
    removeQueue,
}) => {
    const [search, setSearch] = useState('');
    const [updated, setUpdated] = useState(false);
    const queueMap = queue => ({
        name: queue.name,
        id: queue.id,
        description: '',
        value: queue.name,
    });

    const generateInitialQueues = () =>
        queues
            .filter(queue => !existingQueues.includes(queue.id))
            .map(queueMap);
    const [candidates, setCandidates] = useState(generateInitialQueues());

    const updateSearch = value => {
        const candidateQueues = queues.filter(
            queue =>
                !existingQueues.includes(queue.id) &&
                (value === '' ||
                    queue.name.toLowerCase().includes(value.toLowerCase()))
        );
        let candidates = candidateQueues.map(queueMap);
        if (candidates.length > 20) candidates = [];
        setCandidates(candidates);
        setSearch(value);
    };

    const queuesById = {};

    queues.forEach(queue => (queuesById[queue.id] = queue));

    const queueItems = existingQueues.map(queueId => {
        const queue = queuesById[queueId];
        return (
            <li key={queue.id}>
                {queue.name}{' '}
                <a
                    onClick={() => {
                        setUpdated(true);
                        removeQueue(queue);
                    }}
                >
                    &#10540;
                </a>
            </li>
        );
    });

    useEffect(() => {
        if (updated) {
            setCandidates(generateInitialQueues());
            setUpdated(false);
        }
    });

    const selectQueue = queue => {
        addQueue(queue);
        setSearch('');
        setUpdated(true);
    };

    return (
        <div className="kip-queue-select">
            <ul className="kip-queues">{queueItems}</ul>
            <SearchSelect
                disabled={disabled}
                search={search}
                onSelect={selectQueue}
                setSearch={updateSearch}
                candidates={candidates}
                label={<T t={t} k="queues.label" />}
                description={<T t={t} k="queues.description" />}
            />
        </div>
    );
};
