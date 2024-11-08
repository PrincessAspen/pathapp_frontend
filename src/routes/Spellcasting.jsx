// Spellcasting.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Spellcasting = () => {
    const { characterId } = useParams(); // Assumes characterId is passed in the route
    const [spellcastingData, setSpellcastingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpellcastingData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/characters/${characterId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch spellcasting data');
                }
                const data = await response.json();
                setSpellcastingData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpellcastingData();
    }, [characterId]);

    if (loading) {
        return <h2>Loading spellcasting data...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <div>
            <h1>Spellcasting</h1>
            <div>
                <h2>Spell Attack Bonus:</h2>
                <p>{spellcastingData.spell_attack_bonus}</p>
            </div>
            <div>
                <h2>Spell Save DC:</h2>
                <p>{spellcastingData.spell_save_dc}</p>
            </div>
            <div>
                <h2>Spell Slots:</h2>
                <ul>
                    {spellcastingData.spell_slots && spellcastingData.spell_slots.map((slot, index) => (
                        <li key={index}>{`Level ${index + 1}: ${slot} slots`}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Prepared Spells:</h2>
                <ul>
                    {spellcastingData.prepared_spells && spellcastingData.prepared_spells.map((spell) => (
                        <li key={spell.id}>{spell.name}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Known Spells:</h2>
                <ul>
                    {spellcastingData.known_spells && spellcastingData.known_spells.map((spell) => (
                        <li key={spell.id}>{spell.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Spellcasting;
