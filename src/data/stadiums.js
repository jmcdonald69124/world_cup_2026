export const STADIUMS = [
  { id: 1, name: "MetLife Stadium", city: "East Rutherford, NJ", country: "USA", capacity: 82500, lat: 40.8135, lon: -74.0745, surface: "Grass", openedYear: 2010, hostingFinal: true, image: null },
  { id: 2, name: "AT&T Stadium", city: "Arlington, TX", country: "USA", capacity: 80000, lat: 32.7473, lon: -97.0945, surface: "Artificial", openedYear: 2009, hostingFinal: false, image: null },
  { id: 3, name: "SoFi Stadium", city: "Inglewood, CA", country: "USA", capacity: 70240, lat: 33.9535, lon: -118.3392, surface: "Grass", openedYear: 2020, hostingFinal: false, image: null },
  { id: 4, name: "Rose Bowl", city: "Pasadena, CA", country: "USA", capacity: 88565, lat: 34.1614, lon: -118.1676, surface: "Grass", openedYear: 1922, hostingFinal: false, image: null },
  { id: 5, name: "Levi's Stadium", city: "Santa Clara, CA", country: "USA", capacity: 68500, lat: 37.4033, lon: -121.9694, surface: "Grass", openedYear: 2014, hostingFinal: false, image: null },
  { id: 6, name: "Arrowhead Stadium", city: "Kansas City, MO", country: "USA", capacity: 76416, lat: 39.0489, lon: -94.4839, surface: "Grass", openedYear: 1972, hostingFinal: false, image: null },
  { id: 7, name: "Lincoln Financial Field", city: "Philadelphia, PA", country: "USA", capacity: 69796, lat: 39.9008, lon: -75.1675, surface: "Grass", openedYear: 2003, hostingFinal: false, image: null },
  { id: 8, name: "Gillette Stadium", city: "Foxborough, MA", country: "USA", capacity: 65878, lat: 42.0909, lon: -71.2643, surface: "Grass", openedYear: 2002, hostingFinal: false, image: null },
  { id: 9, name: "Allegiant Stadium", city: "Las Vegas, NV", country: "USA", capacity: 65000, lat: 36.0909, lon: -115.1833, surface: "Grass", openedYear: 2020, hostingFinal: false, image: null },
  { id: 10, name: "Hard Rock Stadium", city: "Miami Gardens, FL", country: "USA", capacity: 65326, lat: 25.9580, lon: -80.2389, surface: "Grass", openedYear: 1987, hostingFinal: false, image: null },
  { id: 11, name: "NRG Stadium", city: "Houston, TX", country: "USA", capacity: 72220, lat: 29.6847, lon: -95.4107, surface: "Grass", openedYear: 2002, hostingFinal: false, image: null },
  { id: 12, name: "BC Place", city: "Vancouver, BC", country: "Canada", capacity: 54500, lat: 49.2767, lon: -123.1117, surface: "Artificial", openedYear: 1983, hostingFinal: false, image: null },
  { id: 13, name: "BMO Field", city: "Toronto, ON", country: "Canada", capacity: 45736, lat: 43.6333, lon: -79.4189, surface: "Grass", openedYear: 2007, hostingFinal: false, image: null },
  { id: 14, name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87523, lat: 19.3029, lon: -99.1505, surface: "Grass", openedYear: 1966, hostingFinal: false, image: null },
  { id: 15, name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: 49850, lat: 20.6861, lon: -103.4607, surface: "Grass", openedYear: 2010, hostingFinal: false, image: null },
  { id: 16, name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500, lat: 25.6694, lon: -100.2427, surface: "Grass", openedYear: 2015, hostingFinal: false, image: null },
];

export const getStadiumById = (id) => STADIUMS.find(s => s.id === id);
export const getStadiumByName = (name) => STADIUMS.find(s => s.name === name);
