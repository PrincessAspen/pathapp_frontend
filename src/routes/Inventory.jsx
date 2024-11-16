import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Inventory = () => {
    // const [featuredProducts, setFeaturedProducts] = useState([]);
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchFeaturedProducts = async () => {
    //         try {
    //             const response = await fetch(`${import.meta.env.VITE_API_URL}/products?featured=true`);
    //             const data = await response.json();
    //             setFeaturedProducts(data);
    //         } catch (error) {
    //             console.error('Error fetching featured products:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchFeaturedProducts();
    // }, []);

    // if (loading) {
    //     return <h2>Loading featured products...</h2>;
    // }

    return (
        <div>
            <div>
                <h1>Gear</h1>
                <ul>
                    <li>Placeholder</li>
                    <li>Placeholder 2</li>
                </ul>
            </div>
            
        </div>
  );
};

export default Inventory;
