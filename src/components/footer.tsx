import React, { ComponentPropsWithoutRef, ReactChild } from 'react';
import classnames from 'helpers/classnames';
import { A } from './a';
import { T } from './t';
import t from './translations.yml';
import { withSettings } from './settings';
import Settings from '../helpers/settings';

import './footer.scss';

interface FooterProps extends ComponentPropsWithoutRef<'footer'> {
    children?: ReactChild;
    settings: Settings;
}

export const FooterBase = ({ className, settings }: FooterProps) => {
    return (
        <footer className={classnames('kip-footer bulma-footer', className)}>
            <img
                className={'kip-footer-logo'}
                src={settings.get('secondaryLogo')}
                alt={''}
            />
            <div className={'kip-footer-nav'}>
                <FooterLink k={'footer.link.imprint'} />
                <FooterLink k={'footer.link.privacy'} />
            </div>
            <div className={'kip-footer-line'} />
        </footer>
    );
};
interface FooterLinkProps extends ComponentPropsWithoutRef<'a'> {
    settings: Settings;
    k: string;
}

export const FooterLinkBase = ({ settings, k, ...rest }: FooterLinkProps) => {
    return (
        <A
            className={'kip-footer-link'}
            href={settings.t(t, `${k}.href`)}
            external={true}
            target={'_blank'}
            {...rest}
        >
            <T t={t} k={`${k}.label`} />
        </A>
    );
};

export const Footer = withSettings(FooterBase);

export const FooterLink = withSettings(FooterLinkBase);
