import React, { useState, useEffect } from 'react';
import { useCharacter } from '../CharacterContext';

const CharacterCreationPage = () => {
    const { character, updateCharacter, resetCharacter } = useCharacter();
    const [tempData, setTempData] = useState(character);
    const [classes, setClasses] = useState([]);
    const [alignments, setAlignments] = useState([]);

    // Fetch options for classes and alignments on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/character_classes/`);
                const data = await response.json();
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        const fetchAlignments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/alignments/`);
                const data = await response.json();
                setAlignments(data);
            } catch (error) {
                console.error('Error fetching alignments:', error);
            }
        };

        fetchClasses();
        fetchAlignments();
    }, []);

    // Handle temporary form changes before confirming
    const handleChange = (key, value) => {
        setTempData((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    // Confirm changes to CharacterContext
    const confirmChanges = () => {
        Object.keys(tempData).forEach((key) => {
            updateCharacter(key, tempData[key]);
        });
    };

    // Final save function to POST to API
    const saveCharacter = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/characters/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(character)
            });
            if (response.ok) {
                alert('Character saved successfully!');
                resetCharacter();  // Reset form after saving
            } else {
                alert('Failed to save character');
            }
        } catch (error) {
            console.error('Error saving character:', error);
        }
    };

    return (
        <div>
            <h1>Create Your Character</h1>
            
            <section>
                <h2>Basic Information</h2>
                <label>Name:</label>
                <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                <label>Level:</label>
                <input
                    type="number"
                    value={tempData.level}
                    onChange={(e) => handleChange('level', parseInt(e.target.value))}
                />
            </section>

            <section>
                <h2>Class & Alignment</h2>
                <label>Class:</label>
                <select
                    value={tempData.characterClassId || ''}
                    onChange={(e) => handleChange('characterClassId', parseInt(e.target.value))}
                >
                    <option value="">Select Class</option>
                    {classes.map((charClass) => (
                        <option key={charClass.id} value={charClass.id}>
                            {charClass.name}
                        </option>
                    ))}
                </select>

                <label>Alignment:</label>
                <select
                    value={tempData.alignmentId || ''}
                    onChange={(e) => handleChange('alignmentId', parseInt(e.target.value))}
                >
                    <option value="">Select Alignment</option>
                    {alignments.map((alignment) => (
                        <option key={alignment.id} value={alignment.id}>
                            {alignment.name}
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h2>Feats</h2>
                <button onClick={() => handleChange('feats', [...tempData.feats, 'New Feat'])}>
                    Add Feat
                </button>
                <ul>
                    {tempData.feats.map((feat, index) => (
                        <li key={index}>{feat}</li>
                    ))}
                </ul>
            </section>

            {/* Repeat similar sections for Spells, Stats, Skills, Weapons, Armor, Inventory, and Money */}

            <button onClick={confirmChanges}>Confirm Changes</button>
            <button onClick={saveCharacter}>Save Character</button>
        </div>
    );
};

export default CharacterCreationPage;
