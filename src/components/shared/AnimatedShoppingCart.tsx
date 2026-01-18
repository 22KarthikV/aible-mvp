import type { LucideProps } from 'lucide-react';

export default function AnimatedShoppingCart(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${props.className || ''} animate-cart-drive`}
      {...props}
    >
      {/* Cart Body */}
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      
      {/* Back Wheel */}
      <g className="origin-[8px_21px] animate-wheel-spin">
        <circle cx="8" cy="21" r="1" />
        <path d="M8 21l-0.5 0.5" strokeWidth="0.5" />
        <path d="M8 21l0.5 -0.5" strokeWidth="0.5" />
      </g>

      {/* Front Wheel */}
      <g className="origin-[19px_21px] animate-wheel-spin">
        <circle cx="19" cy="21" r="1" />
        <path d="M19 21l-0.5 0.5" strokeWidth="0.5" />
        <path d="M19 21l0.5 -0.5" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
