import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useFetch } from "../../hooks/useFetch";
import { useInView } from "../../hooks/useInView";
import { useCart } from "../../context/CartContext";
import { GENDERS } from "../../utils/gender";
import Price from "../ui/Price";
import Button from "../ui/Button";
import SectionHeading from "../ui/SectionHeading";
import styles from "./Bestsellers.module.css";

const PER_GENDER = 5;
const AUTO_MS = 6000;

/**
 * Bestsellers as a magazine feature: one product big (photo + details + add to bag),
 * the rest as thumbnails underneath that swap it in. Women / Men tabs on top.
 * Products are the ones ticked "Show in Bestsellers" in the admin.
 */
export default function Bestsellers({ eyebrow, title }) {
  const { data: lists } = useFetch(
    () =>
      Promise.all(
        GENDERS.map((g) =>
          api.getProducts({ featured: true, gender: g.key, limit: PER_GENDER }),
        ),
      ),
    [],
  );
  const [gender, setGender] = useState(GENDERS[0].key);
  const genderIndex = GENDERS.findIndex((g) => g.key === gender);
  const products = lists?.[genderIndex] ?? [];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Bestsellers for"
            >
              {GENDERS.map((g) => (
                <button
                  key={g.key}
                  role="tab"
                  aria-selected={gender === g.key}
                  className={gender === g.key ? styles.tabOn : ""}
                  onClick={() => setGender(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          }
        />
        {/* keyed so switching Women / Men starts again from No. 01 */}
        {products.length > 0 && <Feature key={gender} products={products} />}
      </div>
    </section>
  );
}

function Feature({ products }) {
  const { addItem } = useCart();
  const [ref, visible] = useInView({ threshold: 0.4 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const product = products[active];
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [needSize, setNeedSize] = useState(false);
  const touchX = useRef(null);

  // a new product resets the picks
  useEffect(() => {
    setSize(product.sizes.length === 1 ? product.sizes[0] : "");
    setColor(product.colors[0]?.name ?? "");
    setNeedSize(false);
  }, [product]);

  // turn to the next one by itself — only while on screen, and not while the mouse is on it
  const running = visible && !paused;
  useEffect(() => {
    if (
      !running ||
      products.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = setTimeout(
      () => setActive((i) => (i + 1) % products.length),
      AUTO_MS,
    );
    return () => clearTimeout(t);
  }, [active, running, products.length]);

  const add = () => {
    if (product.sizes.length > 1 && !size) {
      setNeedSize(true);
      return;
    }
    const tone =
      product.colors.find((c) => c.name === color)?.hex ??
      product.colors[0]?.hex;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      tone,
      size,
      color,
      quantity: 1,
    });
  };

  // phones: swipe the big photo to the next / previous one
  const swipe = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50)
      setActive(
        (i) => (i + (dx < 0 ? 1 : -1) + products.length) % products.length,
      );
  };

  const number = String(active + 1).padStart(2, "0");

  return (
    <div
      ref={ref}
      className={styles.feature}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.main}>
        {/* the big photo — keyed so each product fades/zooms in fresh */}
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          className={styles.photo}
          aria-label={product.name}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={swipe}
        >
          <img src={product.images[0]} alt={product.name} />
          {product.images[1] && (
            <img src={product.images[1]} alt="" className={styles.photoAlt} />
          )}
          <span className={styles.bigNum} aria-hidden="true">
            {number}
          </span>
        </Link>

        <div key={`info-${product.id}`} className={styles.info}>
          <p className={styles.kicker}>
            No. {number} <span>·</span> Bestseller
          </p>
          <h3 className={styles.name}>{product.name}</h3>
          <Price
            price={product.price}
            comparePrice={product.comparePrice}
            large
          />
          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}

          <div className={styles.picks}>
            {product.colors.length > 0 && (
              <div className={styles.row}>
                <span className={styles.label}>
                  Colour <em>{color}</em>
                </span>
                <div className={styles.swatches}>
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={color === c.name ? styles.swatchOn : ""}
                      style={{ "--swatch": c.hex }}
                      onClick={() => setColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 1 && (
              <div
                className={`${styles.row} ${needSize ? styles.needSize : ""}`}
              >
                <span className={styles.label}>
                  Size{" "}
                  {needSize && (
                    <em className={styles.warn}>— please pick one</em>
                  )}
                </span>
                <div className={styles.sizes}>
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={size === s}
                      className={size === s ? styles.sizeOn : ""}
                      onClick={() => {
                        setSize(s);
                        setNeedSize(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button onClick={add} disabled={product.stock === 0}>
              {product.stock === 0 ? "Sold out" : "Add to Bag"}
            </Button>
            <Link to={`/product/${product.slug}`} className={styles.more}>
              View details
            </Link>
          </div>
        </div>
      </div>

      {products.length > 1 && (
        <div className={styles.thumbs}>
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={i === active ? styles.thumbOn : ""}
              onClick={() => setActive(i)}
              aria-label={`Show ${p.name}`}
            >
              <img src={p.images[0]} alt="" loading="lazy" />
              <span className={styles.thumbNum}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* time left before it moves on */}
              {i === active && running && (
                <span
                  className={styles.timer}
                  style={{ animationDuration: `${AUTO_MS}ms` }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
