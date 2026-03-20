import { describe, it, expect } from 'vitest';
import { mask, unmask } from '../game/utils/Security';
import React from 'react';

describe('Security Utils (Masking)', () => {
    
    it('debe transformar el valor original (enmascarar)', () => {
        const originalValue = 100;
        const masked = mask(originalValue);
        expect(masked).not.toBe(originalValue);
        expect(masked).toBe(11256135); 
    });

    it('debe ser reversible: unmask(mask(x)) === x', () => {
        const values = [0, 1, 42, 9999, -1, 0xffffff];
        values.forEach(val => {
            const masked = mask(val);
            const unmasked = unmask(masked);
            expect(unmasked).toBe(val);
        });
    });

    it('debe mantener la consistencia (misma entrada, misma salida)', () => {
        const value = 12345;
        expect(mask(value)).toBe(mask(value));
    });

    it('debe funcionar con valores extremos (Boundary testing)', () => {
        const maxInt = Number.MAX_SAFE_INTEGER;
        const masked = mask(maxInt);
        const unmasked = unmask(masked);
        expect(unmasked).toBe(maxInt | 0);
    });
});