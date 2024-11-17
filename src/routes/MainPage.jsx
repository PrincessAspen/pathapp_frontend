import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const CharacterOverview = () => {
    const { characterId } = useParams(); // Get the characterId from the URL
    const { character } = useCharacter(); // Get character data from the context
    const [combatData, setCombatData] = useState(null);  // Store calculated combat data
    const [classData, setClassData] = useState(null);  // Store class data
    const [armorData, setArmorData] = useState([]);  // Store armor data
    const [shieldData, setShieldData] = useState(null);  // Store shield data
    const [featsData, setFeatsData] = useState([]);  // Store feats data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCharacterData = async () => {
            try {
                // Check if character is loaded from context, if so, no need to fetch again
                if (!character || !character.characterClassId) {
                    throw new Error('Character or class not found');
                }

                // Fetch class details using character's class_id (correct field)
                const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.characterClassId}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classDetails = await classResponse.json();
                setClassData(classDetails);

                // Fetch feats and any other necessary data
                const feats = character.feats || [];

                // Fetch details for each feat by its ID
                const featPromises = feats.map(featId =>
                    fetch(`${import.meta.env.VITE_API_URL}/feats/${featId}`).then(res => res.json())
                );

                const featsJson = await Promise.all(featPromises);

                setFeatsData(featsJson);  // Store fetched feats data

                // Calculate HP based on class hit die and Constitution modifier
                const constitution = character.stats?.Constitution || 10; // Default to 10 if not found
                const hitDie = classDetails.hit_die || 6;  // Default hit die if not found
                const conModifier = Math.floor((constitution - 10) / 2); // Calculate constitution modifier
                const hitPoints = hitDie + conModifier; // HP = HD + CON modifier

                // Fetch armor and shield data based on starting armor
                const armorDataPromises = classDetails.starting_armor.filter(item => !item.toLowerCase().includes("shield")).map((armorName) =>
                    fetch(`${import.meta.env.VITE_API_URL}/armor?name=${armorName}`)
                );
                const shieldDataPromises = classDetails.starting_armor.filter(item => item.toLowerCase().includes("shield")).map((shieldName) =>
                    fetch(`${import.meta.env.VITE_API_URL}/armor?name=${shieldName}`)
                );

                // Fetch armor and shield data
                const armorJsonResponses = await Promise.all(armorDataPromises);
                const shieldJsonResponses = await Promise.all(shieldDataPromises);

                // Check if responses are valid
                const armorJson = await Promise.all(armorJsonResponses.map(res => {
                    if (!res.ok) {
                        console.error('Armor fetch failed:', res);
                        return null; // Handle failed response
                    }
                    return res.json();
                }));
                
                const shieldJson = await Promise.all(shieldJsonResponses.map(res => {
                    if (!res.ok) {
                        console.error('Shield fetch failed:', res);
                        return null; // Handle failed response
                    }
                    return res.json();
                }));

                // Filter valid data
                setArmorData(armorJson.flat().filter(armor => armor));  // Only set valid armor
                setShieldData(shieldJson.flat().filter(shield => shield)[0]);  // Only set valid shield, assuming one shield

                // Set calculated combat stats
                setCombatData({
                    hit_points: hitPoints,
                    attack_bonus: 0,  // Placeholder, calculate based on BAB or other factors
                    damage: "1d8",  // Placeholder damage, modify based on weapon or class
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacterData();
    }, [characterId, character]);  // Fetch based on context character

    if (loading) {
        return <h2>Loading character data...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <div>
            <h1>Character Overview</h1>
            <div>
                <h2>Name: {character.name || 'N/A'}</h2>
                {/* Use classData.name to display the class name */}
                <h3>Class: {classData?.name || 'N/A'}</h3>
            </div>
            <div>
                <h2>Hit Points: {combatData.hit_points || 'N/A'}</h2>
            </div>
            <div>
                <h3>Feats:</h3>
                {featsData.length > 0 ? (
                    <ul>
                        {featsData.map((feat, index) => (
                            <li key={index}>{feat.name || 'Unnamed feat'}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No feats available.</p>
                )}
            </div>
        </div>
    );
};

export default CharacterOverview;
