import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductGallery from '../components/product/ProductGallery';
import OptionPicker from '../components/product/OptionPicker';
import Accordion from '../components/product/Accordion';
import ProductGrid from '../components/product/ProductGrid';
import SectionHeading from '../components/ui/SectionHeading';
import QuantityPicker from '../components/ui/QuantityPicker';
import Button from '../components/ui/Button';
import Price from '../components/ui/Price';
import { Loader, EmptyState } from '../components/ui/Loader';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, loading, error } = useFetch(() => api.getProduct(slug), [slug]);

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <EmptyState title="Product not found" text="It may have sold out or moved.">
        <Button variant="outline" to="/shop">
          Back to shop
        </Button>
      </EmptyState>
    );
  }
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }) {
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [color, setColor] = useState(product.colors[0]?.name ?? '');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const soldOut = product.stock === 0;
  const tone = product.colors.find((c) => c.name === color)?.hex ?? product.colors[0]?.hex;

  useEffect(() => setError(''), [size]);

  const handleAdd = () => {
    if (product.sizes.length && !size) return setError('Please choose a size');
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      tone,
      size,
      color,
      quantity,
    });
  };

  const accordion = [
    { title: 'Description', content: <p>{product.description}</p> },
    {
      title: 'Fabric & Care',
      content: (
        <ul>
          {product.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Delivery & Exchange',
      content: (
        <p>
          Inside Kathmandu Valley Rs {settings?.shipping.insideValley} (free above Rs {settings?.shipping.freeAbove}), outside valley
          Rs {settings?.shipping.outsideValley}. Size exchange within 7 days for unworn pieces with tags. All orders ship in plain,
          discreet packaging.
        </p>
      ),
    },
  ];

  return (
    <>
      <div className={`container ${styles.layout}`}>
        <ProductGallery images={product.images} name={product.name} tone={tone} />

        <div className={styles.info}>
          <nav className={styles.crumbs}>
            <Link to="/shop">Shop</Link> /{' '}
            {product.category && <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>}
          </nav>

          <h1 className={styles.name}>{product.name}</h1>
          <Price price={product.price} comparePrice={product.comparePrice} large />

          <div className={styles.options}>
            <OptionPicker label="Colour" type="color" options={product.colors} value={color} onChange={setColor} />
            <OptionPicker label="Size" options={product.sizes} value={size} onChange={setSize} />
          </div>

          <div className={styles.buy}>
            <QuantityPicker value={quantity} onChange={setQuantity} max={Math.min(10, product.stock || 1)} />
            <Button full onClick={handleAdd} disabled={soldOut}>
              {soldOut ? 'Sold Out' : 'Add to Bag'}
            </Button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {product.stock > 0 && product.stock <= 5 && <p className={styles.low}>Only {product.stock} left — order soon</p>}

          <ul className={styles.perks}>
            <li>✦ Cash on Delivery available</li>
            <li>✦ Discreet, unbranded packaging</li>
            <li>✦ 7-day size exchange</li>
          </ul>

          <Accordion items={accordion} />
        </div>
      </div>

      {product.related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Complete the look" title="You may also like" />
            <ProductGrid products={product.related} />
          </div>
        </section>
      )}
    </>
  );
}
