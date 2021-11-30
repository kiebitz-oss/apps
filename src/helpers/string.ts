export const formatSecret = (secret: string) => {
    const parts = secret.match(/.{1,4}/g);

    if (parts === null) {
        return secret;
    }

    return parts.join('  ');
};
