import React, { useEffect, useState } from 'react';
import { useCharacter} from '../CharacterContext';

const Home = () => {
    const { userCharacters, loading, deleteCharacter, fetchUserCharacters } = useCharacter();
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    useEffect(() => {
        // If needed, fetch characters again when component mounts
        if (!userCharacters.length) {
            fetchUserCharacters();
        }
    }, [userCharacters]);

    console.log("Characters: ", userCharacters)

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
                            <p>Race: {character.race_id || 'N/A'}</p>
                            <p>Class: {character.character_class_id || 'N/A'}</p>
                            <button onClick={() => setSelectedCharacter(character)}>View</button>
                            <button onClick={() => deleteCharacter(character.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedCharacter && (
                <div>
                    <h2>{selectedCharacter.name}</h2>
                    {/* Render more details about the selected character */}
                </div>
            )}
        </div>
    );
};

export default Home;
