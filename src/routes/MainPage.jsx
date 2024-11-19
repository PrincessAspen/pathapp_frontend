import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const CharacterOverview = () => {
    const { characterId } = useParams(); // Get the characterId from the URL
    const { character } = useCharacter(); // Get character data from the context
    const [combatData, setCombatData] = useState(null);  // Store calculated combat data
    const [classData, setClassData] = useState(null);  // Store class data
    const [armorData, setArmorData] = useState([]);  // Store armor data
    const [shieldData, setShieldData] = useState(null);  // Store shield data
    const [featsData, setFeatsData] = useState([]);  // Store feats data
    const [skills, setSkills] = useState([]);  // Store the list of skills
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCharacterData = async () => {
            try {
                console.log('Fetching character data...');
                if (!character || !character.characterClassId) {
                    throw new Error('Character or class not found');
                }

                console.log('Character Data:', character);
                
                const classResponse = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/${character.characterClassId}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classDetails = await classResponse.json();
                console.log('Class Data:', classDetails);
                setClassData(classDetails);

                const feats = character.feats || [];
                console.log('Feats:', feats);
                const featPromises = feats.map(featId =>
                    fetch(`${import.meta.env.VITE_API_URL}/feats/${featId}`).then(res => res.json())
                );
                const featsJson = await Promise.all(featPromises);
                console.log('Fetched Feats:', featsJson);
                setFeatsData(featsJson);

                const skillResponse = await fetch(`${import.meta.env.VITE_API_URL}/skills/`);
                const skillsData = await skillResponse.json();
                console.log('Fetched Skills:', skillsData);
                setSkills(skillsData);

                const constitution = character.stats?.Constitution || 10;
                const hitDie = classDetails.hit_die || 6;
                const conModifier = Math.floor((constitution - 10) / 2);
                const hitPoints = hitDie + conModifier;

                console.log('Calculated HP:', hitPoints);

                const armorDataPromises = classDetails.starting_armor.filter(item => !item.toLowerCase().includes("shield")).map((armorName) =>
                    fetch(`${import.meta.env.VITE_API_URL}/armor?name=${armorName}`)
                );
                const shieldDataPromises = classDetails.starting_armor.filter(item => item.toLowerCase().includes("shield")).map((shieldName) =>
                    fetch(`${import.meta.env.VITE_API_URL}/armor?name=${shieldName}`)
                );

                const armorJsonResponses = await Promise.all(armorDataPromises);
                const shieldJsonResponses = await Promise.all(shieldDataPromises);

                const armorJson = await Promise.all(armorJsonResponses.map(res => res.json()));
                const shieldJson = await Promise.all(shieldJsonResponses.map(res => res.json()));

                setArmorData(armorJson.flat().filter(armor => armor));
                setShieldData(shieldJson.flat().filter(shield => shield)[0]);

                setCombatData({
                    hit_points: hitPoints,
                    attack_bonus: 0,
                    damage: "1d8",
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacterData();
    }, [characterId, character]);

    // Function to calculate the final skill value for each skill
    // Mapping of stat IDs to stat names
const statMapping = {
    1: 'Strength',
    2: 'Dexterity',
    3: 'Constitution',
    4: 'Intelligence',
    5: 'Wisdom',
    6: 'Charisma'
};

const getSkillFinalValue = (skillId) => {
    console.log('Calculating final value for skill ID:', skillId);

    const skill = skills.find(s => s.id === skillId);  // Find the skill by its ID
    console.log('Skill:', skill);

    if (!skill) return 0;

    // Get skill rank from character.skills or default to 0
    const skillRank = character.skills?.[skillId] || 0;  
    // Get stat name from the mapping based on skill.modifying_stat_id
    const statName = statMapping[skill.modifying_stat_id];
    // Get stat value from character.stats using statName
    const statValue = character.stats?.[statName] || 10;  
    // Calculate stat modifier
    const statModifier = Math.floor((statValue - 10) / 2);  

    console.log('Skill Rank:', skillRank);
    console.log('Stat Value:', statValue);
    console.log('Stat Modifier:', statModifier);

    // Check if the skill is a class skill (listed in class_skills)
    const isClassSkill = classData?.class_skills?.includes(skill.name);
    console.log('Is Class Skill:', isClassSkill);

    // Add the class skill bonus only if rank >= 1
    const classBonus = (skillRank >= 1 && isClassSkill) ? 3 : 0;

    console.log('Class Bonus:', classBonus);

    // Final value is the sum of rank, stat modifier, and class bonus
    return skillRank + statModifier + classBonus;
};


    if (loading) {
        return <h2>Loading character data...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    return (
        <div>
            <h1>Character Overview</h1>
            <div>
                <h2>Name: {character.name || 'N/A'}</h2>
                <h3>Class: {classData?.name || 'N/A'}</h3>
            </div>
            <div>
                <h2>Hit Points: {combatData.hit_points || 'N/A'}</h2>
            </div>
            <div>
                <h3>Feats:</h3>
                {featsData.length > 0 ? (
                    <ul>
                        {featsData.map((feat, index) => (
                            <li key={index}>{feat.name || 'Unnamed feat'}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No feats available.</p>
                )}
            </div>
            <div>
                <h3>Skills:</h3>
                {skills.length > 0 ? (
                    <ul>
                        {skills.map((skill) => {
                            const skillRank = character.skills?.[skill.id] || 0;  // Default rank is 0
                            return (
                                <li key={skill.id}>
                                    {skill.name || 'Unknown Skill'}: 
                                    {getSkillFinalValue(skill.id)}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No skills available.</p>
                )}
            </div>
        </div>
    );
};

export default CharacterOverview;
