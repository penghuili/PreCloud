import { useEffect, useState } from 'react';

import { getPassword } from '../lib/keychain';

function usePassword() {
  const [password, setPassword] = useState('');

  useEffect(() => {
    getPassword().then(p => {
      setPassword(p || '');
    });
  }, []);

  return password;
}

export default usePassword;
