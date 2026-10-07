import { describe, expect, it } from 'vitest';
import { mapRolToUserRole } from './LoginForm';

describe('mapRolToUserRole', () => {
  it('traduce el rol "empresa" de la base a "business"', () => {
    // ARRANGE
    const rolDeLaBase = 'empresa';

    // ACT
    const resultado = mapRolToUserRole(rolDeLaBase);

    // ASSERT
    expect(resultado).toBe('business');
  });
});
