jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { parseScientificNumber } from '../src/lib/server/quizzes';

describe('parseScientificNumber', () => {
  describe('scientific notation parsing', () => {
    it('parses standard "x 10^" notation', () => {
      expect(parseScientificNumber('1.5 x 10^-3')).toEqual({ value: 0.0015, unit: '' });
      expect(parseScientificNumber('1.5 x 10^3')).toEqual({ value: 1500, unit: '' });
      expect(parseScientificNumber('2 × 10^4')).toEqual({ value: 20000, unit: '' }); // Uses '×'
      expect(parseScientificNumber('-3.14 x 10^2')).toEqual({ value: -314, unit: '' });
    });

    it('parses "e" notation', () => {
      expect(parseScientificNumber('1.5e-3')).toEqual({ value: 0.0015, unit: '' });
      expect(parseScientificNumber('1.5E3')).toEqual({ value: 1500, unit: '' });
      expect(parseScientificNumber('-2.5e2')).toEqual({ value: -250, unit: '' });
    });

    it('parses "* 10**" notation', () => {
      expect(parseScientificNumber('1.5 * 10**3')).toEqual({ value: 1500, unit: '' });
      expect(parseScientificNumber('2.5 * 10**-2')).toEqual({ value: 0.025, unit: '' });
    });

    it('parses scientific notation with units', () => {
      expect(parseScientificNumber('1.5 x 10^-3 mol')).toEqual({ value: 0.0015, unit: 'mol' });
      expect(parseScientificNumber('2.5e4 J/mol')).toEqual({ value: 25000, unit: 'j/mol' });
      expect(parseScientificNumber('3.0 x 10^8 m/s')).toEqual({ value: 300000000, unit: 'm/s' });
    });
  });

  describe('standard floating point parsing', () => {
    it('parses integers and floats', () => {
      expect(parseScientificNumber('42')).toEqual({ value: 42, unit: '' });
      expect(parseScientificNumber('-3.14')).toEqual({ value: -3.14, unit: '' });
      expect(parseScientificNumber('0.005')).toEqual({ value: 0.005, unit: '' });
    });

    it('parses numbers with units', () => {
      expect(parseScientificNumber('42 g')).toEqual({ value: 42, unit: 'g' });
      expect(parseScientificNumber('-3.14 °C')).toEqual({ value: -3.14, unit: '°c' });
      expect(parseScientificNumber('100 %')).toEqual({ value: 100, unit: '%' });
      expect(parseScientificNumber('9.81 m/s^2')).toEqual({ value: 9.81, unit: 'm/s^2' });
    });
  });

  describe('excluded cases (chemical equations)', () => {
    it('returns null for chemical equations and reactions', () => {
      expect(parseScientificNumber('2H2 + O2 -> 2H2O')).toBeNull();
      expect(parseScientificNumber('A = B + C')).toBeNull();
      expect(parseScientificNumber('Na + Cl -> NaCl')).toBeNull();
      expect(parseScientificNumber('1.5 + 2.5')).toBeNull(); // Contains " + "
    });
  });

  describe('invalid formats', () => {
    it('returns null for unparseable strings', () => {
      expect(parseScientificNumber('hello')).toBeNull();
      expect(parseScientificNumber('abc 123')).toBeNull();
      expect(parseScientificNumber('x 10^3')).toBeNull(); // Missing base
      expect(parseScientificNumber('')).toBeNull();
      expect(parseScientificNumber('   ')).toBeNull();
    });
  });
});
