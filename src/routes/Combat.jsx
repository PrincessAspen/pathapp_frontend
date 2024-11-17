import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Combat = () => {
    const { characterId } = useParams();
    const { character } = useCharacter();
    const [combatData, setCombatData] = useState(null);
    const [classData, setClassData] = useState(null);
    const [babProgressionData, setBabProgressionData] = useState(null); // To store BAB data
    const [weapons, setWeapons] = useState([]);
    const [armor, setArmor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCombatData = async () => {
            try {
                // Check if character is loaded from context, if so, no need to fetch again
                if (!character || !character.characterClassId) {
                    throw new Error('Character or class not found');
                }

                // Fetch class details using character's class_id
                const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.characterClassId}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classDetails = await classResponse.json();
                setClassData(classDetails);

                // Fetch BAB progression details from bab_progressions table using bab_progression from class
                const babResponse = await fetch(`${import.meta.env.VITE_API_URL}/bab_progressions/2`); // BAB Progression ID is 2 for level 1
                if (!babResponse.ok) {
                    throw new Error('Failed to fetch BAB progression data');
                }
                const babDetails = await babResponse.json();
                setBabProgressionData(babDetails);

                // Fetch weapons and armor based on starting equipment from the class
                const weaponsData = await Promise.all(
                    classDetails.starting_weapons.map((weaponName) =>
                        fetch(`${import.meta.env.VITE_API_URL}/weapons?name=${weaponName}`)
                    )
                );
                const armorData = await Promise.all(
                    classDetails.starting_armor.map((armorName) =>
                        fetch(`${import.meta.env.VITE_API_URL}/armor?name=${armorName}`)
                    )
                );

                // Process the fetched data
                const weaponsJson = await Promise.all(weaponsData.map(res => res.json()));
                const armorJson = await Promise.all(armorData.map(res => res.json()));

                // Flatten and filter weapons and armor based on starting equipment
                const filteredWeapons = weaponsJson.flat().filter(weapon => classDetails.starting_weapons.includes(weapon.name));
                const filteredArmor = armorJson.flat().filter(armorItem => classDetails.starting_armor.includes(armorItem.name));

                // Remove duplicates using reduce
                const uniqueWeapons = filteredWeapons.reduce((acc, weapon) => {
                    if (!acc.some(existingWeapon => existingWeapon.name === weapon.name)) {
                        acc.push(weapon);
                    }
                    return acc;
                }, []);

                const uniqueArmor = filteredArmor.reduce((acc, armorItem) => {
                    if (!acc.some(existingArmor => existingArmor.name === armorItem.name)) {
                        acc.push(armorItem);
                    }
                    return acc;
                }, []);

                setWeapons(uniqueWeapons);  // Set filtered unique weapons
                setArmor(uniqueArmor);  // Set filtered unique armor

                // Calculate combat data based on character's stats and class
                const constitution = character.stats?.Constitution || 10;
                const hitDie = classDetails.hit_die || 6;  // Default hit die if not found
                const conModifier = Math.floor((constitution - 10) / 2); // Calculate constitution modifier
                const hitPoints = hitDie + conModifier; // HP = HD + CON modifier

                const armorClass = 10 + conModifier;  // Basic AC formula, modify as needed based on equipment and stats

                // Check babProgressionData to pull the value for the BAB
                const babProgression = babProgressionData ? babProgressionData[classDetails.bab_progression] : 0;  // Default to 0 if not found
                const attackBonus = babProgression;  // Adjust this based on class features, etc.

                // Set calculated combat stats
                setCombatData({
                    hit_points: hitPoints,
                    armor_class: armorClass,
                    attack_bonus: attackBonus,
                    damage: "1d8", // Modify based on weapon class/attack
                    fortitude_save: conModifier,  // Example, modify based on character class and stats
                    reflex_save: Math.floor((character.stats?.Dexterity || 10 - 10) / 2), // Modify as needed
                    will_save: Math.floor((character.stats?.Wisdom || 10 - 10) / 2), // Modify as needed
                    touch_ac: armorClass - 2,  // For example, some modification logic
                    flat_footed_ac: armorClass - 4, // Example
                    movement_speed: "30 ft",  // Example
                    speeds: [{ type: 'Run', value: 90 }, {type: "Crawl", value: 5}]
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCombatData();

    }, [characterId, character.characterClassId, character, babProgressionData]);  // Fetch based on context character and babProgressionData

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
                        <li key={speed.type}>{`${speed.type}: ${speed.value}`} ft.</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Starting Weapons:</h2>
                <ul>
                    {weapons.map((weapon) => (
                        <li key={weapon.name}>{weapon.name} - {weapon.damage_dice} damage</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Starting Armor:</h2>
                <ul>
                    {armor.map((armorItem) => (
                        <li key={armorItem.name}>{armorItem.name} - AC Bonus: {armorItem.armor_bonus}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Combat;
