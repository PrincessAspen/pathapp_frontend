import React, { useEffect, useState } from 'react';
import { useCharacter } from '../CharacterContext';

const Home = () => {
    const { userCharacters, loading, deleteCharacter, fetchUserCharacters, updateCharacter } = useCharacter();
    const [classNames, setClassNames] = useState({});  // Store the class names by class ID
    const [raceNames, setRaceNames] = useState({});   // Store the race names by race ID

    useEffect(() => {
        if (!userCharacters.length) {
            fetchUserCharacters();
        }
    }, [userCharacters]);

    useEffect(() => {
        const fetchClassNames = async () => {
            try {
                const classNamesObj = {};
                for (const character of userCharacters) {
                    if (character.character_class_id && !classNamesObj[character.character_class_id]) {
                        const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.character_class_id}`);
                        if (classResponse.ok) {
                            const classData = await classResponse.json();
                            classNamesObj[character.character_class_id] = classData.name;
                        }
                    }
                }
                setClassNames(classNamesObj);
            } catch (err) {
                console.error("Error fetching class names:", err);
            }
        };

        const fetchRaceNames = async () => {
            try {
                const raceNamesObj = {};
                for (const character of userCharacters) {
                    if (character.race_id && !raceNamesObj[character.race_id]) {
                        const raceResponse = await fetch(`${import.meta.env.VITE_API_URL}/races/${character.race_id}`);
                        if (raceResponse.ok) {
                            const raceData = await raceResponse.json();
                            raceNamesObj[character.race_id] = raceData.name;
                        }
                    }
                }
                setRaceNames(raceNamesObj);
            } catch (err) {
                console.error("Error fetching race names:", err);
            }
        };

        if (userCharacters.length > 0) {
            fetchClassNames();
            fetchRaceNames();
        }
    }, [userCharacters]);

    const handleViewCharacter = (character) => {
        console.log('Before update:', character);  // Log character before update
        updateCharacter('name', character.name);
        updateCharacter('level', character.level);
        updateCharacter('characterClassId', character.character_class_id);
        updateCharacter('raceId', character.race_id);
        updateCharacter('alignmentId', character.alignment_id);
        updateCharacter('feats', character.feats);
        updateCharacter('stats', character.stats);
        updateCharacter('skills', character.skills);
        console.log('After update:', character);  // Log character after update
    };

    if (loading) {
        return <h2 className="text-xl text-center text-gray-500">Loading character data...</h2>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">Your Characters</h1>
            {userCharacters.length === 0 ? (
                <h2 className="text-2xl text-center text-gray-600">No characters found.</h2>
            ) : (
                <ul className="space-y-6">
                    {userCharacters.map((character) => (
                        <li key={character.id} className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-2xl font-semibold text-gray-800">{character.name}</h3>
                            <p className="text-gray-600">Level: {character.level}</p>
                            <p className="text-gray-600">Race: {raceNames[character.race_id] || 'N/A'}</p>
                            <p className="text-gray-600">Class: {classNames[character.character_class_id] || 'N/A'}</p>
                            <div className="mt-4 flex space-x-4">
                                <button 
                                    onClick={() => handleViewCharacter(character)} 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    View
                                </button>
                                <button 
                                    onClick={() => deleteCharacter(character.id)} 
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Home;
