import { useEffect, useState } from "react";

const ShopPage = () => {
    const [shopItems, setShopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopItems = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/shop_items/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch shop items");
                }
                const data = await response.json();
                setShopItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShopItems();
    }, []);

    if (loading) {
        return <h2 className="text-center text-xl font-semibold text-gray-700">Loading shop items...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-xl font-semibold text-red-600">Error: {error}</h2>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-artsy">
            <h1 className="text-6xl font-bold text-center text-indigo-600 mb-8">Shop</h1>
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-indigo-600 text-white">
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Gold Value</th>
                    </tr>
                </thead>
                <tbody>
                    {shopItems.map((item, index) => (
                        <tr
                            key={index}
                            className={`${
                                index % 2 === 0 ? "bg-gray-100" : "bg-white"
                            } hover:bg-gray-200 text-black`}
                        >
                            <td className="p-4">{item.type}</td>
                            <td className="p-4">{item.name}</td>
                            <td className="p-4">{item.gold_value} gp</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShopPage;