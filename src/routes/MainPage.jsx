import React, { useEffect, useState } from 'react';

const MainPage = () => {
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/character/${characterId}`); // Replace with the actual character ID
                const data = await response.json();
                setCharacter(data);
            } catch (error) {
                console.error('Error fetching character data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, []);

    if (loading) {
        return <h2>Loading character data...</h2>;
    }

    if (!character) {
        return <h2>No character data found.</h2>;
    }

    return (
        <div>
            <div>
                <h1>Hit Points: {character.hit_points || 'N/A'}</h1>
                <h1>Armor Class: {character.armor_class || 'N/A'}</h1>
                <h3>Touch AC: {character.touch_ac || 'N/A'}</h3>
                <h3>Flat-Footed AC: {character.flat_footed_ac || 'N/A'}</h3>
            </div>
            <div>
                <h1>Fortitude: {character.fortitude || 'N/A'}</h1>
                <h1>Reflex: {character.reflex || 'N/A'}</h1>
                <h1>Will: {character.will || 'N/A'}</h1>
            </div>
            <div>
                <h1>Base Speed: {character.base_speed || 'N/A'} ft</h1>
                <h3>Swim Speed: {character.swim_speed || 'N/A'} ft</h3>
                <h3>Climb Speed: {character.climb_speed || 'N/A'} ft</h3>
                <h3>Fly Speed: {character.fly_speed || 'N/A'} ft</h3>
                <h3>Burrow Speed: {character.burrow_speed || 'N/A'} ft</h3>
            </div>
        </div>
    );
};

export default MainPage;
