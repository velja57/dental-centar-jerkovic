/**
 * Da li sajt zaista šalje mejlove (potvrde, podsetnike, poziv na kontrolu): tek kada su na Vercelu
 * podešeni RESEND_API_KEY i EMAIL_FROM (potreban je sopstveni domen). Dok nisu, mejlovi se samo
 * beleže u admin → Poruke, a tekstovi na sajtu ne obećavaju mejl ni podsetnik.
 * Posle podešavanja ključeva i nove objave, tekstovi o mejlu i podsetnicima se sami vraćaju.
 *
 * Koristiti samo u serverskom kodu (na klijentu ove promenljive ne postoje). Bez "server-only"
 * oznake jer sadržaj usluga (koji ovo koristi) učitava i skripta za punjenje baze (seed).
 */
export const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
