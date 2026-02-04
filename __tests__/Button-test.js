import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../src/components/ui/Button';

describe('Button', () => {
  it('renders the title correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });
});
