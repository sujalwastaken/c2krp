import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import './App.css';

function C2KRP() {
  const [data, setData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mode, setMode] = useState('kanji');
  const audioRef = useRef(); // Create a ref for the audio element
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState('');
  const [lastTakenAnswer, setLastTakenAnswer] = useState('');
  const [isBlur, setIsBlur] = useState(true);
  const [meaning, setMeaning] = useState('');
  const [choices, setChoices] = useState([]); // New state variable for choices
  
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/data.json')
      .then(response => response.json())
      .then(data => {
        // Randomize the data array
        const randomizedData = data.sort(() => Math.random() - 0.5);
        setData(randomizedData);
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
  
    const handleCanPlayThrough = () => {
      audioElement.play();
    };
  
    if (audioElement) {
      audioElement.load(); // Reload the audio element source
      audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
    }
  
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
      }
    };
  }, [currentQuestion]);

  useEffect(() => {
    // Check if data is not empty
    if (data.length > 0) {
      // Generate four random choices
      const newChoices = [];
      while (newChoices.length < 4) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const choice = data[randomIndex][mode];
        if (newChoices.indexOf(choice) === -1) {
          newChoices.push(choice);
        }
      }
  
      // Ensure the correct answer is included
      if (newChoices.indexOf(data[currentQuestion][mode]) === -1) {
        newChoices[Math.floor(Math.random() * newChoices.length)] = data[currentQuestion][mode];
      }
  
      setChoices(newChoices); // Set the new choices
    }
  }, [currentQuestion, data, mode]);
  
  const handleChoiceClick = (choice, event) => {
    // Prevent the click event from propagating up to the parent elements
    event.stopPropagation();
    setLastTakenAnswer(choice);
    setLastCorrectAnswer(data[currentQuestion][mode]);
    setMeaning(data[currentQuestion]['meaning']);
    // Move on to the next question
    setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Define your shortcut keys
      const shortcutKeys = ['1', '2', '3', '4'];
      const key = event.key;
  
      if (shortcutKeys.includes(key)) {
        // Find the index of the pressed key in the shortcutKeys array
        const index = shortcutKeys.indexOf(key);
  
        // Check if the button for the pressed key exists
        if (choices[index]) {
          handleChoiceClick(choices[index], event);
        }
      }
    };
  
    // Add the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);
  
    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [choices, handleChoiceClick]);  

  const handleTextClick = () => {
    setIsBlur(!isBlur);
  };

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  const question = data[currentQuestion];
  const audioSrc = `${process.env.PUBLIC_URL}/audio/${question.audio}`;

  const options = [
    { value: 'kanji', label: 'Kanji' },
    { value: 'furigana', label: 'Furigana' },
    { value: 'kanjiFurigana', label: 'Kanji + Furigana' },
  ];

  return (
    <div className="container">
      <Select
        value={options.find(option => option.value === mode)}
        onChange={selectedOption => setMode(selectedOption.value)}
        options={options}
      />
      <p className="question" style={{color: lastTakenAnswer===lastCorrectAnswer ? 'green' : 'red', filter: isBlur ? 'blur(5px)' : 'none'}} onClick={handleTextClick}>
        {lastTakenAnswer===lastCorrectAnswer ? `${lastCorrectAnswer} - ${meaning}` : <del>{lastTakenAnswer}</del>}
        {lastTakenAnswer!==lastCorrectAnswer ? ` [${lastCorrectAnswer} - ${meaning}]` : ''}
      </p>
      <div className="choices">
      {choices.map((choice, index) => (
        <button
          key={index}
          className={lastTakenAnswer === choice ? (lastTakenAnswer===lastCorrectAnswer ? 'correct' : 'incorrect') : ''}
          onClick={(event) => handleChoiceClick(choice, event)}
          title={`Shortcut: ${index+1}`} // Displaying the shortcut key on hover
        >
          {choice}
        </button>
        ))}
      </div>
      <audio ref={audioRef} controls src={audioSrc}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
export default C2KRP;
