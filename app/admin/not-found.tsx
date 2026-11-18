import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-4 font-serif text-4xl text-cream">We couldn&rsquo;t find that</h1>
      <p className="mt-3 text-sand/70">It may have been deleted.</p>
      <Link href="/admin/products" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-forest">
        Back to products
      </Link>
    </div>
  );
}
