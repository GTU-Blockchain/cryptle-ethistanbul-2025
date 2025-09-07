"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
import { WalletSelector } from "../WalletSelector";

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
                <div className="flex justify-between w-full mx-10">
                    <div className={styles.logoSection}>
                        <Link href="/" className={styles.logoLink}>
                            <div className={styles.logoIcon}>
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                >
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
                            <span className={styles.logoText}>Cryptle</span>
                        </Link>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className={styles.desktopNav}>
                        <Link
                            href="/"
                            className={styles.navLink}
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.location.pathname !== "/") {
                                    window.location.href = "/";
                                } else {
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }
                            }}
                        >
                            Home
                        </Link>
                        <Link href="/play" className={styles.navLink}>
                            Play Solo
                        </Link>
                        <Link href="/play1v1" className={styles.navLink}>
                            1v1 Battle ⚔️
                        </Link>
                        <Link href="/leaderboard" className={styles.navLink}>
                            Leaderboard
                        </Link>
                        <a
                            href="#how-it-works"
                            className={styles.navLink}
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.location.pathname !== "/") {
                                    window.location.href = "/#how-it-works";
                                } else {
                                    const el =
                                        document.getElementById("how-it-works");
                                    if (el) {
                                        el.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                    } else {
                                        // Eğer hash ile gelindiyse ve element henüz yüklenmediyse kısa bir bekleme ile tekrar dene
                                        setTimeout(() => {
                                            document
                                                .getElementById("how-it-works")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                });
                                        }, 300);
                                    }
                                }
                            }}
                        >
                            How It Works
                        </a>
                    </nav>
                    <WalletSelector />
                </div>

                {/* Mobile menu button */}
                <div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={styles.mobileMenuButton}
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsMenuOpen(false);
                                        if (window.location.pathname !== "/") {
                                            window.location.href = "/";
                                        } else {
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        }
                                    }}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/play"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Play Solo
                                </Link>
                                <Link
                                    href="/play1v1"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    1v1 Battle ⚔️
                                </Link>
                                <Link
                                    href="/leaderboard"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Leaderboard
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className={styles.mobileNavLink}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsMenuOpen(false);
                                        if (window.location.pathname !== "/") {
                                            window.location.href =
                                                "/#how-it-works";
                                        } else {
                                            const el =
                                                document.getElementById(
                                                    "how-it-works"
                                                );
                                            if (el) {
                                                el.scrollIntoView({
                                                    behavior: "smooth",
                                                });
                                            } else {
                                                setTimeout(() => {
                                                    document
                                                        .getElementById(
                                                            "how-it-works"
                                                        )
                                                        ?.scrollIntoView({
                                                            behavior: "smooth",
                                                        });
                                                }, 300);
                                            }
                                        }
                                    }}
                                >
                                    How It Works
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
