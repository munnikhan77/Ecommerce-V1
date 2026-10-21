import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

// Shop layout: announcement + header + page + footer + cart drawer
export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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
    </>
  );
}
