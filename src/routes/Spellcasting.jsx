import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const Spellcasting = () => {
    const { characterId } = useParams();
    const { character } = useCharacter();
    const [spellcastingData, setSpellcastingData] = useState(null);
    const [classData, setClassData] = useState(null);
    const [casterTypeData, setCasterTypeData] = useState(null);
    const [spells, setSpells] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpellcastingData = async () => {
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

                const casterTypeResponse = await fetch(`${import.meta.env.VITE_API_URL}/caster_types/${classDetails.caster_type_id}`);
                if (!casterTypeResponse.ok) {
                    throw new Error('Failed to fetch caster type data');
                }
                const casterDetails = await casterTypeResponse.json();
                setCasterTypeData(casterDetails);

                const spellsResponse = await fetch(`${import.meta.env.VITE_API_URL}/spells`);
                if (!spellsResponse.ok) {
                    throw new Error('Failed to fetch spells');
                }
                const allSpells = await spellsResponse.json();

                const className = classDetails.name;
                const filteredSpells = allSpells.filter(spell => spell.class_lists.includes(className));

                const spellsByLevel = {};
                filteredSpells.forEach(spell => {
                    const spellLevel = spell.spell_level || 0;
                    if (!spellsByLevel[spellLevel]) {
                        spellsByLevel[spellLevel] = [];
                    }
                    spellsByLevel[spellLevel].push(spell);
                });

                setSpells(spellsByLevel);

                const spellSlots = [];
                for (let i = 0; i <= 9; i++) {
                    if (casterDetails[`spell_level_${i}`]) {
                        spellSlots[i] = casterDetails[`spell_level_${i}`];
                    }
                }

                setSpellcastingData({
                    spell_attack_bonus: 0,
                    spell_save_dc: 10 + Math.floor((character.stats?.Charisma || 10) - 10) / 2,
                    spell_slots: spellSlots,
                    known_spells: Object.values(spellsByLevel).flat(),
                    prepared_spells: [],
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
        return <h2 className="text-center text-xl font-semibold text-gray-700">Loading spellcasting data...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-xl font-semibold text-red-600">Error: {error}</h2>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-artsy">
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Spellcasting</h1>

            <div className="space-y-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-lg text-gray-800">Spell Attack Bonus:</h2>
                        <p className="text-gray-600">{spellcastingData.spell_attack_bonus}</p>
                    </div>
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-lg text-gray-800">Spell Save DC:</h2>
                        <p className="text-gray-600">{spellcastingData.spell_save_dc}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-lg text-gray-800">Spell Slots:</h2>
                        <ul className="space-y-2 text-gray-600">
                            {spellcastingData.spell_slots && spellcastingData.spell_slots.map((slot, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>Level {index}</span>
                                    <span>{slot} slots</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-800">Spells:</h2>
                {Object.keys(spells).map((spellLevel) => (
                    <div key={spellLevel} className="space-y-4">
                        <h3 className="text-xl font-semibold text-indigo-600">Level {spellLevel} Spells:</h3>
                        <ul className="space-y-3">
                            {spells[spellLevel]?.map((spell) => (
                                <li key={spell.name || spell.id} className="p-4 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition-all">
                                    <h4 className="text-lg font-medium text-gray-800">{spell.name}</h4>
                                    <p className="text-gray-600">{spell.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Spellcasting;
