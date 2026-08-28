const GLOVO_COMMISSION_RATE = 0.3;
export const calculateGlovoNet = (gross: number) => (gross || 0) * (1 - GLOVO_COMMISSION_RATE);
export const calculateEffectiveRevenue = (total: number, glovoGross: number) =>
  (total || 0) - ((glovoGross || 0) - calculateGlovoNet(glovoGross));
export const calculateCashDesk = (total: number, card: number, glovoGross: number) =>
  calculateEffectiveRevenue(total, glovoGross) - (card || 0) - calculateGlovoNet(glovoGross);
