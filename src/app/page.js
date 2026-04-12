import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Decorative Blob */}
      <div className={styles.blob}></div>

      <div className={`container ${styles.heroSection}`}>
        <div className={`glass-panel animate-in ${styles.heroCard}`}>
          <h1 className={styles.title}>Welcome to CK Cake Lounge</h1>
          <p className={styles.subtitle}>
            Artisan pastries and custom cakes crafted with love. Experience the perfect blend of flavor and elegance.
          </p>
          <div className={styles.buttonGroup}>
            <button className="btn-primary">View Menu</button>
            <a href="#about" className={styles.secondaryLink}>Learn More</a>
          </div>
        </div>
      </div>
    </main>
  );
}
