import React, { useState, useEffect } from 'react';

const CharacterCreationPage = () => {
    const [classes, setClasses] = useState([]);
    const [races, setRaces] = useState([]);
    const [skills, setSkills] = useState([]);
    const [stats, setStats] = useState([]);
    const [feats, setFeats] = useState([]);
    const [tempData, setTempData] = useState({
        stats: {},
        skills: {},
        feats: [],
        raceId: null,
        classId: 0, // Start with an empty string for classId
        level: 1,
        skillPoints: 0,
        availableSkillPoints: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, raceRes, statRes, skillRes, featRes] = await Promise.all([
                    fetchClasses(),
                    fetchRaces(),
                    fetchStats(),
                    fetchSkills(),
                    fetchFeats(),
                ]);
                setClasses(classRes);
                setRaces(raceRes);
                setStats(statRes);
                setSkills(skillRes);
                setFeats(featRes);
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

    // Function to roll 4d6 and drop the lowest die
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

        setTempData(prev => ({
            ...prev,
            stats: rolledValues
        }));
    };

    // Handle stat changes
    const handleStatChange = (statId, newValue) => {
        setTempData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [statId]: newValue
            }
        }));
    };

    // Handle level change and recalculate skill points
    const handleLevelChange = (newLevel) => {
        setTempData(prev => {
            const selectedClass = classes.find(cls => cls.id === prev.classId);
            const statModifier = prev.stats['Intelligence'] || 0;
            const skillPoints = (selectedClass.skillPoints + statModifier) * newLevel;

            return {
                ...prev,
                level: newLevel,
                availableSkillPoints: skillPoints,
            };
        });
    };

    // Handle class change and recalculate skill points
    const handleClassChange = (e) => {
        const classId = e.target.value;
        const selectedClass = classes.find(cls => cls.id === classId);
        
        if (!selectedClass) return;

        const statModifier = tempData.stats['Intelligence'] || 0;
        const skillPoints = (selectedClass.skillPoints + statModifier) * tempData.level;

        setTempData(prev => ({
            ...prev,
            classId,  // Update classId directly from the select input
            availableSkillPoints: skillPoints,
        }));
    };

    // Handle rank assignment for skills
    const handleSkillRankChange = (skillId, newRank) => {
        const selectedSkill = skills.find(skill => skill.id === skillId);
        const maxRank = Math.min(newRank, tempData.level);

        if (tempData.availableSkillPoints > 0 && newRank <= maxRank) {
            setTempData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [skillId]: newRank
                },
                availableSkillPoints: prev.availableSkillPoints - newRank,
            }));
        }
    };

    // Save Character data (mocking backend call)
    const handleSave = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/characters/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData),
            });

            if (response.ok) {
                alert('Character saved successfully!');
                setTempData({
                    stats: {},
                    skills: {},
                    feats: [],
                    raceId: null,
                    classId: 0,  // Reset classId to empty string
                    level: 1,
                    skillPoints: 0,
                    availableSkillPoints: 0,
                });
            } else {
                alert('Failed to save character');
            }
        } catch (error) {
            console.error('Error saving character:', error);
        }
    };

    if (!stats || !skills || !feats || !classes) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Character Creation</h1>

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

            {/* Class Selection */}
            <div>
                <h2>Class</h2>
                <select
                    value={tempData.classId} // Ensure classId is set correctly here
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
                            Final Value: {tempData.skills[skill.id] + (tempData.stats[skill.modifying_stat_id] || 0)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Feats Section */}
            <div>
                <h2>Feats</h2>
                <ul>
                    {feats.map((feat) => (
                        <li key={feat.id}>
                            <input
                                type="checkbox"
                                checked={tempData.feats.includes(feat.id)}
                                onChange={() => {
                                    const newFeats = tempData.feats.includes(feat.id)
                                        ? tempData.feats.filter(f => f !== feat.id)
                                        : [...tempData.feats, feat.id];
                                    setTempData({ ...tempData, feats: newFeats });
                                }}
                            />
                            {feat.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Save Character */}
            <button onClick={handleSave}>Save Character</button>
        </div>
    );
};

export default CharacterCreationPage;
