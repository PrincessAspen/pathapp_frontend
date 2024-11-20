import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacter } from '../CharacterContext';

const CharacterOverview = () => {
    const { characterId } = useParams();
    const { character } = useCharacter();
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

        const skill = skills.find(s => s.id === skillId); 
        console.log('Skill:', skill);

        if (!skill) return 0;

        const skillRank = character.skills?.[skillId] || 0;  
        const statName = statMapping[skill.modifying_stat_id];
        const statValue = character.stats?.[statName] || 10;  
        const statModifier = Math.floor((statValue - 10) / 2);  

        console.log('Skill Rank:', skillRank);
        console.log('Stat Value:', statValue);
        console.log('Stat Modifier:', statModifier);

        const isClassSkill = classData?.class_skills?.includes(skill.name);
        console.log('Is Class Skill:', isClassSkill);

        const classBonus = (skillRank >= 1 && isClassSkill) ? 3 : 0;

        console.log('Class Bonus:', classBonus);

        return skillRank + statModifier + classBonus;
    };

    if (loading) {
        return <h2 className="text-center text-2xl font-semibold text-gray-700">Loading character data...</h2>;
    }

    if (error) {
        return <h2 className="text-center text-2xl font-semibold text-red-600">Error: {error}</h2>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 bg-artsy">
            <h1 className="text-4xl font-bold text-center text-indigo-600 mb-12">Character Overview</h1>

            <div className="space-y-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-xl text-gray-800">Name:</h2>
                        <p className="text-lg text-gray-600">{character.name || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-xl text-gray-800">Class:</h2>
                        <p className="text-lg text-gray-600">{classData?.name || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:w-1/3">
                        <h2 className="font-semibold text-xl text-gray-800">Hit Points:</h2>
                        <p className="text-lg text-gray-600">{combatData?.hit_points || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10 mb-8">
                <h3 className="text-2xl font-semibold text-gray-800">Feats:</h3>
                {featsData.length > 0 ? (
                    <ul className="space-y-4">
                        {featsData.map((feat, index) => (
                            <li key={index} className="text-lg text-gray-600">{feat.name || 'Unnamed feat'}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-lg text-gray-600">No feats available.</p>
                )}
            </div>

            <div className="space-y-10">
                <h3 className="text-2xl font-semibold text-gray-800">Skills:</h3>
                {skills.length > 0 ? (
                    <ul className="space-y-4">
                        {skills.map((skill) => {
                            const skillRank = character.skills?.[skill.id] || 0; 
                            return (
                                <li key={skill.id} className="text-lg text-gray-600">
                                    {skill.name || 'Unknown Skill'}: 
                                    {getSkillFinalValue(skill.id)}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-lg text-gray-600">No skills available.</p>
                )}
            </div>
        </div>
    );
};

export default CharacterOverview;
