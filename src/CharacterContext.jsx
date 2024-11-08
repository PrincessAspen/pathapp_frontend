import React, { createContext, useContext, useState } from 'react';

const CharacterContext = createContext();

export const useCharacter = () => useContext(CharacterContext);

export const CharacterProvider = ({ children }) => {
    const [character, setCharacter] = useState({
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

    return (
        <CharacterContext.Provider value={{ character, updateCharacter, resetCharacter }}>
            {children}
        </CharacterContext.Provider>
    );
};

export default CharacterProvider;
