import { verify, ecdhDecrypt, randomBytes, hashString } from 'helpers/crypto';

// TODO: Verify the provider data.
export const verifyProviderData = async (providerData: any, keys?: any): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('TODO: Implement `verifyProviderData`.', providerData, keys);
};

export const decryptInvitationData = async (signedData: any, keys: any, tokenData: any) => {
  let found = false;
  for (const providerKeys of keys.lists.providers) {
    if (providerKeys.json.signing === signedData.publicKey) {
      found = true;
      break;
    }
  }
  // TODO: Make Error.
  if (!found) throw 'invalid key';
  const result = await verify([signedData.publicKey], signedData);
  // TODO: Make Error.
  if (!result) throw 'invalid signature';
  signedData.json = JSON.parse(signedData.data);
  const decryptedData = JSON.parse(await ecdhDecrypt(signedData.json, tokenData.privateKey));
  // we store the public key as we need it to reply to the invitation
  decryptedData.publicKey = signedData.json.publicKey;
  return decryptedData;
};

export const hashContactData = async (data: any): Promise<any> => {
  const hashData = {
    name: data.name,
    nonce: randomBytes(32)
  };

  const hashDataJSON = JSON.stringify(hashData);
  const dataHash = await hashString(hashDataJSON);
  return [dataHash, hashData.nonce];
};
