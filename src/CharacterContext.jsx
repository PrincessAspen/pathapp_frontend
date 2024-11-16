import React, { createContext, useContext, useState } from 'react';

const CharacterContext = createContext();

export const useCharacter = () => {
    const context = useContext(CharacterContext);
    if (!context) {
        throw new Error('useCharacter must be used within a CharacterProvider');
    }
    return context;
};

export const CharacterProvider = ({ children }) => {
    const [character, setCharacter] = useState({
        name: '',
        alignmentId: null,
        level: 1,
        characterClassId: null,
        alignmentId: null,
        saveProgressionType: null,
        feats: [],
        spells: [],
        stats: [],
        skills: [],
        weapons: [],
        armor: [],
        inventoryItems: [],
        money: []
    });

    const updateCharacter = (key, value) => {
        setCharacter((prevCharacter) => ({
            ...prevCharacter,
            [key]: value
        }));
    };

    const resetCharacter = () => {
        setCharacter({
            name: '',
            level: 1,
            characterClassId: null,
            alignmentId: null,
            saveProgressionType: null,
            feats: [],
            spells: [],
            stats: [],
            skills: [],
            weapons: [],
            armor: [],
            inventoryItems: [],
            money: []
        });

        
    };

    const saveCharacter = async () => {
        const {
            name,
            level,
            characterClassId,
            alignmentId,
            feats,
            stats,
            skills,
            weapons,
            armor,
            inventoryItems,
            money
        } = character;  // Get the actual character data from context
    
        try {
            // First, create the character in the characters table
            const characterResponse = await fetch(`${import.meta.env.VITE_API_URL}/characters/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    level,
                    character_class_id: characterClassId,
                    alignment_id: alignmentId,  // Send the actual alignmentId from context
                    feats,
                    stats,
                    skills,
                    weapons,
                    armor,
                    inventory_items: inventoryItems,
                    money
                }),
            });

            //const characterData = await characterResponse.json();  // Getting the character ID

            // Now, save the feats (using CharacterFeatLink table)
            // for (const featId of feats) {
            //     await fetch(`${import.meta.env.VITE_API_URL}/character_feat_link/`, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //             character_id: characterData.id,
            //             feat_id: featId,
            //         }),
            //     });
            // }

            // // Now, save the stats (using CharacterStatLink table)
            // for (const [statId, value] of Object.entries(stats)) {
            //     await fetch(`${import.meta.env.VITE_API_URL}/character_stat_link/`, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //             character_id: characterData.id,
            //             stat_id: statId,
            //             value: value,
            //         }),
            //     });
            // }

            // // Now, save the skills (using CharacterSkillLink table)
            // for (const [skillId, rank] of Object.entries(skills)) {
            //     await fetch(`${import.meta.env.VITE_API_URL}/character_skill_link/`, {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json',
            //         },
            //         body: JSON.stringify({
            //             character_id: characterData.id,
            //             skill_id: skillId,
            //             ranks: rank,
            //         }),
            //     });
            // }

            // Optionally save other data like weapons, armor, inventory items, etc.
            // Repeat the process for each of these as needed

            alert('Character saved successfully!');
        } catch (error) {
            console.error('Error saving character:', error);
            alert('Failed to save character');
        }
    };

    return (
        <CharacterContext.Provider value={{ character, updateCharacter, resetCharacter, saveCharacter }}>
            {children}
        </CharacterContext.Provider>
    );
};

export default CharacterProvider;
