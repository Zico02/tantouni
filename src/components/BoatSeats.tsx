import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import './BoatSeats.css';

interface Props {
  /** Free seats per boat before the visitor's own group. */
  boatsLeft: number[];
  seatsPerBoat: number;
  /** Seats the visitor would take, per boat. */
  mine?: number[];
}

// Top-down boat with its seats: booked seats dim, the visitor's seats glow.
export default function BoatSeats({ boatsLeft, seatsPerBoat, mine = [] }: Props) {
  const { t } = useTranslation();
  return (
    <div className="boats">
      {boatsLeft.map((left, b) => {
        const taken = seatsPerBoat - left;
        const own = mine[b] || 0;
        return (
          <div className="boat" key={b}>
            <svg viewBox="0 0 120 300" className="boat__hull" aria-hidden>
              <defs>
                <linearGradient id={`hull${b}`} x1="0" x2="1">
                  <stop offset="0" stopColor="#dfe9f5" />
                  <stop offset=".5" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#c8d7ea" />
                </linearGradient>
              </defs>
              <path d="M60 4C92 40 112 100 112 170V280Q112 296 96 296H24Q8 296 8 280V170C8 100 28 40 60 4Z" fill={`url(#hull${b})`} stroke="#8fb0d6" strokeWidth="2" />
              <path d="M60 22C84 52 98 104 98 168V276H22V168C22 104 36 52 60 22Z" fill="#0f2c5c" opacity=".9" />
              <rect x="34" y="96" width="52" height="38" rx="8" fill="#1d86ff" opacity=".35" />
              <rect x="40" y="276" width="40" height="18" rx="4" fill="#253247" />
            </svg>
            <div className="boat__seats">
              {Array.from({ length: seatsPerBoat }, (_, i) => {
                const state = i < taken ? 'taken' : i < taken + own ? 'mine' : 'free';
                return (
                  <motion.span
                    key={i}
                    className={`seat seat--${state}`}
                    initial={false}
                    animate={{ scale: state === 'mine' ? [1, 1.25, 1] : 1 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  />
                );
              })}
            </div>
            <p className="boat__label">{t('book.boat', { n: b + 1 })}</p>
          </div>
        );
      })}
      <ul className="boats__legend">
        <li><span className="seat seat--mine" />{t('book.yours')}</li>
        <li><span className="seat seat--taken" />{t('book.taken')}</li>
        <li><span className="seat seat--free" />{t('book.free')}</li>
      </ul>
    </div>
  );
}
