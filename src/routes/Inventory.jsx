import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Inventory = () => {
    const { characterId } = useParams(); // Get the characterId from the URL
    const { character } = useCharacter(); // Get character data from the context
    const [inventoryData, setInventoryData] = useState([]); // Store inventory data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return <h2>Loading inventory data...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <div>
            <h1>Gear</h1>
            <ul>
                {inventoryData.length > 0 ? (
                    inventoryData.map((item, index) => (
                        <li key={index}>
                            <h3>{item}</h3>
                            {/* You can add more item details here if needed */}
                        </li>
                    ))
                ) : (
                    <p>No gear found.</p>
                )}
            </ul>
        </div>
    );
};

export default Inventory;
