import React, { useState } from 'react';
import { Rifm } from 'rifm';
import { Input, InputProps } from './Input';

type DateInputProps = InputProps;

const parseDigits = (string) => (string.match(/\d+/g) || []).join('');
const formatDate = (string) => {
    const digits = parseDigits(string);
    const chars = digits.split('');
    return chars.reduce((r, v, index) => (index === 2 || index === 4 ? `${r}.${v}` : `${r}${v}`), '').substr(0, 10);
};

const formatDateWithAppend = (string) => {
    const res = formatDate(string);

    if (string.endsWith('.')) {
        if (res.length === 2) {
            return `${res}.`;
        }

        if (res.length === 5) {
            return `${res}.`;
        }
    }
    return res;
};

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(({ ...inputProps }, ref) => {
    const [value, setValue] = useState('');

    const appendDot = (v) => (v.length === 2 || v.length === 5 ? `${v}.` : v);

    const renderInput = ({ value, onChange }) => (
        <Input ref={ref} {...inputProps} placeholder="tt.mm.jjjj" value={value} onChange={onChange} />
    );

    return (
        <Rifm
            accept={/\d+/g}
            mask={value.length >= 10}
            format={formatDateWithAppend}
            append={appendDot}
            value={value}
            onChange={setValue}
        >
            {renderInput}
        </Rifm>
    );
});
