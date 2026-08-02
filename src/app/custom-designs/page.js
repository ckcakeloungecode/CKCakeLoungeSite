'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

// Pre-configured custom design showcase collection with placeholders ready for owner images
const CUSTOM_DESIGNS = [
  {
    id: 'design-1',
    title: 'Royal Golden Floral Wedding Cake',
    category: 'Wedding & Anniversary',
    startingPrice: 160,
    description: 'Multilayer luxury cake with edible gold foil accents, handcrafted sugar flowers, and smooth fondant finish.',
    defaultSize: '2-Tier (Serves 20-25)',
    availableSizes: ['2-Tier (Serves 20-25)', '3-Tier (Serves 40-50)', 'Single Tier (Serves 10-12)'],
    availableFlavors: ['Vanilla Raspberry', 'Red Velvet', 'Carrot Cream Cheese', 'Chocolate Fudge'],
    leadTime: '3 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/wedding-gold.jpg'
    placeholderCode: 'wedding-gold.jpg'
  },
  {
    id: 'design-2',
    title: 'Minimalist Pastel Macaron Drip Cake',
    category: 'Birthday Celebrations',
    startingPrice: 85,
    description: 'Chic drip cake featuring pastel buttercream swirls, French macarons, and chocolate pearls.',
    defaultSize: '2 Pound (Serves 10-12)',
    availableSizes: ['1.5 Pound (Serves 6-8)', '2 Pound (Serves 10-12)', '3 Pound (Serves 15-18)'],
    availableFlavors: ['Strawberry Delight', 'Vanilla Bean', 'Chocolate Hazelnut', 'Mango Passion'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/pastel-drip.jpg'
    placeholderCode: 'pastel-drip.jpg'
  },
  {
    id: 'design-3',
    title: 'Elegantly Piped Vintage Lambeth Cake',
    category: 'Birthday Celebrations',
    startingPrice: 95,
    description: 'Retro-inspired piping with intricate ruffle borders, maraschino cherries, and delicate scrollwork.',
    defaultSize: '2 Pound (Serves 10-12)',
    availableSizes: ['1.5 Pound (Serves 6-8)', '2 Pound (Serves 10-12)', '3 Pound (Serves 15-18)'],
    availableFlavors: ['Red Velvet', 'Black Forest', 'Vanilla Bean', 'Pineapple Delight'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/vintage-lambeth.jpg'
    placeholderCode: 'vintage-lambeth.jpg'
  },
  {
    id: 'design-4',
    title: 'Enchanted Butterfly & Rose Celebration Cake',
    category: 'Baby Shower & Kids',
    startingPrice: 110,
    description: 'Dreamy celebration cake with 3D wafer butterflies, fresh floral crowns, and subtle gradient buttercream.',
    defaultSize: '2-Tier (Serves 18-20)',
    availableSizes: ['2 Pound (Serves 10-12)', '2-Tier (Serves 18-20)', '3-Tier (Serves 35-40)'],
    availableFlavors: ['Vanilla Raspberry', 'Mango Mousse', 'Pistachio Kesar', 'Chocolate Fudge'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/butterfly-rose.jpg'
    placeholderCode: 'butterfly-rose.jpg'
  },
  {
    id: 'design-5',
    title: 'Nutella Chocolate Overload Drip Cake',
    category: 'Elegant Drip & Floral',
    startingPrice: 90,
    description: 'Decadent chocolate cake loaded with Ferrero Rocher, Kinder Bueno, rich ganache drip, and hazelnut cream.',
    defaultSize: '2 Pound (Serves 10-12)',
    availableSizes: ['1.5 Pound (Serves 6-8)', '2 Pound (Serves 10-12)', '3 Pound (Serves 15-18)'],
    availableFlavors: ['Chocolate Fudge', 'Nutella Crunch', 'Ferrero Chocolate', 'Black Forest'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/chocolate-overload.jpg'
    placeholderCode: 'chocolate-overload.jpg'
  },
  {
    id: 'design-6',
    title: 'Whimsical Woodland & Teddy Bear Cake',
    category: 'Baby Shower & Kids',
    startingPrice: 130,
    description: 'Hand-sculpted fondant teddy bear, soft pastel cloud details, and golden stars for baby showers or 1st birthdays.',
    defaultSize: '2-Tier (Serves 20-25)',
    availableSizes: ['2 Pound (Serves 10-12)', '2-Tier (Serves 20-25)'],
    availableFlavors: ['Vanilla Bean', 'Butterscotch', 'Carrot Cream Cheese', 'Strawberry'],
    leadTime: '3 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/woodland-bear.jpg'
    placeholderCode: 'woodland-bear.jpg'
  },
  {
    id: 'design-7',
    title: 'Royal Indian Fusion Gulab Jamun Cake',
    category: 'Specialty Theme',
    startingPrice: 105,
    description: 'Cardamom & saffron infused sponge layered with authentic gulab jamun, crushed pistachios, and edible silver leaf.',
    defaultSize: '2 Pound (Serves 10-12)',
    availableSizes: ['1.5 Pound (Serves 6-8)', '2 Pound (Serves 10-12)', '3 Pound (Serves 15-18)'],
    availableFlavors: ['Kesar Pista', 'Gulab Jamun Fusion', 'Rasmalai Delight', 'Paan Kulfi'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/gulab-jamun-fusion.jpg'
    placeholderCode: 'gulab-jamun-fusion.jpg'
  },
  {
    id: 'design-8',
    title: 'Rustic Botanical Fresh Berry & Floral Cake',
    category: 'Wedding & Anniversary',
    startingPrice: 125,
    description: 'Semi-naked botanical cake topped with fresh organic berries, eucalyptus sprigs, and white chocolate drizzle.',
    defaultSize: '2-Tier (Serves 20-25)',
    availableSizes: ['2 Pound (Serves 10-12)', '2-Tier (Serves 20-25)', '3-Tier (Serves 40-50)'],
    availableFlavors: ['Lemon Blueberry', 'Vanilla Raspberry', 'Carrot Walnut', 'White Chocolate'],
    leadTime: '2 Days Notice',
    imageUrl: '', // 👈 Edit this line to add image path, e.g. '/images/designs/rustic-botanical.jpg'
    placeholderCode: 'rustic-botanical.jpg'
  }
];

const CATEGORIES = [
  'All Designs',
  'Wedding & Anniversary',
  'Birthday Celebrations',
  'Baby Shower & Kids',
  'Elegant Drip & Floral',
  'Specialty Theme'
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
        size: d.defaultSize,
        flavor: d.availableFlavors[0]
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
      design.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle direct order / quote request for a specific design
  const handleOrderDesign = (design) => {
    const choices = selectedChoices[design.id] || {
      size: design.defaultSize,
      flavor: design.availableFlavors[0]
    };

    const quoteItem = {
      productId: `custom-design-${design.id}`,
      variantId: null,
      name: design.title,
      size: choices.size,
      flavor: choices.flavor,
      price: design.startingPrice,
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
              size: design.defaultSize,
              flavor: design.availableFlavors[0]
            };

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
                    <span className={styles.priceTag}>Starts $${design.startingPrice}</span>
                  </div>

                  <p className={styles.description}>{design.description}</p>

                  <div className={styles.specList}>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>⏱️</span>
                      <span>Required Lead Time: {design.leadTime}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specIcon}>✨</span>
                      <span>100% Eggless Facility Guaranteed</span>
                    </div>
                  </div>

                  {/* Size Dropdown */}
                  <div className={styles.selectorGroup}>
                    <label className={styles.selectorLabel}>Select Preferred Size</label>
                    <select
                      value={currentChoice.size}
                      onChange={(e) => handleChoiceChange(design.id, 'size', e.target.value)}
                      className={styles.dropdown}
                    >
                      {design.availableSizes.map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Flavor Dropdown */}
                  <div className={styles.selectorGroup}>
                    <label className={styles.selectorLabel}>Select Cake Flavor</label>
                    <select
                      value={currentChoice.flavor}
                      onChange={(e) => handleChoiceChange(design.id, 'flavor', e.target.value)}
                      className={styles.dropdown}
                    >
                      {design.availableFlavors.map(fl => (
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
                    <span>Order / Request Quote for This Design</span>
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
