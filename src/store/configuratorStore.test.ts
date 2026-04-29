import { describe, it, expect } from 'vitest';
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration, useConfiguratorStore } from './configuratorStore';

describe('configuratorStore Utils', () => {

  describe('calculateTotalPrice', () => {
    it('deve retornar o preço base para uma configuração padrão', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      // Preço base: R$40.000
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('deve somar o valor das rodas sport', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      // Base (40000) + Sport Wheels (2000)
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('deve somar o valor dos opcionais', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // Base (40000) + Precision Park (5500) + Flux Capacitor (5000) = 50500
      expect(calculateTotalPrice(config)).toBe(50500);
    });

    it('deve calcular corretamente com rodas sport e opcionais', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['flux-capacitor'],
      };
      // Base (40000) + Sport Wheels (2000) + Flux Capacitor (5000) = 47000
      expect(calculateTotalPrice(config)).toBe(47000);
    });
  });

  describe('calculateInstallment', () => {
    it('deve calcular a parcela com 2% de juros compostos mensais em 12x', () => {
      const installment = calculateInstallment(40000);
      // Base (40000) em 12x com 2% a.m. = 3782.38
      expect(installment).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('deve formatar um número como moeda BRL', () => {
      const formatted = formatPrice(40000);
      // Normaliza possíveis espaços não-quebráveis (\u00a0)
      const normalized = formatted.replace(/\u00a0/g, ' ');
      expect(normalized).toContain('R$ 40.000,00');
    });
  });
});

describe('configuratorStore actions', () => {
  it('should toggle an optional feature correctly', () => {
    // Reset state before test
    useConfiguratorStore.getState().resetConfiguration();

    // Initial state has no optionals
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual([]);

    // Toggle a feature (should add it)
    useConfiguratorStore.getState().toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park');

    // Toggle the same feature (should remove it)
    useConfiguratorStore.getState().toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park');
  });

  it('should handle login logic depending on previous orders', () => {
    useConfiguratorStore.setState({ orders: [] });
    useConfiguratorStore.getState().logout();

    // Login fails if there are no orders for the email
    const loginResult1 = useConfiguratorStore.getState().login('test@example.com');
    expect(loginResult1).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();

    // Add a mock order
    useConfiguratorStore.setState({
      orders: [
        {
          id: '1',
          configuration: { exteriorColor: 'glacier-blue', interiorColor: 'carbon-black', wheelType: 'aero', optionals: [] },
          totalPrice: 40000,
          customer: { name: 'Test', surname: 'User', email: 'test@example.com', phone: '', cpf: '', store: '' },
          paymentMethod: 'avista',
          status: 'APROVADO',
          createdAt: new Date().toISOString()
        }
      ]
    });

    // Login succeeds now
    const loginResult2 = useConfiguratorStore.getState().login('test@example.com');
    expect(loginResult2).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('test@example.com');
  });
});