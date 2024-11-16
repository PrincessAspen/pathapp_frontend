import React, { useState, useEffect } from 'react';
import { useCharacter } from '../CharacterContext';

const CharacterCreationPage = () => {
    const { character, updateCharacter, saveCharacter } = useCharacter();
    const [classes, setClasses] = useState([]);
    const [races, setRaces] = useState([]);
    const [alignments, setAlignments] = useState([]);
    const [skills, setSkills] = useState([]);
    const [stats, setStats] = useState([]);
    const [feats, setFeats] = useState([]);
    const [tempData, setTempData] = useState({
        name: "",
        stats: {},
        skills: {},
        alignmentId: null,
        feats: [],
        raceId: null,
        classId: 0,
        level: 1,
        skillPoints: 0,
        availableSkillPoints: 0,
        featCount: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, raceRes, statRes, skillRes, featRes, alignmentRes] = await Promise.all([
                    fetchClasses(),
                    fetchRaces(),
                    fetchStats(),
                    fetchSkills(),
                    fetchFeats(),
                    fetchAlignments(),
                ]);
                setClasses(classRes);
                setRaces(raceRes);
                setStats(statRes);
                setSkills(skillRes);
                setFeats(featRes);
                setAlignments(alignmentRes)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const fetchClasses = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/character_classes/`);
        return response.json();
    };

    const fetchRaces = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/races/`);
        return response.json();
    };

    const fetchStats = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/`);
        return response.json();
    };

    const fetchSkills = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/skills/`);
        return response.json();
    };

    const fetchFeats = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/feats/`);
        return response.json();
    };

    const fetchAlignments = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/alignments/`);
        return response.json();  // Assuming there's an endpoint for alignments
    };

    const handleAlignmentChange = (e) => {
        const newAlignmentId = e.target.value;
        setTempData(prev => ({
            ...prev,
            alignmentId: newAlignmentId, // Update alignment in tempData
        }));
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setTempData(prev => ({
            ...prev,
            name: newName, // Update name in tempData
        }));
    };

    const rollStats = () => {
        const rolledStats = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
        const rolledValues = {};

        rolledStats.forEach(stat => {
            const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
            rolls.sort((a, b) => b - a);
            rolls.pop();
            rolledValues[stat] = rolls.reduce((acc, value) => acc + value, 0);
        });

        if (tempData.raceId) {
            const selectedRace = races.find(race => race.id === tempData.raceId);
            const modifiers = selectedRace && selectedRace.stat_modifiers ? selectedRace.stat_modifiers : {};

            Object.keys(rolledValues).forEach(stat => {
                if (modifiers[stat]) {
                    rolledValues[stat] += modifiers[stat];
                }
            });
        }

        console.log('Rolled Stats:', rolledValues);

        setTempData(prev => ({
            ...prev,
            stats: rolledValues
        }));
    };

    const handleStatChange = (statId, newValue) => {
        setTempData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [statId]: newValue
            }
        }));
    };

    const handleLevelChange = (newLevel) => {
        setTempData(prev => {
            // Ensure selectedClass exists
            const selectedClass = classes.find(cls => cls.id === prev.classId);

            if (!selectedClass) {
                alert('Please select a class before updating the level');
                return prev; // Don't update skill points if no class is selected
            }

            const statModifier = Math.floor((prev.stats['Intelligence'] - 10) / 2) || 0;
            const skillPoints = (selectedClass.skill_points + statModifier) * newLevel;

            console.log('Level Changed:', newLevel);
            console.log('Stat Modifier (Intelligence):', statModifier);
            console.log('Skill Points from Class and Stats:', skillPoints);

            return {
                ...prev,
                level: newLevel,
                availableSkillPoints: skillPoints || 0, // Update skill points based on class and level
            };
        });
    };

    const handleClassChange = (e) => {
        const classId = Number(e.target.value);
        const selectedClass = classes.find(cls => cls.id === classId);

        if (!selectedClass) return;

        const statModifier = Math.floor((tempData.stats['Intelligence']-10)/2) || 0;
        const skillPoints = selectedClass.skill_points || 0;  // Use 'skill_points' instead of 'skillPoints'
        const skillPointsValue = (skillPoints + statModifier) * tempData.level;

        console.log("RACE:", tempData.raceId)
        console.log("CLASS:", selectedClass.name)

        // Check for bonus feats based on class and race
        let featBonus = 0;
        if (Number(tempData.raceId) === 1) {
            featBonus += 1; // Human race gets +1 feat
        }

        if (selectedClass.name === "Fighter") {
            featBonus += 1; // Fighter class gets +1 feat
        }

        const initialFeats = []; // Initialize feats as an empty array for now
        const availableFeats = 1 + featBonus; // 1 feat + bonuses

        setTempData(prev => ({
            ...prev,
            classId: classId,
            feats: initialFeats,
            availableSkillPoints: skillPointsValue,
            featCount: availableFeats, // Set feat count based on class and race
        }));
    };

    
    

    const handleSkillRankChange = (skillId, newRank) => {
        const maxRank = Math.min(newRank, tempData.level);

        console.log('Changing Rank for Skill:', skillId, 'New Rank:', newRank);
        console.log('Max Rank allowed:', maxRank);

        // Ensure valid rank
        if (tempData.availableSkillPoints > 0 && newRank <= maxRank) {
            setTempData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [skillId]: newRank, // Update the skill rank correctly
                },
                availableSkillPoints: prev.availableSkillPoints - newRank,
            }));
        }
    };

    // Calculate the final value for the skill based on rank, stat modifier, and class skill bonus
    const getSkillFinalValue = (skillId) => {
        const rank = tempData.skills[skillId] || 0;
        const skill = skills.find(skill => skill.id === skillId);
    
        // Ensure the skill has a valid modifying stat ID
        if (!skill || !skill.modifying_stat_id) {
            console.error('Invalid skill or missing modifying stat ID:', skill);
            return 0;
        }
    
        // Look up the stat name in tempData.stats
        const statValue = stats[skill.modifying_stat_id]?.name;

        console.log(statValue)

        const trueStatValue = tempData.stats[statValue];

        console.log(trueStatValue);
        
        // If stat exists, calculate modifier; otherwise, use 0
        const statModifier = trueStatValue !== undefined
            ? Math.floor((trueStatValue - 10) / 2) // Calculate the modifier for the stat
            : 0;
    
        // Check if the skill is a class skill (listed in class_skills)
        const isClassSkill = classes.find(cls => cls.id === tempData.classId)?.class_skills?.includes(skill.name);
    
        // Add the class skill bonus only if rank >= 1
        const classBonus = (rank >= 1 && isClassSkill) ? 3 : 0;
    
        // Final value is the sum of rank, stat modifier, and class bonus
        const finalValue = rank + statModifier + classBonus;
    
        return finalValue;
    };
    
    const handleFeatSelection = (featId) => {
        if (tempData.featCount <= 0) return; // Don't allow selection if no feats are available

        // Add the selected feat and decrease feat count
        setTempData(prev => ({
            ...prev,
            feats: [...prev.feats, featId],
            featCount: prev.featCount - 1, // Decrease available feats by 1
        }));
    };

    const handleConfirm = () => {
        updateCharacter('name', tempData.name || '');
        updateCharacter('level', tempData.level || 1);
        updateCharacter('characterClassId', tempData.classId || null);
        updateCharacter('alignmentId', tempData.alignmentId || null); // Update alignmentId in context
        updateCharacter('feats', [...tempData.feats]);
        updateCharacter('stats', { ...tempData.stats });
        updateCharacter('skills', { ...tempData.skills });
        alert('Character confirmed!');
    };


    const handleSave = () => {
        // Call the saveCharacter function from context to handle the save process
        saveCharacter();
    };

    if (!stats || !skills || !feats || !classes) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Character Creation</h1>

            {/* Character Name Input */}
            <div>
                <h2>Character Name</h2>
                <input
                    type="text"
                    value={tempData.name}  // Bind name input to tempData state
                    onChange={handleNameChange}
                    placeholder="Enter your character's name"
                />
            </div>

            {/* Alignment Selection */}
            <div>
                <h2>Alignment</h2>
                <select
                    value={tempData.alignmentId || ''}
                    onChange={handleAlignmentChange}
                >
                    <option value="">Select Alignment</option>
                    {alignments.map((alignment) => (
                        <option key={alignment.id} value={alignment.id}>
                            {alignment.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Race Selection */}
            <div>
                <h2>Race</h2>
                <select
                    value={tempData.raceId || ''}
                    onChange={(e) => setTempData({ ...tempData, raceId: e.target.value })}
                >
                    <option value="">Select Race</option>
                    {races.map(race => (
                        <option key={race.id} value={race.id}>
                            {race.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats Display */}
            <div>
                <h2>Stats</h2>
                {Object.keys(tempData.stats).length === 0 ? (
                    <p>No stats rolled yet</p>
                ) : (
                    Object.keys(tempData.stats).map((stat) => (
                        <div key={stat}>
                            <label>{stat}:</label>
                            <input
                                type="number"
                                value={tempData.stats[stat] || 0}
                                onChange={(e) => handleStatChange(stat, parseInt(e.target.value))}
                            />
                        </div>
                    ))
                )}
                <button onClick={rollStats}>Roll Stats</button>
            </div>

            {/* Class Selection */}
            <div>
                <h2>Class</h2>
                <select
                    value={tempData.classId}
                    onChange={handleClassChange}
                >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level Selection */}
            <div>
                <h2>Level</h2>
                <input
                    type="number"
                    min="1"
                    value={tempData.level}
                    onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                />
            </div>

            {/* Skill Points Display */}
            <div>
                <h2>Available Skill Points: {tempData.availableSkillPoints}</h2>
            </div>

            {/* Skills Section */}
            <div>
                <h2>Skills</h2>
                {skills.map((skill) => (
                    <div key={skill.id}>
                        <label>{skill.name} (Associated Stat: {stats.find(stat => stat.id === skill.modifying_stat_id)?.name})</label>
                        <input
                            type="number"
                            min="0"
                            max={tempData.level}
                            value={tempData.skills[skill.id] || 0}
                            onChange={(e) => handleSkillRankChange(skill.id, parseInt(e.target.value))}
                        />
                        <span>
                            Final Value: {getSkillFinalValue(skill.id)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Feats Section */}
            <div>
                <h2>Available Feats: {tempData.featCount}</h2>
                <h2>Feats</h2>
                {feats.map((feat) => (
                    <div key={feat.id}>
                        <label>{feat.name}</label>
                        <input
                            type="checkbox"
                            checked={tempData.feats.includes(feat.id)}
                            onChange={() => handleFeatSelection(feat.id)}
                            disabled={tempData.featCount <= 0} // Disable if no feats are available
                        />
                    </div>
                ))}
            </div>

            {/* Save Character */}
            <button onClick={handleConfirm}>Confirm Character</button>
            <button onClick={handleSave}>Save Character</button>
        </div>
    );
};

export default CharacterCreationPage;
