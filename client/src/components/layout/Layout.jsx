import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import DuskCursor from '../saanjh/DuskCursor';
import DuskSky from '../saanjh/DuskSky';
import ScrollButtons from '../saanjh/ScrollButtons';
import { useSettings } from '../../context/SettingsContext';
import { scrollToY, startSmoothScroll } from '../../utils/smoothScroll';

// Shop layout: announcement + header + page + footer + cart drawer
export default function Layout() {
  const { pathname } = useLocation();
  const mood = useSettings().settings?.content.mood;

  useEffect(() => startSmoothScroll(), []);

  useEffect(() => {
    scrollToY(0, { immediate: true });
  }, [pathname]);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <ScrollButtons />
      {/* "saanjh" (dusk) touches — switch them off in /admin/settings → Saanjh mood */}
      {mood?.skyBar && <DuskSky />}
      {mood?.cursor && <DuskCursor />}
    </>
  );
}
