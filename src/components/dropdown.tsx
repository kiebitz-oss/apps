// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ReactElement, MouseEventHandler, createRef, useEffect, useState } from "react"
import classnames from 'helpers/classnames';
import './dropdown.scss';

interface DropdownMenuProps {
    children: ReactElement;
    title?: string;
}

export const DropdownMenu = ({ title, children }: DropdownMenuProps) => (
    <Dropdown
        title={
            <>
                {title && <span>{title}</span>}
                <span aria-label="More options" className="bulma-icon">
                    <i className="fas fa-caret-down" />
                </span>
            </>
        }
    >
        <ul className="kip-dropdownmenu">{children}</ul>
    </Dropdown>
);

interface DropdownMenuItemProps {
    children: ReactElement;
    icon: string;
    onClick: () => void;
}

export const DropdownMenuItem = ({ icon, children, onClick }: DropdownMenuItemProps) => {
    const eventHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();

        onClick();
    }

    return (
        <li>
            <button onClick={eventHandler} >
                <span className="bulma-icon">
                    <i className={`fas fa-${icon}`}></i>
                </span>
                <span>{children}</span>
            </button>
        </li>
    );
}

interface DropdownProps {
    children: ReactElement;
    title: ReactElement;
}

export const Dropdown = ({title, children}: DropdownProps) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [right, setRight] = useState<boolean>(false);
    const ref = createRef<HTMLDivElement>();

    const hide = () => {
        setExpanded(false);
        document.removeEventListener('click', handleClick, false);
    }

    const show = () => {
        setExpanded(true);
        document.addEventListener('click', handleClick, false);
    }

    const handleClick: EventListener = (event) => {
        event.preventDefault();
        event.stopPropagation();

        hide();
    }

    const handleToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (expanded) {
            hide();
        } else {
            show();
        }
    };

    useEffect(() => {
        if (ref.current) {
            // we check where the dropdown is positioned so that we can
            // display the content either left- or right-aligned
            const rect = ref.current.getBoundingClientRect();
            if (rect.left > window.innerWidth * 0.5) {
                setRight(true);
            }
        }

        return () => {
            hide();
        };
    }, [expanded]);


    return (
        <div
            ref={ref}
            className={classnames('kip-dropdown', { 'is-right': right })}
        >
            <button
                aria-expanded={expanded}
                className="bulma-button"
                type="button"
                onClick={handleToggle}
            >
                {title}
            </button>
            <div
                className={classnames('kip-dropdowncontent', {
                    'kip-dropdownexpanded': expanded,
                })}
            >
                {children}
            </div>
        </div>
    );
}
