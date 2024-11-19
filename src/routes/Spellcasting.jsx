import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Spellcasting = () => {
    const { characterId } = useParams(); // Get the characterId from the URL
    const { character } = useCharacter(); // Get character data from the context
    const [spellcastingData, setSpellcastingData] = useState(null);
    const [classData, setClassData] = useState(null);
    const [casterTypeData, setCasterTypeData] = useState(null);
    const [spells, setSpells] = useState({}); // Store spells by level (0-9)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpellcastingData = async () => {
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
                setClassData(classDetails);

                // Fetch caster type data based on character's casterTypeId
                const casterTypeResponse = await fetch(`${import.meta.env.VITE_API_URL}/caster_types/${classDetails.caster_type_id}`);
                if (!casterTypeResponse.ok) {
                    throw new Error('Failed to fetch caster type data');
                }
                const casterDetails = await casterTypeResponse.json();
                setCasterTypeData(casterDetails);

                // Fetch all spells from the spells table
                const spellsResponse = await fetch(`${import.meta.env.VITE_API_URL}/spells`);
                if (!spellsResponse.ok) {
                    throw new Error('Failed to fetch spells');
                }
                const allSpells = await spellsResponse.json();

                // Filter spells that match the class name in `class_lists`
                const className = classDetails.name; // Get the class name from the class data
                const filteredSpells = allSpells.filter(spell => spell.class_lists.includes(className));

                // Organize the spells into levels (0-9)
                const spellsByLevel = {};
                filteredSpells.forEach(spell => {
                    const spellLevel = spell.spell_level || 0; // Default to level 0 if no level is set
                    if (!spellsByLevel[spellLevel]) {
                        spellsByLevel[spellLevel] = [];
                    }
                    spellsByLevel[spellLevel].push(spell);
                });

                setSpells(spellsByLevel);

                // Calculate spell slots per day based on caster type
                const spellSlots = [];
                for (let i = 0; i <= 9; i++) {  // Loop through spell levels 0-9
                    if (casterDetails[`spell_level_${i}`]) {
                        spellSlots[i] = casterDetails[`spell_level_${i}`];
                    }
                }

                // Set spellcasting data with spell slots, prepared and known spells
                setSpellcastingData({
                    spell_attack_bonus: 0, // Example, calculate if needed
                    spell_save_dc: 10 + Math.floor((character.stats?.Charisma || 10) - 10) / 2, // Example calculation for Charisma-based casters
                    spell_slots: spellSlots,
                    known_spells: Object.values(spellsByLevel).flat(), // Combine all spells from all levels into a single list
                    prepared_spells: [], // Implement this based on caster type if applicable
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpellcastingData();
    }, [characterId, character]);

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
                        <li key={index}>{`Level ${index}: ${slot} slots`}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Spells:</h2>
                {Object.keys(spells).map((spellLevel) => (
                    <div key={spellLevel}>
                        <h3>Level {spellLevel} Spells:</h3>
                        <ul>
                            {spells[spellLevel]?.map((spell) => (
                                <li key={spell.name || spell.id}>{spell.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Spellcasting;
