import type { Product } from "@/lib/products";
import { Bottle } from "./Bottle";

const BG: Record<Product["line"], string> = {
  noon: "bg-gradient-to-b from-[#FCE9C4] to-[#F8DDA6]",
  night: "bg-gradient-to-b from-[#3A3E86] to-[#1F2150]",
  bundle: "bg-gradient-to-br from-[#F8DDA6] via-[#8C7FA8] to-[#1F2150]",
};

export function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl ${BG[product.line]}`}>
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <Bottle
          name={product.name}
          line={product.line}
          format={product.format}
          className={large ? "h-4/5 drop-shadow-xl" : "h-3/4 drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1"}
        />
      )}
    </div>
  );
}
