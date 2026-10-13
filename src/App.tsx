import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import { ScrollTrigger, scrollToTop, useSmoothScroll } from './lib/motion';

const Home = lazy(() => import('./pages/Home'));
const Collection = lazy(() => import('./pages/Collection'));
const Reservation = lazy(() => import('./pages/Reservation'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Admin = lazy(() => import('./admin/Admin'));

export default function App() {
  useSmoothScroll();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  // Only the top-level section resets scroll: opening a fish (/tableau-de-chasse/:slug) keeps your place.
  const section = pathname.split('/')[1];

  useEffect(() => {
    scrollToTop();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [section]);

  return (
    <>
      {!isAdmin && <Nav />}
      <main>
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tableau-de-chasse" element={<Collection />} />
            <Route path="/tableau-de-chasse/:slug" element={<Collection />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/palmares" element={<Achievements />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
