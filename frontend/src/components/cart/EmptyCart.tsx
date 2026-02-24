import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../shared/Button';

export const EmptyCart: React.FC = () => {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-24 w-24 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
      <p className="mt-2 text-gray-600">Add some delicious items to get started!</p>
      <Link to="/">
        <Button className="mt-6">Browse Menu</Button>
      </Link>
    </div>
  );
};
