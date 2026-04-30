import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          CK Cake Lounge
        </Link>
        <div className={styles.navLinks}>
          <Link href="/menu" className={styles.navLink}>
            Everyday Menu
          </Link>
          <Link href="/special-cakes" className={`${styles.navLink} ${styles.specialLink}`}>
            Special Cakes
          </Link>
        </div>
      </div>
    </nav>
  );
}
