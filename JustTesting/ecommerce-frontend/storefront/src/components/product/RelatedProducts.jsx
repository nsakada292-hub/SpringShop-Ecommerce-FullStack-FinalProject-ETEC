import { useEffect, useState } from "react";
import { getRelatedProducts } from "../../services/productService";
import ProductGrid from "./ProductGrid";

export default function RelatedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRelatedProducts(productId)
      .then((products) => {
        if (active) setProducts(products || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        You may also like
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
