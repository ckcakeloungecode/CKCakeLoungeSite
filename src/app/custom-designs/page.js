'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

// Universal Custom Cake Sizes & Tier Prices matching the Custom Cakes database catalog
const ALL_CUSTOM_SIZES = [
  { label: '1 LB (Serves 5-7)', price: 30 },
  { label: '2 LB (Serves 10-13)', price: 50 },
  { label: '3 LB (Serves 15-22)', price: 85 },
  { label: '4 LB (Serves 25-35)', price: 115 },
  { label: '5 LB (Serves 35-45)', price: 145 },
  { label: '6 LB 2-Tier (Serves 50-60)', price: 175 },
  { label: '7 LB 2-Tier (Serves 65-80)', price: 205 },
];

// Universal Custom Cake Flavors matching the Custom Cakes database catalog
const ALL_CUSTOM_FLAVORS = [
  'Classic Vanilla',
  'Velvety Chocolate',
  'Red Velvet',
  'Marble Fudge',
  'Tiramisu',
  'Dark Chocolate Truffle',
  'Oreo Crunch',
  'Lotus Biscoff',
  'Butterscotch',
  'Pistachio',
  'Meetha Paan',
  'Rainbow',
  'Rasmalai Bliss',
  'Gulab Jamun',
  'Mango',
  'Tropical Pineapple',
  'Caramel',
  'Coconut',
  'Garden Strawberry',
  'Blueberry',
  'Mix Fruit',
  'Carrot Cream Cheese'
];

// Pre-configured custom design showcase collection with placeholders ready for owner images
const CUSTOM_DESIGNS = [
  {
    id: 'design-jurassic',
    title: 'Jurassic World Dinosaur Birthday Cake',
    category: 'Birthday Celebrations',
    themeMessage: 'Roar into your next celebration with an epic Jurassic World dinosaur adventure theme!',
    defaultSize: '2 LB (Serves 10-13)',
    leadTime: '2 Days Notice',
    imageUrl: '/designs/jurassic-world.jpg',
    placeholderCode: 'jurassic-world.jpg'
  },
  {
    id: 'design-2',
    title: 'Minimalist Pastel Macaron Drip Birthday Cake',
    category: 'Birthday Celebrations',
    themeMessage: 'Chic pastel buttercream swirls topped with delicate macarons and chocolate pearls.',
    defaultSize: '2 LB (Serves 10-13)',
    leadTime: '2 Days Notice',
    imageUrl: '',
    placeholderCode: 'pastel-drip.jpg'
  },
  {
    id: 'design-3',
    title: 'Elegantly Piped Vintage Lambeth Birthday Cake',
    category: 'Birthday Celebrations',
    themeMessage: 'Retro-inspired piping with intricate ruffle borders and classic birthday charm.',
    defaultSize: '2 LB (Serves 10-13)',
    leadTime: '2 Days Notice',
    imageUrl: '',
    placeholderCode: 'vintage-lambeth.jpg'
  },
  {
    id: 'design-1',
    title: 'Royal Golden Floral Wedding Cake',
    category: 'Wedding & Anniversary',
    themeMessage: 'Luxury gold foil accents and sugar flowers crafted for memorable weddings & anniversaries.',
    defaultSize: '6 LB 2-Tier (Serves 50-60)',
    leadTime: '3 Days Notice',
    imageUrl: '',
    placeholderCode: 'wedding-gold.jpg'
  },
  {
    id: 'design-4',
    title: 'Enchanted Butterfly & Rose Celebration Cake',
    category: 'Baby Shower & Kids',
    themeMessage: 'Dreamy wafer butterflies and fresh floral crowns for baby showers & kids celebrations.',
    defaultSize: '6 LB 2-Tier (Serves 50-60)',
    leadTime: '2 Days Notice',
    imageUrl: '',
    placeholderCode: 'butterfly-rose.jpg'
  },
  {
    id: 'design-5',
    title: 'Nutella Chocolate Overload Festive Drip Cake',
    category: 'Festive Cakes',
    themeMessage: 'Decadent chocolate ganache drip loaded with Ferrero Rocher and hazelnut cream.',
    defaultSize: '2 LB (Serves 10-13)',
    leadTime: '2 Days Notice',
    imageUrl: '',
    placeholderCode: 'chocolate-overload.jpg'
  },
  {
    id: 'design-6',
    title: 'Whimsical Woodland & Teddy Bear Cake',
    category: 'Baby Shower & Kids',
    themeMessage: 'Hand-sculpted teddy bear and soft pastel clouds perfect for 1st birthdays & baby showers.',
    defaultSize: '6 LB 2-Tier (Serves 50-60)',
    leadTime: '3 Days Notice',
    imageUrl: '',
    placeholderCode: 'woodland-bear.jpg'
  },
  {
    id: 'design-7',
    title: 'Royal Indian Fusion Gulab Jamun Festive Cake',
    category: 'Festive Cakes',
    themeMessage: 'Cardamom & saffron sponge layered with authentic gulab jamun and pistachios.',
    defaultSize: '2 LB (Serves 10-13)',
    leadTime: '2 Days Notice',
    imageUrl: '',
    placeholderCode: 'gulab-jamun-fusion.jpg'
  }
];

