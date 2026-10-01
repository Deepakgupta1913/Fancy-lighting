import auroraCeiling from '../assets/products/aurora-ceiling.jpg'
import lunaPendant from '../assets/products/luna-pendant.jpg'
import eclipseWall from '../assets/products/eclipse-wall.jpg'
import novaTable from '../assets/products/nova-table.jpg'

const products = [
  {
    id: 1,
    name: 'Aurora Ceiling Light',
    category: 'Ceiling Lights',
    price: 1999,
    originalPrice: 2499,
    badge: 'NEW',
    image: auroraCeiling,
    description:
      'A modern ceiling light designed to create a warm and elegant atmosphere in living rooms, bedrooms and other contemporary spaces.',
    wattage: '24W',
    color: 'Warm White',
    material: 'Aluminium',
  },

  {
    id: 2,
    name: 'Luna Pendant Light',
    category: 'Pendant Lights',
    price: 2499,
    originalPrice: 2999,
    badge: 'POPULAR',
    image: lunaPendant,
    description:
      'A stylish pendant light that combines contemporary design with comfortable illumination for dining rooms, kitchens and modern interiors.',
    wattage: '18W',
    color: 'Warm White',
    material: 'Metal',
  },

  {
    id: 3,
    name: 'Eclipse Wall Light',
    category: 'Wall Lights',
    price: 1499,
    originalPrice: 1899,
    badge: 'SALE',
    image: eclipseWall,
    description:
      'A sophisticated wall light designed for accent lighting and elegant ambient illumination in bedrooms, hallways and living spaces.',
    wattage: '12W',
    color: 'Warm White',
    material: 'Aluminium',
  },

  {
    id: 4,
    name: 'Nova Table Lamp',
    category: 'Table Lamps',
    price: 1299,
    originalPrice: 1599,
    badge: 'NEW',
    image: novaTable,
    description:
      'A compact and elegant table lamp that adds warm ambient lighting to desks, bedside tables and reading corners.',
    wattage: '10W',
    color: 'Warm White',
    material: 'Metal',
  },
  
]


export default products