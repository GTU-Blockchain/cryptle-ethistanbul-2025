'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectWallet = () => {
    // TODO: Implement wallet connection
    setIsWalletConnected(true);
  };

  return (
    <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logoIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  {/* Üst blok - açık mavi */}
                  <path
                    d="M6 8L14 8L12 14L4 14L6 8Z"
                    fill="#06b6d4"
                    stroke="#0891b2"
                    strokeWidth="0.5"
                  />
                  {/* Orta blok - daha koyu mavi */}
                  <path
                    d="M8 14L16 14L14 20L6 20L8 14Z"
                    fill="#0891b2"
                    stroke="#0c4a6e"
                    strokeWidth="0.5"
                  />
                  {/* Alt blok - en koyu mavi */}
                  <path
                    d="M10 20L18 20L16 26L8 26L10 20Z"
                    fill="#0c4a6e"
                    stroke="#1e293b"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <span className={styles.logoText}>
                SEEKify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <Link 
              href="/" 
              className={styles.navLink}
            >
              Home
            </Link>
            <Link 
              href="/play" 
              className={styles.navLink}
            >
              Play
            </Link>
            <Link 
              href="/leaderboard" 
              className={styles.navLink}
            >
              Leaderboard
            </Link>
            <Link 
              href="/how-it-works" 
              className={styles.navLink}
            >
              How It Works
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className={styles.desktopCta}>
            <button 
              className={styles.playButton}
              onClick={() => window.location.href = '/play'}
            >
              Play Now
            </button>
            <button 
              className={styles.connectButton}
              onClick={connectWallet}
            >
              {isWalletConnected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.mobileMenuButton}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={styles.mobileNav}>
            <div className={styles.mobileNavContent}>
              <div className={styles.mobileNavLinks}>
                <Link 
                  href="/" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/play" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Play
                </Link>
                <Link 
                  href="/leaderboard" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link 
                  href="/how-it-works" 
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
              </div>
              <div className={styles.mobileCta}>
                <button 
                  className={styles.mobilePlayButton}
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.location.href = '/play';
                  }}
                >
                  Play Now
                </button>
                <button 
                  className={styles.mobileConnectButton}
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                >
                  {isWalletConnected ? 'Connected' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
