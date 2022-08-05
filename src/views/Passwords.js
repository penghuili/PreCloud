import { Heading, ScrollView, VStack } from 'native-base';
import React from 'react';

import AppBar from '../components/AppBar';

function Passwords() {
  return (
    <>
      <AppBar title="Manage passwords" />
      <ScrollView>
        <VStack space="sm" alignItems="center" px={4} py={4}>
          <Heading>Passwords</Heading>
        </VStack>
      </ScrollView>
    </>
  );
}

export default Passwords;