const CATEGORIES = [
  'All Designs',
  'Wedding & Anniversary',
  'Birthday Celebrations',
  'Baby Shower & Kids',
  'Festive Cakes'
];

export default function CustomDesignsGallery() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All Designs');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected flavor and size choices per card
  const [selectedChoices, setSelectedChoices] = useState(() => {
    const initial = {};
    CUSTOM_DESIGNS.forEach(d => {
      initial[d.id] = {
        size: d.defaultSize || '2 LB (Serves 10-13)',
        flavor: ALL_CUSTOM_FLAVORS[0]
      };
    });
    return initial;
  });

  const handleChoiceChange = (designId, key, value) => {
    setSelectedChoices(prev => ({
      ...prev,
      [designId]: {
        ...prev[designId],
        [key]: value
      }
    }));
  };

  // Filter designs based on category and search
  const filteredDesigns = CUSTOM_DESIGNS.filter(design => {
    const matchesCategory = selectedCategory === 'All Designs' || design.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (design.themeMessage && design.themeMessage.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle direct order / quote request for a specific design
  const handleOrderDesign = (design) => {
    const choices = selectedChoices[design.id] || {
      size: design.defaultSize || '2 LB (Serves 10-13)',
      flavor: ALL_CUSTOM_FLAVORS[0]
    };

    const sizeObj = ALL_CUSTOM_SIZES.find(s => s.label === choices.size) || ALL_CUSTOM_SIZES[1];
    const currentPrice = sizeObj ? sizeObj.price : 50;

    const quoteItem = {
      productId: `custom-design-${design.id}`,
      variantId: null,
      name: design.title,
      size: choices.size,
      flavor: choices.flavor,
      price: currentPrice,
      quantity: 1,
      isPhotoCake: false,
      photoUrl: design.imageUrl || null,
      displayImage: design.imageUrl || null,
      category: 'Cakes',
      designCategory: design.category,
      designNotes: `Requesting custom quote for design "${design.title}" (${design.category}).`
    };

    sessionStorage.setItem('pendingQuoteItem', JSON.stringify(quoteItem));
    router.push('/custom-quote');
  };

  return (
    <main className={styles.main}>
      <div className={`container ${styles.galleryContainer}`}>
        <h1 className={styles.title}>Custom Design Showcase</h1>
        <p className={styles.subtitle}>
          Browse our bespoke cake creations! Select any design below to customize your flavor and size, then order or request a quote directly.
        </p>

        {/* Menu Tabs Navigation */}
        <div className={styles.tabs}>
          <Link href="/menu" className={styles.tab}>Everyday Treats</Link>
          <Link href="/ready-to-go-cakes" className={styles.tab}>Ready to Go Cakes</Link>
          <Link href="/cakes" className={styles.tab}>Custom Cakes</Link>
          <Link href="/international-flavors" className={styles.tab}>International Flavors</Link>
          <Link href="/special-cakes" className={styles.tab}>Special Cakes</Link>
          <Link href="/custom-designs" className={styles.activeTab}>Custom Designs Gallery</Link>
        </div>

        {/* Category Pill Filters & Search */}
        <div className={styles.filterSection}>
          <div className={styles.categoryPills}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`${styles.pillBtn} ${selectedCategory === cat ? styles.activePillBtn : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search custom designs (e.g. Wedding, Drip, Vintage)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={styles.grid}>
          {filteredDesigns.map((design) => {
            const currentChoice = selectedChoices[design.id] || {
              size: design.defaultSize || '2 LB (Serves 10-13)',
              flavor: ALL_CUSTOM_FLAVORS[0]
            };

            const sizeObj = ALL_CUSTOM_SIZES.find(s => s.label === currentChoice.size) || ALL_CUSTOM_SIZES[1];
            const currentPrice = sizeObj ? sizeObj.price : 50;

            return (
              <div key={design.id} className={styles.card}>
                {/* Image or Placeholder Frame */}
                <div className={styles.imageFrame}>
                  {design.imageUrl ? (
                    <img src={design.imageUrl} alt={design.title} />
                  ) : (
                    <div className={styles.placeholderBox}>
                      <span className={styles.placeholderIcon}>🎂</span>
                      <span className={styles.placeholderTitle}>{design.title}</span>
                      <code className={styles.placeholderHint}>
                        📷 Insert image: /public/designs/{design.placeholderCode}
                      </code>
                    </div>
                  )}
                  <span className={styles.badge}>{design.category}</span>
                </div>

                {/* Card Details */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>{design.title}</h2>
                    <span className={styles.priceTag}>Starts ${currentPrice}</span>
                  </div>

                  <p className={styles.description}>
                    {design.themeMessage}
                  </p>

                  {/* Size Dropdown */}
                  <div className={styles.selectorGroup}>
                    <label className={styles.selectorLabel}>SELECT PREFERRED SIZE</label>
                    <select
                      value={currentChoice.size}
                      onChange={(e) => handleChoiceChange(design.id, 'size', e.target.value)}
                      className={styles.dropdown}
                    >
                      {ALL_CUSTOM_SIZES.map(sz => (
                        <option key={sz.label} value={sz.label}>{sz.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Flavor Dropdown */}
                  <div className={styles.selectorGroup}>
                    <label className={styles.selectorLabel}>SELECT CAKE FLAVOR</label>
                    <select
                      value={currentChoice.flavor}
                      onChange={(e) => handleChoiceChange(design.id, 'flavor', e.target.value)}
                      className={styles.dropdown}
                    >
                      {ALL_CUSTOM_FLAVORS.map(fl => (
                        <option key={fl} value={fl}>{fl}</option>
                      ))}
                    </select>
                  </div>

                  {/* Direct Order / Quote Action */}
                  <button
                    type="button"
                    className={styles.orderBtn}
                    onClick={() => handleOrderDesign(design)}
                  >
                    <span>Select & Customize This Design</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDesigns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6e5c54' }}>
            <h3>No designs matched your search</h3>
            <p style={{ marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category pill above.</p>
          </div>
        )}

        {/* Custom Design Inquiry Notice */}
        <div className={styles.noticeBox}>
          <h3>Have Your Own Unique Design in Mind?</h3>
          <p>
            Don't see the exact design you're looking for? You can upload any reference photo or sketch directly using our Custom Cake Quote form!
          </p>
          <Link href="/custom-quote" className="btn-primary">
            Upload Your Own Design & Get Quote
          </Link>
        </div>
      </div>
    </main>
  );
}
