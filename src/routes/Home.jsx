import React, { useEffect, useState } from 'react';
import { useCharacter } from '../CharacterContext';

const Home = () => {
    const { userCharacters, loading, deleteCharacter, fetchUserCharacters, updateCharacter } = useCharacter();
    const [classNames, setClassNames] = useState({});  // Store the class names by class ID
    const [raceNames, setRaceNames] = useState({});   // Store the race names by race ID

    useEffect(() => {
        // If needed, fetch characters again when component mounts
        if (!userCharacters.length) {
            fetchUserCharacters();
        }
    }, [userCharacters]);

    useEffect(() => {
        // Fetch class names based on character_class_id
        const fetchClassNames = async () => {
            try {
                const classNamesObj = {};

                // Loop through each character and fetch class name using class_id
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

        // Fetch race names based on race_id
        const fetchRaceNames = async () => {
            try {
                const raceNamesObj = {};

                // Loop through each character and fetch race name using race_id
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
            fetchClassNames();  // Fetch class names only if we have characters
            fetchRaceNames();   // Fetch race names only if we have characters
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
        return <h2>Loading character data...</h2>;
    }

    return (
        <div>
            <h1>Your Characters</h1>
            {userCharacters.length === 0 ? (
                <h2>No characters found.</h2>
            ) : (
                <ul>
                    {userCharacters.map((character) => (
                        <li key={character.id}>
                            <h3>{character.name}</h3>
                            <p>Level: {character.level}</p>
                            <p>Race: {raceNames[character.race_id] || 'N/A'}</p>  {/* Display race name */}
                            <p>Class: {classNames[character.character_class_id] || 'N/A'}</p>  {/* Display class name */}
                            <button onClick={() => handleViewCharacter(character)}>View</button>
                            <button onClick={() => deleteCharacter(character.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Home;
