import React from 'react';
import { Section, Title, Text } from 'ui';

interface PageHeader {
    title: string;
    subTitle: string;
    text: string;
}

export const PageHeader: React.FC<PageHeader> = ({ title, subTitle, text }) => {
    return (
        <Section className="py-16 px-4 mx-auto max-w-7xl text-center sm:py-24 sm:px-6 lg:px-8">
            <Title className="text-base font-semibold tracking-wide text-primary-600 uppercase">
                {subTitle}

                <p className="mt-1 text-4xl font-extrabold text-gray-900 normal-case sm:text-5xl sm:tracking-tight lg:text-6xl">
                    {title}
                </p>
            </Title>

            <Text className="mx-auto mt-5 max-w-xl text-xl text-gray-500">
                {text}
            </Text>
        </Section>
    );
};
