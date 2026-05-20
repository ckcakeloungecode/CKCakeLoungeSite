import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Premium background decorative shapes */}
      <div className={styles.backgroundBlob1}></div>
      <div className={styles.backgroundBlob2}></div>

      {/* Hero Section */}
      <section className={`container ${styles.heroSection}`}>
        <div className={styles.heroGrid}>
          {/* Left Column: Copy & Actions */}
          <div className={`animate-in ${styles.heroContent}`}>
            <span className={styles.heroBadge}>EST. 2024 • LONDON ON</span>
            <h1 className={styles.heroTitle}>
              Artisan Pastries <br />
              & Custom <span>Celebration Cakes</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome to CK Cake Lounge. We blend exquisite natural ingredients, refined baking techniques, 
              and bespoke hand-detailed designs to create unforgettable desserts for life's sweetest milestones.
            </p>
            <div className={styles.buttonGroup}>
              <Link href="/menu" className="btn-primary">
                Explore Everyday Treats
              </Link>
              <Link href="/cakes" className={styles.btnSecondary}>
                Order Custom Cake
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className={`animate-in ${styles.heroVisual}`}>
            <div className={styles.imageFrameOuter}>
              <div className={styles.imageFrame}>
                <Image 
                  src="/hero_cake.png" 
                  alt="Signature Luxury Wedding and Celebration Cake" 
                  width={500} 
                  height={600}
                  className={styles.heroImage}
                  priority
                />
                <div className={styles.imageOverlay}></div>
              </div>
              {/* Gold Accent Corner highlights */}
              <div className={`${styles.cornerBorder} ${styles.topRight}`}></div>
              <div className={`${styles.cornerBorder} ${styles.bottomLeft}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Allergen & Dietary Trust Grid - Rashmi's Bakery Inspired */}
      <section className={`container ${styles.trustSection}`}>
        <div className={styles.trustGrid}>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🥜</span>
            <h4>100% Nut-Free Facility</h4>
            <p>Baked in a dedicated peanut and tree nut-free environment. Safe for school events & family parties.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🌿</span>
            <h4>Vegan Selections Available</h4>
            <p>Exquisite dairy-free and egg-free plant-based recipe options that preserve our light textures.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🌾</span>
            <h4>Gluten-Free Options</h4>
            <p>Crafted with premium gluten-free flour blends and meticulous cross-contamination prevention.</p>
          </div>
          <div className={`glass-panel ${styles.trustCard}`}>
            <span className={styles.trustIcon}>🚚</span>
            <h4>Temperature-Controlled Transit</h4>
            <p>Bespoke hand-delivery across London to guarantee your cakes arrive in pristine, perfect condition.</p>
          </div>
        </div>
      </section>

      {/* Circular Shop by Category bubbles row */}
      <section className={`container ${styles.bubblesSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>Quickly browse our collections to find your perfect treat</p>
        </div>
        <div className={styles.bubblesRow}>
          <Link href="/menu" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🥐</div>
            <span className={styles.bubbleLabel}>Everyday Treats</span>
          </Link>
          <Link href="/cakes" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🎂</div>
            <span className={styles.bubbleLabel}>Custom Cakes</span>
          </Link>
          <Link href="/international-flavors" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>🌎</div>
            <span className={styles.bubbleLabel}>International</span>
          </Link>
          <Link href="/special-cakes" className={styles.bubbleCard}>
            <div className={styles.bubbleCircle}>✨</div>
            <span className={styles.bubbleLabel}>Special Cakes</span>
          </Link>
        </div>
      </section>

      {/* Product Detail Grid Showcase */}
      <section className={`container ${styles.categoriesSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Detailed Offerings</h2>
          <p className={styles.sectionSubtitle}>Select a catalog below to explore customization options and sizes</p>
        </div>

        <div className={styles.categoryGrid}>
          {/* Category 1: Everyday Treats */}
          <div className={`glass-panel ${styles.categoryCard}`}>
            <div className={styles.cardIcon}>🥐</div>
            <h3>Everyday Treats</h3>
            <p>Indulge in our daily selections of gourmet cupcakes, freshly-baked croissants, cookies, and sweet pastry bites.</p>
            <Link href="/menu" className={styles.cardLink}>
              View Selection <span>→</span>
            </Link>
          </div>

          {/* Category 2: Custom Cakes */}
          <div className={`glass-panel ${styles.categoryCard}`}>
            <div className={styles.cardIcon}>🎂</div>
            <h3>Custom Cakes</h3>
            <p>Design a bespoke masterpiece for weddings, anniversaries, or birthdays. Tailor every layer, flavor, and frosting.</p>
            <Link href="/cakes" className={styles.cardLink}>
              Customize Cake <span>→</span>
            </Link>
          </div>

          {/* Category 3: International Flavors */}
          <div className={`glass-panel ${styles.categoryCard}`}>
            <div className={styles.cardIcon}>🌎</div>
            <h3>International Flavors</h3>
            <p>Take your palate on a global journey. Explore exotic recipe combinations inspired by European, Asian, and tropical styles.</p>
            <Link href="/international-flavors" className={styles.cardLink}>
              Explore Flavors <span>→</span>
            </Link>
          </div>

          {/* Category 4: Special Cakes */}
          <div className={`glass-panel ${styles.categoryCard}`}>
            <div className={styles.cardIcon}>✨</div>
            <h3>Special Cakes</h3>
            <p>Select from our pre-designed, ready-to-order signature collection. Timeless designs for quick and effortless celebrations.</p>
            <Link href="/special-cakes" className={styles.cardLink}>
              Shop Collection <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
