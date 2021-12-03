// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ReactElement, Component, createRef } from "react"
import classnames from 'helpers/classnames';
import { A } from './a';
import './dropdown.scss';

interface DropdownMenuProps {
    title?: string;
    children: ReactElement;
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
    icon: string;
    onClick: () => void;
    children: ReactElement;
}

export const DropdownMenuItem = ({ icon, children, onClick }: DropdownMenuItemProps) => (
    <li>
        <A
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
        >
            <span className="bulma-icon">
                <i className={`fas fa-${icon}`}></i>
            </span>
            <span>{children}</span>
        </A>
    </li>
);

interface DropdownState {
    expanded: boolean;
    right: boolean;
}

interface DropdownProps {
    children: ReactElement;
    title: ReactElement;
}

export class Dropdown extends Component<DropdownProps> {
    private ref: any;
    private handler: (event: any) => void;
    state: DropdownState;

    constructor(props: DropdownProps) {
        super(props);
        this.state = {
            expanded: false,
            right: false,
        };

        this.ref = createRef();
        this.handler = (e: any) => this.handleClick(e);
    }

    hide() {
        this.setState({ expanded: false });
        document.removeEventListener('click', this.handler, false);
    }

    show() {
        this.setState({ expanded: true });
        document.addEventListener('click', this.handler, false);
    }

    handleClick(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
    }

    componentWillUnmount() {
        this.hide();
    }

    componentDidMount() {
        // we check where the dropdown is positioned so that we can
        // display the content either left- or right-aligned
        const rect = this.ref.current.getBoundingClientRect();
        if (rect.left > window.innerWidth * 0.5) {
            this.setState({
                right: true,
            });
        }
    }

    handleToggle = (event: any) => {
        const { expanded } = this.state;
        event.preventDefault();
        event.stopPropagation();
        if (!expanded) {
            this.show();
        } else {
            this.hide();
        }
    };

    render() {
        const { expanded, right } = this.state;
        const { title, children } = this.props;

        return (
            <div
                ref={this.ref}
                className={classnames('kip-dropdown', { 'is-right': right })}
            >
                <button
                    aria-expanded={expanded}
                    className="bulma-button"
                    type="button"
                    onClick={this.handleToggle}
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
}
