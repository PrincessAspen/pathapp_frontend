import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Inventory = () => {
    const { characterId } = useParams(); // Get the characterId from the URL
    const { character, updateCharacter } = useCharacter(); // Get character data from the context
    const [inventoryData, setInventoryData] = useState([]); // Store inventory data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState(''); // For adding a new inventory item

    useEffect(() => {
        const fetchInventoryData = async () => {
            try {
                // Check if character is loaded from context
                if (!character || !character.characterClassId) {
                    throw new Error('Character or class not found');
                }

                // Fetch class details using character's class_id
                const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.characterClassId}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classDetails = await classResponse.json();

                // Directly use the starting_inventory from classDetails
                const itemNames = classDetails.starting_inventory;  // Array of item names from starting_inventory
                if (!itemNames || itemNames.length === 0) {
                    throw new Error('No starting inventory found in the class data.');
                }

                // Set the inventory data
                setInventoryData(itemNames);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryData();
    }, [characterId, character]);

    const handleItemChange = (index, newValue) => {
        const updatedInventory = [...inventoryData];
        updatedInventory[index] = newValue;
        setInventoryData(updatedInventory);
    };

    const handleAddItem = () => {
        if (newItem.trim() !== '') {
            const updatedInventory = [...inventoryData, newItem];
            setInventoryData(updatedInventory);
            setNewItem(''); // Clear the input field after adding
        }
    };

    const handleSaveInventory = () => {
        updateCharacter('inventoryItems', inventoryData); // Update the character's inventory
        alert('Inventory saved!');
    };

    if (loading) {
        return <h2 className="text-center text-xl font-semibold text-gray-700">Loading inventory data...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-xl font-semibold text-red-600">Error: {error}</h2>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-artsy">
            <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">Gear</h1>

            <div className="space-y-4">
                {inventoryData.length > 0 ? (
                    inventoryData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-md">
                            <label htmlFor={`item-${index}`} className="w-1/4 text-lg font-medium text-gray-700">{`Item ${index + 1}:`}</label>
                            <input
                                id={`item-${index}`}
                                type="text"
                                value={item}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg text-gray-500">No gear found.</p>
                )}
            </div>

            <div className="mt-6">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md w-full mb-4"
                    placeholder="Add a new item"
                />
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Add Item
                </button>
            </div>

            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={handleSaveInventory}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Save Inventory
                </button>
            </div>
        </div>
    );
};

export default Inventory;
