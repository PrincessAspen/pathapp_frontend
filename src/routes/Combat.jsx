import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Combat = () => {
    const { characterId } = useParams();
    const { character } = useCharacter();
    const [combatData, setCombatData] = useState(null);
    const [classData, setClassData] = useState(null);
    const [babProgressionData, setBabProgressionData] = useState(null);
    const [weapons, setWeapons] = useState([]);
    const [armor, setArmor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCombatData = async () => {
            try {
                if (!character || !character.characterClassId) {
                    throw new Error('Character or class not found');
                }

                const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.characterClassId}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classDetails = await classResponse.json();
                setClassData(classDetails);

                const babResponse = await fetch(`${import.meta.env.VITE_API_URL}/bab_progressions/2`);
                if (!babResponse.ok) {
                    throw new Error('Failed to fetch BAB progression data');
                }
                const babDetails = await babResponse.json();
                setBabProgressionData(babDetails);

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

                const weaponsJson = await Promise.all(weaponsData.map(res => res.json()));
                const armorJson = await Promise.all(armorData.map(res => res.json()));

                const filteredWeapons = weaponsJson.flat().filter(weapon => classDetails.starting_weapons.includes(weapon.name));
                const filteredArmor = armorJson.flat().filter(armorItem => classDetails.starting_armor.includes(armorItem.name));

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

                setWeapons(uniqueWeapons);
                setArmor(uniqueArmor);

                const constitution = character.stats?.Constitution || 10;
                const strength = character.stats?.Strength || 10;  // Strength value
                const dexterity = character.stats?.Dexterity || 10;  // Dexterity value
                const hitDie = classDetails.hit_die || 6;
                const conModifier = Math.floor((constitution - 10) / 2);
                const hitPoints = hitDie + conModifier;

                const armorClass = 10 + conModifier;
                const babProgression = babDetails ? babDetails[classDetails.bab_progression] : 0; // Ensure correct BAB
                const attackBonus = babProgression;

                // Calculate Melee and Ranged Attack Bonuses
                const meleeAttackBonus = attackBonus + Math.floor((strength - 10) / 2);  // Melee uses Strength modifier
                const rangedAttackBonus = attackBonus + Math.floor((dexterity - 10) / 2);  // Ranged uses Dexterity modifier

                setCombatData({
                    hit_points: hitPoints,
                    armor_class: armorClass,
                    attack_bonus: attackBonus,
                    melee_attack_bonus: meleeAttackBonus,
                    ranged_attack_bonus: rangedAttackBonus,
                    damage: "1d8",
                    fortitude_save: conModifier,
                    reflex_save: Math.floor((character.stats?.Dexterity || 10 - 10) / 2),
                    will_save: Math.floor((character.stats?.Wisdom || 10 - 10) / 2),
                    touch_ac: armorClass - 2,
                    flat_footed_ac: armorClass - 4,
                    movement_speed: "30 ft",
                    speeds: [{ type: 'Run', value: 90 }, { type: "Crawl", value: 5 }]
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCombatData();
    }, [characterId, character.characterClassId, character]);

    if (loading) {
        return <h2 className="text-center text-xl font-semibold text-gray-700">Loading combat data...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-red-600">Error: {error}</h2>;
    }

    return (
        <div className="container mx-auto px-6 py-8 bg-artsy">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Combat Statistics</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Hit Points:</h2>
                    <p className="text-lg text-gray-800">{combatData.hit_points}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Armor Class:</h2>
                    <p className="text-lg text-gray-800">{combatData.armor_class}</p>
                    <h3 className="font-medium mt-2 text-gray-900">Touch AC:</h3>
                    <p className="text-gray-800">{combatData.touch_ac}</p>
                    <h3 className="font-medium mt-2 text-gray-900">Flat-Footed AC:</h3>
                    <p className="text-gray-800">{combatData.flat_footed_ac}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Attack Bonus:</h2>
                    <p className="text-lg text-gray-800">{combatData.attack_bonus}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Melee Attack Bonus:</h2>
                    <p className="text-lg text-gray-800">{combatData.melee_attack_bonus}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Ranged Attack Bonus:</h2>
                    <p className="text-lg text-gray-800">{combatData.ranged_attack_bonus}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Saving Throws:</h2>
                    <div>
                        <h3 className="font-medium text-gray-900">Fortitude:</h3>
                        <p className="text-gray-800">{combatData.fortitude_save}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Reflex:</h3>
                        <p className="text-gray-800">{combatData.reflex_save}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Will:</h3>
                        <p className="text-gray-800">{combatData.will_save}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">Movement Speed:</h2>
                    <p className="text-lg text-gray-800">{combatData.movement_speed}</p>
                    <h3 className="font-medium mt-2 text-gray-900">Other Speeds:</h3>
                    <ul className="list-disc pl-6 text-gray-800">
                        {combatData.speeds.map((speed) => (
                            <li key={speed.type} className="text-lg">{`${speed.type}: ${speed.value} ft.`}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Starting Weapons:</h2>
                <ul className="list-disc pl-6 text-gray-800">
                    {weapons.map((weapon) => (
                        <li key={weapon.name} className="text-lg">{weapon.name} - {weapon.damage_dice} damage</li>
                    ))}
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Starting Armor:</h2>
                <ul className="list-disc pl-6 text-gray-800">
                    {armor.map((armorItem) => (
                        <li key={armorItem.name} className="text-lg">{armorItem.name} - AC Bonus: {armorItem.armor_bonus}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
    
export default Combat;
