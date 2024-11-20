import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CharacterContext = createContext();

export const useCharacter = () => {
    const context = useContext(CharacterContext);
    if (!context) {
        throw new Error('useCharacter must be used within a CharacterProvider');
    }
    return context;
};

export const CharacterProvider = ({ children }) => {
    const { user, token } = useAuth();  // Get user and token from AuthContext
    const [userCharacters, setUserCharacters] = useState([]); // Store fetched characters
    const [character, setCharacter] = useState({
        name: '',
        alignmentId:0,
        level: 1,
        characterClassId: 0,
        raceId: 0,
        saveProgressionType: 0,
        feats: [],
        spells: [],
        stats: [],
        skills: [],
        weapons: [],
        armor: [],
        inventoryItems: [],
        money: []
    }); // Store the current character being created

    const updateCharacter = (key, value) => {
        console.log(`Updating character's ${key} to ${value}`);
        setCharacter((prevCharacter) => ({
            ...prevCharacter,
            [key]: value,
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
            money: [],
            raceId: null
        });
        setUserCharacters([])
    };

    // Save the character to the backend (to the database)
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
            money,
            raceId
        } = character;  // Get character data from context

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/characters/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Send token for authentication
                },
                body: JSON.stringify({
                    name,
                    level,
                    character_class_id: characterClassId,
                    alignment_id: alignmentId,
                    feats,
                    stats,
                    skills,
                    weapons,
                    armor,
                    inventory_items: inventoryItems,
                    money,
                    race_id: raceId
                }),
            });

            if (response.ok) {
                const newCharacter = await response.json();
                setUserCharacters((prev) => [...prev, newCharacter]); // Add the newly created character to the list
                alert('Character saved successfully!');
            } else {
                console.error('Failed to save character');
                alert('Error saving character');
            }
        } catch (error) {
            console.error('Error saving character:', error);
            alert('Failed to save character');
        }
    };

    // Delete a character from the backend (and update context)
    const deleteCharacter = async (characterId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/characters/${characterId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Send token for authentication
                },
            });

            if (response.ok) {
                setUserCharacters((prev) => prev.filter((char) => char.id !== characterId)); // Remove the deleted character from the list
                alert('Character deleted successfully!');
            } else {
                console.error('Failed to delete character');
                alert('Error deleting character');
            }
        } catch (error) {
            console.error('Error deleting character:', error);
            alert('Failed to delete character');
        }
    };

    return (
        <CharacterContext.Provider
            value={{
                userCharacters, // List of characters fetched from the database
                character, // Current character being created
                updateCharacter, // Function to update character details
                resetCharacter, // Function to reset the current character data
                saveCharacter, // Function to save character to the backend
                deleteCharacter, // Function to delete character from the backend
            }}
        >
            {children}
        </CharacterContext.Provider>
    );
};

export default CharacterProvider;
