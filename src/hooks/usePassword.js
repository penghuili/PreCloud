import { useTheme } from 'native-base';
import { useEffect, useState } from 'react';
import { getPassword } from '../lib/keychain';

function usePassword() {
  const [password, setPassword] = useState('');

  useEffect(() => {
    getPassword().then(p => {
      console.log('saved password', p)
      setPassword(p || '');
    });
  }, []);

  return password;
}

export default usePassword;
