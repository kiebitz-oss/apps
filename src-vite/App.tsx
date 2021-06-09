import React, { useEffect } from 'react';
import { getUserInvitationAccepted } from '../kiebitz/user/invitation';

const App = () => {
  useEffect(() => {
    const invitationAccepted = getUserInvitationAccepted();
    // eslint-disable-next-line no-console
    console.log('We are using Kiebitz logic!', invitationAccepted);
  }, []);

  return <div className="App">Hello from Vite.</div>;
};

export default App;
