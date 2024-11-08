// Combat.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Combat = () => {
    const { characterId } = useParams(); // Assumes `characterId` is passed in the route
    const [combatData, setCombatData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCombatData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/characters/${characterId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch combat data');
                }
                const data = await response.json();
                setCombatData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCombatData();
    }, [characterId]);

    if (loading) {
        return <h2>Loading combat data...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <div>
            <h1>Combat Statistics</h1>
            <div>
                <h2>Hit Points:</h2>
                <p>{combatData.hit_points}</p>
            </div>
            <div>
                <h2>Armor Class:</h2>
                <p>{combatData.armor_class}</p>
                <h3>Touch AC:</h3>
                <p>{combatData.touch_ac}</p>
                <h3>Flat-Footed AC:</h3>
                <p>{combatData.flat_footed_ac}</p>
            </div>
            <div>
                <h2>Attack Bonus:</h2>
                <p>{combatData.attack_bonus}</p>
            </div>
            <div>
                <h2>Damage:</h2>
                <p>{combatData.damage}</p>
            </div>
            <div>
                <h2>Saving Throws:</h2>
                <div>
                    <h3>Fortitude:</h3>
                    <p>{combatData.fortitude_save}</p>
                </div>
                <div>
                    <h3>Reflex:</h3>
                    <p>{combatData.reflex_save}</p>
                </div>
                <div>
                    <h3>Will:</h3>
                    <p>{combatData.will_save}</p>
                </div>
            </div>
            <div>
                <h2>Movement Speed:</h2>
                <p>{combatData.movement_speed}</p>
                <h3>Other Speeds:</h3>
                <ul>
                    {combatData.speeds && combatData.speeds.map((speed) => (
                        <li key={speed.type}>{`${speed.type}: ${speed.value}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Combat;
