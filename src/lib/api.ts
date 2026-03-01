export async function fetchAllData() {
  // Simulate network
  await new Promise(r => setTimeout(r, 500));
  return getMockData();
}

function getMockData() {
  const data: any[] = [];
  const locs = ['Oświęcim', 'Wilamowice'];
  const emps = ["Paweł", "Radek", "Sebastian", "Tomek"];

  const mockCatalog = [
      { name: "Bułki", type: "inventory", max: 50 },
      { name: "Mięso: Duże", type: "order", max: 30 },
      { name: "Frytki", type: "order", max: 10 },
      { name: "Pepsi", type: "order", max: 12 },
      { name: "Folia", type: "order", max: 2 },
      { name: "Drwal: Sos Jalapeño", type: "order", max: 5 },
      { name: "Serwetki", type: "order", max: 3 },
      { name: "Torby: Duże", type: "order", max: 5 },
      { name: "Sos: Czosnek", type: "order", max: 8 }
  ];

  for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;

      locs.forEach(l => {
          if (Math.random() > 0.1) {
              const rev = Math.floor(Math.random() * 3000) + 500;
              const products: Record<string, number> = {};
              
              mockCatalog.forEach(p => {
                  if (Math.random() > 0.7) {
                      if (p.type === 'inventory') {
                          products[p.name] = Math.floor(Math.random() * (p.max - 10)) + 10;
                      } else {
                          products[p.name] = Math.floor(Math.random() * (p.max / 2)) + 1;
                      }
                  }
              });

              data.push({
                  location: l,
                  date: dateStr,
                  revenue: rev,
                  cardRevenue: Math.floor(rev * 0.4),
                  employees: { [emps[Math.floor(Math.random()*emps.length)]]: "12:00-20:00" },
                  products: products
              });
          }
      });
  }
  return data;
}
