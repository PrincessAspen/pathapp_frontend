import React, { useState, useEffect } from 'react';
import { useCharacter } from '../CharacterContext';
import d20Image from '../images/d20.png';

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
        alignmentId: 0,
        feats: [],
        raceId: 0,
        classId: 0,
        level: 1,
        skillPoints: 0,
        availableSkillPoints: 0,
        featCount: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/character_creation_data/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch character creation data");
                }
                const data = await response.json();
                
                // Destructure and set state
                setClasses(data.classes);
                setRaces(data.races);
                setStats(data.stats);
                setSkills(data.skills);
                setFeats(data.feats);
                setAlignments(data.alignments);
            } catch (error) {
                console.error("Error fetching character creation data:", error);
            }
        };
    
        fetchData();
    }, []);

    // This useEffect hook will log the updated raceId whenever it changes
    useEffect(() => {
        console.log("Updated raceId:", tempData.raceId);
    }, [tempData.raceId]); // This will trigger every time raceId changes

    const handleRaceChange = (e) => {
        const selectedRaceId = e.target.value;
        console.log("Selected Race ID:", selectedRaceId);  // Log the race ID when it's selected
    
        setTempData(prev => {
            const updatedTempData = {
                ...prev,
                raceId: selectedRaceId,
                stats: updateStatsWithRaceModifiers(prev.stats, selectedRaceId), // Apply race modifiers to stats
            };
            return updatedTempData;
        });
    
        console.log("Updated tempData:", tempData);  // Log the updated state after race change
    };

    // Apply race-based stat modifiers to the stats
    const updateStatsWithRaceModifiers = (currentStats, raceId) => {
        const selectedRace = races.find(race => race.id === raceId);
        if (!selectedRace || !selectedRace.stat_modifiers) return currentStats;

        const updatedStats = { ...currentStats };
        Object.keys(selectedRace.stat_modifiers).forEach(stat => {
            if (updatedStats[stat] !== undefined) {
                updatedStats[stat] += selectedRace.stat_modifiers[stat]; // Apply modifier
            }
        });

        return updatedStats;
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

        // console.log('Rolled Stats:', rolledValues);

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

            // console.log('Level Changed:', newLevel);
            // console.log('Stat Modifier (Intelligence):', statModifier);
            // console.log('Skill Points from Class and Stats:', skillPoints);

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

        // console.log('Changing Rank for Skill:', skillId, 'New Rank:', newRank);
        // console.log('Max Rank allowed:', maxRank);

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

        // console.log(statValue)

        const trueStatValue = tempData.stats[statValue];

        // console.log(trueStatValue);
        
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
        updateCharacter('raceId', tempData.raceId || null);
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
    <div className="container mx-auto px-4 py-8 bg-artsy" >
        <h1 className="text-6xl font-bold text-center text-indigo-600 mb-8">Character Creation</h1>

        {/* Character Name Input */}
        <div className="mb-4">
            <h2 className="text-xl font-extrabold mb-2 text-gray-800">Character Name</h2>
            <input
                type="text"
                value={tempData.name}  // Bind name input to tempData state
                onChange={handleNameChange}
                placeholder="Enter your character's name"
                className="w-full p-2 border border-gray-300 rounded"
            />
        </div>

        {/* Alignment Selection */}
        <div className="mb-4">
            <h2 className="text-xl font-extrabold mb-2 text-gray-800">Alignment</h2>
            <select
                value={tempData.alignmentId || ''}
                onChange={handleAlignmentChange}
                className="w-full p-2 border border-gray-300 rounded"
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
        <div className="mb-4">
            <h2 className="text-xl font-extrabold mb-2 text-gray-800">Race</h2>
            <select
                value={tempData.raceId || ''}
                onChange={handleRaceChange}
                className="w-full p-2 border border-gray-300 rounded"
            >
                <option value="">Select Race</option>
                {races.map((race) => (
                    <option key={race.id} value={race.id}>
                        {race.name}
                    </option>
                ))}
            </select>
        </div>

        {/* Stats Display */}
            <div className="mb-4">
                <h2 className="text-xl font-extrabold mb-2 text-gray-800">Stats</h2>
                <div className="flex space-x-4 mb-4 justify-center">
                    {Object.keys(tempData.stats).length === 0 ? (
                        <p className="text-gray-800 font-extrabold text-xl">Click the die to roll Stats</p>
                    ) : (
                        Object.keys(tempData.stats).map((stat) => (
                            <div key={stat} className="flex flex-col items-center">
                                <label className="mr-2 text-gray-800 font-extrabold">{stat}:</label>
                                <input
                                    type="number"
                                    value={tempData.stats[stat] || 0}
                                    onChange={(e) => handleStatChange(stat, parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded text-center"
                                />
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={rollStats}
                        className="px-6 py-4 bg-blue-500 text-white rounded mt-4 hover:bg-blue-600 text-2xl flex items-center justify-center"
                    >
                        <img src={d20Image} alt="Roll Stats" className="w-12 h-12" />
                    </button>
                </div>
            </div>

        {/* Class Selection */}
            <div className="mb-6">
                <label className="text-xl font-semibold text-gray-700">Class</label>
                <select
                    value={tempData.classId}
                    onChange={handleClassChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </div>

            

        {/* Column Layout for Feats and Skills */}
        <div className="flex space-x-12 mt-4">
            {/* Feats Section */}
            <div className="flex-1">
            <h2 className="text-2xl font-extrabold mb-4 text-gray-800">Feats</h2>
            <div className="mb-4 text-xl font-extrabold text-gray-800">
                <span>Feats Remaining: </span>
                <span className="ml-2 text-2xl text-gray-600">{tempData.featCount}</span>
            </div>
            {feats.map((feat) => (
                <div key={feat.id} className="mb-4 flex items-center">
                    <label className="mr-4 text-lg text-gray-900 font-extrabold">{feat.name}</label>
                    <input
                        type="checkbox"
                        checked={tempData.feats.includes(feat.id)}
                        onChange={() => handleFeatSelection(feat.id)}
                        disabled={tempData.featCount <= 0}
                        className="form-checkbox h-6 w-6"
                    />
                </div>
            ))}
        </div>


            {/* Skills Section */}
            <div className="flex-1">
                <h2 className="text-2xl font-extrabold mb-4 text-gray-800">Skills</h2>
                <div className="mb-4 text-xl font-extrabold text-gray-800">
                    <span>Skill Points Remaining: </span>
                    <span className="ml-2 text-2xl text-gray-600">{tempData.availableSkillPoints}</span>
                </div>
                {skills.map((skill) => (
                    <div key={skill.id} className="mb-4">
                        <label className="block text-xl text-gray-800 font-extrabold mb-2">{skill.name} (Associated Stat: {stats.find(stat => stat.id === skill.modifying_stat_id)?.name})</label>
                        <input
                            type="number"
                            min="0"
                            max={tempData.level}
                            value={tempData.skills[skill.id] || 0}
                            onChange={(e) => handleSkillRankChange(skill.id, parseInt(e.target.value))}
                            className="w-20 p-2 border border-gray-300 rounded text-lg"
                        />
                        <span className="block mt-2 text-xl text-gray-800 font-extrabold">
                            Final Value: {getSkillFinalValue(skill.id)}
                        </span>
                    </div>
                ))}
            </div>

        </div>

        {/* Save Character */}
        <div className="mt-4 flex justify-between">
            <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-extrabold"
            >
                Confirm Character
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-extrabold"
            >
                Save Character
            </button>
        </div>
    </div>


        );
    };

export default CharacterCreationPage;
